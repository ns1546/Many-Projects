const fs = require('fs');

function checkAndFix(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the unescaped apostrophes
  content = content.replace(
    "role1Desc: 'Professional chauffeur looking to be assigned to a Rownaa Fleet Partner's vehicle.'",
    "role1Desc: 'Professional chauffeur looking to be assigned to a Rownaa Fleet Partner\\'s vehicle.'"
  );
  content = content.replace(
    "vehicleDesc: 'Since you are registering as an Owner-Driver, enter your car's model and registration details as per BRTA documents.'",
    "vehicleDesc: 'Since you are registering as an Owner-Driver, enter your car\\'s model and registration details as per BRTA documents.'"
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

checkAndFix('driver-register.html');
checkAndFix('netlify-driver-portal/index.html');

