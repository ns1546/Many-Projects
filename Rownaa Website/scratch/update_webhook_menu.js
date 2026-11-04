const fs = require('fs');

function updateWebhookGs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update onOpen menu to make "🔄 Rebuild & Setup Entire System" first
  const oldMenuSnippet = `ui.createMenu("⚡ Rownaa Operations")
    .addItem("💬 Open WhatsApp for Selected Driver", "openWhatsAppForSelectedDriver")
    .addItem("📋 Copy Chauffeur Details Summary", "copyChauffeurSummary")
    .addItem("🔍 Check Duplicate & Resubmission Audit Log", "checkDuplicateAuditLog")
    .addSeparator()
    .addItem("🔄 Initialize & Safe Rebuild System", "safeRebuildAndSetup")`;

  const newMenuSnippet = `ui.createMenu("⚡ Rownaa Operations")
    .addItem("🔄 Rebuild & Setup Entire System", "safeRebuildAndSetup")
    .addSeparator()
    .addItem("💬 Open WhatsApp for Selected Driver", "openWhatsAppForSelectedDriver")
    .addItem("📋 Copy Chauffeur Details Summary", "copyChauffeurSummary")
    .addItem("🔍 Check Duplicate & Resubmission Audit Log", "checkDuplicateAuditLog")`;

  if (content.includes(oldMenuSnippet)) {
    content = content.replace(oldMenuSnippet, newMenuSnippet);
    console.log('Updated onOpen menu in', filePath);
  } else {
    console.log('Could not find oldMenuSnippet in', filePath);
  }

  // 2. Update safeRebuildAndSetup alert to clarify 100% safety & auto-backup
  const oldSafe = `function safeRebuildAndSetup() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert(
    "🔄 Initialize & Safe Rebuild",
    "This will verify all 36 Dual-License columns, dark luxury styling, plain-text formats, and the Operations KPI Dashboard.\\n\\n✅ 100% SAFE: Existing driver applicant records will NOT be deleted or cleared.\\n\\nProceed?",
    ui.ButtonSet.YES_NO
  );`;

  const newSafe = `function safeRebuildAndSetup() {
  var ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch (e) {}

  if (ui) {
    var resp = ui.alert(
      "🔄 Rebuild & Setup Entire System",
      "This will configure and verify all 36 Dual-License columns (Driver License + Car Blue Book License), dark luxury styling, plain-text formats, and the Operations KPI Dashboard.\\n\\n🛡️ 100% SAFE GUARANTEE:\\n1. An automatic full timestamped backup is saved to Google Drive first.\\n2. Existing chauffeur applicant rows will NEVER be deleted or cleared.\\n\\nDo you want to proceed?",
      ui.ButtonSet.YES_NO
    );
    if (resp !== ui.Button.YES) return;
  }`;

  if (content.includes(oldSafe)) {
    content = content.replace(oldSafe, newSafe);
    console.log('Updated safeRebuildAndSetup alert in', filePath);
  } else {
    console.log('Could not find oldSafe in', filePath);
  }

  // 3. Add rebuildEntireSystem alias if missing
  if (!content.includes('function rebuildEntireSystem()')) {
    content = content.replace(
      'function safeRebuildAndSetup() {',
      'function rebuildEntireSystem() {\n  safeRebuildAndSetup();\n}\n\nfunction safeRebuildAndSetup() {'
    );
    console.log('Added rebuildEntireSystem alias in', filePath);
  }

  // 4. Update any alert messages mentioning 'Initialize & Safe Rebuild System'
  content = content.replaceAll('Initialize & Safe Rebuild System', 'Rebuild & Setup Entire System');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully saved', filePath);
}

updateWebhookGs('google_sheet_webhook.gs');
updateWebhookGs('netlify-driver-portal/google_sheet_webhook.gs');

