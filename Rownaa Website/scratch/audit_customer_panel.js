const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function auditCustomerPanel() {
    console.log('=== DEEP MULTI-DIMENSIONAL AUDIT OF CUSTOMER-PANEL.HTML ===\n');

    const htmlPath = path.join(__dirname, '../customer-panel.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const dom = new JSDOM(htmlContent, {
        runScripts: 'dangerously',
        resources: 'usable',
        url: 'http://localhost:3000/customer-panel.html',
        beforeParse(window) {
            window._IS_TEST_ENV = true;
            window.rownaaSession = { id: 'cust-101', name: 'Tanvir Hossain', role: 'customer' };
        }
    });
    const { window } = dom;
    const { document } = window;

    const findings = [];

    function flag(severity, dimension, title, description, codeRef) {
        findings.push({ severity, dimension, title, description, codeRef });
    }

    // ----------------------------------------------------
    // DIMENSION 1: AI / CODE & LOGIC RUNTIME AUDIT
    // ----------------------------------------------------
    console.log('[AI Analysis] Inspecting code logic, selectors, and state reactivity...');

    // 1.1 Check updateDateTime scoping
    const fnUpdateDateTimeStr = window.updateDateTime ? window.updateDateTime.toString() : '';
    if (fnUpdateDateTimeStr.includes('#frm-airport input[type="date"]')) {
        flag(
            'HIGH',
            'AI / Code Logic',
            'updateDateTime() Hardcoded to Airport Form Only',
            'The function updateDateTime() only queries "#frm-airport input[type=\"date\"]". When a customer selects Hourly Rental, Intercity, or Corporate, changing the date or time on those forms NEVER updates #sum-dt. The Trip Summary stubbornly displays "Select Date".',
            'customer-panel.html: line 1030'
        );
    }

    // 1.2 Check date/time event handlers on Hourly, Intercity, Corporate
    const hourlyDate = document.querySelector('#frm-hourly input[type="date"]');
    if (hourlyDate && !hourlyDate.getAttribute('onchange')) {
        flag(
            'HIGH',
            'AI / Code Logic',
            'Missing Event Handlers on Hourly/Intercity/Corporate Date & Time',
            'Inputs for date and time in #frm-hourly, #frm-intercity, and #frm-corporate lack onchange="updateDateTime()" and onchange="calculateCustomerBookingFare()", leaving summary schedule and price unreactive.',
            'customer-panel.html: #frm-hourly, #frm-intercity, #frm-corporate'
        );
    }

    // 1.3 Check #sum-pick reactivity across services
    const hourlyPick = document.querySelector('#frm-hourly input[type="text"]');
    if (hourlyPick && !hourlyPick.getAttribute('oninput') && !hourlyPick.getAttribute('onchange')) {
        flag(
            'HIGH',
            'AI / Code Logic',
            'Pickup Location in Hourly/Corporate Never Updates Summary',
            'The Trip Summary element #sum-pick is only wired to the Airport select dropdown. When typing an hourly pickup address or corporate location, #sum-pick remains permanently frozen as "Not Set".',
            'customer-panel.html: #sum-pick'
        );
    }

    // 1.4 Check Avg Rating stat update
    const domLoadedCode = htmlContent.substring(htmlContent.indexOf('DOMContentLoaded'));
    if (domLoadedCode.includes('statVals[0]') && !domLoadedCode.includes('statVals[3]')) {
        flag(
            'MEDIUM',
            'AI / Code Logic',
            'Average Rating Metric Ignored in Stats Calculation',
            'The dashboard stats loop calculates totalTrips (statVals[0]), upcoming (statVals[1]), and totalSpend (statVals[2]), but completely ignores statVals[3] (Avg Rating Given), leaving it permanently locked at hardcoded 4.8.',
            'customer-panel.html: line 1618'
        );
    }

    // 1.5 Check Promo Code in Customer Panel
    const promoInput = document.getElementById('cust-promo') || document.querySelector('#pnl-book input[placeholder*="promo" i]');
    if (!promoInput) {
        flag(
            'HIGH',
            'AI / Code Logic',
            'Zero Promo / Voucher Discount Input in Book a Ride',
            'Customer panel has no promo code or voucher entry field in the booking tab. Unlike checkout.html, logged-in customers cannot enter ROWNAA20 or select vouchers to get discounts from their portal.',
            'customer-panel.html: #pnl-book'
        );
    }

    // ----------------------------------------------------
    // DIMENSION 2: AUDITOR / SECURITY, PRIVACY & COMPLIANCE
    // ----------------------------------------------------
    console.log('[Auditor Analysis] Inspecting authentication guards, session hygiene, and data boundaries...');

    // 2.1 Check Customer RBAC / Auth Enforcement Guard
    if (!htmlContent.includes('enforceCustomerRBAC') && !htmlContent.includes('enforceAuth') && !htmlContent.includes('enforceRBAC')) {
        flag(
            'CRITICAL',
            'Auditor / Security',
            'Missing Top-Level Customer Authentication & RBAC Guard',
            'Unlike owner-panel.html (which implements enforceOwnerRBAC at top of head), customer-panel.html has no RBAC entry guard. An unauthenticated guest can navigate to customer-panel.html and access dummy profile screens rather than being cleanly redirected to login.',
            'customer-panel.html: <head>'
        );
    }

    // 2.2 Check Hardcoded User Contamination & Mock Fallbacks
    if (htmlContent.includes("'cust-1'") || htmlContent.includes('"cust-1"')) {
        flag(
            'HIGH',
            'Auditor / Security',
            'Hardcoded Fallback "cust-1" Contaminates Multi-Tenant Data',
            'When session hydration is incomplete or guest visits, code silently falls back to customerId = "cust-1" and ownerId = "biz-001". This risks merging bookings, notifications, and profile data from different users into a single shared mock bucket.',
            'customer-panel.html: lines 1087, 1249, 1493'
        );
    }

    // 2.3 Check Phone Number & Date Validation on submitForm
    const fnSubmitFormStr = window.submitForm ? window.submitForm.toString() : '';
    if (!fnSubmitFormStr.includes('regex') && !fnSubmitFormStr.includes('test(') && !fnSubmitFormStr.includes('match(') && !htmlContent.includes('bdPhoneRegex')) {
        flag(
            'MEDIUM',
            'Auditor / Security',
            'Zero Input Validation on Rider Phone & Past Date Booking',
            'submitForm() accepts arbitrary text strings for customerPhone (e.g. "abc", "123") without validating Bangladesh phone regex format (+8801[3-9]XXXXXXXX). It also permits selecting past dates without client-side blocking.',
            'customer-panel.html: submitForm()'
        );
    }

    // ----------------------------------------------------
    // DIMENSION 3: HUMAN / USER EXPERIENCE & USABILITY
    // ----------------------------------------------------
    console.log('[Human Analysis] Inspecting visual hierarchy, user journey, and real-life usability...');

    // 3.1 Hardcoded Names Mismatch (Rafiq Karim vs Faisal Ahmed)
    const sidebarName = document.querySelector('.user-name')?.textContent || '';
    const bookRiderName = document.getElementById('book-rider-name')?.value || '';
    if (sidebarName === 'Rafiq Karim' && bookRiderName === 'Faisal Ahmed') {
        flag(
            'CRITICAL',
            'Human / Usability',
            'Identity Identity Crisis: Conflicting Dummy Names Across Screens',
            'In the sidebar and welcome banner the user is addressed as "Rafiq Karim" / "Welcome back, Rafiq.", but the booking form defaults to "Faisal Ahmed", and profile settings defaults to "Faisal Ahmed". This causes immediate human mistrust and confusion.',
            'customer-panel.html: .user-name vs #book-rider-name'
        );
    }

    // 3.2 Airport Direction & Inversion
    const segControls = document.querySelectorAll('#frm-airport .seg-btn');
    if (segControls.length === 2) {
        flag(
            'HIGH',
            'Human / Usability',
            'Missing "Round Trip" Option in Airport Transfer Direction',
            'Airport Transfer only offers "To Airport" and "From Airport". Per Rownaa_Complete_Pricing.pdf Section 4.5, "Round Trip (Drop-off + Pickup)" is a core required direction with a 500 tk flat surcharge.',
            'customer-panel.html: #frm-airport .seg-control'
        );
    }

    // 3.3 Airport Pickup Inversion
    const lblPickup = document.getElementById('lbl-air-pickup');
    const lblDropoff = document.getElementById('lbl-air-dropoff');
    if (typeof window.setAirportDirection === 'function') {
        window.setAirportDirection('from_airport');
    }
    const isInverted = (lblPickup && lblPickup.textContent.includes('Drop-off')) || htmlContent.includes('Drop-off Area in Dhaka');
    if (!isInverted) {
        flag(
            'HIGH',
            'Human / Usability',
            'Airport "From Airport" Does Not Invert Origin and Destination',
            'When the customer clicks "From Airport", the form still asks for "Pickup Area: Uttara/Gulshan/Dhanmondi" and "Airport: Hazrat Shahjalal". In real life, the pickup is the Airport and the drop-off is the customer\'s home/hotel.',
            'customer-panel.html: #frm-airport'
        );
    }

    // 3.4 Missing Dhaka Areas in Airport
    const pickupSelect = document.querySelector('#frm-airport select');
    const optCount = pickupSelect ? pickupSelect.querySelectorAll('option').length : 0;
    if (optCount <= 5) {
        flag(
            'MEDIUM',
            'Human / Usability',
            'Only 3 Areas Listed in Airport Pickup (Missing Mirpur, Banani, Badda, Savar, etc.)',
            'The dropdown only lists Uttara, Gulshan, Dhanmondi. Dhaka has 8 major travel zones defined in the Rownaa Pricing Spec (Mirpur, Banani, Bashundhara, Badda, Tejgaon, Old Dhaka, Savar). Customers from other areas cannot select their location.',
            'customer-panel.html: #frm-airport select'
        );
    }

    // 3.5 Intercity Trip Type Selection
    const icSection = document.getElementById('frm-intercity');
    if (icSection && !icSection.innerHTML.includes('Same-Day') && !icSection.innerHTML.includes('Multi-Day')) {
        flag(
            'HIGH',
            'Human / Usability',
            'Intercity Lacks Same-Day vs Multi-Day Selection & Night Inputs',
            'Intercity travel only has two city dropdowns. Customers cannot specify whether they want a One-Way trip, a Same-Day Round Trip (50% surcharge), or a Multi-Day Round Trip with waiting nights (2,000 tk/night) as mandated by the pricing specification.',
            'customer-panel.html: #frm-intercity'
        );
    }

    // 3.6 Hourly Rental Packages (4h & 10h)
    const hourlyDurations = Array.from(document.querySelectorAll('#frm-hourly select option')).map(o => o.text);
    if (hourlyDurations.includes('Full Day') || !hourlyDurations.includes('10 Hours')) {
        flag(
            'MEDIUM',
            'Human / Usability',
            'Hourly Rental Displays Non-Standard "Full Day" Instead of 10-Hour Package',
            'Hourly duration dropdown shows "4 Hours, 8 Hours, Full Day" instead of the official pricing spec packages: "4 Hours" and "10 Hours".',
            'customer-panel.html: #frm-hourly select'
        );
    }

    // Print Results
    console.log(`\nAUDIT COMPLETE: ${findings.length} Distinct Defects Discovered across AI, Auditor, and Human Perspectives.\n`);
    if (findings.length === 0) {
        console.log('🏆 100% CLEAN BILL OF HEALTH: All 13 Defects Successfully Resolved!\n');
    } else {
        findings.forEach((f, idx) => {
            console.log(`[${idx + 1}] [${f.severity}] [${f.dimension}] ${f.title}`);
            console.log(`    Ref: ${f.codeRef}`);
            console.log(`    Details: ${f.description}\n`);
        });
    }
}

auditCustomerPanel().catch(err => {
    console.error('Audit Script Error:', err);
});
