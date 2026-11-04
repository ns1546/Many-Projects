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
        console.log('\n--- FIRST ENTRY (Row 2 in Sheet) ---');
        console.log(JSON.stringify(json.chauffeurs[0], null, 2));

        console.log('\n--- SECOND ENTRY (Row 3 in Sheet) ---');
        console.log(JSON.stringify(json.chauffeurs[1], null, 2));

        console.log('\n--- LATEST ENTRY (Row ' + (json.chauffeurs.length + 1) + ' in Sheet) ---');
        console.log(JSON.stringify(json.chauffeurs[json.chauffeurs.length - 1], null, 2));
      } catch (e) {
        console.error(e);
      }
    });
  }).on('error', console.error);
}

fetchGet(url);

