import re
import codecs

path = 'g:/Download Official/New folder (6)/EvoRise Document Generator - EvoRise Solutions.html'
with codecs.open(path, 'r', 'utf-8') as f:
    content = f.read()

# 1. Activities Replacement
activities_html = """
                    <div id="activities-container" class="space-y-4" bis_skin_checked="1"></div>
                    <button onclick="addActivityItem()" class="btn btn-secondary mt-4" style="padding: 5px 10px; font-size: 0.8rem;">+ Add Activity</button>
"""
content = re.sub(r'<div class="space-y-4" bis_skin_checked="1">.*?<label class="block">.*?1\. Facebook, Instagram Maintenance:.*?</label>.*?</div>', activities_html, content, count=1, flags=re.DOTALL)

# 2. Goals Replacement
goals_html = """
                    <div id="goals-container" class="space-y-4" bis_skin_checked="1"></div>
                    <button onclick="addGoalItem()" class="btn btn-secondary mt-4" style="padding: 5px 10px; font-size: 0.8rem;">+ Add Goal</button>
                    
                    <label class="block mt-6">
                        <span class="text-slate-700 font-bold">Final Vision (Editable):</span>
                        <textarea id="input-finalVision" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 proposal-text-area sensitive-field active">“[Client\'s Brand Name]” will be the most trusted, preferred, and beloved brand in the [Client\'s Industry] market — offering quality, reliability, and the best services/products at a limited profit. ❤️</textarea>
                    </label>
"""
content = re.sub(r'<div class="space-y-4" bis_skin_checked="1">.*?<label class="block">.*?Goal 1 \(Digital Platform Performance Improvement\):.*?</label>.*?Final Vision \(Editable\):.*?</label>\s*</div>', goals_html, content, count=1, flags=re.DOTALL)

# 3. Terms Replacement
terms_html = """
                    <div id="terms-container" class="space-y-4" bis_skin_checked="1"></div>
                    <button onclick="addTermItem()" class="btn btn-secondary mt-4" style="padding: 5px 10px; font-size: 0.8rem;">+ Add Term</button>
"""
content = re.sub(r'<div class="space-y-4" bis_skin_checked="1">.*?<label class="block">.*?Term 1 \(Responsibility\):.*?</label>.*?</div>', terms_html, content, count=1, flags=re.DOTALL)


# 4. Javascript Arrays and Functions Injection
js_injection = """
        // --- DYNAMIC DATA ARRAYS ---
        let editableActivities = [
            { title: "Facebook, Instagram Maintenance", text: "Moderator activities, responding to messages and comments. | Comment: Facebook & Instagram" },
            { title: "Customer Conversion & Support", text: "Assisting customers with sales-oriented communication (Customer Convincing). | Comment: Active" },
            { title: "Content Creation", text: "Writing captions and detailed descriptions for posts. | Comment: Active" },
            { title: "Strategy Formulation", text: "Developing and applying market and trend-based marketing strategies. | Comment: Active" },
            { title: "Video Content (Deliverable)", text: "1 day of videography, 8-10 Reels. | Comment: Guaranteed Monthly" },
            { title: "Graphic Design (Deliverable)", text: "10-12 designs per month. | Comment: Guaranteed Monthly" },
            { title: "Partnership Establishment", text: "Creating promotional opportunities by connecting with popular Key Opinion Leaders (KOLs)/influencers. | Comment: Ongoing Process" },
            { title: "SEO Optimization", text: "Search Engine Optimization for Facebook, Instagram, and Google Map Location. | Comment: Active for 4 months" },
            { title: "Order Management Support", text: "Providing advice to make the order and delivery system more effective and customer-friendly. | Comment: Strategic Consultation" },
            { title: "Page Growth", text: "Brand expansion by increasing page likes and sharing content in various groups. | Comment: Active for 4 months" },
            { title: "Monthly Report", text: "Providing a detailed monthly report on progress and performance. | Comment: End of Each Month" }
        ];
        
        let editableGoals = [
            { title: "Goal 1 (Digital Platform Performance Improvement)", text: "Publish high-quality content regularly (posts, Reels, videos) and ensure fast customer response." },
            { title: "Goal 2 (Product Visual Appeal Enhancement)", text: "Create high-quality, eye-catching graphics and videos for every product or service. Post real photos and videos of customers who visit the location or use the service." },
            { title: "Goal 3 (Transformation from Local to Recognized Brand)", text: "Build [Client's Brand Name] into a trusted and popular brand across the target market, beyond your local area." },
            { title: "Goal 4 (Customer Relationship Development)", text: "Create a WhatsApp/Viber community for previous and regular customers. Provide new offers, industry insights, and customer support there." },
            { title: "Goal 5 (Assistance in Wholesale Growth)", text: "Establish B2B relationships with local industry partners, distributors, or institutional clients." },
            { title: "Goal 6 (Paid and PR Promotion)", text: "Send products or service vouchers to popular KOLs, influencers, or industry figures to generate reviews and videos." },
            { title: "Goal 7 (Google Map Search Optimization)", text: "Optimize Google My Business so that [Client's Brand Name] appears first when searching for 'Best [Industry/Product Category] [Local Area].'" },
            { title: "Goal 8 (Expert Collaboration)", text: "Connect with trusted industry experts or professional consultants to create videos on product usage or industry trends." },
            { title: "Goal 9 (Special Product Promotion)", text: "Create special videos and graphics focusing on [Key Product Line/Service] and increase sales through boost campaigns." },
            { title: "Goal 10 (Value-Added Content)", text: "Increase engagement by creating content based on product tutorials, market trends, or helpful tips, and answers to common audience questions." },
            { title: "Goal 11 (Brand Awareness Campaign - CSR)", text: "Organize a major one-day Community Engagement Event (e.g., Free Product Demo, Expert Workshop) highlighting the brand's commitment to quality or social responsibility. (This will highlight the brand's visibility and human side.)" },
            { title: "Goal 12 (Content Creation Note)", text: "Our Note: 'We regularly shoot videos with our in-house models, but if you wish, we can create video content using other external models or industry experts. However, [Client's Brand Name] will need to bear the extra charge in that case.'" }
        ];
        
        let editableTerms = [
            { text: "The agency will follow its own marketing policies, but will seek client advice and approval before running any campaign. The agency will not be liable for the results or failure of the client's internal strategies." },
            { text: "Boosting results depend on the platform's current algorithm, reaction to previous boosts, and overall page performance. Therefore, result variation is normal and will not be considered an agency fault." },
            { text: "Payment must be completed in full by the 10th of each month." },
            { text: "EvoRise Solutions (Marketing Agency) is not a permanent employee of [Client's Brand Name]. We operate as an independent marketing agency, and this professional distinction must be respected by the client." },
            { text: "If there is a need to add new members to the marketing team, their skills and coordination with the team will be evaluated. The agency will not bear full responsibility for the work results of new members." },
            { text: "If either the client or the agency wishes to terminate this contract, they must provide at least one month's prior notice." }
        ];
        
        function renderDynamicLists() {
            // Activities
            const actContainer = document.getElementById('activities-container');
            if (actContainer) {
                actContainer.innerHTML = '';
                editableActivities.forEach((item, index) => {
                    actContainer.innerHTML += `
                        <div class="p-2 border border-gray-200 rounded-md">
                            <div class="flex justify-between items-center mb-1">
                                <input type="text" class="feature-input w-full font-semibold text-sm" value="${item.title}" oninput="editableActivities[${index}].title = this.value; triggerAutoPreview();" placeholder="Activity Title">
                                <button onclick="editableActivities.splice(${index+1}, 0, {title:'New Activity', text:'Description'}); renderDynamicLists(); triggerAutoPreview();" class="ml-2 text-blue-600 hover:text-blue-900 text-xs">+Add</button>
                                <button onclick="editableActivities.splice(${index}, 1); renderDynamicLists(); triggerAutoPreview();" class="ml-2 text-red-600 hover:text-red-900 text-xs">Del</button>
                            </div>
                            <textarea class="feature-input w-full text-sm sensitive-field active" oninput="editableActivities[${index}].text = this.value; triggerAutoPreview();" rows="2">${item.text}</textarea>
                        </div>
                    `;
                });
            }
            
            // Goals
            const goalContainer = document.getElementById('goals-container');
            if (goalContainer) {
                goalContainer.innerHTML = '';
                editableGoals.forEach((item, index) => {
                    goalContainer.innerHTML += `
                        <div class="p-2 border border-gray-200 rounded-md">
                            <div class="flex justify-between items-center mb-1">
                                <input type="text" class="feature-input w-full font-semibold text-sm" value="${item.title}" oninput="editableGoals[${index}].title = this.value; triggerAutoPreview();" placeholder="Goal Title">
                                <button onclick="editableGoals.splice(${index+1}, 0, {title:'New Goal', text:'Description'}); renderDynamicLists(); triggerAutoPreview();" class="ml-2 text-blue-600 hover:text-blue-900 text-xs">+Add</button>
                                <button onclick="editableGoals.splice(${index}, 1); renderDynamicLists(); triggerAutoPreview();" class="ml-2 text-red-600 hover:text-red-900 text-xs">Del</button>
                            </div>
                            <textarea class="feature-input w-full text-sm sensitive-field active" oninput="editableGoals[${index}].text = this.value; triggerAutoPreview();" rows="2">${item.text}</textarea>
                        </div>
                    `;
                });
            }
            
            // Terms
            const termsContainer = document.getElementById('terms-container');
            if (termsContainer) {
                termsContainer.innerHTML = '';
                editableTerms.forEach((item, index) => {
                    termsContainer.innerHTML += `
                        <div class="p-2 border border-gray-200 rounded-md">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-sm font-semibold text-slate-700">Term ${index + 1}</span>
                                <div>
                                    <button onclick="editableTerms.splice(${index+1}, 0, {text:'New Term'}); renderDynamicLists(); triggerAutoPreview();" class="ml-2 text-blue-600 hover:text-blue-900 text-xs">+Add</button>
                                    <button onclick="editableTerms.splice(${index}, 1); renderDynamicLists(); triggerAutoPreview();" class="ml-2 text-red-600 hover:text-red-900 text-xs">Del</button>
                                </div>
                            </div>
                            <textarea class="feature-input w-full text-sm" oninput="editableTerms[${index}].text = this.value; triggerAutoPreview();" rows="2">${item.text}</textarea>
                        </div>
                    `;
                });
            }
        }
        
        function addActivityItem() { editableActivities.push({title: 'New Activity', text: 'Description'}); renderDynamicLists(); triggerAutoPreview(); }
        function addGoalItem() { editableGoals.push({title: 'New Goal', text: 'Description'}); renderDynamicLists(); triggerAutoPreview(); }
        function addTermItem() { editableTerms.push({text: 'New Term'}); renderDynamicLists(); triggerAutoPreview(); }
        
        // --- END DYNAMIC DATA ARRAYS ---
"""

content = content.replace('// --- INITIALIZATION ---', js_injection + '\n        // --- INITIALIZATION ---')
content = content.replace('renderAgreementPolicyList();', 'renderAgreementPolicyList();\n            renderDynamicLists();')

# 5. Fix collectData to use arrays
collect_data_fix = """
            data.activities = editableActivities.map(a => a.text.replace(/\\[Client's Brand Name\\]/g, data.clientBrand));
            
            data.goals = {};
            editableGoals.forEach((g, i) => {
                data.goals[`input-goal-g${i+1}`] = g.text.replace(/\\[Client's Brand Name\\]/g, data.clientBrand).replace(/\\[Client's Industry\\]/g, data.clientIndustry);
            });
            proposalData.goalTitles = editableGoals.map(g => g.title);
            
            data.goals.finalVision = document.getElementById('input-finalVision').value.replace(/\\[Client's Brand Name\\]/g, data.clientBrand).replace(/\\[Client's Industry\\]/g, data.clientIndustry);
            
            data.terms = editableTerms.map(t => t.text.replace(/\\[Client's Brand Name\\]/g, data.clientBrand));
"""
content = re.sub(r'data\.activities = \[\];.*?for \(let i = 1; i <= 6; i\+\+\) \{.*?\}\s*', collect_data_fix, content, flags=re.DOTALL)


# 6. Global Syncing (Copy Client Name -> Agreement Name etc)
sync_logic = """
        function syncGlobalFields() {
            const propCompany = document.getElementById('input-clientCompany');
            const propAddress = document.getElementById('input-clientAddress');
            const agnName = document.getElementById('input-agn-clientName');
            const agnAddress = document.getElementById('input-agn-clientAddress');
            
            if (propCompany && agnName && document.activeElement === propCompany) {
                agnName.value = propCompany.value;
            }
            if (propAddress && agnAddress && document.activeElement === propAddress) {
                agnAddress.value = propAddress.value;
            }
        }
"""
content = content.replace('// --- AUTO PREVIEW ---', sync_logic + '\n        // --- AUTO PREVIEW ---')
content = content.replace('saveDocumentState(); triggerAutoPreview();', 'saveDocumentState(); syncGlobalFields(); triggerAutoPreview();')


# 7. AI Full Context and Undo
ai_logic_undo = """
        let undoAiHtmlStack = {};
        
        function applyAiContentInline() {
            const editor = getActiveEditor();
            if (!editor) return alert("Please load content into the editor first.");
            const resultText = document.getElementById('ai-result').value;
            
            // Save state for undo
            const currentWorldId = currentWorld;
            undoAiHtmlStack[currentWorldId] = editor.getContents(true);
            document.getElementById('ai-undo-btn').classList.remove('hidden');
            
            // Insert
            editor.appendContents(`<p>${resultText.replace(/\\n/g, '<br>')}</p>`);
            alert("AI Content applied! Use 'Undo AI Change' if needed.");
        }
        
        function undoAiContent() {
            const editor = getActiveEditor();
            if (!editor) return;
            const currentWorldId = currentWorld;
            if (undoAiHtmlStack[currentWorldId]) {
                editor.setContents(undoAiHtmlStack[currentWorldId]);
                document.getElementById('ai-undo-btn').classList.add('hidden');
                alert("AI Change Undone.");
            }
        }
"""

content = content.replace('function insertAIContent() {', ai_logic_undo + '\n        function old_insertAIContent() {')

# Find the button that calls insertAIContent and add the Undo button next to it.
ai_buttons_html = """
                    <div style="display: flex; gap: 8px;">
                        <button onclick="applyAiContentInline()" class="btn btn-primary w-full" style="padding: 5px; font-size: 12px; background: linear-gradient(135deg, #10b981, #059669);">Apply AI Change to Editor</button>
                        <button id="ai-undo-btn" onclick="undoAiContent()" class="btn btn-secondary hidden" style="padding: 5px; font-size: 12px; color: #dc2626; border-color: #fca5a5;">Undo AI</button>
                    </div>
"""
content = content.replace('<button onclick="insertAIContent()" class="btn btn-primary w-full" style="padding: 5px; font-size: 12px;">Insert into Active Editor</button>', ai_buttons_html)

# Enhance AI prompt to inject JSON context
ai_generate_enhancement = """
            // Enhance AI context
            let fullContext = "";
            try { fullContext = JSON.stringify(collectData()); } catch(e){}
            
            const systemPrompt = `You are a professional business agreement and proposal assistant for EvoRise Solutions. Here is the entire JSON structure of the current document for your context:\\n${fullContext}\\n\\nPlease perform the user's specific request accurately. Return ONLY the finalized professional text without any conversational filler.`;
            
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: promptText }
                        ]
"""
content = re.sub(r'try \{\s*const response = await fetch\("https://api\.groq\.com/openai/v1/chat/completions".*?messages: \[\s*\{ role: "user", content: promptText \}\s*\]', ai_generate_enhancement, content, flags=re.DOTALL)


# State management updates to include activities, goals, terms arrays
state_manager_arrays = """
                arrays: {
                    editableFeatures,
                    editableAgreementServices,
                    editableAgreementMonitoring,
                    editableAgreementPolicy,
                    editableActivities,
                    editableGoals,
                    editableTerms
                }
"""
content = re.sub(r'arrays: \{\s*editableFeatures,\s*editableAgreementServices,\s*editableAgreementMonitoring,\s*editableAgreementPolicy\s*\}', state_manager_arrays, content)

load_state_manager_arrays = """
                    if (state.arrays) {
                        if (state.arrays.editableFeatures) editableFeatures = state.arrays.editableFeatures;
                        if (state.arrays.editableAgreementServices) editableAgreementServices = state.arrays.editableAgreementServices;
                        if (state.arrays.editableAgreementMonitoring) editableAgreementMonitoring = state.arrays.editableAgreementMonitoring;
                        if (state.arrays.editableAgreementPolicy) editableAgreementPolicy = state.arrays.editableAgreementPolicy;
                        if (state.arrays.editableActivities) editableActivities = state.arrays.editableActivities;
                        if (state.arrays.editableGoals) editableGoals = state.arrays.editableGoals;
                        if (state.arrays.editableTerms) editableTerms = state.arrays.editableTerms;
                    }
"""
content = re.sub(r'if \(state\.arrays\) \{\s*if \(state\.arrays\.editableFeatures\).*?if \(state\.arrays\.editableAgreementPolicy\) editableAgreementPolicy = state\.arrays\.editableAgreementPolicy;\s*\}', load_state_manager_arrays, content, flags=re.DOTALL)


with codecs.open(path, 'w', 'utf-8') as f:
    f.write(content)
print("Phase 1-3 implementation complete.")
