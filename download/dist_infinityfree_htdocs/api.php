<?php
/**
 * ======================================================================
 * JKH JESAN CMS & API BACKEND FOR INFINITYFREE / APACHE HOSTING
 * ======================================================================
 * Seamless PHP replacement for server.js.
 * Provides all authentication, content management, and user administration
 * endpoints matching the Node.js server specification 100%.
 */

// Enable error logging for production diagnostics (suppress HTML error display)
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Set security and CORS headers
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database paths
$DB_PATH = __DIR__ . '/database.json';
$USERS_PATH = __DIR__ . '/users.json';

// Initialize content database if missing
if (!file_exists($DB_PATH)) {
    $initialData = [
        "works" => [
            [
                "id" => round(microtime(true) * 1000),
                "title" => "Kothay Pabo Tare",
                "category" => "OST / Composition",
                "link" => "https://www.youtube.com/watch?v=f023KdTlYBk"
            ],
            [
                "id" => round(microtime(true) * 1000) + 1,
                "title" => "Ridoy Nayer Boitha",
                "category" => "BGM Soundtrack",
                "link" => "https://www.youtube.com/watch?v=PwU--Y4GWJg"
            ]
        ]
    ];
    file_put_contents($DB_PATH, json_encode($initialData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

// Initialize users database if missing
if (!file_exists($USERS_PATH)) {
    $initialUsers = [
        [
            "id" => "admin_1",
            "email" => "admin@jkhjesan.com",
            "password" => "admin",
            "role" => "admin",
            "permissions" => ["all"]
        ]
    ];
    file_put_contents($USERS_PATH, json_encode($initialUsers, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

function getUsers() {
    global $USERS_PATH;
    if (!file_exists($USERS_PATH)) return [];
    $raw = file_get_contents($USERS_PATH);
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function saveUsers($users) {
    global $USERS_PATH;
    file_put_contents($USERS_PATH, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
}

// Parse request URI and determine endpoint
$requestUri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Extract the path after /api
$endpoint = '';
if (preg_match('#/api(/.*)?$#', $requestUri, $matches)) {
    $endpoint = rtrim($matches[0], '/');
} elseif (isset($_GET['endpoint'])) {
    $endpoint = '/api/' . trim($_GET['endpoint'], '/');
} else {
    // If accessed as /api or /api.php
    $endpoint = '/api/data';
}

// Parse JSON input for POST requests
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);
if (!is_array($input)) $input = [];

// ==========================================
// 1. CONTENT ENDPOINTS
// ==========================================

// GET /api/data
if ($endpoint === '/api/data' && $method === 'GET') {
    if (!file_exists($DB_PATH)) {
        echo json_encode(["content" => [], "works" => [], "gallery" => []]);
        exit;
    }
    $raw = file_get_contents($DB_PATH);
    $data = json_decode($raw, true) ?: [];

    $modified = false;
    $now = round(microtime(true) * 1000);
    $thirtyDays = 30 * 24 * 60 * 60 * 1000;

    // Auto-clean trash older than 30 days
    if (isset($data['trash']) && is_array($data['trash'])) {
        $origCount = count($data['trash']);
        $data['trash'] = array_values(array_filter($data['trash'], function($item) use ($now, $thirtyDays) {
            return isset($item['deletedAt']) && (($now - $item['deletedAt']) < $thirtyDays);
        }));
        if (count($data['trash']) !== $origCount) $modified = true;
    } else {
        $data['trash'] = [];
        $modified = true;
    }

    // Auto-clean history older than 30 days
    if (isset($data['history']) && is_array($data['history'])) {
        $origCount = count($data['history']);
        $data['history'] = array_values(array_filter($data['history'], function($item) use ($now, $thirtyDays) {
            return isset($item['savedAt']) && (($now - $item['savedAt']) < $thirtyDays);
        }));
        if (count($data['history']) !== $origCount) $modified = true;
    } else {
        $data['history'] = [];
        $modified = true;
    }

    if ($modified) {
        file_put_contents($DB_PATH, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    }

    echo json_encode($data);
    exit;
}

// POST /api/data
if ($endpoint === '/api/data' && $method === 'POST') {
    $userId = $input['userId'] ?? '';
    $newData = $input['data'] ?? null;
    $users = getUsers();
    $user = null;

    foreach ($users as $u) {
        if (($u['id'] ?? '') === $userId && in_array($u['role'] ?? '', ['admin', 'moderator'])) {
            $user = $u;
            break;
        }
    }

    if ($user && $newData !== null) {
        file_put_contents($DB_PATH, json_encode($newData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
        echo json_encode(["success" => true]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized to save content."]);
    }
    exit;
}

// ==========================================
// 2. AUTHENTICATION ENDPOINTS
// ==========================================

// POST /api/auth/login
if ($endpoint === '/api/auth/login' && $method === 'POST') {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $users = getUsers();
    $found = null;

    foreach ($users as $u) {
        if (($u['email'] ?? '') === $email && ($u['password'] ?? '') === $password) {
            $found = $u;
            break;
        }
    }

    if ($found) {
        if (($found['role'] ?? '') === 'pending') {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Account pending admin approval."]);
            exit;
        }
        unset($found['password']);
        echo json_encode(["success" => true, "user" => $found]);
    } else {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
    }
    exit;
}

// POST /api/auth/register
if ($endpoint === '/api/auth/register' && $method === 'POST') {
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $users = getUsers();

    foreach ($users as $u) {
        if (($u['email'] ?? '') === $email) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Email already exists."]);
            exit;
        }
    }

    $newUser = [
        "id" => "mod_" . round(microtime(true) * 1000),
        "email" => $email,
        "password" => $password,
        "role" => "pending",
        "permissions" => []
    ];

    $users[] = $newUser;
    saveUsers($users);
    echo json_encode(["success" => true, "message" => "Registration successful! Waiting for admin approval."]);
    exit;
}

// POST /api/auth/forgot
if ($endpoint === '/api/auth/forgot' && $method === 'POST') {
    $email = trim($input['email'] ?? '');
    $users = getUsers();
    $foundIndex = -1;

    for ($i = 0; $i < count($users); $i++) {
        if (($users[$i]['email'] ?? '') === $email) {
            $foundIndex = $i;
            break;
        }
    }

    if ($foundIndex !== -1) {
        $newPin = (string) rand(100000, 999999);
        $users[$foundIndex]['password'] = $newPin;
        saveUsers($users);
        echo json_encode(["success" => true, "message" => "Password reset successful. Your new temporary password is: {$newPin}"]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Email not found."]);
    }
    exit;
}

// POST /api/auth/update
if ($endpoint === '/api/auth/update' && $method === 'POST') {
    $userId = $input['userId'] ?? '';
    $newEmail = $input['newEmail'] ?? null;
    $newPassword = $input['newPassword'] ?? null;
    $users = getUsers();
    $foundIndex = -1;

    for ($i = 0; $i < count($users); $i++) {
        if (($users[$i]['id'] ?? '') === $userId) {
            $foundIndex = $i;
            break;
        }
    }

    if ($foundIndex !== -1) {
        if (!empty($newEmail)) $users[$foundIndex]['email'] = trim($newEmail);
        if (!empty($newPassword)) $users[$foundIndex]['password'] = $newPassword;
        saveUsers($users);
        $safeUser = $users[$foundIndex];
        unset($safeUser['password']);
        echo json_encode(["success" => true, "user" => $safeUser]);
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "User not found."]);
    }
    exit;
}

// ==========================================
// 3. ADMIN MANAGEMENT ENDPOINTS
// ==========================================

// POST /api/admin/users
if ($endpoint === '/api/admin/users' && $method === 'POST') {
    $adminId = $input['adminId'] ?? '';
    $users = getUsers();
    $isAdmin = false;

    foreach ($users as $u) {
        if (($u['id'] ?? '') === $adminId && ($u['role'] ?? '') === 'admin') {
            $isAdmin = true;
            break;
        }
    }

    if ($isAdmin) {
        $safeUsers = array_map(function($u) {
            return [
                "id" => $u['id'] ?? '',
                "email" => $u['email'] ?? '',
                "role" => $u['role'] ?? '',
                "permissions" => $u['permissions'] ?? []
            ];
        }, $users);
        echo json_encode(["success" => true, "users" => $safeUsers]);
    } else {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized."]);
    }
    exit;
}

// POST /api/admin/update-user
if ($endpoint === '/api/admin/update-user' && $method === 'POST') {
    $adminId = $input['adminId'] ?? '';
    $targetUserId = $input['targetUserId'] ?? '';
    $newRole = $input['newRole'] ?? null;
    $newPermissions = $input['newPermissions'] ?? null;
    $users = getUsers();
    $isAdmin = false;

    foreach ($users as $u) {
        if (($u['id'] ?? '') === $adminId && ($u['role'] ?? '') === 'admin') {
            $isAdmin = true;
            break;
        }
    }

    if ($isAdmin) {
        $foundIndex = -1;
        for ($i = 0; $i < count($users); $i++) {
            if (($users[$i]['id'] ?? '') === $targetUserId) {
                $foundIndex = $i;
                break;
            }
        }
        if ($foundIndex !== -1) {
            if ($newRole !== null) $users[$foundIndex]['role'] = $newRole;
            if ($newPermissions !== null) $users[$foundIndex]['permissions'] = $newPermissions;
            saveUsers($users);
            echo json_encode(["success" => true]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "User not found."]);
        }
    } else {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized."]);
    }
    exit;
}

// POST /api/admin/delete-user
if ($endpoint === '/api/admin/delete-user' && $method === 'POST') {
    $adminId = $input['adminId'] ?? '';
    $targetUserId = $input['targetUserId'] ?? '';
    $users = getUsers();
    $isAdmin = false;

    foreach ($users as $u) {
        if (($u['id'] ?? '') === $adminId && ($u['role'] ?? '') === 'admin') {
            $isAdmin = true;
            break;
        }
    }

    if ($isAdmin) {
        if ($targetUserId === $adminId) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Cannot delete yourself."]);
            exit;
        }
        $users = array_values(array_filter($users, function($u) use ($targetUserId) {
            return ($u['id'] ?? '') !== $targetUserId;
        }));
        saveUsers($users);
        echo json_encode(["success" => true]);
    } else {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Unauthorized."]);
    }
    exit;
}

// Fallback for unknown /api endpoint
http_response_code(404);
echo json_encode(["success" => false, "message" => "API endpoint not found: {$endpoint}"]);
