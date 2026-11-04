const https = require('https');
const url = 'https://script.google.com/macros/s/AKfycbz0S9TFcB-6fIqtGba095AZ8CJiYaQi_NLH3h-i0Dq1Yp3sqWDvfasxAJSLaVIidcgH/exec?action=getChauffeurs';

function fetchGet(urlStr) {
  https.get(urlStr, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      return fetchGet(res.headers.location);
    }
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('Total chauffeurs:', json.chauffeurs.length);
        json.chauffeurs.forEach((c, idx) => {
          console.log(`Row ${idx + 2}: ID=${c.id} | Name=${c.name} | Role=${c.role} | Status=${c.status} | Vehicle=${c.vehicle} | Payout=${c.payout} | Audit=${c.auditTracker}`);
        });
      } catch (e) {
        console.error(e);
      }
    });
  }).on('error', console.error);
}

fetchGet(url);
