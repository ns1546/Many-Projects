/**
 * ONE-TIME SETUP SCRIPT
 * Run this ONCE: node scripts/drive-auth.js
 * It will open your browser, ask for Google Drive permission,
 * and save a token file (drive-token.json) permanently.
 * After that, auto-backup.js will use that token automatically forever.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CREDENTIALS_PATH = path.resolve(__dirname, '../client_secret_336113528136-o9fb9qlobtc0ql8dvhn6hq19mka8dfqe.apps.googleusercontent.com.json');
const TOKEN_PATH = path.resolve(__dirname, '../drive-token.json');
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const { client_id, client_secret, redirect_uris } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
});

console.log('\n===========================================================');
console.log('STEP 1: Open this URL in your browser and log in:');
console.log('\n' + authUrl + '\n');
console.log('STEP 2: After approving, Google will show you a code.');
console.log('STEP 3: Copy that code and paste it below.');
console.log('===========================================================\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Paste the authorization code here: ', async (code) => {
  rl.close();
  try {
    const { tokens } = await oAuth2Client.getToken(code.trim());
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('\n✅ SUCCESS! Token saved to drive-token.json');
    console.log('You can now run backups anytime with: node scripts/auto-backup.js run');
  } catch (err) {
    console.error('❌ Failed to get token:', err.message);
  }
});
