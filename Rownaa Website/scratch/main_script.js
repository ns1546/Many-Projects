
    // Configuration for Google Sheets Live Database Webhook
    const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyIfi-UfdbxfeNBu_8mo33CAN0SasA1EjBP4ahScIoHWVfuMUzjPoG2DjPwddBzVyNbTQ/exec';
    let GOOGLE_SHEET_WEBHOOK_URL = window.ROWNAA_GOOGLE_SHEET_URL || localStorage.getItem('rownaa_gsheet_url') || DEFAULT_GOOGLE_SHEET_URL;

    // Suppress Dev Dock permanently on Driver Intake Form
    window.DISABLE_ROLE_DOCK = true;

    // =========================================================
    // PERSISTENT FORM SETTINGS & EXTENSIBILITY ENGINE
    // =========================================================
    const SETTINGS_KEY = 'rownaa_driver_form_settings';

    let driverSettings = {
      bypassMandatory: false,
      customOptions: [],
      sheetWebhookUrl: DEFAULT_GOOGLE_SHEET_URL
    };

    function loadDriverSettings() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          driverSettings = Object.assign({}, driverSettings, parsed);
        }
      } catch(e) {
        console.warn('Error loading driver form settings:', e);
      }
      return driverSettings;
    }

    function saveDriverSettings(newSettings) {
      driverSettings = Object.assign(driverSettings, newSettings);
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(driverSettings));
      } catch(e) {
        console.warn('Error saving driver form settings:', e);
      }
    }

    function applyDriverSettings() {
      const isBypass = !!driverSettings.bypassMandatory;

      // 1. Mandatory Fields Controller
      const allFormInputs = document.querySelectorAll('#driver-register-form input, #driver-register-form select, #driver-register-form textarea');
      allFormInputs.forEach(el => {
        if (el.hasAttribute('required') && !el.hasAttribute('data-orig-required')) {
          el.setAttribute('data-orig-required', 'true');
        }
        if (isBypass) {
          el.removeAttribute('required');
        } else {
          if (el.getAttribute('data-orig-required') === 'true') {
            el.setAttribute('required', '');
          }
        }
      });

      // Update Labels (* asterisks vs (Optional))
      document.querySelectorAll('.f-label .req').forEach(reqSpan => {
        if (isBypass) {
          reqSpan.innerHTML = '<span class="opt-badge">' + (currentLang === 'bn' ? '(ঐচ্ছিক)' : '(Optional)') + '</span>';
        } else {
          reqSpan.innerHTML = '*';
        }
      });

      // Update Form Notice Banner & Nav Badges
      const banner = document.getElementById('bypass-mandatory-notice');
      const navBadge = document.getElementById('settings-badge');
      const modalSwitch = document.getElementById('setting-bypass-mandatory');
      const statusTag = document.getElementById('sm-bypass-status-tag');
      const statusText = document.getElementById('sm-bypass-status-text');

      if (banner) banner.style.display = isBypass ? 'flex' : 'none';
      if (navBadge) {
        const hasCustom = driverSettings.customOptions && driverSettings.customOptions.length > 0;
        navBadge.style.display = (isBypass || hasCustom) ? 'inline-block' : 'none';
        navBadge.textContent = isBypass ? (currentLang === 'bn' ? 'বাইপাস' : 'BYPASS') : (currentLang === 'bn' ? 'কাস্টম' : 'CUSTOM');
      }
      if (modalSwitch) modalSwitch.checked = isBypass;
      if (statusTag) {
        statusTag.className = isBypass ? 'sm-status-indicator bypass-active' : 'sm-status-indicator';
        if (statusText) {
          statusText.textContent = isBypass 
            ? (currentLang === 'bn' ? 'বাইপাস সক্রিয় (সকল রিকোয়ার্ড ফিল্ড ঐচ্ছিক)' : 'Bypass Active (All mandatory constraints relaxed)')
            : (currentLang === 'bn' ? 'কঠোর মোড সক্রিয় (সকল ফিল্ড পূরণ বাধ্যতামূলক)' : 'Strict Mode Active (All required fields enforced)');
        }
      }

      // 2. Custom Dropdown Options Injector
      if (Array.isArray(driverSettings.customOptions)) {
        driverSettings.customOptions.forEach(opt => {
          injectCustomOptionIntoDom(opt);
        });
      }

      // 3. Webhook Sync Setting
      if (driverSettings.sheetWebhookUrl) {
        GOOGLE_SHEET_WEBHOOK_URL = driverSettings.sheetWebhookUrl;
      }
      const sheetUrlInput = document.getElementById('sm-sheet-url');
      if (sheetUrlInput) sheetUrlInput.value = GOOGLE_SHEET_WEBHOOK_URL;

      renderCustomOptionsInSettings();
    }

    function injectCustomOptionIntoDom(opt) {
      if (!opt || !opt.fieldId || !opt.value) return;

      if (opt.fieldId === 'services') {
        const grid = document.getElementById('services-grid-container');
        const addTile = document.getElementById('btn-add-custom-service-tile');
        const existingCb = document.querySelector(`input[name="services"][value="${CSS.escape(opt.value)}"]`);
        if (!existingCb && grid && addTile) {
          const newCard = document.createElement('label');
          newCard.className = 'service-card-tile selected custom-injected-svc';
          newCard.setAttribute('data-custom-opt-id', opt.value);
          newCard.setAttribute('onclick', 'toggleServiceCheckbox(this)');
          newCard.innerHTML = `
            <input type="checkbox" name="services" value="${opt.value}" checked/>
            <div class="svc-tile-head">
              <div class="svc-tile-icon" style="background:rgba(212,255,0,0.14); color:var(--accent);"><i class="ph-fill ph-sparkle"></i></div>
              <div class="svc-tile-title">${opt.label}</div>
            </div>
            <div class="svc-tile-desc">Custom specialized service category</div>
            <div class="svc-rate-badge" style="background:rgba(212,255,0,0.15); color:var(--accent);">Custom Service</div>
          `;
          grid.insertBefore(newCard, addTile);
        }
        return;
      }

      const selectEl = document.getElementById(opt.fieldId);
      if (!selectEl) return;

      let existingOption = Array.from(selectEl.options).find(o => o.value === opt.value);
      if (!existingOption) {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        optionEl.className = 'custom-injected-opt';

        const customOpt = selectEl.querySelector('option[value="__custom__"]');
        if (customOpt) {
          selectEl.insertBefore(optionEl, customOpt);
        } else {
          selectEl.appendChild(optionEl);
        }
      }
    }

    function openDriverSettingsModal() {
      const overlay = document.getElementById('driver-settings-overlay');
      if (overlay) overlay.style.display = 'flex';
      renderCustomOptionsInSettings();
      const sheetUrlInput = document.getElementById('sm-sheet-url');
      if (sheetUrlInput) sheetUrlInput.value = GOOGLE_SHEET_WEBHOOK_URL;
    }

    function closeDriverSettingsModal(e) {
      if (e && e.target && e.target.id !== 'driver-settings-overlay' && !e.target.closest('.sm-close-btn') && !e.target.closest('button')) {
        return;
      }
      const overlay = document.getElementById('driver-settings-overlay');
      if (overlay) overlay.style.display = 'none';
    }

    function toggleMandatoryBypass(checked) {
      driverSettings.bypassMandatory = checked;
      saveDriverSettings({ bypassMandatory: checked });
      applyDriverSettings();
    }

    function addCustomOptionFromSettings() {
      const fieldSelect = document.getElementById('sm-target-field');
      const valInput = document.getElementById('sm-new-option-val');
      const targetField = fieldSelect ? fieldSelect.value : 'drv-city';
      const optionVal = valInput ? valInput.value.trim() : '';

      if (!optionVal) {
        alert(currentLang === 'bn' ? 'অনুগ্রহ করে নতুন অপশনের একটি নাম লিখুন।' : 'Please enter a name or title for the new option.');
        if (valInput) valInput.focus();
        return;
      }

      const exists = (driverSettings.customOptions || []).some(o => o.fieldId === targetField && o.value.toLowerCase() === optionVal.toLowerCase());
      if (exists) {
        alert(currentLang === 'bn' ? 'এই অপশনটি ইতিমধ্যেই তালিকায় বিদ্যমান।' : 'This custom option already exists for the selected field.');
        return;
      }

      if (!driverSettings.customOptions) driverSettings.customOptions = [];
      const newOpt = {
        fieldId: targetField,
        value: optionVal,
        label: optionVal
      };
      driverSettings.customOptions.push(newOpt);
      saveDriverSettings({ customOptions: driverSettings.customOptions });
      applyDriverSettings();

      const targetSelect = document.getElementById(targetField);
      if (targetSelect) {
        targetSelect.value = optionVal;
      }

      if (valInput) valInput.value = '';
      alert(currentLang === 'bn' ? `✅ "${optionVal}" সফলভাবে যুক্ত করা হয়েছে!` : `✅ Custom option "${optionVal}" successfully added!`);
    }

    function removeCustomOption(index) {
      if (!driverSettings.customOptions || !driverSettings.customOptions[index]) return;
      const removed = driverSettings.customOptions[index];

      if (removed.fieldId === 'services') {
        const injectedCard = document.querySelector(`label.custom-injected-svc[data-custom-opt-id="${CSS.escape(removed.value)}"]`);
        if (injectedCard) injectedCard.remove();
      } else {
        const selectEl = document.getElementById(removed.fieldId);
        if (selectEl) {
          const optEl = Array.from(selectEl.options).find(o => o.value === removed.value);
          if (optEl) optEl.remove();
        }
      }

      driverSettings.customOptions.splice(index, 1);
      saveDriverSettings({ customOptions: driverSettings.customOptions });
      applyDriverSettings();
    }

    function clearAllCustomOptions() {
      if (!driverSettings.customOptions || driverSettings.customOptions.length === 0) return;
      if (!confirm(currentLang === 'bn' ? 'আপনি কি সকল কাস্টম অপশন মুছে ফেলতে চান?' : 'Clear all custom options you added?')) return;

      document.querySelectorAll('.custom-injected-opt, .custom-injected-svc').forEach(el => el.remove());
      driverSettings.customOptions = [];
      saveDriverSettings({ customOptions: [] });
      applyDriverSettings();
    }

    function renderCustomOptionsInSettings() {
      const container = document.getElementById('sm-custom-options-container');
      const countEl = document.getElementById('sm-custom-count');
      if (!container) return;

      const opts = driverSettings.customOptions || [];
      if (countEl) countEl.textContent = opts.length;

      if (opts.length === 0) {
        container.innerHTML = `<div style="font-size:0.75rem; color:var(--text-tertiary); text-align:center; padding:12px;">${currentLang === 'bn' ? 'কোনো কাস্টম অপশন এখনও যোগ করা হয়নি।' : 'No custom options added yet.'}</div>`;
        return;
      }

      const fieldNames = {
        'drv-city': 'District/City',
        'drv-license-type': 'License Class',
        'drv-languages': 'Language',
        'drv-car-model': 'Vehicle Model',
        'drv-car-seats': 'Seating',
        'drv-payout-method': 'Payout Method',
        'services': 'Service Category'
      };

      container.innerHTML = opts.map((opt, idx) => `
        <div class="sm-custom-item">
          <div>
            <span class="sm-custom-badge">${fieldNames[opt.fieldId] || opt.fieldId}</span>
            <span style="color:#fff; font-weight:600;">${opt.label}</span>
          </div>
          <button type="button" class="sm-custom-del-btn" onclick="removeCustomOption(${idx})" title="Delete option">
            <i class="ph ph-trash"></i>
          </button>
        </div>
      `).join('');
    }

    function saveAndApplySettingsModal() {
      const sheetUrlInput = document.getElementById('sm-sheet-url');
      if (sheetUrlInput) {
        const url = sheetUrlInput.value.trim();
        driverSettings.sheetWebhookUrl = url;
        GOOGLE_SHEET_WEBHOOK_URL = url;
        localStorage.setItem('rownaa_gsheet_url', url);
      }
      saveDriverSettings(driverSettings);
      applyDriverSettings();
      closeDriverSettingsModal();
      alert(currentLang === 'bn' ? '✅ সেটিংস সংরক্ষিত এবং কার্যকর করা হয়েছে!' : '✅ Driver form settings saved and applied!');
    }

    function resetDriverSettingsToDefault() {
      if (!confirm(currentLang === 'bn' ? 'সকল সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে আনবেন?' : 'Reset all configuration to factory defaults?')) return;
      document.querySelectorAll('.custom-injected-opt, .custom-injected-svc').forEach(el => el.remove());
      driverSettings = {
        bypassMandatory: false,
        customOptions: [],
        sheetWebhookUrl: DEFAULT_GOOGLE_SHEET_URL
      };
      GOOGLE_SHEET_WEBHOOK_URL = DEFAULT_GOOGLE_SHEET_URL;
      localStorage.removeItem(SETTINGS_KEY);
      localStorage.removeItem('rownaa_gsheet_url');
      applyDriverSettings();
      alert(currentLang === 'bn' ? '✅ সফলভাবে ফ্যাক্টরি ডিফল্টে রিসেট করা হয়েছে!' : '✅ Reset to factory defaults completed!');
    }

    async function testSheetConnection() {
      const resultDiv = document.getElementById('sm-sheet-ping-result');
      const urlInput = document.getElementById('sm-sheet-url');
      const testUrl = urlInput ? urlInput.value.trim() : GOOGLE_SHEET_WEBHOOK_URL;

      if (!testUrl) {
        if (resultDiv) {
          resultDiv.style.display = 'block';
          resultDiv.style.color = 'var(--danger)';
          resultDiv.textContent = currentLang === 'bn' ? '⚠️ অনুগ্রহ করে একটি বৈধ গুগল শিট ওয়েবহুক URL লিখুন।' : '⚠️ Please enter a Google Apps Script Webhook URL.';
        }
        return;
      }

      if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.style.color = 'var(--warning)';
        resultDiv.innerHTML = '<i class="ph-bold ph-spinner" style="animation:spin 1s linear infinite;"></i> ' + (currentLang === 'bn' ? 'সার্ভারে পিং পাঠানো হচ্ছে...' : 'Pinging Google Apps Script endpoint...');
      }

      try {
        const resp = await fetch(testUrl, { method: 'GET', mode: 'no-cors' });
        if (resultDiv) {
          resultDiv.style.color = '#10b981';
          resultDiv.innerHTML = '<i class="ph-bold ph-check-circle"></i> ' + (currentLang === 'bn' ? 'সার্ভার সক্রিয় ও সংযুক্ত! (HTTP Endpoint Ready)' : 'Endpoint Reachable & Ready! Connected to Google Apps Script.');
        }
      } catch (err) {
        if (resultDiv) {
          resultDiv.style.color = 'var(--danger)';
          resultDiv.innerHTML = '<i class="ph-bold ph-warning-circle"></i> Connection error: ' + err.message;
        }
      }
    }

    // =========================================================
    // COMPREHENSIVE BILINGUAL TRANSLATION SYSTEM (EN / BN)
    // =========================================================
    let currentLang = 'en';

    const I18N = {
      en: {
        langBtn: 'বাংলা সংস্করণ',
        settingsBtn: 'Settings',
        bypassActive: 'BYPASS',
        customActive: 'CUSTOM',
        stepLabels: ['Personal & NID', 'License & Skills', 'Services & Time', 'Role & Payout', 'Documents & Review'],
        mobileStepNames: [
          'Personal & NID Credentials',
          'Driving License & Road Expertise',
          'Preferred Services & Working Hours',
          'Role, Payout & Fleet Profile',
          'Document Uploads & Final Affirmation'
        ],
        mobilePills: ['1. Info', '2. License', '3. Services', '4. Role', '5. Review'],
        bypassTitle: 'Mandatory Validation Bypassed:',
        bypassDesc: 'All required constraints (*) are relaxed. You can skip any field during registration.',
        restoreStrict: 'Restore Strict Mode',
        step1: {
          title: '1. Personal & Contact Information',
          desc: 'Enter your legal identity exactly as shown on your NID (Smart Card) and BRTA Driving License.',
          lblName: 'Full Legal Name',
          lblPhone: 'Mobile Number (WhatsApp)',
          lblNid: 'National ID (NID / Smart Card)',
          lblCity: 'Base Residential City / Area',
          lblEmName: 'Emergency Contact Name',
          lblEmPhone: 'Emergency Contact Phone',
          btnNext: 'Continue to License & Experience'
        },
        step2: {
          title: '2. BRTA Driving License & Professional Experience',
          desc: 'All Rownaa chauffeurs must hold an active, non-expired BRTA license.',
          lblLicense: 'BRTA Driving License Number',
          lblLicenseType: 'License Classification',
          lblExp: 'Total Commercial Driving Experience',
          lblExpiry: 'License Expiration Date',
          lblLang: 'Language & VIP Communication Skills',
          lblHighway: 'Highway & Night Driving Comfort',
          btnNext: 'Continue to Services & Availability'
        },
        step3: {
          title: '3. Service Preference & Working Availability',
          desc: 'Select which services you are available for. You can also click "+ Add Custom Service" to offer new trip types.',
          lblAvail: 'Working Availability Commitment',
          avail1Title: 'Full-Time Dedicated',
          avail1Desc: 'Available 6 days/week. Priority allocation for high-paying corporate contracts.',
          avail2Title: 'Part-Time Flex',
          avail2Desc: 'Fixed shifts or evening hours. Ideal for standby city chauffeurs.',
          avail3Title: 'Weekend & On-Demand',
          avail3Desc: 'Available Friday/Saturday for highway intercity tours & airport transfers.',
          btnNext: 'Continue to Role & Payout'
        },
        step4: {
          title: '4. Chauffeur Role, Payout Wallet & Fleet Info',
          desc: 'Specify your employment mode and provide your mobile wallet for instant payments and trip allowances.',
          lblRole: 'Select Your Driving Status',
          role1Title: 'Fleet Chauffeur',
          role1Desc: 'Professional chauffeur looking to be assigned to a Rownaa Fleet Partner's vehicle.',
          role2Title: 'Owner-Driver',
          role2Desc: 'I own a personal vehicle (Sedan/SUV/HiAce) and will drive it myself for Rownaa.',
          role3Title: 'On-Demand Standby',
          role3Desc: 'Available for airport emergency dispatch, tour replacement, and VIP standbys.',
          vehicleTitle: 'Your Vehicle Profile (গাড়ির বিবরণ)',
          vehicleDesc: 'Since you are registering as an Owner-Driver, enter your car's model and registration details as per BRTA documents.',
          lblCarModel: 'Car Model & Make',
          lblCarPlate: 'Number Plate',
          lblCarSeats: 'Seating Capacity',
          lblCarYear: 'Manufacture Year',
          lblCarFitness: 'Fitness Expiry',
          payoutHeading: 'Payout & Expense Reimbursement (টাকা প্রাপ্তির তথ্য)',
          lblPayoutMethod: 'Payout Mobile Wallet Method',
          lblPayoutNum: 'Wallet / Account Number',
          btnNext: 'Continue to Documents & Review'
        },
        step5: {
          title: '5. Verification Documents & Application Review',
          desc: 'Upload clear photographs of your identity documents (Front & Back) and review your application summary.',
          upPhotoTitle: 'Chauffeur Portrait Photo',
          upPhotoSub: 'Clean front-facing headshot / সেলফি ছবি',
          upLicFrontTitle: 'BRTA License (Front)',
          upLicFrontSub: 'Front side / লাইসেন্সের সামনের অংশ',
          upLicBackTitle: 'BRTA License (Back)',
          upLicBackSub: 'Back side / লাইসেন্সের পেছনের অংশ',
          upNidFrontTitle: 'NID Smart Card (Front)',
          upNidFrontSub: 'Front side / এনআইডি সামনের অংশ',
          upNidBackTitle: 'NID Smart Card (Back)',
          upNidBackSub: 'Back side / এনআইডি পেছনের অংশ',
          sumHeader: 'Application Review Summary',
          btnSubmit: 'Submit Chauffeur Application'
        },
        btnBack: 'Back',
        optionalBadge: '(Optional)'
      },
      bn: {
        langBtn: 'English Version',
        settingsBtn: 'সেটিংস',
        bypassActive: 'বাইপাস',
        customActive: 'কাস্টম',
        stepLabels: ['ব্যক্তিগত ও এনআইডি', 'লাইসেন্স ও অভিজ্ঞতা', 'সার্ভিস ও সময়', 'ভূমিকা ও পেমেন্ট', 'কাগজপত্র ও রিভিউ'],
        mobileStepNames: [
          'ব্যক্তিগত তথ্য ও জাতীয় পরিচয়পত্র',
          'বিআরটিএ লাইসেন্স ও ড্রাইভিং দক্ষতা',
          'পছন্দের সার্ভিস ও কাজের সময়সূচি',
          'কাজের ভূমিকা ও পেমেন্ট তথ্য',
          'কাগজপত্র আপলোড ও চূড়ান্ত আবেদন'
        ],
        mobilePills: ['১. তথ্য', '২. লাইসেন্স', '৩. সার্ভিস', '৪. ভূমিকা', '৫. রিভিউ'],
        bypassTitle: 'বাধ্যতামূলক ফিল্ড রিমুভ সক্রিয়:',
        bypassDesc: 'সকল রিকোয়ার্ড ফিল্ড (*) শিথিল করা হয়েছে। যেকোনো তথ্য ছাড়া স্কিপ করে নিবন্ধন সম্পন্ন করা যাবে।',
        restoreStrict: 'কঠোর মোড পুনঃস্থাপন করুন',
        step1: {
          title: '১. ব্যক্তিগত তথ্য ও যোগাযোগের বিবরণ',
          desc: 'আপনার জাতীয় পরিচয়পত্র (এনআইডি) এবং ড্রাইভিং লাইসেন্স অনুযায়ী সঠিক তথ্য প্রদান করুন।',
          lblName: 'পূর্ণ নাম (জাতীয় পরিচয়পত্র অনুযায়ী)',
          lblPhone: 'মোবাইল নম্বর (হোয়াটসঅ্যাপ সক্রিয়)',
          lblNid: 'জাতীয় পরিচয়পত্র (এনআইডি নম্বর)',
          lblCity: 'প্রধান কাজের এলাকা / জেলা',
          lblEmName: 'জরুরি যোগাযোগের ব্যক্তির নাম ও সম্পর্ক',
          lblEmPhone: 'জরুরি যোগাযোগের মোবাইল নম্বর',
          btnNext: 'পরবর্তী ধাপ: লাইসেন্স ও অভিজ্ঞতা →'
        },
        step2: {
          title: '২. বিআরটিএ ড্রাইভিং লাইসেন্স ও অভিজ্ঞতা',
          desc: 'রওনার সকল শফারকে বিআরটিএ অনুমোদিত বৈধ লাইসেন্সধারী হতে হবে।',
          lblLicense: 'বিআরটিএ ড্রাইভিং লাইসেন্স নম্বর',
          lblLicenseType: 'লাইসেন্সের শ্রেণি / ক্যাটাগরি',
          lblExp: 'মোট পেশাদার ড্রাইভিং অভিজ্ঞতা',
          lblExpiry: 'লাইসেন্সের মেয়াদ উত্তীর্ণের তারিখ',
          lblLang: 'ভাষা ও যোগাযোগ দক্ষতা',
          lblHighway: 'হাইওয়ে ও রাতের ড্রাইভিং অভিজ্ঞতা',
          btnNext: 'পরবর্তী ধাপ: সার্ভিস ও সময়সূচি →'
        },
        step3: {
          title: '৩. পছন্দের সার্ভিস ও কাজের সময়সূচি',
          desc: 'আপনি রওনার কোন কোন ট্রিপে কাজ করতে চান তা নির্বাচন করুন অথবা নতুন কোনো সার্ভিস যোগ করুন।',
          lblAvail: 'কাজের সময়সূচি ও প্রাপ্যতা',
          avail1Title: 'ফুল-টাইম ডেডিকেটেড',
          avail1Desc: 'সপ্তাহে ৬ দিন উপলব্ধ। কর্পোরেট এক্সিকিউটিভ ও উচ্চ আয়ের চুক্তিতে অগ্রাধিকার।',
          avail2Title: 'পার্ট-টাইম ফ্লেক্স',
          avail2Desc: 'নির্দিষ্ট শিফট বা সন্ধ্যার সময়। লোকাল সিটি স্ট্যান্ডবাই শফারের জন্য উপযুক্ত।',
          avail3Title: 'উইকেন্ড ও অন-ডিমান্ড',
          avail3Desc: 'শুক্র/শনিবার হাইওয়ে ট্যুর ও এয়ারপোর্ট ইমার্জেন্সি ডিসপ্যাচে কাজ।',
          btnNext: 'পরবর্তী ধাপ: ভূমিকা ও পেমেন্ট →'
        },
        step4: {
          title: '৪. কাজের ভূমিকা, পেমেন্ট ওয়ালেট ও গাড়ির তথ্য',
          desc: 'নিজের গাড়ি চালাবেন নাকি কোম্পানির গাড়ি চালাবেন তা নির্ধারণ করুন এবং পেমেন্ট নম্বর দিন।',
          lblRole: 'আপনার কাজের ধরন নির্বাচন করুন',
          role1Title: 'ফ্লিট শফার (কোম্পানির গাড়ি)',
          role1Desc: 'রওনার নিবন্ধিত ফ্লিট পার্টনারের গাড়ি ড্রাইভ করতে ইচ্ছুক পেশাদার ড্রাইভার।',
          role2Title: 'ওনার-ড্রাইভার (নিজের গাড়ি)',
          role2Desc: 'আমার নিজস্ব ব্যক্তিগত গাড়ি রয়েছে (সেডান/এসইউভি) এবং আমি নিজেই ড্রাইভ করব।',
          role3Title: 'অন-ডিমান্ড স্ট্যান্ডবাই',
          role3Desc: 'জরুরি এয়ারপোর্ট ট্রান্সফার ও ট্যুর রিপ্লেসমেন্ট ড্রাইভার হিসেবে কাজ।',
          vehicleTitle: 'আপনার গাড়ির বিবরণ (Vehicle Profile)',
          vehicleDesc: 'যেহেতু আপনি ওনার-ড্রাইভার হিসেবে নিবন্ধন করছেন, গাড়ির বিআরটিএ রেজিস্ট্রেশন তথ্য দিন।',
          lblCarModel: 'গাড়ির ব্র্যান্ড ও মডেল',
          lblCarPlate: 'মেট্রো নম্বর প্লেট',
          lblCarSeats: 'আসন সংখ্যা (Seating Capacity)',
          lblCarYear: 'উৎপাদনের বছর (Year)',
          lblCarFitness: 'ফিটনেস মেয়াদ',
          payoutHeading: 'টাকা উত্তোলন ও ভাতা প্রাপ্তির তথ্য (Payout)',
          lblPayoutMethod: 'পেমেন্ট ওয়ালেট মাধ্যম',
          lblPayoutNum: 'বিকাশ / নগদ / ব্যাংক অ্যাকাউন্ট নম্বর',
          btnNext: 'পরবর্তী ধাপ: কাগজপত্র ও রিভিউ →'
        },
        step5: {
          title: '৫. কাগজপত্র আপলোড ও চূড়ান্ত আবেদন',
          desc: 'আপনার ছবি ও প্রয়োজনীয় নথিপত্র (সামনে ও পেছনে) পরিষ্কারভাবে আপলোড করুন এবং তথ্য পর্যালোচনা করুন।',
          upPhotoTitle: 'শফারের ছবি',
          upPhotoSub: 'পরিষ্কার সেলফি বা পাসপোর্ট ছবি',
          upLicFrontTitle: 'ড্রাইভিং লাইসেন্স (সামনের অংশ)',
          upLicFrontSub: 'লাইসেন্সের সামনের স্পষ্ট ছবি',
          upLicBackTitle: 'ড্রাইভিং লাইসেন্স (পেছনের অংশ)',
          upLicBackSub: 'লাইসেন্সের পেছনের স্পষ্ট ছবি',
          upNidFrontTitle: 'স্মার্ট এনআইডি (সামনের অংশ)',
          upNidFrontSub: 'এনআইডির সামনের স্পষ্ট ছবি',
          upNidBackTitle: 'স্মার্ট এনআইডি (পেছনের অংশ)',
          upNidBackSub: 'এনআইডির পেছনের স্পষ্ট ছবি',
          sumHeader: 'আবেদনের সারসংক্ষেপ পর্যালোচনা',
          btnSubmit: 'শফার আবেদনপত্র জমা দিন 🚀'
        },
        btnBack: 'পূর্ববর্তী ধাপ',
        optionalBadge: '(ঐচ্ছিক)'
      }
    };

    function setLanguage(lang) {
      currentLang = lang;
      localStorage.setItem('rownaa_lang', lang);
      const t = I18N[lang] || I18N.en;

      // Update lang button text
      const langBtnText = document.getElementById('lang-btn-text');
      if (langBtnText) langBtnText.textContent = t.langBtn;

      // Toggle span.lang-en and span.lang-bn
      document.querySelectorAll('.lang-en').forEach(el => el.style.display = (lang === 'bn' ? 'none' : 'inline'));
      document.querySelectorAll('.lang-bn').forEach(el => el.style.display = (lang === 'bn' ? 'inline' : 'none'));

      // Update Stepper Labels
      for (let i = 1; i <= 5; i++) {
        const stepLbl = document.getElementById(`step-lbl-${i}`);
        if (stepLbl) stepLbl.textContent = t.stepLabels[i - 1];
        const mPill = document.getElementById(`m-pill-${i}`);
        if (mPill) mPill.textContent = t.mobilePills[i - 1];
      }

      // Update current step name in mobile stepper
      updateMobileStepHeader(currentStep);

      // Bypass banner
      const bpTitle = document.getElementById('bypass-banner-title');
      const bpDesc = document.getElementById('bypass-banner-desc');
      const bpBtn = document.getElementById('btn-restore-strict');
      if (bpTitle) bpTitle.textContent = t.bypassTitle;
      if (bpDesc) bpDesc.textContent = t.bypassDesc;
      if (bpBtn) bpBtn.querySelector('span').textContent = t.restoreStrict;

      // Step 1
      const s1 = t.step1;
      const t1 = document.getElementById('title-step-1'); if (t1) t1.textContent = s1.title;
      const d1 = document.getElementById('desc-step-1'); if (d1) d1.textContent = s1.desc;
      const ln = document.getElementById('lbl-name'); if (ln) ln.innerHTML = `${s1.lblName} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const lp = document.getElementById('lbl-phone'); if (lp) lp.innerHTML = `${s1.lblPhone} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const lnd = document.getElementById('lbl-nid'); if (lnd) lnd.innerHTML = `${s1.lblNid} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const lc = document.getElementById('lbl-city'); if (lc) lc.innerHTML = `${s1.lblCity} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const len = document.getElementById('lbl-em-name'); if (len) len.innerHTML = `${s1.lblEmName} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const lep = document.getElementById('lbl-em-phone'); if (lep) lep.innerHTML = `${s1.lblEmPhone} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const bn1 = document.getElementById('btn-next-1'); if (bn1) bn1.querySelector('span').textContent = s1.btnNext;

      // Step 2
      const s2 = t.step2;
      const t2 = document.getElementById('title-step-2'); if (t2) t2.textContent = s2.title;
      const d2 = document.getElementById('desc-step-2'); if (d2) d2.textContent = s2.desc;
      const llic = document.getElementById('lbl-license'); if (llic) llic.innerHTML = `${s2.lblLicense} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const llt = document.getElementById('lbl-license-type'); if (llt) llt.innerHTML = `${s2.lblLicenseType} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const lexp = document.getElementById('lbl-exp'); if (lexp) lexp.innerHTML = `${s2.lblExp} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const lexpiry = document.getElementById('lbl-expiry'); if (lexpiry) lexpiry.innerHTML = `${s2.lblExpiry} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const llang = document.getElementById('lbl-lang'); if (llang) llang.textContent = s2.lblLang;
      const lhigh = document.getElementById('lbl-highway'); if (lhigh) lhigh.textContent = s2.lblHighway;
      const bn2 = document.getElementById('btn-next-2'); if (bn2) bn2.querySelector('span').textContent = s2.btnNext;

      // Step 3
      const s3 = t.step3;
      const t3 = document.getElementById('title-step-3'); if (t3) t3.textContent = s3.title;
      const d3 = document.getElementById('desc-step-3'); if (d3) d3.textContent = s3.desc;
      const lav = document.getElementById('lbl-avail'); if (lav) lav.innerHTML = `${s3.lblAvail} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const av1t = document.getElementById('avail-opt-1-title'); if (av1t) av1t.textContent = s3.avail1Title;
      const av1d = document.getElementById('avail-opt-1-desc'); if (av1d) av1d.textContent = s3.avail1Desc;
      const av2t = document.getElementById('avail-opt-2-title'); if (av2t) av2t.textContent = s3.avail2Title;
      const av2d = document.getElementById('avail-opt-2-desc'); if (av2d) av2d.textContent = s3.avail2Desc;
      const av3t = document.getElementById('avail-opt-3-title'); if (av3t) av3t.textContent = s3.avail3Title;
      const av3d = document.getElementById('avail-opt-3-desc'); if (av3d) av3d.textContent = s3.avail3Desc;
      const bn3 = document.getElementById('btn-next-3'); if (bn3) bn3.querySelector('span').textContent = s3.btnNext;

      // Step 4
      const s4 = t.step4;
      const t4 = document.getElementById('title-step-4'); if (t4) t4.textContent = s4.title;
      const d4 = document.getElementById('desc-step-4'); if (d4) d4.textContent = s4.desc;
      const lrole = document.getElementById('lbl-role'); if (lrole) lrole.innerHTML = `${s4.lblRole} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const r1t = document.getElementById('role-opt-1-title'); if (r1t) r1t.textContent = s4.role1Title;
      const r1d = document.getElementById('role-opt-1-desc'); if (r1d) r1d.textContent = s4.role1Desc;
      const r2t = document.getElementById('role-opt-2-title'); if (r2t) r2t.textContent = s4.role2Title;
      const r2d = document.getElementById('role-opt-2-desc'); if (r2d) r2d.textContent = s4.role2Desc;
      const r3t = document.getElementById('role-opt-3-title'); if (r3t) r3t.textContent = s4.role3Title;
      const r3d = document.getElementById('role-opt-3-desc'); if (r3d) r3d.textContent = s4.role3Desc;
      const lvt = document.getElementById('lbl-vehicle-title'); if (lvt) lvt.textContent = s4.vehicleTitle;
      const lvd = document.getElementById('lbl-vehicle-desc'); if (lvd) lvd.textContent = s4.vehicleDesc;
      const lcm = document.getElementById('lbl-car-model'); if (lcm) lcm.textContent = s4.lblCarModel;
      const lcp = document.getElementById('lbl-car-plate'); if (lcp) lcp.textContent = s4.lblCarPlate;
      const lcs = document.getElementById('lbl-car-seats'); if (lcs) lcs.textContent = s4.lblCarSeats;
      const lcy = document.getElementById('lbl-car-year'); if (lcy) lcy.textContent = s4.lblCarYear;
      const lcf = document.getElementById('lbl-car-fitness'); if (lcf) lcf.textContent = s4.lblCarFitness;
      const lph = document.getElementById('lbl-payout-heading'); if (lph) lph.textContent = s4.payoutHeading;
      const lpm = document.getElementById('lbl-payout-method'); if (lpm) lpm.innerHTML = `${s4.lblPayoutMethod} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const lpn = document.getElementById('lbl-payout-num'); if (lpn) lpn.innerHTML = `${s4.lblPayoutNum} <span class="req">${driverSettings.bypassMandatory ? t.optionalBadge : '*'}</span>`;
      const bn4 = document.getElementById('btn-next-4'); if (bn4) bn4.querySelector('span').textContent = s4.btnNext;

      // Step 5 (5 Upload Cards)
      const s5 = t.step5;
      const t5 = document.getElementById('title-step-5'); if (t5) t5.textContent = s5.title;
      const d5 = document.getElementById('desc-step-5'); if (d5) d5.textContent = s5.desc;
      const uptp = document.getElementById('up-title-photo'); if (uptp) uptp.textContent = s5.upPhotoTitle;
      const upsp = document.getElementById('up-sub-photo'); if (upsp) upsp.textContent = s5.upPhotoSub;
      const uptlf = document.getElementById('up-title-lic-front'); if (uptlf) uptlf.textContent = s5.upLicFrontTitle;
      const upslf = document.getElementById('up-sub-lic-front'); if (upslf) upslf.textContent = s5.upLicFrontSub;
      const uptlb = document.getElementById('up-title-lic-back'); if (uptlb) uptlb.textContent = s5.upLicBackTitle;
      const upslb = document.getElementById('up-sub-lic-back'); if (upslb) upslb.textContent = s5.upLicBackSub;
      const uptnf = document.getElementById('up-title-nid-front'); if (uptnf) uptnf.textContent = s5.upNidFrontTitle;
      const upsnf = document.getElementById('up-sub-nid-front'); if (upsnf) upsnf.textContent = s5.upNidFrontSub;
      const uptnb = document.getElementById('up-title-nid-back'); if (uptnb) uptnb.textContent = s5.upNidBackTitle;
      const upsnb = document.getElementById('up-sub-nid-back'); if (upsnb) upsnb.textContent = s5.upNidBackSub;
      const sumH = document.getElementById('sum-header-title'); if (sumH) sumH.textContent = s5.sumHeader;
      const bsub = document.getElementById('btn-submit-text'); if (bsub) bsub.textContent = s5.btnSubmit;

      // All Back buttons
      document.querySelectorAll('.btn-prev-text').forEach(el => el.textContent = t.btnBack);

      // Summary table labels
      const sumNameLbl = document.getElementById('sum-lbl-name'); if (sumNameLbl) sumNameLbl.textContent = (lang === 'bn' ? 'আবেদনকারীর নাম:' : 'Applicant Name:');
      const sumPhoneLbl = document.getElementById('sum-lbl-phone'); if (sumPhoneLbl) sumPhoneLbl.textContent = (lang === 'bn' ? 'মোবাইল (হোয়াটসঅ্যাপ):' : 'Mobile (WhatsApp):');
      const sumNidLbl = document.getElementById('sum-lbl-nid'); if (sumNidLbl) sumNidLbl.textContent = (lang === 'bn' ? 'এনআইডি নম্বর:' : 'NID Number:');
      const sumLicLbl = document.getElementById('sum-lbl-lic'); if (sumLicLbl) sumLicLbl.textContent = (lang === 'bn' ? 'বিআরটিএ লাইসেন্স:' : 'BRTA License & Expiry:');
      const sumRoleLbl = document.getElementById('sum-lbl-role'); if (sumRoleLbl) sumRoleLbl.textContent = (lang === 'bn' ? 'কাজের ভূমিকা ও এলাকা:' : 'Role & Base Area:');
      const sumSvcLbl = document.getElementById('sum-lbl-svcs'); if (sumSvcLbl) sumSvcLbl.textContent = (lang === 'bn' ? 'নির্বাচিত সার্ভিস:' : 'Services Selected:');
      const sumPayLbl = document.getElementById('sum-lbl-payout'); if (sumPayLbl) sumPayLbl.textContent = (lang === 'bn' ? 'পেমেন্ট ওয়ালেট:' : 'Payout Wallet:');
      const sumDocLbl = document.getElementById('sum-lbl-docs'); if (sumDocLbl) sumDocLbl.textContent = (lang === 'bn' ? 'সংযুক্ত নথিপত্র:' : 'Uploaded Documents:');
    }

    function toggleLanguage() {
      const nextLang = currentLang === 'en' ? 'bn' : 'en';
      setLanguage(nextLang);
    }

    // =========================================================
    // STEP NAVIGATION & FORM PROGRESSION
    // =========================================================
    let currentStep = 1;
    const totalSteps = 5;

    function goToStep(step) {
      if (step < 1 || step > totalSteps) return;

      document.querySelectorAll('.step-pane').forEach(p => p.classList.remove('active'));
      const activePane = document.getElementById(`pane-step-${step}`);
      if (activePane) activePane.classList.add('active');

      for (let i = 1; i <= totalSteps; i++) {
        const node = document.getElementById(`step-node-${i}`);
        if (!node) continue;
        node.classList.remove('active', 'completed');
        if (i === step) {
          node.classList.add('active');
        } else if (i < step) {
          node.classList.add('completed');
        }
      }

      updateMobileStepHeader(step);

      currentStep = step;
      if (step === 5) {
        populateSummary();
      }

      window.scrollTo({ top: 120, behavior: 'smooth' });
    }

    function updateMobileStepHeader(step) {
      const t = I18N[currentLang] || I18N.en;
      const stepText = document.getElementById('mobile-step-text');
      const stepPill = document.getElementById('ms-badge-pill');
      const percentEl = document.getElementById('mobile-step-percent');
      const bar = document.getElementById('mobile-progress-bar');

      const pct = Math.round((step / totalSteps) * 100);
      if (bar) bar.style.width = `${pct}%`;
      if (percentEl) percentEl.textContent = currentLang === 'bn' ? `${pct}% সম্পন্ন` : `${pct}% Done`;
      if (stepPill) stepPill.textContent = currentLang === 'bn' ? `ধাপ ${step}/৫` : `STEP ${step}/5`;
      if (stepText) stepText.textContent = t.mobileStepNames[step - 1] || `Step ${step}`;

      for (let i = 1; i <= totalSteps; i++) {
        const pill = document.getElementById(`m-pill-${i}`);
        if (!pill) continue;
        pill.classList.remove('active', 'completed');
        if (i === step) pill.classList.add('active');
        else if (i < step) pill.classList.add('completed');
      }
    }

    function validateAndNext(step) {
      const isBypass = !!(driverSettings && driverSettings.bypassMandatory);

      if (!isBypass) {
        const currentPane = document.getElementById(`pane-step-${step}`);
        if (currentPane) {
          const requiredInputs = currentPane.querySelectorAll('input[required], select[required], textarea[required]');
          for (let input of requiredInputs) {
            if (!input.checkValidity() || !input.value.trim()) {
              input.reportValidity();
              input.focus();
              return;
            }
          }
        }
      }

      goToStep(step + 1);
    }

    // Interactive Tile Selectors
    function selectTile(tileEl, hiddenInputId, val) {
      const parent = tileEl.parentElement;
      parent.querySelectorAll('.tile-opt').forEach(el => el.classList.remove('active'));
      tileEl.classList.add('active');
      const radio = tileEl.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      const hidden = document.getElementById(hiddenInputId);
      if (hidden) hidden.value = val;
    }

    function selectRoleTile(tileEl, val) {
      selectTile(tileEl, 'drv-role-val', val);
      const vehicleSec = document.getElementById('owner-vehicle-section');
      if (vehicleSec) {
        vehicleSec.style.display = (val === 'car_owner_driver') ? 'block' : 'none';
      }
    }

    function toggleServiceCheckbox(tileEl) {
      const cb = tileEl.querySelector('input[type="checkbox"]');
      if (!cb) return;
      cb.checked = !cb.checked;
      if (cb.checked) {
        tileEl.classList.add('selected');
      } else {
        tileEl.classList.remove('selected');
      }
    }

    // Dynamic Select Field Handlers
    function handleDynamicCitySelect(val) {
      const wrap = document.getElementById('wrap-custom-city');
      if (wrap) wrap.style.display = (val === '__custom__') ? 'block' : 'none';
    }
    function handleDynamicLicenseSelect(val) {
      const wrap = document.getElementById('wrap-custom-license');
      if (wrap) wrap.style.display = (val === '__custom__') ? 'block' : 'none';
    }
    function handleDynamicLangSelect(val) {
      const wrap = document.getElementById('wrap-custom-lang');
      if (wrap) wrap.style.display = (val === '__custom__') ? 'block' : 'none';
    }
    function handleDynamicCarModelSelect(val) {
      const wrap = document.getElementById('wrap-custom-car-model');
      if (wrap) wrap.style.display = (val === '__custom__') ? 'block' : 'none';
    }
    function handleDynamicSeatsSelect(val) {
      const wrap = document.getElementById('wrap-custom-seats');
      if (wrap) wrap.style.display = (val === '__custom__') ? 'block' : 'none';
    }
    function handleDynamicPayoutSelect(val) {
      const wrap = document.getElementById('wrap-custom-payout');
      if (wrap) wrap.style.display = (val === '__custom__') ? 'block' : 'none';
    }

    function toggleCustomServiceCreator() {
      const box = document.getElementById('custom-svc-creator-box');
      if (box) box.style.display = (box.style.display === 'block') ? 'none' : 'block';
    }

    function addCustomServiceCard() {
      const nameInput = document.getElementById('new-svc-name');
      const badgeInput = document.getElementById('new-svc-badge');
      const svcName = nameInput ? nameInput.value.trim() : '';
      const svcBadge = badgeInput ? badgeInput.value.trim() : 'Custom Rate';

      if (!svcName) {
        alert(currentLang === 'bn' ? 'অনুগ্রহ করে সার্ভিসের নাম লিখুন।' : 'Please enter a name for the custom service.');
        return;
      }

      const grid = document.getElementById('services-grid-container');
      const addTile = document.getElementById('btn-add-custom-service-tile');
      const newCard = document.createElement('label');
      newCard.className = 'service-card-tile selected custom-injected-svc';
      newCard.setAttribute('onclick', 'toggleServiceCheckbox(this)');
      newCard.innerHTML = `
        <input type="checkbox" name="services" value="${svcName}" checked/>
        <div class="svc-tile-head">
          <div class="svc-tile-icon" style="background:rgba(212,255,0,0.14); color:var(--accent);"><i class="ph-fill ph-sparkle"></i></div>
          <div class="svc-tile-title">${svcName}</div>
        </div>
        <div class="svc-tile-desc">Custom specialized chauffeur service</div>
        <div class="svc-rate-badge" style="background:rgba(212,255,0,0.15); color:var(--accent);">${svcBadge}</div>
      `;
      grid.insertBefore(newCard, addTile);

      if (!driverSettings.customOptions) driverSettings.customOptions = [];
      driverSettings.customOptions.push({ fieldId: 'services', value: svcName, label: svcName });
      saveDriverSettings({ customOptions: driverSettings.customOptions });

      if (nameInput) nameInput.value = '';
      if (badgeInput) badgeInput.value = '';
      toggleCustomServiceCreator();
      alert(currentLang === 'bn' ? `✅ "${svcName}" সার্ভিস যুক্ত করা হয়েছে!` : `✅ Custom Service "${svcName}" added and selected!`);
    }

    function handleFileSelected(input, labelId, cardId) {
      const card = document.getElementById(cardId);
      const label = document.getElementById(labelId);
      if (input.files && input.files[0]) {
        const file = input.files[0];
        card.classList.add('has-file');
        label.textContent = `✓ ${file.name} (${Math.round(file.size / 1024)} KB)`;
        label.style.display = 'block';
      } else {
        card.classList.remove('has-file');
        label.style.display = 'none';
      }
      populateSummary();
    }

    function resolveFieldValue(selectId, customInputId) {
      const sel = document.getElementById(selectId);
      if (!sel) return '';
      if (sel.value === '__custom__') {
        const customEl = document.getElementById(customInputId);
        return customEl ? customEl.value.trim() : '';
      }
      return sel.value;
    }

    function populateSummary() {
      const name = document.getElementById('drv-name').value || '—';
      const phone = document.getElementById('drv-phone').value || '—';
      const nid = document.getElementById('drv-nid').value || '—';
      const licVal = document.getElementById('drv-license').value || '—';
      const licExp = document.getElementById('drv-expiry').value || '—';
      const role = document.getElementById('drv-role-val').value;
      const roleMap = {
        'seeking_fleet_car': currentLang === 'bn' ? 'ফ্লিট শফার' : 'Fleet Chauffeur',
        'car_owner_driver': currentLang === 'bn' ? 'ওনার-ড্রাইভার' : 'Owner-Driver',
        'part_time_freelance': currentLang === 'bn' ? 'অন-ডিমান্ড স্ট্যান্ডবাই' : 'On-Demand Standby'
      };
      const city = resolveFieldValue('drv-city', 'drv-city-custom');
      const payoutMethod = resolveFieldValue('drv-payout-method', 'drv-payout-custom');
      const payoutNum = document.getElementById('drv-payout-number').value || '—';

      const svcs = [];
      document.querySelectorAll('input[name="services"]:checked').forEach(cb => svcs.push(cb.value));

      // Docs summary
      const docsArr = [];
      if (document.getElementById('file-photo')?.files?.[0]) docsArr.push(currentLang === 'bn' ? 'ছবি ✓' : 'Photo ✓');
      if (document.getElementById('file-license-front')?.files?.[0]) docsArr.push(currentLang === 'bn' ? 'লাইসেন্স (সামনে) ✓' : 'Lic Front ✓');
      if (document.getElementById('file-license-back')?.files?.[0]) docsArr.push(currentLang === 'bn' ? 'লাইসেন্স (পেছনে) ✓' : 'Lic Back ✓');
      if (document.getElementById('file-nid-front')?.files?.[0]) docsArr.push(currentLang === 'bn' ? 'এনআইডি (সামনে) ✓' : 'NID Front ✓');
      if (document.getElementById('file-nid-back')?.files?.[0]) docsArr.push(currentLang === 'bn' ? 'এনআইডি (পেছনে) ✓' : 'NID Back ✓');

      document.getElementById('sum-name').textContent = name;
      document.getElementById('sum-phone').textContent = phone;
      document.getElementById('sum-nid').textContent = nid;
      document.getElementById('sum-license').textContent = `${licVal} (Exp: ${licExp})`;
      document.getElementById('sum-role-area').textContent = `${roleMap[role] || role} · ${city}`;
      document.getElementById('sum-services').textContent = svcs.length > 0 ? svcs.join(', ') : 'None';
      document.getElementById('sum-payout').textContent = `${payoutMethod} (${payoutNum})`;
      const docSummaryEl = document.getElementById('sum-docs');
      if (docSummaryEl) {
        docSummaryEl.textContent = docsArr.length > 0 ? docsArr.join(', ') : (currentLang === 'bn' ? 'কোনোটি নয়' : 'None uploaded');
      }
    }

    function readFileAsBase64(file) {
      return new Promise((resolve) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

    // =========================================================
    // SUBMISSION HANDLER & GOOGLE SHEET SYNC (5 DOCUMENTS)
    // =========================================================
    async function handleDriverApplication(e) {
      e.preventDefault();
      const isBypass = !!(driverSettings && driverSettings.bypassMandatory);
      const btn = document.getElementById('btn-submit-drv');

      const agreementCb = document.getElementById('drv-agreement');
      if (!isBypass && agreementCb && !agreementCb.checked) {
        alert(currentLang === 'bn' ? 'অনুগ্রহ করে নীতিমালার সাথে সম্মতি প্রদান করুন।' : 'Please review and affirm the VIP Chauffeur Code of Conduct agreement.');
        if (agreementCb) agreementCb.focus();
        return;
      }

      btn.innerHTML = '<i class="ph-bold ph-spinner" style="animation:spin 1s linear infinite;"></i> ' + (currentLang === 'bn' ? 'জমা হচ্ছে...' : 'Processing...');
      btn.disabled = true;

      // Extract all 5 document files
      const photoFile = document.getElementById('file-photo')?.files?.[0];
      const licFrontFile = document.getElementById('file-license-front')?.files?.[0];
      const licBackFile = document.getElementById('file-license-back')?.files?.[0];
      const nidFrontFile = document.getElementById('file-nid-front')?.files?.[0];
      const nidBackFile = document.getElementById('file-nid-back')?.files?.[0];

      const [photoBase64, licFrontBase64, licBackBase64, nidFrontBase64, nidBackBase64] = await Promise.all([
        readFileAsBase64(photoFile),
        readFileAsBase64(licFrontFile),
        readFileAsBase64(licBackFile),
        readFileAsBase64(nidFrontFile),
        readFileAsBase64(nidBackFile)
      ]);

      const selectedServices = [];
      document.querySelectorAll('input[name="services"]:checked').forEach(cb => {
        selectedServices.push(cb.value);
      });

      const cityFinal = resolveFieldValue('drv-city', 'drv-city-custom');
      const licTypeFinal = resolveFieldValue('drv-license-type', 'drv-license-custom');
      const langFinal = resolveFieldValue('drv-languages', 'drv-lang-custom');
      const carModelFinal = resolveFieldValue('drv-car-model', 'drv-car-model-custom');
      const carSeatsFinal = resolveFieldValue('drv-car-seats', 'drv-car-seats-custom');
      const payoutMethodFinal = resolveFieldValue('drv-payout-method', 'drv-payout-custom');

      const rawName = document.getElementById('drv-name').value.trim();
      const rawPhone = document.getElementById('drv-phone').value.trim();
      const rawNid = document.getElementById('drv-nid').value.trim();

      const appId = 'DRV-DAC-' + Math.floor(1000 + Math.random() * 9000);
      const submissionTimestamp = new Date().toISOString();

      const applicationPayload = {
        applicationId: appId,
        id: appId,
        submittedAt: submissionTimestamp,
        fullName: rawName || 'Applicant Chauffeur',
        name: rawName || 'Applicant Chauffeur',
        phone: rawPhone || '01700000000',
        nidNumber: rawNid || 'N/A',
        nid: rawNid || 'N/A',
        baseCity: cityFinal || 'Dhaka',
        city: cityFinal || 'Dhaka',
        emergencyContact: {
          name: document.getElementById('drv-emergency-name').value.trim() || 'Family',
          phone: document.getElementById('drv-emergency-phone').value.trim() || 'N/A'
        },
        licenseNumber: document.getElementById('drv-license').value.trim() || 'N/A',
        licenseType: licTypeFinal || 'Professional Light',
        licenseExpiry: document.getElementById('drv-expiry').value || '2030-01-01',
        experience: document.getElementById('drv-exp').value || '5-10 Years',
        languages: langFinal || 'Bangla Native + Conversational English',
        highwayExp: document.getElementById('drv-highway-exp').value || 'Highways & Night Expert',
        services: selectedServices.length > 0 ? selectedServices : ['Airport Transfer', 'Corporate Transport'],
        availability: document.getElementById('drv-avail-val').value || 'full_time',
        role: document.getElementById('drv-role-val').value || 'seeking_fleet_car',
        driverRole: document.getElementById('drv-role-val').value || 'seeking_fleet_car',
        ownerCar: (document.getElementById('drv-role-val').value === 'car_owner_driver') ? {
          model: carModelFinal || 'Toyota Premio',
          plateNumber: document.getElementById('drv-car-plate').value.trim() || 'Dhaka Metro GA',
          seats: carSeatsFinal || '4 Seats',
          year: document.getElementById('drv-car-year').value || '2019',
          fitnessExpiry: document.getElementById('drv-car-fitness').value || '2027-01-01'
        } : null,
        payoutMethod: payoutMethodFinal || 'bKash Personal',
        payoutNumber: document.getElementById('drv-payout-number').value.trim() || rawPhone,
        payoutWallet: `${payoutMethodFinal || 'bKash'} - ${document.getElementById('drv-payout-number').value.trim() || rawPhone}`,
        status: 'Pending Verification',
        photoBase64: photoBase64,
        licenseFrontBase64: licFrontBase64,
        licenseBackBase64: licBackBase64,
        licenseDocBase64: licFrontBase64, // Legacy fallback
        nidFrontBase64: nidFrontBase64,
        nidBackBase64: nidBackBase64,
        nidDocBase64: nidFrontBase64 // Legacy fallback
      };

      // 1. Save Locally to Browser Storage
      try {
        const localList = JSON.parse(localStorage.getItem('rownaa_driver_applications') || '[]');
        localList.unshift(applicationPayload);
        localStorage.setItem('rownaa_driver_applications', JSON.stringify(localList));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }

      // 2. Dispatch to Google Apps Script Webhook
      const targetWebhook = GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_GOOGLE_SHEET_URL;

      if (targetWebhook) {
        try {
          await fetch(targetWebhook, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationPayload)
          });
        } catch (fetchErr) {
          console.warn('Google Sheet Webhook sync error (offline fallback preserved):', fetchErr);
        }
      }

      // Show Success Screen
      document.getElementById('driver-app-shell').style.display = 'none';
      const successScreen = document.getElementById('driver-success-screen');
      successScreen.style.display = 'block';
      document.getElementById('success-ref-badge').textContent = `REF: #${appId}`;

      window.scrollTo({ top: 100, behavior: 'smooth' });
    }

    function resetDriverForm() {
      document.getElementById('driver-register-form').reset();
      document.querySelectorAll('.upload-card').forEach(c => c.classList.remove('has-file'));
      document.querySelectorAll('.upload-filename').forEach(f => f.style.display = 'none');
      document.getElementById('driver-app-shell').style.display = 'block';
      document.getElementById('driver-success-screen').style.display = 'none';
      goToStep(1);
    }

    // Export Applications to CSV
    function exportLocalApplicationsToCsv() {
      try {
        const raw = localStorage.getItem('rownaa_driver_applications');
        const drivers = raw ? JSON.parse(raw) : [];
        if (!drivers || drivers.length === 0) {
          alert(currentLang === 'bn' ? 'কোনো আবেদন এখনও জমা পড়েনি।' : 'No driver applications recorded yet in this browser.');
          return;
        }
        const headers = ['Application ID', 'Submission Date', 'Full Name', 'Phone', 'NID Number', 'Base District', 'Emergency Contact', 'License Number', 'License Class', 'License Expiry', 'Experience', 'Languages', 'Services', 'Role', 'Car Details', 'Payout Wallet', 'Status'];
        const escapeCsv = (val) => {
          if (val === null || val === undefined) return '""';
          return `"${String(val).replace(/"/g, '""')}"`;
        };
        const rows = drivers.map(d => [
          escapeCsv(d.id),
          escapeCsv(d.submittedAt),
          escapeCsv(d.name),
          escapeCsv(d.phone),
          escapeCsv(d.nidNumber),
          escapeCsv(d.baseCity),
          escapeCsv(typeof d.emergencyContact === 'object' && d.emergencyContact ? `${d.emergencyContact?.name} (${d.emergencyContact?.phone})` : (d.emergencyContact || '—')),
          escapeCsv(d.licenseNumber),
          escapeCsv(d.licenseType),
          escapeCsv(d.licenseExpiry),
          escapeCsv(d.experience),
          escapeCsv(d.languages),
          escapeCsv(Array.isArray(d.services) ? d.services.join(', ') : (d.services || '—')),
          escapeCsv(d.driverRole),
          escapeCsv(typeof d.ownerCar === 'object' && d.ownerCar ? `${d.ownerCar.model} [${d.ownerCar.plateNumber || ''}]` : (d.ownerCar || 'N/A (Fleet)')),
          escapeCsv(`${d.payoutMethod || ''} - ${d.payoutNumber || ''}`),
          escapeCsv(d.status)
        ].join(','));

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rownaa_driver_registrations_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch(e) {
        alert('Export error: ' + e.message);
      }
    }

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('#driver-register-form input[required], #driver-register-form select[required], #driver-register-form textarea[required]').forEach(el => {
        el.setAttribute('data-orig-required', 'true');
      });

      loadDriverSettings();
      applyDriverSettings();

      const savedLang = localStorage.getItem('rownaa_lang') || 'en';
      setLanguage(savedLang);
    });
  