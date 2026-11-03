const fs = require('fs');
const path = require('path');

const targetFiles = [
  path.join(__dirname, '..', 'driver-register.html'),
  path.join(__dirname, '..', 'netlify-driver-portal', 'index.html')
];

const modernMobileCss = `    /* =========================================================
       WORLD-CLASS LUXURY MOBILE ARCHITECTURE (FAANG AESTHETIC)
       ========================================================= */
    @media (max-width: 768px) {
      /* Smooth Scrolling & Responsive Root */
      html, body {
        overflow-x: hidden !important;
        -webkit-text-size-adjust: 100%;
        touch-action: manipulation;
        background: #09090b !important;
      }
      .page-container {
        padding: 14px 12px 64px !important;
        max-width: 100% !important;
      }

      /* Navigation Header */
      .site-nav {
        height: 56px !important;
        padding: 0 14px !important;
        background: rgba(9, 9, 11, 0.85) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
      }
      .nav-wrap {
        gap: 8px !important;
      }
      .brand-group {
        gap: 8px !important;
      }
      .brand-icon {
        width: 32px !important;
        height: 32px !important;
        font-size: 1.05rem !important;
        border-radius: 8px !important;
      }
      .wordmark {
        font-size: 1.15rem !important;
        font-weight: 800 !important;
      }
      .nav-actions {
        gap: 8px !important;
      }
      .lang-toggle-btn {
        height: 32px !important;
        padding: 0 10px !important;
        font-size: 0.74rem !important;
        font-weight: 600 !important;
        border-radius: 8px !important;
        gap: 5px !important;
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
      .form-settings-btn {
        height: 32px !important;
        padding: 0 10px !important;
        font-size: 0.74rem !important;
        font-weight: 600 !important;
        border-radius: 8px !important;
        gap: 5px !important;
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
      }
      .settings-active-badge {
        font-size: 0.58rem !important;
        padding: 2px 5px !important;
        border-radius: 4px !important;
      }

      /* Hero Title & Badge */
      .hero-header {
        margin-bottom: 14px !important;
        text-align: center !important;
      }
      .badge-pill {
        font-size: 0.68rem !important;
        padding: 4px 10px !important;
        margin-bottom: 8px !important;
        border-radius: 9999px !important;
        background: rgba(212, 255, 0, 0.08) !important;
        border: 1px solid rgba(212, 255, 0, 0.22) !important;
        color: var(--accent) !important;
      }
      .hero-title {
        font-size: 1.55rem !important;
        font-weight: 800 !important;
        line-height: 1.22 !important;
        letter-spacing: -0.02em !important;
      }

      /* Modern Linear-Style Segmented Stepper */
      .stepper-container {
        padding: 12px 14px !important;
        margin-bottom: 14px !important;
        border-radius: 14px !important;
        background: rgba(18, 19, 24, 0.7) !important;
        backdrop-filter: blur(16px) !important;
        border: 1px solid rgba(255, 255, 255, 0.06) !important;
      }
      .stepper-nav {
        display: none !important;
      }
      .mobile-stepper-wrap {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }
      .mobile-stepper-head {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
      }
      .mobile-step-badge {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
      }
      .ms-pill {
        background: rgba(212, 255, 0, 0.12) !important;
        color: #d4ff00 !important;
        border: 1px solid rgba(212, 255, 0, 0.3) !important;
        font-size: 0.62rem !important;
        font-weight: 700 !important;
        letter-spacing: 0.06em !important;
        padding: 3px 8px !important;
        border-radius: 6px !important;
        text-transform: uppercase !important;
      }
      .ms-title {
        font-size: 0.84rem !important;
        font-weight: 600 !important;
        color: #f4f4f5 !important;
        letter-spacing: -0.01em !important;
      }
      .ms-percent {
        font-size: 0.72rem !important;
        font-weight: 600 !important;
        color: #a1a1aa !important;
      }
      .mobile-progress-track {
        width: 100% !important;
        height: 4px !important;
        background: rgba(255, 255, 255, 0.06) !important;
        border-radius: 9999px !important;
        overflow: hidden !important;
      }
      .mobile-progress-fill {
        height: 100% !important;
        background: linear-gradient(90deg, #b0df00 0%, #d4ff00 100%) !important;
        box-shadow: 0 0 10px rgba(212, 255, 0, 0.45) !important;
        border-radius: 9999px !important;
        transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .mobile-step-pills {
        display: grid !important;
        grid-template-columns: repeat(5, 1fr) !important;
        gap: 4px !important;
        margin-top: 2px !important;
      }
      .m-pill {
        padding: 5px 2px !important;
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.06) !important;
        color: #71717a !important;
        font-size: 0.68rem !important;
        font-weight: 600 !important;
        border-radius: 6px !important;
        cursor: pointer !important;
        text-align: center !important;
        white-space: nowrap !important;
        transition: all 0.2s ease !important;
      }
      .m-pill.active {
        background: rgba(212, 255, 0, 0.12) !important;
        border-color: rgba(212, 255, 0, 0.4) !important;
        color: #d4ff00 !important;
      }
      .m-pill.completed {
        background: rgba(16, 185, 129, 0.08) !important;
        border-color: rgba(16, 185, 129, 0.25) !important;
        color: #10b981 !important;
      }

      /* Refined Card Shell (Luxury Dark Glass) */
      .form-shell {
        border-radius: 16px !important;
        padding: 1px !important;
        margin-bottom: 20px !important;
        background: rgba(18, 19, 24, 0.75) !important;
        border: 1px solid rgba(255, 255, 255, 0.06) !important;
        backdrop-filter: blur(24px) !important;
        box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.6) !important;
      }
      .form-core {
        padding: 18px 14px 22px !important;
        border-radius: 15px !important;
        background: transparent !important;
      }
      .f-sec-title {
        font-size: 1.15rem !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        letter-spacing: -0.01em !important;
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        margin-bottom: 4px !important;
      }
      .f-sec-title i {
        color: #d4ff00 !important;
        font-size: 1.25rem !important;
      }
      .f-sec-desc {
        font-size: 0.78rem !important;
        color: #a1a1aa !important;
        line-height: 1.45 !important;
        margin-bottom: 18px !important;
      }

      /* Clean Ergonomic Inputs (46px Touch Standard) */
      .grid-2, .grid-3 {
        display: flex !important;
        flex-direction: column !important;
        gap: 14px !important;
        margin-bottom: 14px !important;
      }
      .f-group {
        margin-bottom: 14px !important;
      }
      .f-label {
        font-size: 0.80rem !important;
        font-weight: 600 !important;
        color: #e4e4e7 !important;
        margin-bottom: 6px !important;
        letter-spacing: 0.01em !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
      }
      .f-label small, .bn-text {
        display: none !important;
      }
      .f-control {
        height: 46px !important;
        min-height: 46px !important;
        padding: 10px 14px 10px 42px !important;
        font-size: 14px !important;
        border-radius: 12px !important;
        background: rgba(255, 255, 255, 0.035) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        color: #ffffff !important;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        box-sizing: border-box !important;
      }
      .f-control:focus {
        border-color: rgba(212, 255, 0, 0.5) !important;
        background: rgba(255, 255, 255, 0.05) !important;
        box-shadow: 0 0 0 3px rgba(212, 255, 0, 0.12) !important;
        outline: none !important;
      }
      .f-control.no-prefix {
        padding-left: 14px !important;
      }
      .prefix-icon {
        left: 14px !important;
        font-size: 1.15rem !important;
        color: #71717a !important;
        transition: color 0.2s !important;
      }
      .f-input-wrap:focus-within .prefix-icon {
        color: #d4ff00 !important;
      }

      /* Option Tiles (Role & Availability) */
      .tiles-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 10px !important;
        margin-bottom: 16px !important;
      }
      .tile-opt {
        padding: 14px 14px !important;
        border-radius: 12px !important;
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.07) !important;
        min-height: auto !important;
        gap: 6px !important;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .tile-opt.selected {
        background: rgba(212, 255, 0, 0.04) !important;
        border-color: rgba(212, 255, 0, 0.45) !important;
        box-shadow: 0 0 16px rgba(212, 255, 0, 0.06) !important;
      }
      .tile-title {
        font-size: 0.88rem !important;
        font-weight: 700 !important;
        color: #ffffff !important;
      }
      .tile-desc {
        font-size: 0.74rem !important;
        color: #a1a1aa !important;
        line-height: 1.35 !important;
      }

      /* Service Selection Cards */
      .services-spec-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 10px !important;
        margin-bottom: 18px !important;
      }
      .service-card-tile {
        padding: 14px 14px !important;
        border-radius: 12px !important;
        background: rgba(255, 255, 255, 0.03) !important;
        border: 1px solid rgba(255, 255, 255, 0.07) !important;
        gap: 6px !important;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
      }
      .service-card-tile.selected {
        background: rgba(212, 255, 0, 0.04) !important;
        border-color: rgba(212, 255, 0, 0.45) !important;
        box-shadow: 0 0 16px rgba(212, 255, 0, 0.06) !important;
      }
      .svc-tile-head {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        margin-bottom: 4px !important;
      }
      .svc-tile-icon {
        width: 32px !important;
        height: 32px !important;
        font-size: 1.05rem !important;
        border-radius: 8px !important;
        background: rgba(255, 255, 255, 0.05) !important;
        color: #d4ff00 !important;
      }
      .svc-tile-title {
        font-size: 0.88rem !important;
        font-weight: 700 !important;
        color: #ffffff !important;
      }
      .svc-tile-desc {
        font-size: 0.74rem !important;
        color: #a1a1aa !important;
        line-height: 1.35 !important;
      }
      .svc-rate-badge {
        font-size: 0.68rem !important;
        font-weight: 600 !important;
        padding: 3px 8px !important;
        border-radius: 6px !important;
      }
      .service-card-tile input[type="checkbox"] {
        width: 18px !important;
        height: 18px !important;
        top: 14px !important;
        right: 14px !important;
        accent-color: var(--accent) !important;
      }

      /* Step 5 Upload Cards */
      .upload-card-full {
        margin-bottom: 10px !important;
      }
      .upload-card-full .upload-card {
        min-height: 80px !important;
        padding: 14px !important;
        border-radius: 12px !important;
        border: 1.5px dashed rgba(255, 255, 255, 0.12) !important;
        background: rgba(255, 255, 255, 0.02) !important;
      }
      .upload-subgrid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 10px !important;
        margin-bottom: 10px !important;
      }
      .upload-card {
        min-height: 86px !important;
        padding: 14px 10px !important;
        border-radius: 12px !important;
        border: 1.5px dashed rgba(255, 255, 255, 0.12) !important;
        background: rgba(255, 255, 255, 0.02) !important;
        transition: all 0.2s ease !important;
      }
      .upload-card:active {
        background: rgba(212, 255, 0, 0.04) !important;
        border-color: rgba(212, 255, 0, 0.4) !important;
      }
      .upload-icon {
        font-size: 1.4rem !important;
        color: #d4ff00 !important;
        margin-bottom: 4px !important;
      }
      .upload-title {
        font-size: 0.78rem !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        margin-bottom: 2px !important;
      }
      .upload-subtitle {
        font-size: 0.68rem !important;
        color: #a1a1aa !important;
        line-height: 1.25 !important;
      }
      .upload-filename {
        font-size: 0.68rem !important;
        font-weight: 600 !important;
        color: #10b981 !important;
        margin-top: 4px !important;
      }

      /* Summary Review Card */
      .summary-card {
        padding: 16px !important;
        border-radius: 14px !important;
        background: rgba(255, 255, 255, 0.025) !important;
        border: 1px solid rgba(255, 255, 255, 0.07) !important;
        margin-bottom: 16px !important;
      }
      .summary-header {
        font-size: 0.88rem !important;
        font-weight: 700 !important;
        color: #ffffff !important;
        margin-bottom: 12px !important;
        padding-bottom: 8px !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
      }
      .summary-grid {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }
      .sum-item {
        display: flex !important;
        justify-content: space-between !important;
        align-items: center !important;
        padding: 4px 0 !important;
        border-bottom: 1px solid rgba(255, 255, 255, 0.03) !important;
      }
      .sum-label {
        font-size: 0.72rem !important;
        color: #a1a1aa !important;
      }
      .sum-val {
        font-size: 0.78rem !important;
        font-weight: 600 !important;
        color: #ffffff !important;
      }

      /* Agreement Label */
      .verify-label {
        font-size: 0.76rem !important;
        line-height: 1.45 !important;
        color: #a1a1aa !important;
      }

      /* Bottom Navigation Actions (Tactile 48px Buttons) */
      .form-nav-actions {
        display: flex !important;
        flex-direction: column-reverse !important;
        gap: 10px !important;
        margin-top: 20px !important;
        padding-top: 14px !important;
        border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
      }
      .btn-step-prev {
        width: 100% !important;
        min-height: 44px !important;
        padding: 10px 16px !important;
        border-radius: 12px !important;
        font-size: 0.84rem !important;
        font-weight: 600 !important;
        justify-content: center !important;
        background: rgba(255, 255, 255, 0.04) !important;
        border: 1px solid rgba(255, 255, 255, 0.08) !important;
        color: #a1a1aa !important;
      }
      .btn-step-next,
      .btn-submit-app {
        width: 100% !important;
        min-height: 48px !important;
        padding: 12px 18px !important;
        border-radius: 12px !important;
        font-size: 0.90rem !important;
        font-weight: 700 !important;
        justify-content: center !important;
        background: #d4ff00 !important;
        color: #000000 !important;
        box-shadow: 0 4px 16px rgba(212, 255, 0, 0.22) !important;
      }

      /* Settings Modal Overlay on Mobile */
      .settings-modal-overlay {
        padding: 8px !important;
        align-items: center !important;
        justify-content: center !important;
      }
      .settings-modal-card {
        width: 100% !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
        max-height: 92vh !important;
        border-radius: 14px !important;
      }
      .sm-header {
        padding: 12px 14px !important;
        gap: 8px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
      }
      .sm-title-group {
        min-width: 0 !important;
        flex: 1 !important;
        gap: 8px !important;
        overflow: hidden !important;
      }
      .sm-icon {
        width: 30px !important;
        height: 30px !important;
        font-size: 1rem !important;
        flex-shrink: 0 !important;
        border-radius: 8px !important;
      }
      .sm-title {
        font-size: 0.88rem !important;
        line-height: 1.25 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      .sm-subtitle {
        font-size: 0.68rem !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
      .sm-close-btn {
        flex-shrink: 0 !important;
        width: 30px !important;
        height: 30px !important;
        font-size: 1rem !important;
      }
      .sm-body {
        padding: 12px !important;
        gap: 12px !important;
        overflow-x: hidden !important;
      }
      .sm-section-box {
        padding: 12px !important;
        border-radius: 10px !important;
        overflow-x: hidden !important;
      }
      .sm-sec-icon {
        width: 30px !important;
        height: 30px !important;
        font-size: 1rem !important;
      }
      .sm-sec-title {
        font-size: 0.82rem !important;
      }
      .sm-sec-desc {
        font-size: 0.68rem !important;
      }
      .sm-add-grid {
        display: flex !important;
        flex-direction: column !important;
        width: 100% !important;
        gap: 8px !important;
        align-items: stretch !important;
      }
      .sm-add-grid select,
      .sm-add-grid input,
      .sm-add-grid button {
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .sm-add-grid button {
        height: 40px !important;
        justify-content: center !important;
        border-radius: 8px !important;
      }
      .sm-footer {
        padding: 10px 12px !important;
        flex-direction: column !important;
        gap: 8px !important;
        align-items: stretch !important;
      }
      .btn-reset-factory {
        width: 100% !important;
        justify-content: center !important;
        height: 38px !important;
      }
      .sm-footer > div {
        width: 100% !important;
        display: flex !important;
        gap: 8px !important;
      }
      .sm-footer > div > button {
        flex: 1 !important;
        justify-content: center !important;
        height: 40px !important;
      }
    }`;

targetFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.error('File not found:', file);
    return;
  }
  let content = fs.readFileSync(file, 'utf8');

  // 1. Enforce display: none !important for .bn-text and .f-label small in base CSS
  content = content.replace(/\.bn-text\s*\{[^}]*\}/g, '.bn-text { display: none !important; }');
  content = content.replace(/\.f-label\s+small\s*\{[^}]*\}/g, '.f-label small { display: none !important; }');

  // 2. Replace the entire @media (max-width: 768px) block cleanly
  const mediaRegex = /@media\s*\(max-width:\s*768px\)\s*\{[\s\S]*?\n\s*\}\s*\n\s*<\/style>/;
  if (mediaRegex.test(content)) {
    content = content.replace(mediaRegex, modernMobileCss + '\n  </style>');
    console.log('Successfully replaced @media (max-width: 768px) block in', file);
  } else {
    console.warn('Could not match @media (max-width: 768px) in', file);
  }

  // 3. Clean all <small id="sublbl-..."> tags from HTML
  content = content.replace(/\s*<small id="sublbl-[^"]+">[^<]*<\/small>/g, '');
  content = content.replace(/\s*<small>[^<]*<\/small>/g, '');

  // 4. Remove all duplicate <span class="bn-text" id="bndesc-..."> tags from HTML
  content = content.replace(/\s*<span class="bn-text" id="bndesc-[^"]+">[\s\S]*?<\/span>/g, '');

  // 5. Clean Step 5 upload subtitles in HTML
  content = content.replace(/Clean front-facing headshot \/ পাসপোর্ট সাইজ সেলফি ছবি/g, 'Clean front-facing headshot or portrait');
  content = content.replace(/Clean front-facing headshot \/ সেলফি ছবি/g, 'Clean front-facing headshot or portrait');
  content = content.replace(/Front side \/ লাইসেন্সের সামনের অংশ/g, 'Clear front side of card');
  content = content.replace(/Back side \/ লাইসেন্সের পেছনের অংশ/g, 'Clear back side of card');
  content = content.replace(/Front side \/ এনআইডি সামনের অংশ/g, 'Clear front side of card');
  content = content.replace(/Back side \/ এনআইডি পেছনের অংশ/g, 'Clear back side of card');

  // 6. Clean dual text with slashes / Bengali in option tags & headings
  content = content.replace(/Professional \(Light Motor Vehicle - কার\/মাইক্রো\)/g, 'Professional (Light Motor Vehicle)');
  content = content.replace(/Professional \(Medium \/ Heavy - এসইউভি\/কোচ\)/g, 'Professional (Medium / Heavy Commercial)');
  content = content.replace(/Non-Professional \(Light - ব্যক্তিগত লাইসেন্স\)/g, 'Non-Professional (Light / Private)');
  content = content.replace(/➕ \+ Other License Category \(কাস্টম শ্রেণি লিখুন\)\.\.\./g, '➕ + Other License Category...');
  content = content.replace(/Arabic Speaking \(হজ্ব ও মধ্যপ্রাচ্য ফেরত\)/g, 'Arabic Speaking (Middle East / Gulf Expat Returnees)');
  content = content.replace(/Bangla Native Only \(বাংলা ভাষা\)/g, 'Bangla Native Only');
  content = content.replace(/➕ \+ Add Custom Language \(অন্যান্য ভাষা লিখুন\)\.\.\./g, '➕ + Add Custom Language...');
  content = content.replace(/➕ \+ Add Other District \/ Thana \/ Area \(নতুন এলাকা লিখুন\)\.\.\./g, '➕ + Add Other District / Area...');
  content = content.replace(/bKash \(বিকাশ পার্সোনাল\)/g, 'bKash Personal');
  content = content.replace(/bKash \(বিকাশ এজেন্ট \/ মার্চেন্ট\)/g, 'bKash Merchant / Agent');
  content = content.replace(/Nagad \(নগদ পার্সোনাল\)/g, 'Nagad Personal');
  content = content.replace(/Rocket \(রকেট\)/g, 'Rocket Personal');
  content = content.replace(/Upay \(ইউপে ওয়ালেট\)/g, 'Upay Wallet');
  content = content.replace(/Cellfin \(সেলফিন - ইসলামী ব্যাংক\)/g, 'Cellfin (IBBL)');
  content = content.replace(/Commercial Bank Account \(ব্যাংক অ্যাকাউন্ট\)/g, 'Commercial Bank Account');
  content = content.replace(/➕ \+ Other Wallet \/ Payment Option \(অন্যান্য মাধ্যম\)\.\.\./g, '➕ + Other Wallet / Payment Option...');
  content = content.replace(/➕ \+ Add Other Vehicle Model \(অন্য মডেল লিখুন\)\.\.\./g, '➕ + Add Other Vehicle Model...');
  content = content.replace(/Your Vehicle Profile \(গাড়ির বিবরণ\)/g, 'Your Vehicle Profile');
  content = content.replace(/Payout & Expense Reimbursement \(টাকা প্রাপ্তির তথ্য\)/g, 'Payout & Expense Reimbursement');
  content = content.replace(/Define a New Custom Service \(নতুন সার্ভিস যোগ করুন\)/g, 'Define a New Custom Service');
  content = content.replace(/placeholder="e\.g\. Md\. Rafiqul Islam \(Brother \/ ভাই\)"/g, 'placeholder="e.g. Md. Rafiqul Islam (Brother)"');

  // 7. Clean agreement checkbox text
  const oldAgreement = /<label for="drv-agreement" class="verify-label" id="lbl-agreement">[\s\S]*?<\/label>/;
  const newAgreement = `<label for="drv-agreement" class="verify-label" id="lbl-agreement">I hereby certify that all information submitted is accurate and that I possess a clean police record with zero criminal history. I pledge to adhere to Rownaa's VIP Chauffeur Standards: strict punctuality, executive courtesy, defensive driving, zero smoking inside vehicles, and polite passenger care.</label>`;
  if (oldAgreement.test(content)) {
    content = content.replace(oldAgreement, newAgreement);
  }

  // 8. Clean I18N.en in JavaScript
  content = content.replace(/upPhotoSub:\s*'Clean front-facing headshot \/ [^']+'/g, "upPhotoSub: 'Clean front-facing headshot or portrait'");
  content = content.replace(/upLicFrontSub:\s*'Front side \/ [^']+'/g, "upLicFrontSub: 'Clear front side of card'");
  content = content.replace(/upLicBackSub:\s*'Back side \/ [^']+'/g, "upLicBackSub: 'Clear back side of card'");
  content = content.replace(/upNidFrontSub:\s*'Front side \/ [^']+'/g, "upNidFrontSub: 'Clear front side of card'");
  content = content.replace(/upNidBackSub:\s*'Back side \/ [^']+'/g, "upNidBackSub: 'Clear back side of card'");
  content = content.replace(/vehicleTitle:\s*'Your Vehicle Profile \(গাড়ির বিবরণ\)'/g, "vehicleTitle: 'Your Vehicle Profile'");
  content = content.replace(/payoutHeading:\s*'Payout & Expense Reimbursement \(টাকা প্রাপ্তির তথ্য\)'/g, "payoutHeading: 'Payout & Expense Reimbursement'");

  // 9. Update setLanguage to update agreement text, vehicleTitle, payoutHeading cleanly
  if (!content.includes("if (lagr) lagr.textContent = t.agreementText;")) {
    content = content.replace(
      "const sumDocLbl = document.getElementById('sum-lbl-docs');",
      "const lagr = document.getElementById('lbl-agreement'); if (lagr && t.agreementText) lagr.textContent = t.agreementText;\n      const sumDocLbl = document.getElementById('sum-lbl-docs');"
    );
  }

  // Add agreementText to I18N.en and I18N.bn if not present
  if (!content.includes("agreementText: 'I hereby certify")) {
    content = content.replace(
      "btnSubmit: 'Submit Chauffeur Application 🚀'",
      "btnSubmit: 'Submit Chauffeur Application 🚀',\n          agreementText: 'I hereby certify that all information submitted is accurate and that I possess a clean police record with zero criminal history. I pledge to adhere to Rownaa\\'s VIP Chauffeur Standards: strict punctuality, executive courtesy, defensive driving, zero smoking inside vehicles, and polite passenger care.'"
    );
  }
  if (!content.includes("agreementText: 'আমি শপথ করছি")) {
    content = content.replace(
      "btnSubmit: 'শফার আবেদনপত্র জমা দিন 🚀'",
      "btnSubmit: 'শফার আবেদনপত্র জমা দিন 🚀',\n          agreementText: 'আমি শপথ করছি যে প্রদত্ত সকল তথ্য সত্য এবং আমার কোনো অপরাধমূলক রেকর্ড নেই। আমি রওনার ভিআইপি শফার নীতিমালা মেনে চলব।'"
    );
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully processed and updated:', file);
});

