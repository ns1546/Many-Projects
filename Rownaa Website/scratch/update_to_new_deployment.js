const fs = require('fs');

const OLD_DEPLOYMENT = 'AKfycbxv6GREV5g3rJz5Bo1OMKUGyGFh8UdLeAzkPtThvqdmbtAMzLUORcRxBjy4dIH18IvgXg';
const NEW_DEPLOYMENT = 'AKfycbwgSv5OXT-z0dKr06cWRs5r1T-lrT3OYhVmvLQHbwQ7DuteyRoKrjMvAjrfRv9X35dW';

const filesToUpdate = [
  'driver-register.html',
  'netlify-driver-portal/index.html',
  'Rownaa-Frontend-Netlify/driver-register.html'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(OLD_DEPLOYMENT)) {
      content = content.split(OLD_DEPLOYMENT).join(NEW_DEPLOYMENT);
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Updated ${file} with NEW Deployment ID`);
    } else {
      console.log(`⚠️ ${file} did not contain old deployment ID, checking if already new...`);
      if (content.includes(NEW_DEPLOYMENT)) {
        console.log(`ℹ️ ${file} already has NEW Deployment ID!`);
      }
    }
  }
});
