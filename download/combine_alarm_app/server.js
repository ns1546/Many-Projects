const express = require('express');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const QRCode = require('qrcode');

// Firebase Cloud Messaging (FCM) Admin SDK Integration
let fcmMessaging = null;
const SERVICE_ACCOUNT_FILE = path.join(__dirname, 'service-account.json');

if (fs.existsSync(SERVICE_ACCOUNT_FILE)) {
  try {
    const { initializeApp, cert } = require('firebase-admin/app');
    const { getMessaging } = require('firebase-admin/messaging');
    const serviceAccount = require(SERVICE_ACCOUNT_FILE);
    const firebaseApp = initializeApp({
      credential: cert(serviceAccount)
    });
    fcmMessaging = getMessaging(firebaseApp);
    console.log(`🔥 Firebase Cloud Messaging (FCM) ACTIVE for project [${serviceAccount.project_id}]`);
  } catch (err) {
    console.warn('⚠️ Could not initialize Firebase Admin:', err.message);
  }
}

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory Database with file sync
let db = {
  rooms: {}, // roomId -> { id, name, createdAt, alarms: [], logs: [] }
};

function loadDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      console.log('📦 Loaded existing database with', Object.keys(db.rooms || {}).length, 'rooms');
    } catch (err) {
      console.error('⚠️ Error reading database.json, starting fresh:', err.message);
    }
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('⚠️ Error saving database:', err.message);
  }
}

loadDatabase();

// Connected clients: ws -> { roomId, deviceId, deviceName, platform, isRinging, isAwake }
const clients = new Map();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// Direct Root APK Download Route (Prevents APK from being placed in public assets and ballooning app size)
app.get(['/EvoAlarm.apk', '/CombineAlarm.apk', '/download/apk'], (req, res) => {
  const apkPath = path.join(__dirname, 'EvoAlarm.apk');
  if (fs.existsSync(apkPath)) {
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');
    res.setHeader('Content-Disposition', 'attachment; filename="EvoAlarm.apk"');
    res.sendFile(apkPath);
  } else {
    res.status(404).send('Evo Alarm APK is currently compiling. Please try again in a few moments.');
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Helper to get local network IP addresses
function getNetworkIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push(net.address);
      }
    }
  }
  return ips;
}

// Helper to get or create room
function getOrCreateRoom(roomId, roomName = null) {
  const normalizedId = (roomId || 'GLOBAL').toUpperCase().trim();
  if (!db.rooms[normalizedId]) {
    db.rooms[normalizedId] = {
      id: normalizedId,
      name: roomName || `Squad ${normalizedId}`,
      createdAt: new Date().toISOString(),
      alarms: [
        {
          id: 'sample-morning',
          title: '🌅 Squad Morning Wake Up',
          time: '07:00',
          enabled: true,
          repeatDays: [1, 2, 3, 4, 5], // Mon-Fri
          sound: 'siren', // radar, siren, digital_chime, tactical
          challenge: 'math', // none, math, tap, shake
          consensusMode: 'any', // 'any' (anyone can dismiss) or 'all' (each must confirm)
          voiceMemo: 'Good morning team! Time to crush today goals.',
          status: 'IDLE', // IDLE, RINGING, SNOOZED, DISMISSED
          createdBy: 'System Demo',
          createdAt: new Date().toISOString()
        }
      ],
      members: [],
      logs: [
        {
          id: 'log-1',
          text: `Room ${normalizedId} created`,
          timestamp: new Date().toISOString(),
          type: 'info'
        }
      ]
    };
    saveDatabase();
  }
  if (!db.rooms[normalizedId].members) {
    db.rooms[normalizedId].members = [];
  }
  return db.rooms[normalizedId];
}

// Log an action to room
function addRoomLog(roomId, text, type = 'info', user = 'System') {
  const room = getOrCreateRoom(roomId);
  const logItem = {
    id: crypto.randomUUID(),
    text,
    type,
    user,
    timestamp: new Date().toISOString()
  };
  room.logs.unshift(logItem);
  if (room.logs.length > 50) room.logs.pop(); // keep last 50 logs
  saveDatabase();
  broadcastToRoom(roomId, {
    type: 'ROOM_LOG',
    log: logItem
  });
}

// Broadcast JSON message to all clients in a specific room
function broadcastToRoom(roomId, data, senderWs = null) {
  const normalizedId = roomId.toUpperCase().trim();
  const payload = JSON.stringify(data);
  for (const [ws, info] of clients.entries()) {
    if (info.roomId === normalizedId && ws.readyState === WebSocket.OPEN) {
      if (!senderWs || ws !== senderWs || data.echoSender) {
        ws.send(payload);
      }
    }
  }
}

// Get list of active devices in a room
function getActiveRoomDevices(roomId) {
  const normalizedId = roomId.toUpperCase().trim();
  const devices = [];
  for (const [ws, info] of clients.entries()) {
    if (info.roomId === normalizedId && ws.readyState === WebSocket.OPEN) {
      devices.push({
        deviceId: info.deviceId,
        deviceName: info.deviceName,
        platform: info.platform,
        isRinging: !!info.isRinging,
        isAwake: !!info.isAwake,
        battery: info.battery || null,
        joinedAt: info.joinedAt
      });
    }
  }
  return devices;
}

// WebSocket Connection Management
wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      handleClientMessage(ws, data);
    } catch (err) {
      console.error('Failed to parse WS message:', err.message);
    }
  });

  ws.on('close', () => {
    const info = clients.get(ws);
    if (info) {
      clients.delete(ws);
      console.log(`🔌 Device left [${info.roomId}]: ${info.deviceName} (${info.deviceId})`);
      broadcastToRoom(info.roomId, {
        type: 'DEVICE_LIST_UPDATED',
        devices: getActiveRoomDevices(info.roomId)
      });
      addRoomLog(info.roomId, `${info.deviceName} disconnected`, 'system');
    }
  });
});

// Periodic heartbeat to clean dead connections
const pingInterval = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  }
}, 30000);

wss.on('close', () => clearInterval(pingInterval));

// Send high-priority FCM Push Notification to wake up native mobile phones & lock screens
async function sendFCMAlarmBroadcast(roomId, alarm) {
  if (!fcmMessaging) return;
  const room = getOrCreateRoom(roomId);
  const targetTokens = new Set();

  // Find tokens for targeted members
  (room.members || []).forEach(mem => {
    if (mem.fcmToken) {
      if (alarm.targetScope === 'selected' && Array.isArray(alarm.targetMembers) && alarm.targetMembers.length > 0) {
        if (alarm.targetMembers.some(name => name.toLowerCase() === mem.name.toLowerCase())) {
          targetTokens.add(mem.fcmToken);
        }
      } else {
        targetTokens.add(mem.fcmToken);
      }
    }
  });

  // Also check active clients map
  for (const [ws, info] of clients.entries()) {
    if (info.roomId === roomId && info.fcmToken) {
      if (alarm.targetScope === 'selected' && Array.isArray(alarm.targetMembers) && alarm.targetMembers.length > 0) {
        if (alarm.targetMembers.some(name => name.toLowerCase() === info.deviceName.toLowerCase())) {
          targetTokens.add(info.fcmToken);
        }
      } else {
        targetTokens.add(info.fcmToken);
      }
    }
  }

  const tokenList = Array.from(targetTokens);
  if (tokenList.length === 0) {
    console.log(`ℹ️ [FCM] No registered push tokens for room [${roomId}] (Target: ${alarm.targetScope || 'all'})`);
    return;
  }

  try {
    const payload = {
      tokens: tokenList,
      data: {
        type: 'COMBINE_ALARM_RING',
        alarmId: String(alarm.id),
        title: String(alarm.title || 'Combine Alarm'),
        time: String(alarm.time || ''),
        sound: String(alarm.sound || 'siren'),
        challenge: String(alarm.challenge || 'none'),
        consensusMode: String(alarm.consensusMode || 'any'),
        voiceMemo: String(alarm.voiceMemo || ''),
        targetScope: String(alarm.targetScope || 'all')
      },
      android: {
        priority: 'high',
        ttl: 0,
        notification: {
          channelId: 'combine_alarm_critical',
          title: `⏰ Alarm: ${alarm.title}`,
          body: `Time: ${alarm.time} • Tap to open & complete mission`,
          sound: 'default',
          priority: 'max',
          visibility: 'public'
        }
      }
    };

    const res = await fcmMessaging.sendEachForMulticast(payload);
    console.log(`📡 [FCM Push] Sent to ${tokenList.length} mobile devices. Success: ${res.successCount}, Failures: ${res.failureCount}`);
  } catch (err) {
    console.error('❌ Error sending FCM push:', err.message);
  }
}

// Message Handler
function handleClientMessage(ws, data) {
  const { type } = data;

  switch (type) {
    case 'JOIN_ROOM': {
      const { roomId, deviceId, deviceName, platform, battery } = data;
      const room = getOrCreateRoom(roomId);
      clients.set(ws, {
        roomId: room.id,
        deviceId: deviceId || crypto.randomUUID(),
        deviceName: deviceName || 'Anonymous Device',
        platform: platform || 'Web/Mobile',
        battery: battery || null,
        isRinging: false,
        isAwake: false,
        joinedAt: new Date().toISOString()
      });

      // Ensure this device is registered in room.members list
      let member = room.members.find(m => (m.deviceId && m.deviceId === deviceId) || m.name.toLowerCase() === deviceName.toLowerCase());
      if (!member) {
        member = {
          id: 'mem-' + crypto.randomUUID().substring(0, 8),
          name: deviceName,
          deviceId: deviceId,
          type: 'auto',
          joinedAt: new Date().toISOString()
        };
        room.members.push(member);
        saveDatabase();
      } else {
        member.deviceId = deviceId;
        member.lastSeen = new Date().toISOString();
        saveDatabase();
      }

      console.log(`⚡ Device joined [${room.id}]: ${deviceName} (${deviceId})`);

      // Send initial full room state to the newly joined client
      ws.send(JSON.stringify({
        type: 'ROOM_STATE_SYNC',
        room: {
          id: room.id,
          name: room.name,
          alarms: room.alarms,
          members: room.members,
          logs: room.logs
        },
        devices: getActiveRoomDevices(room.id)
      }));

      // Notify all members that a new device joined
      broadcastToRoom(room.id, {
        type: 'DEVICE_LIST_UPDATED',
        devices: getActiveRoomDevices(room.id),
        members: room.members
      });

      addRoomLog(room.id, `${deviceName} connected to the room`, 'success', deviceName);
      break;
    }

    case 'ADD_MANUAL_MEMBER': {
      const info = clients.get(ws);
      if (!info) return;
      const room = getOrCreateRoom(info.roomId);
      const name = (data.name || '').trim();
      if (!name) return;

      const exists = room.members.some(m => m.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        const newMember = {
          id: 'manual-' + crypto.randomUUID().substring(0, 8),
          name: name,
          deviceId: null,
          type: 'manual',
          addedBy: info.deviceName,
          createdAt: new Date().toISOString()
        };
        room.members.push(newMember);
        saveDatabase();

        broadcastToRoom(info.roomId, {
          type: 'MEMBERS_LIST_UPDATED',
          members: room.members,
          devices: getActiveRoomDevices(info.roomId)
        });

        addRoomLog(info.roomId, `Squad member "${name}" added by ${info.deviceName}`, 'info', info.deviceName);
      }
      break;
    }

    case 'DELETE_MEMBER': {
      const info = clients.get(ws);
      if (!info) return;
      const room = getOrCreateRoom(info.roomId);
      const memberId = data.memberId;
      const mem = room.members.find(m => m.id === memberId);
      room.members = room.members.filter(m => m.id !== memberId);
      saveDatabase();

      broadcastToRoom(info.roomId, {
        type: 'MEMBERS_LIST_UPDATED',
        members: room.members,
        devices: getActiveRoomDevices(info.roomId)
      });

      if (mem) {
        addRoomLog(info.roomId, `Member "${mem.name}" removed by ${info.deviceName}`, 'warning', info.deviceName);
      }
      break;
    }

    case 'CREATE_ALARM': {
      const info = clients.get(ws);
      if (!info) return;
      const room = getOrCreateRoom(info.roomId);
      const newAlarm = {
        id: crypto.randomUUID(),
        title: data.alarm.title || 'Combine Alarm',
        time: data.alarm.time || '08:00',
        enabled: data.alarm.enabled !== false,
        repeatMode: data.alarm.repeatMode || (Array.isArray(data.alarm.repeatDays) && data.alarm.repeatDays.length === 0 ? 'once' : 'repeat'),
        repeatDays: Array.isArray(data.alarm.repeatDays) ? data.alarm.repeatDays : [0, 1, 2, 3, 4, 5, 6],
        snoozeDuration: data.alarm.snoozeDuration !== undefined ? data.alarm.snoozeDuration : 10,
        sound: data.alarm.sound || 'nuclear',
        challenge: data.alarm.challenge || 'none',
        consensusMode: data.alarm.consensusMode || 'any',
        targetScope: data.alarm.targetScope || 'all', // 'all' or 'selected'
        targetMembers: data.alarm.targetMembers || [], // Array of targeted member names
        crescendo: !!data.alarm.crescendo,
        voiceMemo: data.alarm.voiceMemo || '',
        status: 'IDLE',
        createdBy: info.deviceName,
        createdAt: new Date().toISOString()
      };

      room.alarms.push(newAlarm);
      saveDatabase();

      broadcastToRoom(info.roomId, {
        type: 'ALARM_LIST_UPDATED',
        alarms: room.alarms,
        action: 'CREATED',
        alarm: newAlarm,
        byUser: info.deviceName
      });

      addRoomLog(info.roomId, `Alarm "${newAlarm.title}" at ${newAlarm.time} created by ${info.deviceName}`, 'info', info.deviceName);
      break;
    }

    case 'UPDATE_ALARM': {
      const info = clients.get(ws);
      if (!info) return;
      const room = getOrCreateRoom(info.roomId);
      const idx = room.alarms.findIndex(a => a.id === data.alarm.id);
      if (idx !== -1) {
        room.alarms[idx] = {
          ...room.alarms[idx],
          ...data.alarm,
          lastModifiedBy: info.deviceName,
          lastModifiedAt: new Date().toISOString()
        };
        saveDatabase();

        broadcastToRoom(info.roomId, {
          type: 'ALARM_LIST_UPDATED',
          alarms: room.alarms,
          action: 'UPDATED',
          alarm: room.alarms[idx],
          byUser: info.deviceName
        });

        addRoomLog(info.roomId, `Alarm "${room.alarms[idx].title}" modified by ${info.deviceName}`, 'info', info.deviceName);
      }
      break;
    }

    case 'DELETE_ALARM': {
      const info = clients.get(ws);
      if (!info) return;
      const room = getOrCreateRoom(info.roomId);
      const alarmToDelete = room.alarms.find(a => a.id === data.alarmId);
      room.alarms = room.alarms.filter(a => a.id !== data.alarmId);
      saveDatabase();

      broadcastToRoom(info.roomId, {
        type: 'ALARM_LIST_UPDATED',
        alarms: room.alarms,
        action: 'DELETED',
        alarmId: data.alarmId,
        byUser: info.deviceName
      });

      if (alarmToDelete) {
        addRoomLog(info.roomId, `Alarm "${alarmToDelete.title}" deleted by ${info.deviceName}`, 'warning', info.deviceName);
      }
      break;
    }

    case 'TRIGGER_INSTANT_ALERT': {
      // PANIC / INSTANT WAKE-UP BUTTON: rings all devices immediately!
      const info = clients.get(ws);
      if (!info) return;
      const { priority = 'emergency', message = 'WAKE UP CALL!', sound = 'siren' } = data;
      console.log(`🚨 INSTANT ALERT in [${info.roomId}] triggered by ${info.deviceName}: "${message}"`);

      // Mark all clients in this room as ringing
      for (const [clientWs, clientInfo] of clients.entries()) {
        if (clientInfo.roomId === info.roomId) {
          clientInfo.isRinging = true;
          clientInfo.isAwake = false;
        }
      }

      broadcastToRoom(info.roomId, {
        type: 'ALARM_RING_TRIGGERED',
        alarm: {
          id: 'instant-' + Date.now(),
          title: message,
          sound: sound,
          isInstantAlert: true,
          priority: priority,
          voiceMemo: message,
          triggeredBy: info.deviceName,
          timestamp: new Date().toISOString()
        },
        devices: getActiveRoomDevices(info.roomId)
      });

      // Send High-Priority FCM Push to all mobile devices in room
      sendFCMAlarmBroadcast(info.roomId, {
        id: 'instant-' + Date.now(),
        title: message,
        sound: sound,
        isInstantAlert: true,
        targetScope: 'all'
      });

      addRoomLog(info.roomId, `🚨 INSTANT ALERT broadcasted by ${info.deviceName}: "${message}"`, 'danger', info.deviceName);
      break;
    }

    case 'REGISTER_FCM_TOKEN': {
      const info = clients.get(ws);
      if (!info) return;
      const { fcmToken } = data;
      if (!fcmToken) return;
      info.fcmToken = fcmToken;
      const room = getOrCreateRoom(info.roomId);
      const mem = room.members.find(m => (m.deviceId && m.deviceId === info.deviceId) || m.name.toLowerCase() === info.deviceName.toLowerCase());
      if (mem) {
        mem.fcmToken = fcmToken;
        saveDatabase();
      }
      console.log(`🔑 Registered FCM Token for device [${info.deviceName}]`);
      break;
    }

    case 'DISMISS_ALARM': {
      const info = clients.get(ws);
      if (!info) return;
      const { alarmId, mode = 'any' } = data;
      const room = getOrCreateRoom(info.roomId);
      const alarm = room.alarms.find(a => a.id === alarmId);

      info.isAwake = true;
      info.isRinging = false;

      if (mode === 'any' || !alarm || alarm.consensusMode === 'any') {
        // Anyone can dismiss: stop sound on all devices
        for (const [clientWs, clientInfo] of clients.entries()) {
          if (clientInfo.roomId === info.roomId) {
            clientInfo.isRinging = false;
            clientInfo.isAwake = true;
          }
        }

        if (alarm) {
          alarm.status = 'DISMISSED';
          delete alarm.snoozeUntil;
          saveDatabase();
        }

        broadcastToRoom(info.roomId, {
          type: 'ALARM_DISMISSED',
          alarmId,
          dismissedBy: info.deviceName,
          allDismissed: true,
          devices: getActiveRoomDevices(info.roomId)
        });

        addRoomLog(info.roomId, `Alarm dismissed for everyone by ${info.deviceName}`, 'success', info.deviceName);
      } else {
        // Consensus mode 'all': only mark this specific device as awake
        const devices = getActiveRoomDevices(info.roomId);
        const awakeCount = devices.filter(d => d.isAwake).length;
        const totalCount = devices.length;

        broadcastToRoom(info.roomId, {
          type: 'USER_CHECKED_IN',
          alarmId,
          user: info.deviceName,
          deviceId: info.deviceId,
          awakeCount,
          totalCount,
          devices
        });

        addRoomLog(info.roomId, `${info.deviceName} checked in as AWAKE (${awakeCount}/${totalCount})`, 'info', info.deviceName);

        if (awakeCount >= totalCount) {
          // All checked in! Now turn off completely
          if (alarm) {
            alarm.status = 'DISMISSED';
            delete alarm.snoozeUntil;
            saveDatabase();
          }
          broadcastToRoom(info.roomId, {
            type: 'ALARM_DISMISSED',
            alarmId,
            dismissedBy: 'All Members Checked In',
            allDismissed: true,
            devices: getActiveRoomDevices(info.roomId)
          });
          addRoomLog(info.roomId, `🎉 All squad members checked in awake! Alarm deactivated.`, 'success', 'Squad');
        }
      }
      break;
    }

    case 'SNOOZE_ALARM': {
      const info = clients.get(ws);
      if (!info) return;
      const { alarmId, minutes = 5 } = data;
      const room = getOrCreateRoom(info.roomId);
      const alarm = room.alarms.find(a => a.id === alarmId);

      for (const [clientWs, clientInfo] of clients.entries()) {
        if (clientInfo.roomId === info.roomId) {
          clientInfo.isRinging = false;
        }
      }

      if (alarm) {
        alarm.status = 'SNOOZED';
        alarm.snoozeUntil = Date.now() + (minutes * 60000);
        alarm.snoozeMinutes = minutes;
        saveDatabase();
      }

      broadcastToRoom(info.roomId, {
        type: 'ALARM_SNOOZED',
        alarmId,
        snoozedBy: info.deviceName,
        minutes,
        resumeTime: new Date(Date.now() + minutes * 60000).toISOString(),
        devices: getActiveRoomDevices(info.roomId)
      });

      addRoomLog(info.roomId, `Alarm "${alarm ? alarm.title : 'Alarm'}" snoozed for ${minutes} min by ${info.deviceName}`, 'warning', info.deviceName);
      break;
    }

    case 'UPDATE_STATUS': {
      const info = clients.get(ws);
      if (info) {
        if (data.battery !== undefined) info.battery = data.battery;
        if (data.deviceName) info.deviceName = data.deviceName;
        broadcastToRoom(info.roomId, {
          type: 'DEVICE_LIST_UPDATED',
          devices: getActiveRoomDevices(info.roomId)
        });
      }
      break;
    }
  }
}

// Background scheduler tick: checks every second if an alarm or snooze is due
setInterval(() => {
  const now = new Date();
  const nowMs = now.getTime();
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTimeString = `${currentHours}:${currentMinutes}`;
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
  const currentSeconds = now.getSeconds();

  for (const [roomId, room] of Object.entries(db.rooms)) {
    for (const alarm of room.alarms) {
      if (!alarm.enabled && alarm.status !== 'SNOOZED') continue;

      // Check 1: Snooze wake-up
      const isSnoozeDue = alarm.status === 'SNOOZED' && alarm.snoozeUntil && nowMs >= alarm.snoozeUntil;

      // Check 2: Scheduled time (checked on second 0 of each minute)
      const isOnce = alarm.repeatMode === 'once' || (Array.isArray(alarm.repeatDays) && alarm.repeatDays.length === 0);
      const repeatsToday = isOnce || (!alarm.repeatDays || alarm.repeatDays.includes(currentDay));
      const isScheduleDue = currentSeconds === 0 && alarm.enabled && alarm.time === currentTimeString && repeatsToday && alarm.status !== 'RINGING';

      if (isSnoozeDue || isScheduleDue) {
        console.log(`⏰ ${isSnoozeDue ? 'Snooze expired' : 'Scheduled Alarm'} "${alarm.title}" due at ${currentTimeString} in room [${roomId}]! Ringing all devices...`);
        alarm.status = 'RINGING';
        delete alarm.snoozeUntil;
        if (isOnce && !isSnoozeDue) {
          alarm.enabled = false; // Turn off after sounding once!
        }
        saveDatabase();

        // Mark devices ringing
        for (const [clientWs, clientInfo] of clients.entries()) {
          if (clientInfo.roomId === roomId) {
            clientInfo.isRinging = true;
            clientInfo.isAwake = false;
          }
        }

        broadcastToRoom(roomId, {
          type: 'ALARM_RING_TRIGGERED',
          alarm,
          isFromSnooze: isSnoozeDue,
          devices: getActiveRoomDevices(roomId)
        });

        // Send FCM High-Priority Native Push to targeted mobile devices
        sendFCMAlarmBroadcast(roomId, alarm);

        addRoomLog(roomId, `⏰ Alarm "${alarm.title}" ${isSnoozeDue ? '(Resumed from Snooze)' : ''} is ringing all connected devices!`, 'danger', 'Alarm Engine');
      } else if (currentSeconds === 0 && alarm.time !== currentTimeString && (alarm.status === 'RINGING' || alarm.status === 'DISMISSED')) {
        // Reset state back to IDLE when minute passes
        alarm.status = 'IDLE';
        delete alarm.snoozeUntil;
        saveDatabase();
      }
    }
  }
}, 1000);

// API Endpoints for REST integration / External Webhooks
app.get('/api/status', (req, res) => {
  res.json({
    appName: 'CombineAlarm Master Server',
    version: '1.2.0',
    status: 'ONLINE',
    uptime: process.uptime(),
    localIps: getNetworkIps(),
    port: PORT,
    roomsCount: Object.keys(db.rooms).length,
    activeSockets: clients.size
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = getOrCreateRoom(req.params.roomId);
  res.json({
    room,
    devices: getActiveRoomDevices(room.id)
  });
});

// Helper to get active Cloudflare/public tunnel
function getActiveTunnelUrl() {
  const tunnelFile = path.join(__dirname, 'tunnel-url.txt');
  if (fs.existsSync(tunnelFile)) {
    try {
      const url = fs.readFileSync(tunnelFile, 'utf-8').trim();
      if (url.startsWith('https://')) return url;
    } catch (e) {}
  }
  return 'https://rca-tested-episode-belkin.trycloudflare.com';
}

// Dedicated Download Landing Page for Mobile & QR Code Scanners
app.get('/download', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// Dynamic QR Code Generation Endpoint (Standard SVG or PNG)
app.get('/api/qr', async (req, res) => {
  try {
    const ips = getNetworkIps();
    const tunnelUrl = getActiveTunnelUrl();
    const publicHost = req.query.host || req.headers['x-forwarded-host'] || req.headers.host;
    
    let hostBase;
    let isHttps = false;
    
    if (publicHost && !publicHost.startsWith('localhost') && !publicHost.startsWith('127.0.0.1')) {
      hostBase = publicHost;
      isHttps = (req.headers['x-forwarded-proto'] === 'https') || publicHost.includes('.trycloudflare.com') || publicHost.includes('.loca.lt');
    } else {
      hostBase = tunnelUrl.replace(/^https?:\/\//, '');
      isHttps = true;
    }
    
    const protocol = isHttps ? 'https' : 'http';
    const room = req.query.room || 'ALPHA-7';
    const targetType = req.query.target || 'download'; // 'download', 'direct_apk', 'join'

    let targetUrl;
    if (req.query.text) {
      targetUrl = req.query.text;
    } else if (targetType === 'direct_apk') {
      targetUrl = `${protocol}://${hostBase}/EvoAlarm.apk`;
    } else if (targetType === 'join') {
      targetUrl = `${protocol}://${hostBase}/?room=${encodeURIComponent(room)}`;
    } else {
      targetUrl = `${protocol}://${hostBase}/download?room=${encodeURIComponent(room)}`;
    }

    const format = req.query.format || 'svg';
    const size = parseInt(req.query.size) || 320;

    if (format === 'png') {
      const pngBuffer = await QRCode.toBuffer(targetUrl, {
        type: 'png',
        margin: 2,
        width: size,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.send(pngBuffer);
    } else {
      const svgString = await QRCode.toString(targetUrl, {
        type: 'svg',
        margin: 2,
        width: size,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=60');
      return res.send(svgString);
    }
  } catch (err) {
    console.error('QR code generation error:', err);
    res.status(500).json({ error: 'Failed to generate QR code', details: err.message });
  }
});

// Network & Multi-Device Sync Info Endpoint
app.get('/api/network-status', (req, res) => {
  const ips = getNetworkIps();
  const tunnelUrl = getActiveTunnelUrl();
  const localLanUrl = ips.length > 0 ? `http://${ips[0]}:${PORT}` : `http://localhost:${PORT}`;
  const room = req.query.room || 'ALPHA-7';

  res.json({
    status: 'online',
    cloudTunnel: tunnelUrl,
    localLanUrl,
    localIps: ips,
    port: PORT,
    room,
    links: {
      cloudDownload: `${tunnelUrl}/download?room=${encodeURIComponent(room)}`,
      cloudApk: `${tunnelUrl}/EvoAlarm.apk`,
      cloudWeb: `${tunnelUrl}/?room=${encodeURIComponent(room)}`,
      lanDownload: `${localLanUrl}/download?room=${encodeURIComponent(room)}`,
      lanApk: `${localLanUrl}/EvoAlarm.apk`,
      lanWeb: `${localLanUrl}/?room=${encodeURIComponent(room)}`
    }
  });
});

// QR & Sharing Info Endpoint (Legacy compatibility)
app.get('/api/qr-info', (req, res) => {
  const ips = getNetworkIps();
  const tunnelUrl = getActiveTunnelUrl();
  const defaultHost = tunnelUrl.replace(/^https?:\/\//, '');
  const room = req.query.room || 'ALPHA-7';

  res.json({
    host: defaultHost,
    networkIps: ips,
    port: PORT,
    urls: {
      downloadPage: `${tunnelUrl}/download?room=${encodeURIComponent(room)}`,
      directApk: `${tunnelUrl}/EvoAlarm.apk`,
      webAppJoin: `${tunnelUrl}/?room=${encodeURIComponent(room)}`
    },
    qrEndpoints: {
      downloadPage: `/api/qr?target=download&room=${encodeURIComponent(room)}`,
      directApk: `/api/qr?target=direct_apk&room=${encodeURIComponent(room)}`,
      webAppJoin: `/api/qr?target=join&room=${encodeURIComponent(room)}`
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ips = getNetworkIps();
  console.log('\n======================================================');
  console.log('🚀 CombineAlarm Real-Time Server running!');
  console.log(`📡 Local Computer : http://localhost:${PORT}`);
  ips.forEach(ip => {
    console.log(`📱 Other Phones/Wi-Fi: http://${ip}:${PORT}`);
  });
  console.log('======================================================\n');
});
