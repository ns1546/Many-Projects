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
      const json = JSON.parse(data);
      console.log('Total chauffeurs:', json.chauffeurs.length);
      for (let i = 0; i < json.chauffeurs.length; i++) {
        console.log(`\n=== ROW ${i + 2} ===`);
        console.log(JSON.stringify(json.chauffeurs[i], null, 2));
      }
    });
  }).on('error', console.error);
}

fetchGet(url);

