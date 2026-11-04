const fs = require('fs');

let html = fs.readFileSync('driver-register.html', 'utf8');

// 1. Update EN step5 I18N
const oldEnStep5 = `upLicFrontTitle: 'BRTA License (Front)',
          upLicFrontSub: 'Clear front side of card',
          upLicBackTitle: 'BRTA License (Back)',
          upLicBackSub: 'Clear back side of card',`;

const newEnStep5 = `upLicFrontTitle: "Driver's Driving License (Front)",
          upLicFrontSub: "Clear front side of BRTA Driving License card",
          upLicBackTitle: "Driver's Driving License (Back)",
          upLicBackSub: "Clear back side of BRTA Driving License card",
          carDocsTitle: "Car License & Vehicle Documents (Blue Book)",
          carDocsDesc: "Required for Owner-Drivers & Rental Fleets: Upload clear photos of your BRTA Registration Card / Blue Book and Fitness Token.",
          upCarLicFrontTitle: "Car License / Blue Book (Front)",
          upCarLicFrontSub: "Clear front of vehicle registration",
          upCarLicBackTitle: "Car License / Blue Book (Back)",
          upCarLicBackSub: "Clear back of vehicle registration",
          upCarFitnessTitle: "Car Tax Token & Fitness Certificate (Optional)",
          upCarFitnessSub: "Clear photo of valid BRTA Tax Token or Fitness paper",`;

html = html.replace(oldEnStep5, newEnStep5);

// 2. Update BN step5 I18N
const oldBnStep5 = `upLicFrontTitle: 'বিআরটিএ লাইসেন্স (সামনের অংশ)',
          upLicFrontSub: 'লাইসেন্স কার্ডের সামনের স্পষ্ট ছবি',
          upLicBackTitle: 'বিআরটিএ লাইসেন্স (পেছনের অংশ)',
          upLicBackSub: 'লাইসেন্স কার্ডের পেছনের স্পষ্ট ছবি',`;

const newBnStep5 = `upLicFrontTitle: "ড্রাইভারের ড্রাইভিং লাইসেন্স (সামনের অংশ)",
          upLicFrontSub: "বিআরটিএ ড্রাইভিং লাইসেন্স কার্ডের সামনের স্পষ্ট ছবি",
          upLicBackTitle: "ড্রাইভারের ড্রাইভিং লাইসেন্স (পেছনের অংশ)",
          upLicBackSub: "বিআরটিএ ড্রাইভিং লাইসেন্স কার্ডের পেছনের স্পষ্ট ছবি",
          carDocsTitle: "গাড়ির লাইসেন্স ও রেজিস্ট্রেশন ডকুমেন্টস (ব্লু-বুক)",
          carDocsDesc: "ওনার-ড্রাইভার ও রেন্ট-এ-কার ফ্লিটের জন্য: গাড়ির বিআরটিএ ডিজিটাল ব্লু-বুক এবং ফিটনেস সনদের ছবি আপলোড করুন।",
          upCarLicFrontTitle: "গাড়ির লাইসেন্স / ব্লু-বুক (সামনের অংশ)",
          upCarLicFrontSub: "গাড়ির রেজিস্ট্রেশন কার্ডের সামনের স্পষ্ট ছবি",
          upCarLicBackTitle: "গাড়ির লাইসেন্স / ব্লু-বুক (পেছনের অংশ)",
          upCarLicBackSub: "গাড়ির রেজিস্ট্রেশন কার্ডের পেছনের স্পষ্ট ছবি",
          upCarFitnessTitle: "ট্যাক্স টোকেন ও ফিটনেস সার্টিফিকেট (ঐচ্ছিক)",
          upCarFitnessSub: "বৈধ বিআরটিএ ট্যাক্স টোকেন বা ফিটনেস সনদের স্পষ্ট ছবি",`;

html = html.replace(oldBnStep5, newBnStep5);

// 3. Update setLanguage function
const oldSetLangStep5 = `const upsnb = document.getElementById('up-sub-nid-back'); if (upsnb) upsnb.textContent = s5.upNidBackSub;`;

const newSetLangStep5 = `const upsnb = document.getElementById('up-sub-nid-back'); if (upsnb) upsnb.textContent = s5.upNidBackSub;
      const tcDocs = document.getElementById('title-car-docs'); if (tcDocs && s5.carDocsTitle) tcDocs.textContent = s5.carDocsTitle;
      const dcDocs = document.getElementById('desc-car-docs'); if (dcDocs && s5.carDocsDesc) dcDocs.textContent = s5.carDocsDesc;
      const uptcf = document.getElementById('up-title-car-lic-front'); if (uptcf && s5.upCarLicFrontTitle) uptcf.textContent = s5.upCarLicFrontTitle;
      const upscf = document.getElementById('up-sub-car-lic-front'); if (upscf && s5.upCarLicFrontSub) upscf.textContent = s5.upCarLicFrontSub;
      const uptcb = document.getElementById('up-title-car-lic-back'); if (uptcb && s5.upCarLicBackTitle) uptcb.textContent = s5.upCarLicBackTitle;
      const upscb = document.getElementById('up-sub-car-lic-back'); if (upscb && s5.upCarLicBackSub) upscb.textContent = s5.upCarLicBackSub;
      const uptfit = document.getElementById('up-title-car-fitness'); if (uptfit && s5.upCarFitnessTitle) uptfit.textContent = s5.upCarFitnessTitle;
      const upsfit = document.getElementById('up-sub-car-fitness'); if (upsfit && s5.upCarFitnessSub) upsfit.textContent = s5.upCarFitnessSub;`;

html = html.replace(oldSetLangStep5, newSetLangStep5);

// 4. Update populateSummary to show both Driver License and Car License
const oldPopulateSummaryLic = `const licVal = document.getElementById('drv-license').value || '—';
      const licExp = document.getElementById('drv-expiry').value || '—';`;

const newPopulateSummaryLic = `const licVal = document.getElementById('drv-license').value || '—';
      const licExp = document.getElementById('drv-expiry').value || '—';
      const carPlateVal = (role === 'car_owner_driver' ? (document.getElementById('drv-car-plate')?.value || '—') : (role === 'rental_fleet_operator' ? (fleetVehicles.map(v => v.plate).filter(Boolean).join(', ') || 'Fleet Multi-Car') : 'Rownaa Fleet Provided'));`;

html = html.replace(oldPopulateSummaryLic, newPopulateSummaryLic);

fs.writeFileSync('driver-register.html', html, 'utf8');
console.log('Successfully patched I18N and language bindings for dual licenses in driver-register.html');

