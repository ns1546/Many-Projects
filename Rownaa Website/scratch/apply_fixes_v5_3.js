const fs = require('fs');

// 1. UPDATE GOOGLE_SHEET_WEBHOOK.GS
function updateWebhook(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Add clearDataValidations in setupSheet
  const targetSetup = 'sheet.getRange("S:S").setNumberFormat("@"); // Payout Account';
  const replacementSetup = `sheet.getRange("S:S").setNumberFormat("@"); // Payout Account

  // CRITICAL: Clear any legacy data validations from all other columns (especially Column R / 18)
  sheet.getRange(2, 1, 1000, 19).clearDataValidations();
  sheet.getRange(2, 21, 1000, 8).clearDataValidations();`;

  if (content.includes(targetSetup) && !content.includes('clearDataValidations();')) {
    content = content.replace(targetSetup, replacementSetup);
  }

  // Add clearDataValidations in repairExistingErrors
  const targetRepair = 'var lastRow = sheet.getLastRow();\n  if (lastRow < 2) return;';
  const replacementRepair = `var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  // Clear legacy data validations from Column R (Vehicle Profile) and Column S
  sheet.getRange(2, 18, Math.max(lastRow - 1, 1), 2).clearDataValidations();`;

  if (content.includes(targetRepair) && !content.includes('clearDataValidations();')) {
    content = content.replace(targetRepair, replacementRepair);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

updateWebhook('google_sheet_webhook.gs');
updateWebhook('netlify-driver-portal/google_sheet_webhook.gs');

// 2. UPDATE DRIVER-REGISTER.HTML AND NETLIFY INDEX.HTML
function updateHtml(filePath) {
  let html = fs.readFileSync(filePath, 'utf8');

  // Remove Section 3: Google Sheets Webhook Database URL from the modal HTML
  const startSec = '<!-- Section 3: Google Sheets Webhook Database URL -->';
  const endSec = '</div>\n\n      </div>\n\n      <!-- Modal Footer -->';
  
  const startIdx = html.indexOf(startSec);
  if (startIdx !== -1) {
    const endIdx = html.indexOf('<!-- Modal Footer -->', startIdx);
    if (endIdx !== -1) {
      // Find the closing </div> of sm-section-box before <!-- Modal Footer -->
      const boxCloseIdx = html.lastIndexOf('</div>', endIdx);
      if (boxCloseIdx !== -1) {
        html = html.substring(0, startIdx) + html.substring(endIdx);
        console.log('Removed Section 3 from modal in ' + filePath);
      }
    }
  }

  // Clean JavaScript references to sm-sheet-url in applyDriverSettings
  html = html.replace(
    /const sheetUrlInput = document\.getElementById\('sm-sheet-url'\);\s*if \(sheetUrlInput\) sheetUrlInput\.value = GOOGLE_SHEET_WEBHOOK_URL;/g,
    '// Webhook managed internally'
  );

  // Clean JavaScript references in saveAndApplySettingsModal
  html = html.replace(
    /const sheetUrlInput = document\.getElementById\('sm-sheet-url'\);\s*if \(sheetUrlInput\) \{\s*const url = sheetUrlInput\.value\.trim\(\);\s*driverSettings\.sheetWebhookUrl = url;\s*GOOGLE_SHEET_WEBHOOK_URL = url;\s*localStorage\.setItem\('rownaa_gsheet_url', url\);\s*\}/g,
    '// Webhook URL preserved internally'
  );

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Updated ' + filePath);
}

updateHtml('driver-register.html');
updateHtml('netlify-driver-portal/index.html');
