const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwta7x5wTA-nCmTqsMalRQF45WaWqk6Iq9kQneEXXwQl33tOl5JtpwewmV5qJgVQpEz7Q/exec';

async function testLiveWebhook() {
  console.log('📡 Testing direct submission to User Google Sheet Webhook...');

  const samplePhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  const testPayload = {
    applicationId: 'DRV-DAC-8921',
    fullName: 'Kamal Uddin Majumdar',
    phone: '+880 1712 345678',
    nidNumber: '1988269458000192',
    baseCity: 'Dhaka - Gulshan & Airport Zone',
    emergencyContact: 'Rehana Begum (+880 1911 223344)',
    licenseNumber: 'DL-DH-77889',
    licenseType: 'Professional Light',
    licenseExpiry: '2028-11-20',
    experience: '7+ Years Executive Driving',
    languages: 'Bengali, Functional English, Hindi',
    services: 'VIP Airport Transfer, Executive Corporate Chauffeur, Intercity Tours',
    availability: 'full_time',
    role: 'Fleet Chauffeur',
    carModel: 'N/A (Fleet Vehicle Assigned)',
    payoutWallet: 'bKash Personal - 01712345678',
    status: 'Pending Verification',
    submittedAt: new Date().toISOString(),
    photoBase64: samplePhoto
  };

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    const text = await res.text();
    console.log('HTTP Status:', res.status);
    console.log('Response body:', text);
  } catch (err) {
    console.error('Error sending to webhook:', err);
  }
}

testLiveWebhook();

