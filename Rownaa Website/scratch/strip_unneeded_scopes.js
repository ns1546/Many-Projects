const fs = require('fs');
const vm = require('vm');

let fileContent = fs.readFileSync('scratch/build_clean_2tab_webhook.js', 'utf8');

// 1. Remove installDailyBackupTrigger from onOpen
fileContent = fileContent.replace(
`function onOpen() {
  try {
    installDailyBackupTrigger();
  } catch (e) {
    Logger.log("Backup trigger check note: " + e.toString());
  }

  var ui = SpreadsheetApp.getUi();`,
`function onOpen() {
  var ui = SpreadsheetApp.getUi();`
);

// 2. Simplify createDailyBackup to use native Drive copy only (no UrlFetchApp, no ScriptApp.getOAuthToken)
const oldBackup = `function createDailyBackup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var backupFolder = getBackupFolder();
  var timeZone = Session.getScriptTimeZone() || "GMT+6";
  var dateStamp = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd_HH-mm");

  var ssFile = DriveApp.getFileById(ss.getId());

  var backupSheetName = "Rownaa_Operations_Backup_" + dateStamp;
  var backupSheetCopy = ssFile.makeCopy(backupSheetName, backupFolder);
  var sheetBackupUrl = backupSheetCopy.getUrl();

  var excelFileUrl = "";
  try {
    var url = "https://docs.google.com/spreadsheets/d/" + ss.getId() + "/export?format=xlsx";
    var params = {
      headers: { "Authorization": "Bearer " + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(url, params);
    if (response.getResponseCode() === 200) {
      var excelBlob = response.getBlob().setName("Rownaa_Operations_Export_" + dateStamp + ".xlsx");
      var excelFile = backupFolder.createFile(excelBlob);
      excelFileUrl = excelFile.getUrl();
    }
  } catch (err) {
    Logger.log("Excel export note: " + err.toString());
  }

  try {
    pruneOldBackups(backupFolder, 30);
  } catch (pErr) {}

  return {
    status: "success",
    timestamp: dateStamp,
    sheetBackupUrl: sheetBackupUrl,
    excelBackupUrl: excelFileUrl
  };
}`;

const newBackup = `function createDailyBackup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var backupFolder = getBackupFolder();
  var timeZone = Session.getScriptTimeZone() || "GMT+6";
  var dateStamp = Utilities.formatDate(new Date(), timeZone, "yyyy-MM-dd_HH-mm");

  var ssFile = DriveApp.getFileById(ss.getId());

  var backupSheetName = "Rownaa_Operations_Backup_" + dateStamp;
  var backupSheetCopy = ssFile.makeCopy(backupSheetName, backupFolder);
  var sheetBackupUrl = backupSheetCopy.getUrl();

  try {
    pruneOldBackups(backupFolder, 30);
  } catch (pErr) {}

  return {
    status: "success",
    timestamp: dateStamp,
    sheetBackupUrl: sheetBackupUrl,
    excelBackupUrl: ""
  };
}`;

fileContent = fileContent.replace(oldBackup, newBackup);

// 3. Remove installDailyBackupTrigger function
fileContent = fileContent.replace(/function installDailyBackupTrigger\(\) \{[\s\S]*?\n\}\n/, '');

fs.writeFileSync('scratch/build_clean_2tab_webhook.js', fileContent, 'utf8');
console.log('Updated scratch/build_clean_2tab_webhook.js successfully');

