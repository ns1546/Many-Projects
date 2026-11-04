const https = require('https');

const targetWebhook = 'https://script.google.com/macros/s/AKfycbxv6GREV5g3rJz5Bo1OMKUGyGFh8UdLeAzkPtThvqdmbtAMzLUORcRxBjy4dIH18IvgXg/exec';

// Generate tiny valid 1x1 pixel base64 jpeg
const sampleBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';

function postPayload(payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    const parsed = new URL(targetWebhook);

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
        // Apps Script redirects POST response (302) to an echo GET URL
        const redirectUrl = new URL(res.headers.location);
        https.get(redirectUrl, (rRes) => {
          let data = '';
          rRes.on('data', chunk => data += chunk);
          rRes.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch(e) {
              resolve({ raw: data, statusCode: rRes.statusCode });
            }
          });
        }).on('error', reject);
        return;
      }

      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve({ raw: body, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runAllTests() {
  console.log('=== STARTING LIVE ENTERPRISE VERIFICATION TESTS ===\n');

  // Test 1: Solo Driver
  console.log('1. Submitting Solo Chauffeur Application (DRV-SOLO-VERIFY-1)...');
  const soloPayload = {
    applicationId: 'DRV-SOLO-VERIFY-1',
    id: 'DRV-SOLO-VERIFY-1',
    submittedAt: new Date().toISOString(),
    fullName: 'Tanvir Ahmed',
    name: 'Tanvir Ahmed',
    phone: '01712345678',
    nidNumber: '1994269201948571',
    baseCity: 'Dhaka (Uttara)',
    emergencyContact: { name: 'Brother', phone: '01712999000' },
    licenseNumber: 'DK9845210A',
    licenseType: 'Professional Light',
    licenseExpiry: '2028-11-20',
    experience: '5-10 Years',
    languages: 'Bangla Native + Conversational English',
    services: ['Airport Transfer', 'Corporate VIP Protocol'],
    availability: 'full_time',
    role: 'seeking_fleet_car',
    vehicleProfile: 'N/A (Fleet Chauffeur)',
    payoutMethod: 'bKash Personal',
    payoutNumber: '01712345678',
    payoutWallet: 'bKash Personal - 01712345678',
    photoBase64: sampleBase64,
    licenseFrontBase64: sampleBase64,
    licenseBackBase64: sampleBase64,
    nidFrontBase64: sampleBase64,
    nidBackBase64: sampleBase64
  };

  const soloRes = await postPayload(soloPayload);
  console.log('Solo Result:', soloRes);

  // Test 2: Owner-Driver
  console.log('\n2. Submitting Owner-Driver Application (DRV-OWNER-VERIFY-2)...');
  const ownerPayload = {
    applicationId: 'DRV-OWNER-VERIFY-2',
    id: 'DRV-OWNER-VERIFY-2',
    submittedAt: new Date().toISOString(),
    fullName: 'Kazi Shafiqul Islam',
    phone: '01819876543',
    nidNumber: '1988269201123456',
    baseCity: 'Dhaka (Dhanmondi)',
    emergencyContact: { name: 'Son', phone: '01819111222' },
    licenseNumber: 'DK1234567B',
    licenseType: 'Professional Light',
    licenseExpiry: '2029-05-15',
    carLicenseNumber: 'Dhaka Metro GA 29-1092',
    carPlate: 'Dhaka Metro GA 29-1092',
    carFitnessExpiry: '2027-08-30',
    experience: '10+ Years Executive',
    languages: 'Bangla + Fluent English',
    services: ['Executive Chauffeur', 'Intercity Round Trip', 'Choose Your Car'],
    availability: 'full_time',
    role: 'car_owner_driver',
    ownerCar: {
      model: 'Toyota Premio 1.5X',
      plateNumber: 'Dhaka Metro GA 29-1092',
      seats: '4 Seats',
      year: '2020',
      fitnessExpiry: '2027-08-30'
    },
    vehicleProfile: 'Toyota Premio 1.5X [Dhaka Metro GA 29-1092] (4 Seats, 2020)',
    payoutMethod: 'Bank Transfer',
    payoutWallet: 'Bank: City Bank (Dhanmondi Br) - A/C: 22019920199 [Current Account - Kazi Shafiqul Islam]',
    bankDetails: {
      bankName: 'City Bank',
      branch: 'Dhanmondi Branch',
      accountName: 'Kazi Shafiqul Islam',
      accountNumber: '22019920199',
      routingNumber: '090261199',
      accountType: 'Current Account'
    },
    photoBase64: sampleBase64,
    licenseFrontBase64: sampleBase64,
    licenseBackBase64: sampleBase64,
    carLicenseFrontBase64: sampleBase64,
    carLicenseBackBase64: sampleBase64,
    carFitnessBase64: sampleBase64,
    nidFrontBase64: sampleBase64,
    nidBackBase64: sampleBase64
  };

  const ownerRes = await postPayload(ownerPayload);
  console.log('Owner Result:', ownerRes);

  // Test 3: Rental Fleet Service Agency
  console.log('\n3. Submitting Rental Fleet Agency Application (FLT-AGENCY-VERIFY-3 with 2 Cars, 2 Drivers)...');
  const fleetPayload = {
    applicationId: 'FLT-AGENCY-VERIFY-3',
    id: 'FLT-AGENCY-VERIFY-3',
    submittedAt: new Date().toISOString(),
    fullName: 'Syed Rezaul Karim',
    businessName: 'Imperial Fleet & Rental Services Ltd.',
    companyName: 'Imperial Fleet & Rental Services Ltd.',
    tradeLicenseNumber: 'TRAD/DNCC/082736/2023',
    tradeLicense: 'TRAD/DNCC/082736/2023',
    officeAddress: 'Road 11, Banani, Dhaka',
    phone: '01911223344',
    nidNumber: '1975269201998877',
    baseCity: 'Dhaka (Banani)',
    emergencyContact: { name: 'Operations Manager', phone: '01911998877' },
    services: ['Airport Transfer', 'Corporate VIP Protocol', 'Intercity Round Trip', 'Event Fleet Support', 'Choose Your Car'],
    availability: 'full_time',
    role: 'rental_fleet_operator',
    driverRole: 'rental_fleet_operator',
    payoutMethod: 'Bank Transfer',
    payoutWallet: 'Bank: BRAC Bank (Banani Br) - A/C: 1501204899200001 [Corporate Account - Imperial Fleet & Rental Services Ltd.]',
    bankDetails: {
      bankName: 'BRAC Bank',
      branch: 'Banani Branch',
      accountName: 'Imperial Fleet & Rental Services Ltd.',
      accountNumber: '1501204899200001',
      routingNumber: '060260481',
      accountType: 'Corporate Account'
    },
    fleetData: {
      totalCars: 2,
      totalDrivers: 2,
      vehicles: [
        {
          model: 'Toyota HiAce Grand Cabin VIP',
          plate: 'Dhaka Metro Cha 53-9901',
          seats: '10-14 Seats',
          fuel: 'Octane + CNG',
          year: '2022',
          fitnessExpiry: '2028-06-30',
          carLicenseFrontBase64: sampleBase64,
          carLicenseBackBase64: sampleBase64,
          carFitnessBase64: sampleBase64
        },
        {
          model: 'Hyundai Staria VIP Lounge',
          plate: 'Dhaka Metro GA 45-8812',
          seats: '7 Seats',
          fuel: 'Hybrid (Petrol/Electric)',
          year: '2023',
          fitnessExpiry: '2028-12-31',
          carLicenseFrontBase64: sampleBase64,
          carLicenseBackBase64: sampleBase64,
          carFitnessBase64: sampleBase64
        }
      ],
      drivers: [
        {
          name: 'Md. Rafiqul Islam',
          phone: '01711002233',
          nid: '19852692010011',
          license: 'DK7722119',
          licenseClass: 'Professional Heavy',
          licenseExpiry: '2029-03-10',
          assignedPlate: 'Dhaka Metro Cha 53-9901',
          licenseFrontBase64: sampleBase64,
          licenseBackBase64: sampleBase64
        },
        {
          name: 'Nurul Absar',
          phone: '01811003344',
          nid: '19902692010022',
          license: 'DK8833220',
          licenseClass: 'Professional Light',
          licenseExpiry: '2030-01-15',
          assignedPlate: 'Dhaka Metro GA 45-8812',
          licenseFrontBase64: sampleBase64,
          licenseBackBase64: sampleBase64
        }
      ]
    },
    photoBase64: sampleBase64,
    nidFrontBase64: sampleBase64,
    nidBackBase64: sampleBase64,
    tradeLicenseBase64: sampleBase64
  };

  const fleetRes = await postPayload(fleetPayload);
  console.log('Fleet Result:', fleetRes);

  // Test 4: Resubmission / Correction of Solo Driver
  console.log('\n4. Submitting Resubmission Correction for Solo Chauffeur (Duplicate Tracker Test)...');
  const resubmitPayload = {
    ...soloPayload,
    applicationId: 'DRV-SOLO-VERIFY-1-CORRECTED',
    id: 'DRV-SOLO-VERIFY-1-CORRECTED',
    submittedAt: new Date().toISOString(),
    isResubmission: true,
    previousApplicationId: 'DRV-SOLO-VERIFY-1',
    correctionReason: 'Wrong Phone Number in Previous Submission',
    correctionNotes: 'Corrected phone and base district to Uttara Sector 4.'
  };

  const resubmitRes = await postPayload(resubmitPayload);
  console.log('Resubmission Result:', resubmitRes);

  console.log('\n=== ALL TESTS FINISHED SUCCESSFULLY! ===');
}

runAllTests().catch(err => console.error('Test error:', err));
