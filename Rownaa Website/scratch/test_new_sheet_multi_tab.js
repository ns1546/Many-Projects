const https = require('https');

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxv6GREV5g3rJz5Bo1OMKUGyGFh8UdLeAzkPtThvqdmbtAMzLUORcRxBjy4dIH18IvgXg/exec';

function postPayload(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const parsed = new URL(WEBHOOK_URL);

    const options = {
      hostname: parsed.hostname,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect (Apps Script redirects POST responses with 302 to an execution URL)
        const redirectUrl = new URL(res.headers.location);
        https.get(redirectUrl, (rRes) => {
          let data = '';
          rRes.on('data', chunk => data += chunk);
          rRes.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch(e) {
              resolve(data);
            }
          });
        }).on('error', reject);
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runTest() {
  console.log('Testing Multi-Tab Rental Fleet Ingestion on New Google Sheet Webhook...');

  const fleetPayload = {
    applicationId: 'FLT-TEST-8801',
    fullName: 'Al-Amin Hossain',
    phone: '01719998811',
    nidNumber: '1985999881122',
    baseCity: 'Dhaka (Gulshan)',
    businessName: 'Apex Luxury Rent-A-Car Ltd.',
    officeAddress: 'House 42, Road 11, Block D, Banani, Dhaka',
    tradeLicenseNumber: 'TRAD/DNCC/019284/2024',
    role: 'rental_owner',
    payoutWallet: 'Dutch Bangla Bank (Gulshan Br) - A/C: 115120004992',
    services: ['Airport Transfer', 'Corporate VIP Protocol', 'Intercity Round Trip', 'Choose Your Car'],
    fleetData: {
      totalCars: 2,
      totalDrivers: 2,
      cars: [
        {
          model: 'Toyota HiAce Super GL',
          reg: 'Dhaka Metro Cha 53-8801',
          year: '2022',
          seats: '11 Seats',
          fuel: 'Octane / Hybrid',
          fitnessExpiry: '2028-05-15'
        },
        {
          model: 'Hyundai Staria VIP Lounge',
          reg: 'Dhaka Metro GA-11-8802',
          year: '2023',
          seats: '7 Seats',
          fuel: 'Octane',
          fitnessExpiry: '2029-01-20'
        }
      ],
      drivers: [
        {
          name: 'Md. Delowar Hossain',
          phone: '01819998822',
          nid: '199088223344',
          license: 'DK-882299A',
          licenseClass: 'Professional Heavy',
          licenseExpiry: '2028-10-10',
          assignedPlate: 'Dhaka Metro Cha 53-8801'
        },
        {
          name: 'Shahidul Islam',
          phone: '01919998833',
          nid: '199488334455',
          license: 'DK-883311B',
          licenseClass: 'Professional Light',
          licenseExpiry: '2027-08-25',
          assignedPlate: 'Dhaka Metro GA-11-8802'
        }
      ]
    }
  };

  try {
    const res = await postPayload(fleetPayload);
    console.log('Webhook Response:', JSON.stringify(res, null, 2));
  } catch(err) {
    console.error('Test Failed:', err);
  }
}

runTest();

