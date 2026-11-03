import fs from 'fs';
import path from 'path';

// 1. Patch next-auth/react/index.js
const reactIndexPath = path.resolve('node_modules', 'next-auth', 'react', 'index.js');
if (fs.existsSync(reactIndexPath)) {
  let content = fs.readFileSync(reactIndexPath, 'utf8');

  // Replace __NEXTAUTH declaration with 100% browser-safe defaults
  const nextAuthRegex = /var __NEXTAUTH = \{[\s\S]*?_getSession: function _getSession\(\) \{\}\s*\};/;
  const safeNextAuth = `var __NEXTAUTH = {
  baseUrl: typeof window !== "undefined" && window.location ? window.location.origin : "http://localhost:3000",
  basePath: "/api/auth",
  baseUrlServer: typeof window !== "undefined" && window.location ? window.location.origin : "http://localhost:3000",
  basePathServer: "/api/auth",
  _lastSync: 0,
  _session: undefined,
  _getSession: function _getSession() {}
};`;

  if (nextAuthRegex.test(content)) {
    content = content.replace(nextAuthRegex, safeNextAuth);
  }

  // Also replace any remaining process.env in react/index.js
  content = content.replaceAll('process.env.NODE_ENV !== "production"', 'typeof process !== "undefined" && process?.env?.NODE_ENV !== "production"');
  content = content.replaceAll('_p.NEXTAUTH_URL', '"http://localhost:3000"');
  content = content.replaceAll('_p.VERCEL_URL', '"localhost:3000"');
  content = content.replaceAll('_p.NEXTAUTH_URL_INTERNAL', '"http://localhost:3000"');
  content = content.replaceAll('process.env.NEXTAUTH_URL', '"http://localhost:3000"');

  fs.writeFileSync(reactIndexPath, content, 'utf8');
  console.log('[patch-next-auth] Successfully patched next-auth/react/index.js with rock-solid __NEXTAUTH config.');
}

// 2. Patch next-auth/utils/detect-origin.js
const detectOriginPath = path.resolve('node_modules', 'next-auth', 'utils', 'detect-origin.js');
if (fs.existsSync(detectOriginPath)) {
  let content = fs.readFileSync(detectOriginPath, 'utf8');
  content = `\"use strict\";
Object.defineProperty(exports, \"__esModule\", { value: true });
exports.detectOrigin = detectOrigin;
function detectOrigin(forwardedHost, protocol) {
  var env = typeof process !== "undefined" && process && process.env ? process.env : {};
  if (env.NEXTAUTH_URL) return env.NEXTAUTH_URL;
  if (env.VERCEL || env.AUTH_TRUST_HOST) return (protocol === "http" ? "http" : "https") + "://" + forwardedHost;
  return "http://localhost:3000";
}
`;
  fs.writeFileSync(detectOriginPath, content, 'utf8');
  console.log('[patch-next-auth] Successfully patched next-auth/utils/detect-origin.js');
}

// 3. Patch process/browser.js to provide standard env
const processBrowserPath = path.resolve('node_modules', 'process', 'browser.js');
if (fs.existsSync(processBrowserPath)) {
  let content = fs.readFileSync(processBrowserPath, 'utf8');
  content = content.replace(
    'process.env = {};',
    'process.env = { NODE_ENV: "development", NEXTAUTH_URL: "http://localhost:3000", NEXTAUTH_URL_INTERNAL: "http://localhost:3000", VERCEL_URL: "localhost:3000" };'
  );
  fs.writeFileSync(processBrowserPath, content, 'utf8');
  console.log('[patch-next-auth] Successfully patched process/browser.js with default env properties.');
}
