import codecs
path = 'g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

target = """            data.activities = editableActivities.map(a => a.text.replace(/\\[Client's Brand Name\\]/g, data.clientBrand));
            
            data.goals = {};
            editableGoals.forEach((g, i) => {
                data.goals[`input-goal-g${i+1}`] = g.text.replace(/\\[Client's Brand Name\\]/g, data.clientBrand).replace(/\\[Client's Industry\\]/g, data.clientIndustry);
            });
            proposalData.goalTitles = editableGoals.map(g => g.title);
            
            data.goals.finalVision = document.getElementById('input-finalVision').value.replace(/\\[Client's Brand Name\\]/g, data.clientBrand).replace(/\\[Client's Industry\\]/g, data.clientIndustry);
            
            data.terms = editableTerms.map(t => t.text.replace(/\\[Client's Brand Name\\]/g, data.clientBrand));
`).value.replace(/\\[Client's Brand Name\\]/g, data.clientBrand));\r
            }"""

replacement = """            data.activities = editableActivities.map(a => a.text.replace(/\\[Client's Brand Name\\]/g, data.clientBrand));
            
            data.goals = {};
            editableGoals.forEach((g, i) => {
                data.goals[`input-goal-g${i+1}`] = g.text.replace(/\\[Client's Brand Name\\]/g, data.clientBrand).replace(/\\[Client's Industry\\]/g, data.clientIndustry);
            });
            data.goalTitles = editableGoals.map(g => g.title);
            
            data.goals.finalVision = document.getElementById('input-finalVision').value.replace(/\\[Client's Brand Name\\]/g, data.clientBrand).replace(/\\[Client's Industry\\]/g, data.clientIndustry);
            
            data.terms = editableTerms.map(t => t.text.replace(/\\[Client's Brand Name\\]/g, data.clientBrand));"""

if target in content:
    content = content.replace(target, replacement)
    with codecs.open(path, 'w', 'utf-8') as f:
        f.write(content)
    print('Fixed syntax bug.')
else:
    print('Failed to find exact block.')
