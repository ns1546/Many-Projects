
        let sunEditorProposal = null;
        let sunEditorAgreement = null;
        let editorConfig = null;

        // --- PROPOSAL STATE (No changes) ---
        const initialFeatures = [
            { name: 'Social Media Management', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Ad Campaign/Boosting Management', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Monthly Detailed Report', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Graphics Design (Quantity)', basic: '8 Pcs', popular: '15 Pcs', premium: '20-25 Pcs' },
            { name: 'Extra Social Media Posts', basic: '✖', popular: '✔', premium: '✔' },
            { name: 'Videography (Video Quantity)', basic: '1', popular: '1', premium: '2' },
            { name: 'Reels Editing', basic: '5 Pcs', popular: '10 Pcs', premium: 'Unlimited (<30 Pcs)' },
            { name: 'Video Editing (Premium)', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Cyber Security', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Marketing Consultancy', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Marketing Strategy Formulation', basic: '✖', popular: '✔', premium: '✔' },
            { name: 'AI Animated Content', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Google My Business (GMB) Optimization', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Branding Consultation', basic: '✖', popular: '✔', premium: '✔' },
            { name: 'Competitor Analysis', basic: '✖', popular: '✔', premium: '✔' },
            { name: 'Content Calendar Creation', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Customer Engagement/Inbox Management', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Influencer Marketing (As needed)', basic: '✖', popular: '✔', premium: '✔' },
            { name: 'Live Session Management', basic: '✖', popular: '✖', premium: '✔' },
            { name: 'Search Engine Optimization (SEO)', basic: '✖', popular: '✔', premium: '✔' },
            { name: 'Online Booking & Delivery System Consultation', basic: '✖', popular: '✔', premium: '✔' },
            { name: 'Email & WhatsApp Marketing (Offers)', basic: '✖', popular: '✔', premium: '✔' },
            { name: 'Hashtag & Caption Strategy', basic: '✔', popular: '✔', premium: '✔' },
            { name: 'Facebook Pixel & Google Analytics Integration', basic: '✖', popular: '✔', premium: '✔' },
            { name: 'Customer Review Generation Strategy', basic: '✖', popular: '✔', premium: '✔' },
        ];
        let editableFeatures = [...initialFeatures];
        const proposalData = {
            activityTitles: [
                'Facebook, Instagram Maintenance', 'Customer Conversion & Support', 'Content Creation', 'Strategy Formulation',
                'Video Content (Deliverable)', 'Graphic Design (Deliverable)', 'Partnership Establishment', 'SEO Optimization',
                'Order Management Support', 'Page Growth', 'Monthly Report'
            ],
            goalTitles: [
                'Digital Platform Performance Improvement', 'Product Visual Appeal Enhancement', 'Transformation from Local to Recognized Brand',
                'Customer Relationship Development', 'Assistance in Wholesale Growth', 'Paid and PR Promotion',
                'Google Map Search Optimization', 'Expert Collaboration', 'Special Product Promotion', 'Value-Added Content (Without Products)',
                'Brand Awareness Campaign (CSR)', 'Content Creation Note'
            ]
        };

        // --- AGREEMENT STATE (No changes) ---
        let editableAgreementServices = [
            { feature: 'Social Media Management', quantity: 'Ongoing', description: "We will manage your brand's daily presence across relevant social media platforms." },
            { feature: 'Ad Campaign/Boosting Management', quantity: 'Ongoing', description: "We will create, launch, and manage paid advertising campaigns and boosted posts." },
            { feature: 'Monthly Detailed Report', quantity: 'One Per Month', description: "You will receive a comprehensive report at the end of each month detailing performance and growth." },
            { feature: 'Graphic Design', quantity: '8-10', description: "Our team will design 8 professional, custom graphics (e.g., for posts, stories, or ads)." },
            { feature: 'Video Shoot (Camera)', quantity: '5-8', description: "Includes one day professional on-site video shoot to capture high-quality footage With Camera." },
            { feature: 'Extra Video Shoot With I-Phone', quantity: 'N/A', description: "Includes one day professional on-site video shoot to capture high-quality footage With Mobile" },
            { feature: 'Reels Editing', quantity: 'N/A', description: "We will edit and produce 5 engaging short-form videos (like Reels or TikToks)." },
            { feature: 'Video Editing (Premium)', quantity: '8', description: "Professional, high-quality editing for the primary video captured during the videography session." },
            { feature: 'Cyber Security', quantity: 'Ongoing', description: "Basic monitoring and implementation of security measures to protect your digital assets." },
            { feature: 'Google Map Optimization', quantity: 'Ongoing', description: "Enhancing the client’s Google Business Profile for better visibility in local search results, including profile setup/review, keyword optimization, photo updates, and accurate business information placement." },
            { feature: 'Marketing Consultancy', quantity: 'Ongoing', description: "Access to our experts for professional advice and guidance on your digital strategy as needed." },
            { feature: 'Google My Business (GMB) Optimization', quantity: 'Ongoing', description: "We will manage and optimize your GMB profile to improve your visibility in local search results." },
            { feature: 'Customer Engagement / Inbox Management', quantity: 'Ongoing', description: "We will handle incoming comments and direct messages (inbox) on your behalf." },
            { feature: 'Hashtag & Caption Strategy', quantity: 'Ongoing', description: "We will research and write compelling captions and hashtags for all content." }
        ];

        let editableAgreementMonitoring = [
            { service: 'Campaign Management', description: "Ongoing tracking, content adjustments, and performance review." },
            { service: 'Monthly Summary Report', description: "A detailed report on key performance indicators (KPIs) including reach, impressions, click-through rate (CTR), cost per click (CPC), and leads generated." },
            { service: 'Ads Campaign Report', description: "Every Ads Campaign Report after the deadline of Ads." },
            { service: 'Review Session', description: "A 30-minute monthly review session (via Meet or in-person) to discuss performance, feedback, and strategy." },
            { service: 'Dedicated Account Manager', description: "A single point of contact to ensure clear communication, proactive support, and seamless project continuity." }
        ];

        let editableAgreementPolicy = [
            { title: 'Ad Campaign Responsibility', text: 'All campaigns will be executed only with the Client’s permission. If the Client chooses to run their own strategy, EvoRise Solutions will not be held responsible for the outcome.' },
            { title: 'Boost Performance Disclaimer', text: 'Boost results depend on Facebook’s algorithm and page health, and may vary over time. This variation is not a fault in our work.' },
            { title: 'Payment Policy', text: 'Monthly payments must be cleared by the 10th of each month.' },
            { title: 'Employment Status', text: 'EvoRise Solutions operates as an independent marketing agency and is not a permanent employee of the Company.' },
            { title: 'Contract Termination', text: 'If the contract is ended early, full payment must still be made as per the agreement.' },
            { title: 'Legal Compliance & Liability Disclaimer', text: '1. Client’s Legal Responsibility – The Client confirms that their business operations, services, and content fully comply with all applicable local, national, and international laws, regulations, and industry standards. 2. No Liability for Client’s Actions – EvoRise Solutions will not be held liable for any legal disputes, penalties, losses, damages, or third-party claims arising from the Client’s actions, business practices, or representations. 3. Scope of Non-Liability – This includes, but is not limited to, acts of fraud, misrepresentation, or violations of national or international laws. 4. Right to Suspend or Terminate – If the Client becomes involved in any legal proceedings, scam allegations, regulatory inquiries, or government investigations, EvoRise Solutions reserves the right to immediately suspend or terminate all services without any refund. 5. Outstanding Payments – In such cases, all pending or outstanding payments to EvoRise Solutions must still be paid in full by the Client. 6. Full Legal Responsibility – The sole and entire responsibility for legal compliance rests exclusively with the Client.' },
            { title: 'Content Ownership & Responsibility', text: 'All promotional content will be based on information provided by the Client. EvoRise Solutions shall not be held liable for the accuracy, truthfulness, or legality of such information. The Client assumes full responsibility for any claims, representations, or offers made in the content.' },
            { title: 'No Guarantee of Client Service Results', text: 'EvoRise Solutions does not guarantee or endorse the outcome of the Client’s services, including but not limited to admission success, scholarship approval, visa issuance, or any related results.' },
            { title: 'Cybersecurity & Page Hacking Disclaimer', text: 'EvoRise Solutions implements strong security measures. However: (i) If any page administrator clicks on harmful links or shares access with unauthorized persons, or if the page is hacked by a third party through no action or negligence by EvoRise Solutions, the agency will not be held liable. (ii) If hacking occurs without any action from EvoRise Solutions, the Client agrees that the agency will not be responsible for recovery, losses, penalties, or damages resulting from the incident. (iii) Responsibility for securing all login credentials, administrator access, and recovery processes lies with the Client.' },
            { title: 'Proof of Instructions & Work', text: 'EvoRise Solutions will keep written proof of all instructions, approvals, and materials provided by the Client. All communications, approvals, and published content will be stored for record-keeping.' },
            { title: 'Force Majeure', text: 'EvoRise Solutions shall not be held liable for delays or failure to perform services due to events beyond our reasonable control, including but not limited to natural disasters, internet outages, platform downtime, government restrictions, strikes, or other unforeseen circumstances.' },
            { title: 'Indemnity Clause', text: 'The Client agrees to indemnify and hold harmless EvoRise Solutions from any claims, damages, losses, or expenses (including legal fees) arising from the Client’s content, business practices, advertisements, or any breach of this agreement.' }
        ];

        // --- SHARED FUNCTIONS ---

        function toggleSensitiveEditing(isActive) {
            document.querySelectorAll('.sensitive-field').forEach(field => {
                if (isActive) {
                    field.classList.add('active');
                    if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
                        field.readOnly = false;
                        field.removeAttribute('readonly');
                    }
                } else {
                    field.classList.remove('active');
                    if (field.tagName === 'TEXTAREA' || field.tagName === 'INPUT') {
                        field.readOnly = true;
                        field.setAttribute('readonly', 'true');
                    }
                }
            });
            document.querySelectorAll('#feature-editor-wrapper input, #feature-editor-wrapper textarea, #agreement-services-wrapper input, #agreement-services-wrapper textarea, #agreement-monitoring-wrapper input, #agreement-monitoring-wrapper textarea, #agreement-policy-wrapper input, #agreement-policy-wrapper textarea').forEach(input => {
                input.readOnly = !isActive;
                if (isActive) { input.removeAttribute('readonly'); }
                else { input.setAttribute('readonly', 'true'); }
            });
            document.querySelectorAll('#feature-editor-wrapper button, #agreement-services-wrapper button, #agreement-monitoring-wrapper button, #agreement-policy-wrapper button').forEach(btn => {
                if (btn) btn.disabled = !isActive;
            });
            
            // Update toggle wrapper visual
            const wrapper = document.getElementById('sensitiveToggleWrapper');
            const label = document.getElementById('advToggleLabel');
            if (wrapper && label) {
                if (isActive) {
                    wrapper.classList.add('on');
                    label.innerHTML = '🔓 Editing Unlocked';
                } else {
                    wrapper.classList.remove('on');
                    label.innerHTML = '🔒 Editing Locked';
                }
            }
        }

        let currentWorld = 'proposal';

        function switchWorld(world) {
            currentWorld = world;
            
            // Update Buttons
            document.getElementById('worldBtnProposal').classList.remove('active-proposal');
            document.getElementById('worldBtnAgreement').classList.remove('active-agreement');
            
            if (world === 'proposal') {
                document.getElementById('worldBtnProposal').classList.add('active-proposal');
                document.getElementById('world-proposal').style.display = 'block';
                document.getElementById('world-agreement').style.display = 'none';
                showTab('client');
            } else {
                document.getElementById('worldBtnAgreement').classList.add('active-agreement');
                document.getElementById('world-proposal').style.display = 'none';
                document.getElementById('world-agreement').style.display = 'block';
                
                // Show the agreement tab content
                showTab('agreement');
                // Initialize SunEditor for Agreement only when it's visible, to prevent 0-height bug
                if (!sunEditorAgreement && typeof SUNEDITOR !== 'undefined' && editorConfig) {
                    setTimeout(() => {
                        sunEditorAgreement = SUNEDITOR.create(document.getElementById('live-review-editor-agreement'), editorConfig);
                        if (sunEditorAgreement) {
                            sunEditorAgreement.setContents('<p style="color: #6b7280;">Click "Load/Refresh Content" to begin agreement preview...</p>');
                        }
                    }, 50);
                }
            }
        }

        function showTab(tabName) {
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
            const tabPane = document.getElementById(`tab-${tabName}`);
            if (tabPane) tabPane.classList.remove('hidden');
            
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
            if (tabBtn) tabBtn.classList.add('active');
        }

        function formatCurrency(amount) {
            return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0 }).format(amount).replace('BDT', 'BDT');
        }

        // --- PROPOSAL: Feature Table Management ---
        // All functions (renderFeaturesTable, updateFeature, addFeatureRow, deleteFeatureRow)
        // remain exactly the same as v3.
        function renderFeaturesTable() {
            const tbody = document.getElementById('features-tbody');
            const thead = document.getElementById('features-thead');
            const showBasic = document.getElementById('col-basic') ? document.getElementById('col-basic').checked : true;
            const showPopular = document.getElementById('col-popular') ? document.getElementById('col-popular').checked : true;
            const showPremium = document.getElementById('col-premium') ? document.getElementById('col-premium').checked : true;
            
            if (thead) {
                thead.innerHTML = `<tr>
                    <th style="width:35%">Service Feature</th>
                    ${showBasic ? '<th style="width:15%">Basic</th>' : ''}
                    ${showPopular ? '<th style="width:15%">Popular</th>' : ''}
                    ${showPremium ? '<th style="width:15%">Premium</th>' : ''}
                    <th style="width:10%">Action</th>
                </tr>`;
            }

            tbody.innerHTML = '';
            editableFeatures.forEach((feature, index) => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td class="px-3 py-2 whitespace-nowrap"><input type="text" class="feature-input w-full" value="${feature.name}" oninput="updateFeature(${index}, 'name', this.value)"></td>
                    ${showBasic ? `<td class="px-3 py-2 whitespace-nowrap"><input type="text" class="feature-input w-full" value="${feature.basic}" oninput="updateFeature(${index}, 'basic', this.value)"></td>` : ''}
                    ${showPopular ? `<td class="px-3 py-2 whitespace-nowrap"><input type="text" class="feature-input w-full" value="${feature.popular}" oninput="updateFeature(${index}, 'popular', this.value)"></td>` : ''}
                    ${showPremium ? `<td class="px-3 py-2 whitespace-nowrap"><input type="text" class="feature-input w-full" value="${feature.premium}" oninput="updateFeature(${index}, 'premium', this.value)"></td>` : ''}
                    <td class="px-3 py-2 whitespace-nowrap text-center">
                        <button onclick="insertFeatureRow(${index})" class="text-blue-600 hover:text-blue-900 text-sm font-medium mr-2" title="Insert Below" style="margin-right: 5px;">+ Add</button>
                        <button onclick="deleteFeatureRow(${index})" class="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50">Delete</button>
                    </td>
                `;
            });
            toggleSensitiveEditing(document.getElementById('input-sensitiveEdit').checked);
        }
        function insertFeatureRow(index) {
            if (!document.getElementById('input-sensitiveEdit').checked) return;
            editableFeatures.splice(index + 1, 0, { name: "New Feature", basic: "✖", popular: "✔", premium: "✔" });
            renderFeaturesTable();
        }
        function updateFeature(index, key, value) {
            if (editableFeatures[index]) {
                editableFeatures[index][key] = value;
            }
        }
        function addFeatureRow() {
            editableFeatures.push({ name: 'New Custom Feature', basic: '✖', popular: '✔', premium: '✔' });
            renderFeaturesTable();
        }
        function deleteFeatureRow(index) {
            if (editableFeatures.length > 1) {
                editableFeatures.splice(index, 1);
                renderFeaturesTable();
            }
        }

        // --- PROPOSAL: Data Collection (No changes) ---
        // All functions (calculateDiscountedPrice, collectData)
        // remain exactly the same as v3.
        function calculateDiscountedPrice(monthlyPrice, duration, discountPercentage) {
            const total = monthlyPrice * duration;
            if (discountPercentage > 0) {
                const discount = (total * discountPercentage) / 100;
                return { total, discount, final: total - discount, percentage: discountPercentage };
            }
            return { total, discount: 0, final: total, percentage: 0 };
        }
        function collectData() {
            const data = {};
            data.logoUrl = document.getElementById('input-logoUrl').value;
            data.date = document.getElementById('input-date').value;
            data.clientCompany = document.getElementById('input-clientCompany').value;
            data.clientBrand = document.getElementById('input-clientBrand').value;
            data.clientIndustry = document.getElementById('input-clientIndustry').value;
            data.introText = document.getElementById('input-introText').value.replace(/\[Client's Brand Name\]/g, data.clientBrand).replace(/\[Client's Company Name\]/g, data.clientCompany);
            data.featuresList = editableFeatures;
            const basicPrice = parseFloat(document.getElementById('input-basicPrice').value || 0);
            const popularPrice = parseFloat(document.getElementById('input-popularPrice').value || 0);
            const basic6moDiscount = parseFloat(document.getElementById('input-basic6moDiscount').value || 0);
            const pop4moDisc = parseFloat(document.getElementById('input-popular4moDiscount').value || 0);
            const pop6moDisc = parseFloat(document.getElementById('input-popular6moDiscount').value || 0);
            const pop1yrDisc = parseFloat(document.getElementById('input-popular1yrDiscount').value || 0);
            data.pricing = {
                basicPrice: basicPrice,
                popularPrice: popularPrice,
                premiumPrice: parseFloat(document.getElementById('input-premiumPrice').value || 0),
                basic4mo: calculateDiscountedPrice(basicPrice, 4, 0),
                basic6mo: calculateDiscountedPrice(basicPrice, 6, 0),
                basic6moDiscountOff: basic6moDiscount,
                basic6moAfterDiscount: (basicPrice * 6) - basic6moDiscount,
                popular4mo: calculateDiscountedPrice(popularPrice, 4, pop4moDisc),
                popular6mo: calculateDiscountedPrice(popularPrice, 6, pop6moDisc),
                popular1yr: calculateDiscountedPrice(popularPrice, 12, pop1yrDisc),
                popular1yrOffer: document.getElementById('input-popular1yrOffer').value,
                adRunMin: document.getElementById('input-adRunMin').value,
                boostingNote: document.getElementById('input-boostingNote').value,
                boostingSurchargeNote: document.getElementById('input-boostingSurchargeNote').value,
            };
            
            data.activities = editableActivities.map(a => a.text.replace(/\[Client's Brand Name\]/g, data.clientBrand));
            
            data.goals = {};
            editableGoals.forEach((g, i) => {
                data.goals[`input-goal-g${i+1}`] = g.text.replace(/\[Client's Brand Name\]/g, data.clientBrand).replace(/\[Client's Industry\]/g, data.clientIndustry);
            });
            data.goalTitles = editableGoals.map(g => g.title);
            
            data.goals.finalVision = document.getElementById('input-finalVision').value.replace(/\[Client's Brand Name\]/g, data.clientBrand).replace(/\[Client's Industry\]/g, data.clientIndustry);
            
            data.terms = editableTerms.map(t => t.text.replace(/\[Client's Brand Name\]/g, data.clientBrand));
            data.conclusion = document.getElementById('input-conclusion').value.replace(/\[Client's Brand Name\]/g, data.clientBrand);
            data.showContactInfo = document.getElementById('input-showContactInfo').checked;
            data.contactInfo = document.getElementById('input-contactInfo').value;
            return data;
        }

        // --- PROPOSAL: HTML Component Generators (No changes) ---
        // All create...HTML functions remain exactly the same as v3.
        function createHeaderHTML(logoUrl) {
            return `
                <div style="width: 100%; border-bottom: 3px solid #000000; padding-bottom: 10px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%;">
                        <div style="width: 20%; padding: 0;">
                            <img src="${logoUrl}" alt="Agency Logo" width="50" height="50" style="object-fit: contain; display: block;">
                        </div>
                        <div style="width: 80%; padding: 0; text-align: right;">
                            <h1 style="font-size: 20pt; color: #000000; margin: 0; padding: 0;">MARKETING PROPOSAL</h1>
                            <p style="font-size: 12pt; color: #000000; margin: 0; padding: 0;">EvoRise Solutions (Marketing Agency)</p>
                        </div>
                    </div>
                </div>
            `;
        }
        function createFeaturesTableHTML(features, prices) {
            const showBasic = document.getElementById('col-basic') ? document.getElementById('col-basic').checked : true;
            const showPopular = document.getElementById('col-popular') ? document.getElementById('col-popular').checked : true;
            const showPremium = document.getElementById('col-premium') ? document.getElementById('col-premium').checked : true;

            let html = `
                <h3 style="font-size: 12pt; font-weight: bold; margin-top: 15px; color: #000000;">1. Comparison of Our Service Packages and Features</h3>
                <p style="font-size: 10pt; margin-bottom: 10px;">Based on the required complexity and depth of service, we have created three distinct packages, allowing you to choose one based on your budget and goals.</p>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Service Features</th>
                            ${showBasic ? `<th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Basic Package ${formatCurrency(prices.basicPrice)}</th>` : ''}
                            ${showPopular ? `<th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Most Popular ${formatCurrency(prices.popularPrice)}</th>` : ''}
                            ${showPremium ? `<th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Premium Pack ${formatCurrency(prices.premiumPrice)}</th>` : ''}
                        </tr>
                    </thead>
                    <tbody>
            `;
            features.forEach(f => {
                html += `
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">${f.name}</td>
                        ${showBasic ? `<td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${f.basic.replace('✔', '&#10003;').replace('✖', '&#10006;')}</td>` : ''}
                        ${showPopular ? `<td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${f.popular.replace('✔', '&#10003;').replace('✖', '&#10006;')}</td>` : ''}
                        ${showPremium ? `<td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${f.premium.replace('✔', '&#10003;').replace('✖', '&#10006;')}</td>` : ''}
                    </tr>
                `;
            });
            html += `</tbody></table>`;
            return html;
        }
        function createBoostingTableHTML(prices) {
            return `
                <h3 style="font-size: 12pt; font-weight: bold; margin-top: 20px; color: #000000;">Boosting Plan (Advertising costs are NOT included in our investment)</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 10pt; page-break-inside: avoid;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Item</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px; width: 30%;"><strong>Agency Support</strong></td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${prices.boostingNote}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Recommended Monthly Ad Run</strong></td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${prices.adRunMin} (Client-funded)</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;"><strong>Additional Service Charge</strong></td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${prices.boostingSurchargeNote}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
        function createBasicPricingTableHTML(prices) {
            const basic4mo = prices.basic4mo;
            const basic6mo = prices.basic6mo;
            const basic6moDiscountOff = prices.basic6moDiscountOff;
            const basic6moAfterDiscount = prices.basic6moAfterDiscount;
            return `
                <h3 style="font-size: 12pt; font-weight: bold; margin-top: 15px; color: #000000;">2.1. Basic Package</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Contract Duration</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Price Per Month</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Total Amount</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Discount Off</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">After Discount Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">4 Months</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(prices.basicPrice)}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(basic4mo.total)}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">None</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(basic4mo.total)}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">6 Months</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(prices.basicPrice)}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(basic6mo.total)}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(basic6moDiscountOff)} off</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(basic6moAfterDiscount)}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
        function createPopularPricingTableHTML(prices) {
            const pop4mo = prices.popular4mo;
            const pop6mo = prices.popular6mo;
            const pop1yr = prices.popular1yr;
            return `
                <h3 style="font-size: 12pt; font-weight: bold; margin-top: 15px; color: #000000;">2.2. Most Popular Package</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 10pt;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Contract Duration</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Price Per Month</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Discount Percentage</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: center;">Extra Offer</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">4 Months</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(prices.popularPrice)}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${pop4mo.percentage}%</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">None</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">6 Months</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(prices.popularPrice)}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${pop6mo.percentage}%</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">None</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">1 Year</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${formatCurrency(prices.popularPrice)}</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${pop1yr.percentage}%</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${prices.popular1yrOffer}</td>
                        </tr>
                    </tbody>
                </table>
                <p style="font-size: 10pt; margin-top: 10px;">*The discounted amount for the popular package is calculated from the total duration cost: 4 Months (${formatCurrency(pop4mo.final)}), 6 Months (${formatCurrency(pop6mo.final)}), 1 Year (${formatCurrency(pop1yr.final)}).</p>
            `;
        }
        function createActivitiesTableHTML(activities) {
            let html = `
                <h2 style="font-size: 14pt; font-weight: bold; color: #000000; page-break-before: always;">3. Monthly Activities and Deliverables</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 10px; width: 5%;">No.</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; width: 30%; text-align: left;">Activity Area</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; width: 65%; text-align: left;">Description and Comment</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            activities.forEach((desc, index) => {
                const title = proposalData.activityTitles[index];
                const parts = desc.split('| Comment: ');
                const description = parts[0].trim();
                const comment = parts.length > 1 ? parts[1].trim() : 'N/A';
                html += `
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${index + 1}</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px; font-weight: bold;">${title}</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">${description} <strong>(${comment})</strong></td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
            return html;
        }
        function createGoalsHTML(goals, goalTitles, clientBrand) {
            let html = `
                <h2 style="font-size: 14pt; font-weight: bold; color: #000000; page-break-before: auto;">4. Primary Goals and Objectives of this Project</h2>
                <p style="margin-bottom: 15px; font-size: 10pt;">${clientBrand} – Vision & Strategic Plan</p>
                <p style="margin-bottom: 15px; font-size: 10pt;">Our main goal is to transform <strong>${clientBrand}</strong> into a strong and recognized <strong>market-leading</strong> brand, ensuring sustainable business development through increased sales and maximized profit.</p>
                <ol style="list-style-type: decimal; margin-left: 20px; padding-left: 0; font-size: 10pt;">
            `;
            for (let i = 1; i <= 12; i++) {
                const title = goalTitles[i - 1];
                const contentKey = `input-goal-g${i}`;
                const content = goals[contentKey];
                let displayTitle = title;
                if (i === 12) displayTitle = 'Content Creation Note';
                html += `<li style="margin-bottom: 10px;"><strong>${displayTitle}:</strong> ${content}</li>`;
            }
            html += `</ol>`;
            html += `<p style="margin-top: 20px; font-style: italic; font-size: 10pt;">Final Vision:</p>`;
            html += `<p style="font-weight: bold; font-size: 11pt; color: #000000;">${goals.finalVision.replace('❤️', '')}</p>`;
            return html;
        }
        function createTermsHTML(terms) {
            let html = `
                <h2 style="font-size: 14pt; font-weight: bold; color: #000000; page-break-before: auto;">5. Policy and Terms & Conditions</h2>
                <ol style="list-style-type: decimal; margin-left: 20px; padding-left: 0; font-size: 10pt;">
            `;
            terms.forEach((term, index) => {
                const title = `Term ${index + 1}`;
                html += `<li style="margin-bottom: 8px;"><strong>${title}:</strong> ${term}</li>`;
            });
            html += `</ol>`;
            return html;
        }
        function createContactHTML(data) {
            if (data.showContactInfo) {
                const formattedContactInfo = data.contactInfo.replace(/\n/g, '<br>');
                return `
                    <h2 style="font-size: 14pt; font-weight: bold; color: #000000; page-break-before: auto; margin-top: 20px;">Contact Information</h2>
                    <p style="font-size: 10pt; margin-bottom: 20px;">${formattedContactInfo}</p>
                `;
            } else {
                return `
                    <p style="margin-bottom: 20px; font-size: 10pt;">If you have any questions or require clarification on any part of this proposal, please feel free to contact us.</p>
                `;
            }
        }
        
        function updateLiveEditor() {
            let contentHTML = '';

            try {
                if (currentWorld === 'proposal') {
                    if (!sunEditorProposal) {
                        console.warn("Proposal Editor not initialized. Attempting initialization...");
                        let config = typeof editorConfig !== 'undefined' ? editorConfig : {
                            width: '100%',
                            height: '600px',
                            defaultStyle: "font-family: 'Inter', sans-serif; font-size: 11pt; line-height: 1.6;"
                        };
                        if (typeof SUNEDITOR !== 'undefined') {
                            sunEditorProposal = SUNEDITOR.create(document.getElementById('live-review-editor'), config);
                        }
                    }
                    if (!sunEditorProposal) {
                        console.error("Proposal Editor not initialized.");
                        return;
                    }
                    const btn = document.getElementById('update-editor-btn');
                    btn.classList.add('loading');
                    btn.innerHTML = '↻ Loading...';

                    // Generate Proposal HTML
                    const data = collectData();
                    const featureTable = createFeaturesTableHTML(data.featuresList, data.pricing);
                    const activityTable = createActivitiesTableHTML(data.activities);
                    const goalsList = createGoalsHTML(data.goals, proposalData.goalTitles, data.clientBrand);
                    const termsList = createTermsHTML(data.terms);
                    const header = createHeaderHTML(data.logoUrl);
                    const boostingTable = createBoostingTableHTML(data.pricing);
                    const contactBlock = createContactHTML(data);
                    const showBasic = document.getElementById('col-basic') ? document.getElementById('col-basic').checked : true;
                    const showPopular = document.getElementById('col-popular') ? document.getElementById('col-popular').checked : true;
                    
                    contentHTML = `
                        ${header}
                        <h2 style="font-size: 14pt; color: #374151; margin-top: 0; border-bottom: none;">Subject: Comprehensive Marketing Proposal for Digital Growth and Market Expansion of ${data.clientBrand}</h2>
                        <p style="margin-bottom: 10px; font-size: 10pt;">Dear Representative of ${data.clientCompany},</p>
                        <p style="margin-bottom: 25px; font-size: 10pt;">${data.introText}</p>
                        ${featureTable}
                        <h2>2. Investment and Payment Terms</h2>
                        <p style="margin-bottom: 10px; font-size: 10pt;">All prices are shown in Bangladeshi Taka (BDT). To maintain the quality of work, the full amount of the determined investment must be paid before the start of each month's work.</p>
                        ${showBasic ? createBasicPricingTableHTML(data.pricing) : ''}
                        ${showPopular ? createPopularPricingTableHTML(data.pricing) : ''}
                        ${boostingTable}
                        ${activityTable}
                        ${goalsList}
                        ${termsList}
                        <h2>6. Conclusion</h2>
                        <p style="margin-bottom: 15px; font-size: 10pt;">${data.conclusion}</p>
                        ${contactBlock}
                        <p style="font-weight: bold; font-size: 11pt;">Best regards,</p>
                        <p style="font-weight: bold; font-size: 11pt; color: #000000;">EvoRise Solutions (Marketing Agency)</p>
                    `;
                    
                    sunEditorProposal.setContents(contentHTML);
                    
                    setTimeout(() => {
                        btn.classList.remove('loading');
                        btn.innerHTML = '↻ Load / Refresh Content';
                    }, 500);
                    
                } else if (currentWorld === 'agreement') {
                    if (!sunEditorAgreement) {
                        console.warn("Agreement Editor not initialized. Attempting initialization...");
                        let config = typeof editorConfig !== 'undefined' ? editorConfig : {
                            width: '100%',
                            height: '600px',
                            defaultStyle: "font-family: 'Inter', sans-serif; font-size: 11pt; line-height: 1.6;"
                        };
                        if (typeof SUNEDITOR !== 'undefined') {
                            sunEditorAgreement = SUNEDITOR.create(document.getElementById('live-review-editor-agreement'), config);
                        }
                    }
                    if (!sunEditorAgreement) {
                        console.error("Agreement Editor not initialized.");
                        return;
                    }
                    const btn = document.getElementById('update-agreement-editor-btn');
                    btn.classList.add('loading');
                    btn.innerHTML = '↻ Loading...';

                    // Generate Agreement HTML
                    const data = collectAgreementData();
                    const docHeader = createAgreementHeaderHTML(data);
                    const servicesTable = createAgreementServicesTableHTML(data.services);
                    const monitoringTable = createAgreementMonitoringTableHTML(data.monitoring);
                    const financialsTable = createAgreementFinancialsTableHTML(data);
                    const policyList = createAgreementPolicyListHTML(data.policy, data.agencyName);
                    
                    contentHTML = `
                        ${docHeader}
                        <p style="font-size: 10pt;">${data.purpose}</p>
                        <h2 style="font-size: 14pt; font-weight: bold; color: #000000;">2. Duration of the Agreement</h2>
                        <p style="font-size: 10pt;">This agreement will be effective from <strong>${data.startDate}</strong> and will remain in force until <strong>${data.endDate}</strong>, for a total duration of <strong>${data.durationText}</strong>. The term may be extended or renewed in writing with mutual consent of both parties.</p>
                        ${servicesTable}
                        ${monitoringTable}
                        ${financialsTable}
                        <h2 style="font-size: 14pt; font-weight: bold; color: #000000;">6. Payment Terms</h2>
                        <p style="font-size: 10pt;">${data.paymentTerms.replace(/\n/g, '<br>')}</p>
                        ${policyList}
                        <h2 style="font-size: 14pt; font-weight: bold; color: #000000; page-break-before: auto;">8. Signatures & Approval</h2>
                        <p style="font-size: 10pt;">This agreement is prepared in two (2) copies, duly signed, and each party will retain one copy.</p>
                    `;
                    
                    sunEditorAgreement.setContents(contentHTML);
                    
                    setTimeout(() => {
                        btn.classList.remove('loading');
                        btn.innerHTML = '↻ Load / Refresh Content';
                    }, 500);
                }
            } catch (error) {
                console.error("Error loading content into editor:", error);
                if (currentWorld === 'proposal' && sunEditorProposal) {
                    sunEditorProposal.setContents(`<p style="color: red;">Error loading content. Please check the form for missing data and try again.</p>`);
                } else if (currentWorld === 'agreement' && sunEditorAgreement) {
                    sunEditorAgreement.setContents(`<p style="color: red;">Error loading content. Please check the form for missing data and try again.</p>`);
                }
            }
        }

        // --- PROPOSAL: Download ---

        function generateDocx() {
            const data = collectData(); 
            const clientNameForFilename = data.clientBrand.replace(/[^a-z0-9]/gi, '_');

            if (!sunEditorProposal) return;
            const editedContent = sunEditorProposal.getContents(true);

            const content = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        /* ... (Styles remain the same as v3) ... */
                        body { font-family: Calibri, sans-serif; line-height: 1.6; margin: 40px; color: #000000; }
                        h1 { font-size: 22pt; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 5px; margin-top: 30px; margin-bottom: 15px; }
                        h2 { font-size: 16pt; color: #000000; margin-top: 25px; margin-bottom: 10px; page-break-after: avoid; }
                        h3 { font-size: 12pt; color: #000000; margin-top: 15px; margin-bottom: 5px; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 10pt; page-break-inside: avoid; }
                        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
                        thead tr { background-color: #f3f4f6; }
                        ol { margin-left: 20px; padding-left: 0; font-size: 10pt; page-break-inside: avoid; }
                        ol li { margin-bottom: 8px; }
                        strong { font-weight: bold; }
                        /* REMOVED: img { max-width: 100%; height: auto; } */
                    </style>
                    <!-- Firebase App (the core Firebase SDK) is always required and must be listed first -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js">