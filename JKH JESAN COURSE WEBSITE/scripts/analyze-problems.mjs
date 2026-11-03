import { ESLint } from "eslint";

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles(["src/**/*.{ts,tsx,js,jsx}"]);
  
  const rules = {};
  const fileIssues = [];

  for (const r of results) {
    if (r.messages.length > 0) {
      fileIssues.push({
        filePath: r.filePath,
        errors: r.errorCount,
        warnings: r.warningCount,
        messages: r.messages.map(m => ({ rule: m.ruleId, msg: m.message, line: m.line, severity: m.severity }))
      });
      for (const m of r.messages) {
        rules[m.ruleId] = (rules[m.ruleId] || 0) + 1;
      }
    }
  }

  console.log("Summary by Rule:", JSON.stringify(rules, null, 2));
  console.log("Files with problems:", fileIssues.length);
  for (const f of fileIssues) {
    console.log(`\n${f.filePath} (${f.messages.length}):`);
    for (const m of f.messages) {
      console.log(`  Line ${m.line} [${m.rule}]: ${m.msg}`);
    }
  }
}

main().catch(console.error);

