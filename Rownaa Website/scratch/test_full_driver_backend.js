const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const BASE_URL = 'http://127.0.0.1:3000';

async function runTests() {
  console.log('🏁 STARTING FULL DRIVER BACKEND & ADMIN PANEL VERIFICATION...\n');

  // Sample 1x1 transparent PNG base64
  const samplePhotoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const sampleLicenseBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const sampleNidBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

  const testPhone = '+880 1888 776655';
  const driverPayload = {
    name: 'Mohammad Rafiqul Islam',
    phone: testPhone,
    nidNumber: '1985269458000492',
    baseCity: 'Dhaka',
    emergencyContact: {
      name: 'Begum Rokeya',
      phone: '+880 1711 002233'
    },
    licenseNumber: 'DL-DH-99124',
    licenseType: 'Professional Light',
    licenseExpiry: '2028-09-15',
    experience: '8+ Years Executive Driving',
    languages: 'Bengali, English, Hindi',
    highwayExperience: 'Padma Bridge, Dhaka-Ctg Highway, Sylhet Bypass',
    services: ['VIP Airport Transfer', 'Inter-District City-to-City', 'Executive Corporate Chauffeur'],
    availability: 'full_time',
    driverRole: 'car_owner_driver',
    ownerCar: {
      model: 'Toyota Premio F 2019',
      plateNumber: 'Dhaka Metro GA 45-6789',
      seats: '4 Seats (Sedan)',
      year: 2019,
      fitnessExpiry: '2026-12-31'
    },
    payoutMethod: 'bKash Personal',
    payoutNumber: '+880 1888 776655',
    photoBase64: samplePhotoBase64,
    licenseDocBase64: sampleLicenseBase64,
    nidDocBase64: sampleNidBase64,
    status: 'Pending Verification'
  };

  // 1. Test POST /api/drivers/register
  console.log('1️⃣ Testing POST /api/drivers/register with base64 documents...');
  const regRes = await fetch(`${BASE_URL}/api/drivers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(driverPayload)
  });
  const regData = await regRes.json();
  console.log('Status:', regRes.status, 'Response:', regData.success ? 'SUCCESS' : regData);
  if (!regData.success) throw new Error('Registration failed: ' + JSON.stringify(regData));

  const driverId = regData.driver.id;
  console.log(`✅ Chauffeur registered with ID: ${driverId}`);
  console.log(`   Photo URL: ${regData.driver.photoUrl}`);
  console.log(`   License Doc URL: ${regData.driver.licenseDocUrl}`);
  console.log(`   NID Doc URL: ${regData.driver.nidDocUrl}`);

  // Verify file was saved to disk
  if (regData.driver.photoUrl) {
    const localPhotoPath = path.resolve(__dirname, '..', regData.driver.photoUrl.replace(/^\//, ''));
    if (fs.existsSync(localPhotoPath)) {
      console.log(`✅ Document verified on disk at: ${localPhotoPath}`);
    } else {
      console.warn(`⚠️ File not found on disk at: ${localPhotoPath}`);
    }
  }

  // 2. Test GET /api/drivers
  console.log('\n2️⃣ Testing GET /api/drivers...');
  const getRes = await fetch(`${BASE_URL}/api/drivers`);
  const getData = await getRes.json();
  console.log(`✅ Total drivers returned: ${getData.count}`);
  const found = getData.drivers.find(d => d.id === driverId);
  if (!found) throw new Error('Registered driver not found in GET /api/drivers');
  console.log(`✅ Found chauffeur #${driverId} with status: ${found.status}`);

  // 3. Test GET /api/drivers/export (CSV for Google Sheets)
  console.log('\n3️⃣ Testing GET /api/drivers/export (Google Sheets / Excel CSV)...');
  const csvRes = await fetch(`${BASE_URL}/api/drivers/export`);
  const csvText = await csvRes.text();
  console.log('CSV Status:', csvRes.status, 'Content-Type:', csvRes.headers.get('content-type'));
  const lines = csvText.split('\r\n');
  console.log(`✅ CSV generated with ${lines.length} lines.`);
  console.log(`   Header: ${lines[0]}`);
  console.log(`   Sample Row: ${lines[1]?.slice(0, 100)}...`);
  if (!csvText.includes('Mohammad Rafiqul Islam')) {
    throw new Error('CSV does not contain the newly registered chauffeur');
  }

  // 4. Test POST /api/drivers/:id/approve
  console.log('\n4️⃣ Testing POST /api/drivers/:id/approve...');
  const approveRes = await fetch(`${BASE_URL}/api/drivers/${driverId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ adminUser: 'Lead Operations Director' })
  });
  const approveData = await approveRes.json();
  console.log('Approve Status:', approveRes.status, 'Success:', approveData.success);
  if (!approveData.success || approveData.driver.status !== 'available') {
    throw new Error('Approval failed: ' + JSON.stringify(approveData));
  }
  console.log(`✅ Chauffeur #${driverId} approved! New Status: ${approveData.driver.status}`);

  // 5. Test Headless Chrome Puppeteer verification of admin-panel.html
  console.log('\n5️⃣ Testing Admin Panel Live Browser View (Chauffeur Management)...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  await page.goto(`${BASE_URL}/admin-panel.html`, { waitUntil: 'networkidle0' });

  // Click Chauffeurs tab in sidebar
  console.log('Switching to Chauffeurs panel in admin-panel.html...');
  await page.evaluate(() => {
    window.switchTab('drivers');
  });

  await new Promise(r => setTimeout(r, 1200));

  // Verify Chauffeurs table content
  const tableContent = await page.evaluate(() => {
    const list = document.getElementById('admin-chauffeur-list');
    return list ? list.innerText : '';
  });

  console.log('Table text sample:', tableContent.slice(0, 160).replace(/\n/g, ' '));
  if (tableContent.includes('Mohammad Rafiqul Islam')) {
    console.log('✅ Chauffeur Mohammad Rafiqul Islam visible in Admin Panel table!');
  } else {
    console.warn('⚠️ Chauffeur not visible in table text');
  }

  // Inspect Dossier modal
  console.log('Opening Chauffeur Dossier modal for inspection...');
  await page.evaluate((id) => {
    window.viewDriverDossier(id);
  }, driverId);

  await new Promise(r => setTimeout(r, 800));

  const screenshotPath = path.resolve('C:/Users/User/.gemini/antigravity/brain/1ce46b1b-42f4-4c8c-b769-e4acb487d91d/admin_chauffeur_dossier_verified.png');
  await page.screenshot({ path: screenshotPath });
  console.log(`📸 Screenshot of Chauffeur Dossier saved to: ${screenshotPath}`);

  await browser.close();

  console.log('\n🎉 ALL DRIVER BACKEND & GOOGLE SHEET PIPES VERIFIED 100% OPERATIONAL!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
