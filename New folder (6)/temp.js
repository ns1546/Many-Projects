
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
                </head>
                <body>
                    ${editedContent} <!-- Inject the edited HTML directly -->
                </body>
                </html>
            `;
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clientNameForFilename}_Proposal_${data.date.replace(/[^a-z0-9]/gi, '')}.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function generateHtml() {
            const data = collectData();
            const clientNameForFilename = data.clientBrand.replace(/[^a-z0-9]/gi, '_');

            if (!sunEditorProposal) return;
            const editedContent = sunEditorProposal.getContents(true);

            const content = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Marketing Proposal for ${data.clientBrand}</title>
                    <style>
                        /* ... (Styles remain the same as v3) ... */
                        body { font-family: Calibri, sans-serif; line-height: 1.6; margin: 40px; color: #000000; max-width: 800px; margin-left: auto; margin-right: auto; }
                        h1 { font-size: 22pt; color: #000000; border-bottom: 2px solid #000000; padding-bottom: 5px; margin-top: 30px; margin-bottom: 15px; }
                        h2 { font-size: 16pt; color: #000000; margin-top: 25px; margin-bottom: 10px; }
                        h3 { font-size: 12pt; color: #000000; margin-top: 15px; margin-bottom: 5px; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 10pt; }
                        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
                        thead tr { background-color: #f3f4f6; }
                        ol { margin-left: 20px; padding-left: 0; font-size: 10pt; }
                        ol li { margin-bottom: 8px; }
                        strong { font-weight: bold; }
                        /* REMOVED: img { max-width: 100%; height: auto; } */
                    </style>
                </head>
                <body>
                    ${editedContent} <!-- Inject the edited HTML directly -->
                </body>
                </html>
            `;
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.download = `${clientNameForFilename}_Proposal_${data.date.replace(/[^a-z0-9]/gi, '')}.html`;
            a.href = url;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // --- AGREEMENT: Dynamic Table/List Management ---
        // All functions (renderAgreementServicesTable, updateAgreementService, addAgreementServiceRow, etc.)
        // remain exactly the same as v3.
        function renderAgreementServicesTable() {
            const tbody = document.getElementById('agreement-services-tbody');
            tbody.innerHTML = '';
            editableAgreementServices.forEach((item, index) => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td class="px-3 py-2"><input type="text" class="feature-input w-full" value="${item.feature}" oninput="updateAgreementService(${index}, 'feature', this.value)"></td>
                    <td class="px-3 py-2"><input type="text" class="feature-input w-full" value="${item.quantity}" oninput="updateAgreementService(${index}, 'quantity', this.value)"></td>
                    <td class="px-3 py-2"><textarea class="feature-input w-full" oninput="updateAgreementService(${index}, 'description', this.value)">${item.description}</textarea></td>
                    <td class="px-3 py-2 text-center">
                        <button onclick="insertAgreementServiceRow(${index})" class="text-blue-600 hover:text-blue-900 text-sm font-medium mr-2" title="Insert Below" style="margin-right: 5px;">+ Add</button>
                        <button onclick="deleteAgreementServiceRow(${index})" class="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50">Delete</button>
                    </td>
                `;
            });
            toggleSensitiveEditing(document.getElementById('input-sensitiveEdit').checked);
        }
        function insertAgreementServiceRow(index) {
            if (!document.getElementById('input-sensitiveEdit').checked) return;
            editableAgreementServices.splice(index + 1, 0, { feature: 'New Service', quantity: 'Ongoing', description: 'New service description.' });
            renderAgreementServicesTable();
        }
        function updateAgreementService(index, key, value) {
            if (editableAgreementServices[index]) {
                editableAgreementServices[index][key] = value;
            }
        }
        function addAgreementServiceRow() {
            editableAgreementServices.push({ feature: 'New Service', quantity: 'Ongoing', description: 'New service description.' });
            renderAgreementServicesTable();
        }
        function deleteAgreementServiceRow(index) {
            if (editableAgreementServices.length > 1) {
                editableAgreementServices.splice(index, 1);
                renderAgreementServicesTable();
            }
        }
        function renderAgreementMonitoringTable() {
            const tbody = document.getElementById('agreement-monitoring-tbody');
            tbody.innerHTML = '';
            editableAgreementMonitoring.forEach((item, index) => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td class="px-3 py-2"><input type="text" class="feature-input w-full" value="${item.service}" oninput="updateAgreementMonitoring(${index}, 'service', this.value)"></td>
                    <td class="px-3 py-2"><textarea class="feature-input w-full" oninput="updateAgreementMonitoring(${index}, 'description', this.value)">${item.description}</textarea></td>
                    <td class="px-3 py-2 text-center">
                        <button onclick="insertAgreementMonitoringRow(${index})" class="text-blue-600 hover:text-blue-900 text-sm font-medium mr-2" title="Insert Below" style="margin-right: 5px;">+ Add</button>
                        <button onclick="deleteAgreementMonitoringRow(${index})" class="text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50">Delete</button>
                    </td>
                `;
            });
            toggleSensitiveEditing(document.getElementById('input-sensitiveEdit').checked);
        }
        function insertAgreementMonitoringRow(index) {
            if (!document.getElementById('input-sensitiveEdit').checked) return;
            editableAgreementMonitoring.splice(index + 1, 0, { service: 'New Item', description: 'New item description.' });
            renderAgreementMonitoringTable();
        }
        function updateAgreementMonitoring(index, key, value) {
            if (editableAgreementMonitoring[index]) {
                editableAgreementMonitoring[index][key] = value;
            }
        }
        function addAgreementMonitoringRow() {
            editableAgreementMonitoring.push({ service: 'New Item', description: 'New item description.' });
            renderAgreementMonitoringTable();
        }
        function deleteAgreementMonitoringRow(index) {
            if (editableAgreementMonitoring.length > 1) {
                editableAgreementMonitoring.splice(index, 1);
                renderAgreementMonitoringTable();
            }
        }
        function renderAgreementPolicyList() {
            const list = document.getElementById('agreement-policy-list');
            list.innerHTML = '';
            editableAgreementPolicy.forEach((item, index) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'p-2 border border-gray-200 rounded-md';
                itemEl.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <input type="text" class="feature-input w-full font-semibold" value="${item.title}" oninput="updateAgreementPolicy(${index}, 'title', this.value)" placeholder="Policy Title">
                        <button onclick="insertAgreementPolicyItem(${index})" class="ml-2 text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50">+ Add</button>
                        <button onclick="deleteAgreementPolicyItem(${index})" class="ml-2 text-red-600 hover:text-red-900 text-sm font-medium disabled:opacity-50">Delete</button>
                    </div>
                    <textarea class="feature-input w-full" oninput="updateAgreementPolicy(${index}, 'text', this.value)" rows="3" placeholder="Policy text...">${item.text}</textarea>
                `;
                list.appendChild(itemEl);
            });
            toggleSensitiveEditing(document.getElementById('input-sensitiveEdit').checked);
        }
        function insertAgreementPolicyItem(index) {
            if (!document.getElementById('input-sensitiveEdit').checked) return;
            editableAgreementPolicy.splice(index + 1, 0, { title: 'New Policy Title', text: 'New policy description.' });
            renderAgreementPolicyList();
            renderDynamicLists();
        }
        function updateAgreementPolicy(index, key, value) {
            if (editableAgreementPolicy[index]) {
                editableAgreementPolicy[index][key] = value;
            }
        }
        function addAgreementPolicyItem() {
            editableAgreementPolicy.push({ title: 'New Policy Title', text: 'New policy description.' });
            renderAgreementPolicyList();
            renderDynamicLists();
        }
        function deleteAgreementPolicyItem(index) {
            if (editableAgreementPolicy.length > 1) {
                editableAgreementPolicy.splice(index, 1);
                renderAgreementPolicyList();
            renderDynamicLists();
            }
        }

        // --- AGREEMENT: Data Collection (No changes) ---
        function collectAgreementData() {
            // ... (This function remains the same as v3) ...
            const data = {};
            data.agencyName = document.getElementById('input-agn-name').value;
            data.agencyAddress = document.getElementById('input-agn-address').value;
            data.clientName = document.getElementById('input-agn-clientName').value;
            data.clientAddress = document.getElementById('input-agn-clientAddress').value;
            data.effectiveDate = document.getElementById('input-agn-effectiveDate').value;
            data.version = document.getElementById('input-agn-version').value;
            data.purpose = document.getElementById('input-agn-purpose').value;
            data.startDate = document.getElementById('input-agn-startDate').value;
            data.endDate = document.getElementById('input-agn-endDate').value;
            data.durationText = document.getElementById('input-agn-durationText').value;
            data.services = editableAgreementServices;
            data.monitoring = editableAgreementMonitoring;
            data.retainerFee = document.getElementById('input-agn-retainerFee').value;
            data.adBudget = document.getElementById('input-agn-adBudget').value;
            data.adBudgetNote = document.getElementById('input-agn-adBudgetNote').value;
            data.paymentTerms = document.getElementById('input-agn-paymentTerms').value;
            data.policy = editableAgreementPolicy;
            return data;
        }

        // --- AGREEMENT: HTML Component Generators (No changes) ---
        // All createAgreement...HTML functions remain exactly the same as v3.
        function createAgreementHeaderHTML(data) {
            return `
                <div style="width: 100%; margin-bottom: 20px; text-align: center;">
                    <h1 style="font-size: 20pt; color: #000000; margin: 0; padding: 0;">${data.agencyName}</h1>
                    <p style="font-size: 14pt; color: #000000; margin: 0; padding: 0; border-bottom: 2px solid #000000; padding-bottom: 10px;">SERVICE AGREEMENT & WORKING POLICY</p>
                </div>
                <p style="font-size: 10pt;"><strong>Between:</strong> ${data.agencyName} (Service Provider)<br>Address: ${data.agencyAddress}</p>
                <p style="font-size: 10pt;"><strong>AND</strong></p>
                <p style="font-size: 10pt;"><strong>Client:</strong> ${data.clientName} (Service Receiver)<br>Address: ${data.clientAddress}</p>
                <p style="font-size: 10pt;"><strong>Agreement Effective Date:</strong> ${data.effectiveDate}</p>
                <p style="font-size: 10pt;"><strong>Version:</strong> ${data.version} | ${data.effectiveDate}</p>
            `;
        }
        function createAgreementServicesTableHTML(services) {
            let html = `
                <h2 style="font-size: 14pt; font-weight: bold; color: #000000;">3. Services and Details</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Service Feature</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Quantity</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Description</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            services.forEach(s => {
                html += `
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">${s.feature}</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">${s.quantity}</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">${s.description}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
            return html;
        }
        function createAgreementMonitoringTableHTML(monitoring) {
            let html = `
                <h2 style="font-size: 14pt; font-weight: bold; color: #000000;">4. Monitoring, Reporting & Communication</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Service</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Description</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            monitoring.forEach(m => {
                html += `
                    <tr>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">${m.service}</td>
                        <td style="border: 1px solid #d1d5db; padding: 8px;">${m.description}</td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;
            return html;
        }
        function createAgreementFinancialsTableHTML(data) {
             return `
                <h2 style="font-size: 14pt; font-weight: bold; color: #000000;">5. Financial Overview</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt;">
                    <thead>
                        <tr style="background-color: #f3f4f6;">
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Service Category</th>
                            <th style="border: 1px solid #d1d5db; padding: 10px; text-align: left;">Deliverables & Value (BDT)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">Monthly Retainer Fee</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${data.retainerFee}</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">All Services</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">Included</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">Ad/Boosting Budget</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">(Not Included Under Monthly Retainer Fee). Paid by Client</td>
                        </tr>
                         <tr>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">Paid Ad Budget</td>
                            <td style="border: 1px solid #d1d5db; padding: 8px;">${data.adBudget} (Client-funded, paid directly to Meta)<br><br>${data.adBudgetNote}</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }
        function createAgreementPolicyListHTML(policy, agencyName) {
            let html = `
                <h2 style="font-size: 14pt; font-weight: bold; color: #000000;">7. ${agencyName}-Working Policy</h2>
                <ol style="list-style-type: decimal; margin-left: 20px; padding-left: 0; font-size: 10pt;">
            `;
            policy.forEach(p => {
                html += `<li style="margin-bottom: 10px;"><strong>${p.title}:</strong> ${p.text.replace(/\n/g, '<br>')}</li>`;
            });
            html += `</ol>`;
            return html;
        }

        // --- AGREEMENT: Download ---

        function generateAgreementDocx() {
            const data = collectAgreementData();
            const clientNameForFilename = data.clientName.replace(/[^a-z0-9]/gi, '_');

            if (!sunEditorAgreement) return;
            let editedContent = sunEditorAgreement.getContents(true);
            
            const signatureBlock = `
                <h2 style="font-size: 14pt; font-weight: bold; color: #000000; page-break-before: auto;">8. Signatures & Approval</h2>
                <p style="font-size: 10pt;">This agreement is prepared in two (2) copies, duly signed, and each party will retain one copy.</p>
                <div style="width: 100%; margin-top: 40px; display: flex; justify-content: space-between;">
                    <div style="width: 45%; vertical-align: top;">
                        <p style="font-size: 10pt;"><strong>First Party: ${data.agencyName} (Service Provider)</strong></p>
                        <div class="sig-line"></div>
                        <p style="font-size: 10pt;">Name: ________________________<br>Designation: ________________________<br>Signature: ____________________<br>Date: _______________________</p>
                    </div>
                    <div style="width: 10%;"></div>
                    <div style="width: 45%; vertical-align: top;">
                        <p style="font-size: 10pt;"><strong>Second Party: ${data.clientName} (Service Receiver)</strong></p>
                        <div class="sig-line"></div>
                        <p style="font-size: 10pt;">Name: ________________________<br>Designation: ____________________<br>Signature: ____________________<br>Date: _______________________</p>
                    </div>
                </div>
            `;
            editedContent += signatureBlock;
            const content = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        /* ... (Styles remain the same as v3) ... */
                        body { font-family: Calibri, sans-serif; line-height: 1.6; margin: 40px; color: #000000; }
                        h1 { font-size: 22pt; color: #000000; margin-top: 30px; margin-bottom: 15px; }
                        h2 { font-size: 16pt; color: #000000; margin-top: 25px; margin-bottom: 10px; page-break-after: avoid; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 10pt; page-break-inside: avoid; }
                        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
                        thead tr { background-color: #f3f4f6; }
                        ol { margin-left: 20px; padding-left: 0; font-size: 10pt; page-break-inside: avoid; }
                        ol li { margin-bottom: 8px; }
                        strong { font-weight: bold; }
                        .sig-block { margin-top: 50px; width: 45%; font-size: 10pt; }
                        .sig-line { border-bottom: 1px solid #374151; height: 20px; margin-top: 30px; }
                        /* REMOVED: img { max-width: 100%; height: auto; } */
                    </style>
                </head>
                <body>
                    ${editedContent}
                </body>
                </html>
            `;
            const blob = new Blob([content], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clientNameForFilename}_Service_Agreement.doc`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        function generateAgreementHtml() {
            const data = collectAgreementData();
            const clientNameForFilename = data.clientName.replace(/[^a-z0-9]/gi, '_');

            if (!sunEditorAgreement) return;
            let editedContent = sunEditorAgreement.getContents(true);
            
            const signatureBlock = `
                <h2 style="font-size: 14pt; font-weight: bold; color: #000000;">8. Signatures & Approval</h2>
                <p style="font-size: 10pt;">This agreement is prepared in two (2) copies, duly signed, and each party will retain one copy.</p>
                <div style="width: 100%; margin-top: 40px; display: flex; justify-content: space-between;">
                    <div style="width: 45%; vertical-align: top;">
                        <p style="font-size: 10pt;"><strong>First Party: ${data.agencyName} (Service Provider)</strong></p>
                        <div class="sig-line"></div>
                        <p style="font-size: 10pt;">Name: ________________________<br>Designation: ________________________<br>Signature: ____________________<br>Date: _______________________</p>
                    </div>
                    <div style="width: 10%;"></div>
                    <div style="width: 45%; vertical-align: top;">
                        <p style="font-size: 10pt;"><strong>Second Party: ${data.clientName} (Service Receiver)</strong></p>
                        <div class="sig-line"></div>
                        <p style="font-size: 10pt;">Name: ________________________<br>Designation: ____________________<br>Signature: ____________________<br>Date: _______________________</p>
                    </div>
                </div>
            `;
            editedContent += signatureBlock;
            const content = `
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Service Agreement - ${data.clientName}</title>
                    <style>
                        /* ... (Styles remain the same as v3) ... */
                        body { font-family: Calibri, sans-serif; line-height: 1.6; margin: 40px; color: #374151; max-width: 800px; margin-left: auto; margin-right: auto; }
                        h1 { font-size: 22pt; color: #000000; margin-top: 30px; margin-bottom: 15px; }
                        h2 { font-size: 16pt; color: #000000; margin-top: 25px; margin-bottom: 10px; }
                        table { border-collapse: collapse; width: 100%; margin-bottom: 20px; font-size: 10pt; }
                        th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
                        thead tr { background-color: #f3f4f6; }
                        ol { margin-left: 20px; padding-left: 0; font-size: 10pt; }
                        ol li { margin-bottom: 8px; }
                        strong { font-weight: bold; }
                        .sig-block { margin-top: 50px; width: 45%; font-size: 10pt; }
                        .sig-line { border-bottom: 1px solid #374151; height: 20px; margin-top: 30px; }
                        /* REMOVED: img { max-width: 100%; height: auto; } */
                    </style>
                </head>
                <body>
                    ${editedContent}
                </body>
                </html>
            `;
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clientNameForFilename}_Service_Agreement.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        // --- AI API AND ADVANCED TOOLS ---
        const GROQ_API_KEY = "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";
        
        function getActiveEditor() {
            if (currentWorld === 'proposal' && typeof sunEditorProposal !== 'undefined') return sunEditorProposal;
            if (currentWorld === 'agreement' && typeof sunEditorAgreement !== 'undefined') return sunEditorAgreement;
            return null;
        }

        function executeFindReplace() {
            const findWord = document.getElementById('ai-find-word').value;
            const replaceWord = document.getElementById('ai-replace-word').value;
            if (!findWord) return alert("Please enter a word to find.");
            
            const editor = getActiveEditor();
            if (!editor) return alert("Please load content into the editor first.");
            
            let content = editor.getContents();
            // Simple replace all, maintaining HTML tags mostly (can be a bit risky with HTML but sufficient for standard text replacements)
            const regex = new RegExp(findWord, 'gi');
            const newContent = content.replace(regex, replaceWord);
            
            editor.setContents(newContent);
            alert(`Replaced all occurrences of "${findWord}".`);
        }

        async function executeAIGeneration() {
            const prompt = document.getElementById('ai-prompt').value;
            if (!prompt) return alert("Please enter a prompt for the AI.");
            
            const btn = document.getElementById('ai-generate-btn');
            btn.innerHTML = "Generating...";
            btn.disabled = true;
            
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant", 
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7
                    })
                });
                
                const data = await response.json();
                if (data.choices && data.choices.length > 0) {
                    const resultText = data.choices[0].message.content;
                    document.getElementById('ai-result').value = resultText;
                    document.getElementById('ai-response-area').classList.remove('hidden');
                } else {
                    alert("AI generation failed. Please check the API key.");
                }
            } catch (error) {
                console.error("AI Error:", error);
                alert("Error connecting to AI. See console.");
            }
            
            btn.innerHTML = "Generate Content";
            btn.disabled = false;
        }

        
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
            editor.appendContents(`<p>${resultText.replace(/\n/g, '<br>')}</p>`);
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

        function old_insertAIContent() {
            const resultText = document.getElementById('ai-result').value;
            const editor = getActiveEditor();
            if (!editor) return alert("Please load content into the editor first.");
            
            editor.appendContents(`<p>${resultText.replace(/\n/g, '<br>')}</p>`);
            alert("Content inserted at the end of the document.");
        }

        function generatePdf() {
            if (!sunEditorProposal) {
                alert("Please 'Load / Refresh Content' first!");
                return;
            }
            const content = sunEditorProposal.getContents(true);
            if (!content || content.trim() === '') {
                alert("Editor is empty.");
                return;
            }
            const wrapper = document.createElement('div');
            wrapper.innerHTML = content;
            const opt = {
                margin:       1,
                filename:     'EvoRise_Proposal.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(wrapper).save();
        }

        function generateAgreementPdf() {
            if (!sunEditorAgreement) {
                alert("Please 'Load / Refresh Content' first!");
                return;
            }
            const content = sunEditorAgreement.getContents(true);
            if (!content || content.trim() === '') {
                alert("Editor is empty.");
                return;
            }
            const wrapper = document.createElement('div');
            wrapper.innerHTML = content;
            const opt = {
                margin:       1,
                filename:     'EvoRise_Agreement.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().set(opt).from(wrapper).save();
        }

        function saveDocumentState() {
            const state = {
                inputs: {},
                
                arrays: {
                    editableFeatures,
                    editableAgreementServices,
                    editableAgreementMonitoring,
                    editableAgreementPolicy,
                    editableActivities,
                    editableGoals,
                    editableTerms
                }

            };
            document.querySelectorAll('input[id], textarea[id], select[id]').forEach(el => {
                if (el.id.startsWith('suneditor_') || el.id.startsWith('ai-') || el.classList.contains('sun-editor-editable')) return;
                if (el.type === 'checkbox' || el.type === 'radio') {
                    state.inputs[el.id] = el.checked;
                } else {
                    state.inputs[el.id] = el.value;
                }
            });
            localStorage.setItem('evoriseDocumentState', JSON.stringify(state));
        }

        function loadDocumentState() {
            const saved = localStorage.getItem('evoriseDocumentState');
            if (saved) {
                try {
                    const state = JSON.parse(saved);
                    
                    if (state.arrays) {
                        if (state.arrays.editableFeatures) editableFeatures = state.arrays.editableFeatures;
                        if (state.arrays.editableAgreementServices) editableAgreementServices = state.arrays.editableAgreementServices;
                        if (state.arrays.editableAgreementMonitoring) editableAgreementMonitoring = state.arrays.editableAgreementMonitoring;
                        if (state.arrays.editableAgreementPolicy) editableAgreementPolicy = state.arrays.editableAgreementPolicy;
                        if (state.arrays.editableActivities) editableActivities = state.arrays.editableActivities;
                        if (state.arrays.editableGoals) editableGoals = state.arrays.editableGoals;
                        if (state.arrays.editableTerms) editableTerms = state.arrays.editableTerms;
                    }

                    if (state.inputs) {
                        Object.keys(state.inputs).forEach(id => {
                            const el = document.getElementById(id);
                            if (el) {
                                if (el.type === 'checkbox' || el.type === 'radio') {
                                    el.checked = state.inputs[id];
                                } else {
                                    el.value = state.inputs[id];
                                }
                            }
                        });
                    }
                } catch (e) {
                    console.error("Failed to load state", e);
                }
            }
        }
                // --- FIREBASE & CLOUD DRAFT MANAGEMENT ---
        const firebaseConfig = {
            apiKey: "AIzaSyBR-Ve4HbryTvPoe39ruTWf5G4Zzh1dDBU",
            authDomain: "evorise-client-notificat-4731e.firebaseapp.com",
            projectId: "evorise-client-notificat-4731e",
            storageBucket: "evorise-client-notificat-4731e.firebasestorage.app",
            messagingSenderId: "36069190125",
            appId: "1:36069190125:web:b7339d0962f2f4a1b95fe4",
            measurementId: "G-YP4RFH3CB8"
        };
        
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const db = firebase.firestore();
        
        let allCloudDrafts = [];
        
        async function loadCloudDrafts() {
            document.getElementById('drafts-list-container').innerHTML = '<div style="text-align:center; padding:40px; color:#64748b;">Loading drafts from Cloud...</div>';
            try {
                const snapshot = await db.collection("drafts").orderBy("updatedAt", "desc").get();
                allCloudDrafts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                renderDraftsList();
            } catch (e) {
                console.error("Error loading drafts from Firestore", e);
                document.getElementById('drafts-list-container').innerHTML = '<div style="text-align:center; padding:40px; color:#ef4444;">Failed to load drafts. Check console for details.</div>';
            }
        }
        
        function renderDraftsList() {
            const container = document.getElementById('drafts-list-container');
            const search = document.getElementById('draft-search').value.toLowerCase();
            
            container.innerHTML = '';
            const filtered = allCloudDrafts.filter(d => d.name.toLowerCase().includes(search));
            
            if (filtered.length === 0) {
                container.innerHTML = '<div style="text-align:center; color:#64748b; padding:40px;">No drafts found.</div>';
                return;
            }
            
            filtered.forEach(draft => {
                const dateStr = new Date(draft.updatedAt).toLocaleString();
                const div = document.createElement('div');
                div.style = "display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border:1px solid #e2e8f0; border-radius:10px; margin-bottom:12px; background:#ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition:all 0.2s;";
                div.onmouseover = () => div.style.borderColor = '#6366f1';
                div.onmouseout = () => div.style.borderColor = '#e2e8f0';
                
                div.innerHTML = `
                    <div>
                        <div style="font-weight:700; color:#1e293b; font-size:1.1rem; margin-bottom:4px;">${draft.name}</div>
                        <div style="font-size:0.85rem; color:#64748b; display:flex; align-items:center; gap:6px;">
                            <span>🕒</span> Last saved: ${dateStr}
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="btn btn-primary" style="padding:8px 16px; font-size:0.85rem;" onclick="loadDraftFromCloud('${draft.id}')">Open Draft</button>
                        <button class="btn btn-secondary" style="padding:8px 16px; font-size:0.85rem; color:#ef4444; border-color:#fca5a5;" onclick="deleteDraftFromCloud('${draft.id}')">Delete</button>
                    </div>
                `;
                container.appendChild(div);
            });
        }
        
        async function saveNamedDraft() {
            const name = document.getElementById('draft-name').value.trim();
            if (!name) return alert("Please enter a draft name.");
            
            // Collect the very latest state before saving
            collectData(); 
            if (currentWorld === 'proposal') {
                try {
                    proposalData.editorHtml = sunEditorProposal.getContents(true);
                } catch(e){}
            }
            if (currentWorld === 'agreement') {
                collectAgreementData();
                try {
                    agreementData.editorHtml = sunEditorAgreement.getContents(true);
                } catch(e){}
            }
            saveDocumentState(); // Ensure local storage is also updated as a fallback backup
            
            const state = JSON.parse(localStorage.getItem('evoriseDocumentState') || '{}');
            const btn = document.getElementById('btn-save-draft');
            const oldText = btn.innerText;
            btn.innerText = "Saving to Cloud...";
            btn.disabled = true;
            
            try {
                // Ensure name is safe for doc ID
                const docId = name.replace(/[^a-zA-Z0-9 -_]/g, '');
                if (!docId) throw new Error("Invalid draft name.");
                
                await db.collection("drafts").doc(docId).set({
                    name: name,
                    state: JSON.stringify(state),
                    updatedAt: Date.now()
                });
                alert(`Draft '${name}' successfully saved to Cloud!`);
                document.getElementById('draft-name').value = '';
            } catch (e) {
                console.error("Error saving draft to cloud", e);
                alert("Failed to save draft to cloud.");
            }
            btn.innerText = oldText;
            btn.disabled = false;
        }
        
        function loadDraftFromCloud(id) {
            const draft = allCloudDrafts.find(d => d.id === id);
            if (!draft) return;
            
            localStorage.setItem('evoriseDocumentState', draft.state);
            loadDocumentState();
            document.getElementById('firebase-drafts-modal').style.display = 'none';
            alert(`Draft '${draft.name}' loaded from Cloud!`);
        }
        
        async function deleteDraftFromCloud(id) {
            if (!confirm(`Are you sure you want to permanently delete this draft from the Cloud?`)) return;
            try {
                await db.collection("drafts").doc(id).delete();
                allCloudDrafts = allCloudDrafts.filter(d => d.id !== id);
                renderDraftsList();
            } catch(e) {
                console.error(e);
                alert("Failed to delete draft from Cloud.");
            }
        }
        
        function updateDraftDropdown() {
            // Deprecated - Replaced by Firebase Cloud Dashboard
        }

        
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

        // --- AUTO PREVIEW ---
        let previewDebounce = null;
        function triggerAutoPreview() {
            clearTimeout(previewDebounce);
            previewDebounce = setTimeout(() => {
                if (currentWorld === 'proposal') {
                    const autoCheckbox = document.getElementById('auto-preview-proposal');
                    if (autoCheckbox && autoCheckbox.checked) updateLiveEditor();
                } else if (currentWorld === 'agreement') {
                    const autoCheckbox = document.getElementById('auto-preview-agreement');
                    if (autoCheckbox && autoCheckbox.checked) updateLiveEditor();
                }
            }, 1000);
        }

        
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

        // --- INITIALIZATION ---

        document.addEventListener('DOMContentLoaded', () => {
            
            // Load persisted state
            loadDocumentState();
            
            // Auto-save listeners
            document.addEventListener('input', () => { saveDocumentState(); syncGlobalFields(); triggerAutoPreview(); });
            document.addEventListener('change', () => { saveDocumentState(); syncGlobalFields(); triggerAutoPreview(); });
            
            // Init Draft dropdown
            updateDraftDropdown();
            
            // --- Core UI Initialization ---
            const sensitiveEditCheckbox = document.getElementById('input-sensitiveEdit');
            const showContactCheckbox = document.getElementById('input-showContactInfo');
            const contactInfoWrapper = document.getElementById('contact-info-wrapper');
            
            toggleSensitiveEditing(false);
            
            if (sensitiveEditCheckbox) {
                sensitiveEditCheckbox.addEventListener('change', (e) => {
                    toggleSensitiveEditing(e.target.checked);
                });
            }

            if (showContactCheckbox) {
                showContactCheckbox.addEventListener('change', (e) => {
                    if (contactInfoWrapper) {
                        if (e.target.checked) {
                            contactInfoWrapper.classList.remove('hidden');
                        } else {
                            contactInfoWrapper.classList.add('hidden');
                        }
                    }
                });
            }

            // Render initial tables
            renderFeaturesTable();
            renderAgreementServicesTable();
            renderAgreementMonitoringTable();
            renderAgreementPolicyList();
            renderDynamicLists();
            
            showTab('client');

            // --- Editor Initialization ---
            try {
                if (typeof SUNEDITOR !== 'undefined') {
                    editorConfig = {
                        width: '100%',
                        height: '600px',
                        defaultStyle: "font-family: 'Inter', sans-serif; font-size: 11pt; line-height: 1.6;"
                    };

                    setTimeout(() => {
                        sunEditorProposal = SUNEDITOR.create(document.getElementById('live-review-editor'), editorConfig);
                        if (sunEditorProposal) {
                            sunEditorProposal.setContents('<p style="color: #6b7280;">Click "Load/Refresh Content" to begin proposal preview...</p>');
                        }
                    }, 50);
                } else {
                    console.warn("SUNEDITOR is not defined. The rich text editor will not be available.");
                }
            } catch (e) {
                console.error("Error initializing SunEditor:", e);
            }
        });
    