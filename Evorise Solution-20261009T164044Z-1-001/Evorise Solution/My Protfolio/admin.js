(function() {
  // 1. Initialize Defaults
  const defaults = {
    adminEmail: 'a@gmail.com',
    adminPassword: 'aaaaaa',
    siteContent: '{}',
    activeTheme: 'light',
    activePlugins: JSON.stringify({ 'cursor-glow': false, 'wa-button': true }),
    postsList: JSON.stringify([{ id: 1, title: 'Hello world!', author: 'admin', date: '2026/09/30' }]),
    mediaList: JSON.stringify(['hero.jpeg', 'about.jpeg', 'contact.jpeg'])
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, value);
    }
  }

  // Editable configuration for the new layout
  const editableConfig = [
    { id: 'hero-title', selector: '.hero-title', label: 'Hero Title (Home)' },
    { id: 'hero-subtitle', selector: '.hero-subtitle', label: 'Hero Subtitle (Home)' },
    { id: 'footer-copy', selector: '.footer-copy', label: 'Footer Copyright (All Pages)' },
    { id: 'contact-info-desc', selector: '.contact-info-desc', label: 'Contact Description (Contact)' }
  ];

  // Apply Global State (Theme, Plugins, Content)
  function applyGlobalState() {
    // 1. Apply Content
    const savedContent = JSON.parse(localStorage.getItem('siteContent') || '{}');
    editableConfig.forEach(field => {
      if (savedContent[field.id]) {
        const els = document.querySelectorAll(field.selector);
        els.forEach(el => { el.innerHTML = savedContent[field.id]; });
      }
    });

    // 2. Apply Theme
    const activeTheme = localStorage.getItem('activeTheme');
    let themeStyle = document.getElementById('dynamic-theme-style');
    if (!themeStyle) {
      themeStyle = document.createElement('style');
      themeStyle.id = 'dynamic-theme-style';
      document.head.appendChild(themeStyle);
    }
    // The new design defaults to a Light/White background. We invert it for 'dark'.
    if (activeTheme === 'dark') {
      themeStyle.innerHTML = `
        :root {
          --black: #ffffff !important;
          --white: #050505 !important;
          --light-gray: #111111 !important;
          --border: #333333 !important;
        }
      `;
    } else {
      themeStyle.innerHTML = ''; 
    }

    // 3. Apply Plugins (Dynamically injected since HTML was cleaned up)
    const plugins = JSON.parse(localStorage.getItem('activePlugins') || '{}');
    
    // WA Button Plugin
    let waBtn = document.getElementById('plugin-wa-btn');
    if (plugins['wa-button']) {
      if (!waBtn) {
        waBtn = document.createElement('a');
        waBtn.id = 'plugin-wa-btn';
        waBtn.href = 'https://wa.me/8801628500052';
        waBtn.target = '_blank';
        waBtn.innerHTML = '💬';
        waBtn.style.cssText = 'position:fixed;bottom:32px;right:32px;z-index:900;width:60px;height:60px;border-radius:50%;background:#25D366;display:flex;align-items:center;justify-content:center;font-size:1.8rem;box-shadow:0 8px 32px rgba(37,211,102,0.4);text-decoration:none;transition:transform 0.3s;';
        waBtn.onmouseover = () => waBtn.style.transform = 'scale(1.1)';
        waBtn.onmouseout = () => waBtn.style.transform = 'scale(1)';
        document.body.appendChild(waBtn);
      }
      waBtn.style.display = 'flex';
    } else if (waBtn) {
      waBtn.style.display = 'none';
    }


  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyGlobalState);
  } else {
    applyGlobalState();
  }

  // Build WordPress Admin HTML
  function initAdminUI() {
    const adminHTML = `
      <style>
        #wp-admin-wrap, #wp-login-overlay {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
          color: #3c434a; font-size: 13px; line-height: 1.4em; box-sizing: border-box; text-align: left;
        }
        #wp-admin-wrap *, #wp-login-overlay * { box-sizing: border-box; }
        
        #wp-login-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: #f0f0f1; z-index: 10000;
          display: none; align-items: center; justify-content: center; flex-direction: column;
        }
        .wp-login-box {
          background: #fff; width: 100%; max-width: 320px;
          padding: 24px; border: 1px solid #c3c4c7; box-shadow: 0 1px 3px rgba(0,0,0,0.04); margin-bottom: 24px;
        }
        .wp-login-logo {
          width: 84px; height: 84px; margin: 0 auto 25px;
          background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 122.5 122.5" xmlns="http://www.w3.org/2000/svg"><circle cx="61.3" cy="61.3" r="61.3" fill="%232271b1"/><path d="M12.9,92.5a58.4,58.4,0,0,0,88.7,16l-33-90A58.6,58.6,0,0,0,12.9,92.5ZM61.3,7.5a53.8,53.8,0,0,1,38.1,15.8l-15.5,42.5-12.7-38h-4.4L54.1,65.8l-17-48h-4.5l14.9,43-15.2,42.5A53.8,53.8,0,0,1,61.3,7.5ZM97.3,87.6a53.8,53.8,0,0,0,13.8-37.1c0-10.8-3.2-20.9-8.7-29.3Z" fill="%23fff"/></svg>') no-repeat center;
          background-size: contain;
        }
        .wp-login-label { display: block; margin-bottom: 8px; font-size: 14px; color: #3c434a; }
        .wp-input {
          width: 100%; padding: 4px 12px; font-size: 24px; line-height: 1.3; margin-bottom: 16px;
          color: #32373c; background-color: #fff; border: 1px solid #8c8f94; border-radius: 4px; transition: border-color 0.1s;
        }
        .wp-input:focus { border-color: #2271b1; box-shadow: 0 0 0 1px #2271b1; outline: none; }
        .wp-button-primary {
          display: inline-block; text-decoration: none; font-size: 13px; line-height: 2.15384615;
          min-height: 32px; margin: 0; padding: 0 12px; cursor: pointer; border-width: 1px;
          border-style: solid; border-radius: 3px; white-space: nowrap;
          color: #fff; background: #2271b1; border-color: #2271b1;
        }
        .wp-button-primary:hover { background: #135e96; border-color: #135e96; }
        #wp-login-err { background: #fff; border-left: 4px solid #d63638; box-shadow: 0 1px 1px 0 rgba(0,0,0,.1); padding: 12px; margin-bottom: 20px; display: none; width: 100%; max-width: 320px; }
        #wp-close-login { color: #50575e; text-decoration: none; font-size: 13px; margin-top: 10px; cursor: pointer;}
        #wp-close-login:hover { color: #2271b1; }

        #wp-admin-wrap { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #f0f0f1; z-index: 10001; display: none; }
        #wpadminbar { position: absolute; top: 0; left: 0; width: 100%; height: 32px; background: #1d2327; color: #f0f0f1; z-index: 999; display: flex; justify-content: space-between; align-items: center; }
        #wp-admin-bar-left, #wp-admin-bar-right { display: flex; height: 100%; }
        .ab-item { display: flex; align-items: center; padding: 0 12px; color: #f0f0f1; text-decoration: none; cursor: pointer; height: 100%; transition: background 0.2s, color 0.2s; font-size: 13px; }
        .ab-item:hover { background: #2c3338; color: #72aee6; }
        .ab-icon { font-size: 16px; margin-right: 6px; filter: grayscale(1) contrast(5); opacity: 0.8; }
        
        #adminmenumain { position: absolute; top: 32px; left: 0; width: 160px; bottom: 0; background: #1d2327; z-index: 998; overflow-y: auto; }
        #adminmenu { list-style: none; padding: 12px 0 0 0; margin: 0; }
        .wp-menu-item { display: block; }
        .wp-menu-link { display: flex; align-items: center; padding: 10px 12px; color: #f0f0f1; text-decoration: none; border-left: 4px solid transparent; cursor: pointer; }
        .wp-menu-link:hover, .wp-menu-item.active .wp-menu-link { background: #2c3338; color: #72aee6; }
        .wp-menu-item.active .wp-menu-link { color: #fff; background: #2271b1; font-weight: 600; }
        .menu-icon { margin-right: 10px; font-size: 16px; width: 20px; text-align: center; filter: grayscale(1) invert(1); opacity: 0.6; }
        .wp-menu-item.active .menu-icon { opacity: 1; filter: none; }
        
        #wpcontent { position: absolute; top: 32px; left: 160px; right: 0; bottom: 0; overflow-y: auto; padding: 20px; }
        .wrap { display: none; max-width: 1200px; margin: 0; }
        .wrap.active { display: block; }
        .wp-heading-inline { font-size: 23px; font-weight: 400; margin: 0; padding: 9px 0 4px 0; color: #1d2327; }
        hr.wp-header-end { border: 0; border-top: 1px solid #c3c4c7; margin: 20px 0; }
        
        .postbox { background: #fff; border: 1px solid #c3c4c7; box-shadow: 0 1px 1px rgba(0,0,0,0.04); margin-bottom: 20px; }
        .postbox-header { padding: 12px 15px; border-bottom: 1px solid #c3c4c7; font-size: 14px; font-weight: 600; }
        .postbox-body { padding: 15px; }
        
        .form-table { width: 100%; border-collapse: collapse; }
        .form-table th { padding: 20px 10px 20px 0; width: 200px; text-align: left; vertical-align: top; font-weight: 600; font-size: 14px; color: #2c3338; border-bottom: 1px solid #dcdcde; }
        .form-table td { padding: 15px 10px; border-bottom: 1px solid #dcdcde; }
        .form-table tr:last-child th, .form-table tr:last-child td { border-bottom: none; }
        
        .regular-text { width: 25em; }
        .large-text { width: 100%; height: 6em; }
        .wp-input-admin { padding: 0 8px; line-height: 2; min-height: 30px; border: 1px solid #8c8f94; border-radius: 4px; box-shadow: 0 0 0 transparent; font-family: inherit; font-size: 14px; }
        textarea.wp-input-admin { padding: 8px; line-height: 1.4; }
        .wp-input-admin:focus { border-color: #2271b1; box-shadow: 0 0 0 1px #2271b1; outline: none; }
        
        .notice { background: #fff; border-left: 4px solid #fff; box-shadow: 0 1px 1px 0 rgba(0,0,0,.1); margin: 5px 0 15px; padding: 1px 12px; display: none; }
        .notice-success { border-left-color: #00a32a; }
        
        .glance-item { display: inline-block; width: 48%; padding: 5px 0; font-size: 14px; color: #2271b1; }
        .glance-item::before { content: '⏺'; color: #8c8f94; margin-right: 5px; font-size: 12px; }
        
        .wp-list-table { width: 100%; border: 1px solid #c3c4c7; border-collapse: collapse; background: #fff; }
        .wp-list-table th { background: #fff; padding: 8px 10px; border-bottom: 1px solid #c3c4c7; text-align: left; font-weight: 400; color: #2c3338; }
        .wp-list-table td { padding: 8px 10px; border-bottom: 1px solid #f0f0f1; vertical-align: top; color: #3c434a; }
        .wp-list-table tr:nth-child(even) { background: #f6f7f7; }
        .row-title { font-weight: 600; color: #2271b1; text-decoration: none; display: block; font-size: 14px;}
        .row-actions { visibility: hidden; font-size: 13px; margin-top: 4px; }
        .wp-list-table tr:hover .row-actions { visibility: visible; }
        .row-actions span { cursor: pointer; color: #2271b1; text-decoration: none; margin-right: 4px; }
        .row-actions .delete { color: #d63638; }
        
        .wp-submenu-head { padding: 10px 0 10px 12px; font-size: 11px; text-transform: uppercase; color: #a7aaad; font-weight: 600; margin-top: 10px; }
        
        .theme-card { width:300px; border:1px solid #c3c4c7; background:#fff; position:relative; }
        .theme-card.active { border:2px solid #2271b1; }
        .theme-img { height:180px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:20px; font-weight:bold; }
        .theme-info { padding:15px; background:#f6f7f7; }
        .theme-card.active .theme-info { background:#f0f6fc; }
        .plugin-status { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
        .status-active { background: #d4edda; color: #155724; }
        .status-inactive { background: #f8d7da; color: #721c24; }
      </style>

      <div id="wp-login-overlay">
        <div class="wp-login-logo"></div>
        <div id="wp-login-err"><strong>Error:</strong> Incorrect credentials.</div>
        <div class="wp-login-box">
          <form id="wp-login-form">
            <div class="wp-input-wrapper">
              <label class="wp-login-label">Email Address</label>
              <input type="email" id="wp-email-in" class="wp-input">
            </div>
            <div class="wp-input-wrapper">
              <label class="wp-login-label">Password</label>
              <input type="password" id="wp-pass-in" class="wp-input">
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:24px;">
              <label style="font-size:12px; color:#3c434a;"><input type="checkbox" style="margin-right:4px;"> Remember Me</label>
              <button type="button" class="wp-button-primary" id="wp-login-btn">Log In</button>
            </div>
          </form>
        </div>
        <a id="wp-close-login">← Go to My Portfolio</a>
      </div>

      <div id="wp-admin-wrap">
        
        <!-- WP Admin Bar -->
        <div id="wpadminbar">
          <div id="wp-admin-bar-left">
            <a class="ab-item"><span class="ab-icon">W</span></a>
            <a class="ab-item" id="wp-bar-site"><span class="ab-icon">🏠</span> My Portfolio</a>
            <a class="ab-item"><span class="ab-icon">🔄</span> 0</a>
            <a class="ab-item"><span class="ab-icon">💬</span> 0</a>
            <a class="ab-item"><span class="ab-icon">➕</span> New</a>
          </div>
          <div id="wp-admin-bar-right">
            <a class="ab-item">Howdy, <span id="topbar-user">admin</span></a>
            <a class="ab-item" id="wp-logout-btn">Log Out</a>
          </div>
        </div>

        <!-- Sidebar -->
        <div id="adminmenumain">
          <ul id="adminmenu">
            <li class="wp-menu-item active" data-target="view-dashboard">
              <a class="wp-menu-link"><span class="menu-icon">🏠</span> Dashboard</a>
            </li>
            <div class="wp-submenu-head">Content</div>
            <li class="wp-menu-item" data-target="view-posts">
              <a class="wp-menu-link"><span class="menu-icon">📌</span> Posts</a>
            </li>
            <li class="wp-menu-item" data-target="view-media">
              <a class="wp-menu-link"><span class="menu-icon">📷</span> Media</a>
            </li>
            <li class="wp-menu-item" data-target="view-pages">
              <a class="wp-menu-link"><span class="menu-icon">📄</span> Pages</a>
            </li>
            <li class="wp-menu-item" data-target="view-comments">
              <a class="wp-menu-link"><span class="menu-icon">💬</span> Comments</a>
            </li>
            <div class="wp-submenu-head">Configuration</div>
            <li class="wp-menu-item" data-target="view-appearance">
              <a class="wp-menu-link"><span class="menu-icon">🎨</span> Appearance</a>
            </li>
            <li class="wp-menu-item" data-target="view-plugins">
              <a class="wp-menu-link"><span class="menu-icon">🔌</span> Plugins</a>
            </li>
            <li class="wp-menu-item" data-target="view-users">
              <a class="wp-menu-link"><span class="menu-icon">👤</span> Users</a>
            </li>
            <li class="wp-menu-item" data-target="view-tools">
              <a class="wp-menu-link"><span class="menu-icon">🛠️</span> Tools</a>
            </li>
            <li class="wp-menu-item" data-target="view-settings">
              <a class="wp-menu-link"><span class="menu-icon">⚙️</span> Settings</a>
            </li>
          </ul>
        </div>

        <!-- Main Content -->
        <div id="wpcontent">
          
          <div id="wp-notice" class="notice notice-success"><p><strong id="wp-notice-msg">Settings saved.</strong></p></div>

          <!-- View: Dashboard -->
          <div class="wrap active" id="view-dashboard">
            <h1 class="wp-heading-inline">Dashboard</h1>
            <hr class="wp-header-end">
            <div style="display:flex; gap:20px;">
              <div style="flex: 2;">
                <div class="postbox">
                  <div class="postbox-header">At a Glance</div>
                  <div class="postbox-body">
                    <div class="glance-item"><span id="glance-posts">1</span> Posts</div>
                    <div class="glance-item">6 Pages</div>
                    <div class="glance-item">10 Projects</div>
                    <div class="glance-item">LocalStorage Engine</div>
                    <p style="margin-top:15px; color:#646970;">WordPress 6.4.3 running Custom Theme.</p>
                  </div>
                </div>
              </div>
              <div style="flex: 1;">
                <div class="postbox">
                  <div class="postbox-header">Site Health Status</div>
                  <div class="postbox-body">
                    <p>Your site's health is looking good.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- View: Posts -->
          <div class="wrap" id="view-posts">
            <h1 class="wp-heading-inline">Posts</h1>
            <hr class="wp-header-end">
            <div style="margin-bottom: 20px; background:#fff; padding:15px; border:1px solid #c3c4c7;">
              <h3 style="margin-top:0;">Add New Post</h3>
              <input type="text" id="new-post-title" class="wp-input-admin regular-text" placeholder="Post Title">
              <button class="wp-button-primary" id="btn-add-post">Publish</button>
            </div>
            <table class="wp-list-table">
              <thead><tr><th>Title</th><th>Author</th><th>Date</th></tr></thead>
              <tbody id="posts-tbody">
                <!-- Injected via JS -->
              </tbody>
            </table>
          </div>

          <!-- View: Media -->
          <div class="wrap" id="view-media">
            <h1 class="wp-heading-inline">Media Library</h1>
            <hr class="wp-header-end">
            <div style="margin-bottom: 20px; background:#fff; padding:15px; border:1px solid #c3c4c7;">
              <h3 style="margin-top:0;">Add Media URL</h3>
              <input type="text" id="new-media-url" class="wp-input-admin regular-text" placeholder="https://example.com/image.jpg">
              <button class="wp-button-primary" id="btn-add-media">Upload</button>
            </div>
            <div id="media-grid" style="display:flex; gap:10px; flex-wrap:wrap;">
              <!-- Injected via JS -->
            </div>
          </div>

          <!-- View: Pages -->
          <div class="wrap" id="view-pages">
            <h1 class="wp-heading-inline">Pages Editor</h1>
            <hr class="wp-header-end">
            <div class="postbox">
              <div class="postbox-header">Live Content Fields</div>
              <div class="postbox-body">
                <table class="form-table" id="wp-content-fields">
                  <!-- Injected via JS -->
                </table>
                <p class="submit"><button class="wp-button-primary" id="wp-save-content">Update Pages</button></p>
              </div>
            </div>
          </div>

          <!-- View: Comments -->
          <div class="wrap" id="view-comments">
            <h1 class="wp-heading-inline">Comments</h1>
            <hr class="wp-header-end">
            <table class="wp-list-table">
              <thead><tr><th>Author</th><th>Comment</th><th>In Response To</th></tr></thead>
              <tbody><tr><td colspan="3" style="text-align:center; padding:20px;">No comments found.</td></tr></tbody>
            </table>
          </div>

          <!-- View: Appearance -->
          <div class="wrap" id="view-appearance">
            <h1 class="wp-heading-inline">Themes</h1>
            <hr class="wp-header-end">
            <div style="display:flex; gap:20px;">
              <div class="theme-card" id="theme-dark">
                <div class="theme-img" style="background:#080810; color:#06B6D4;">Dark Premium</div>
                <div class="theme-info">
                  <h3 style="margin:0 0 10px; font-size:15px;">Dark Premium Theme</h3>
                  <button class="wp-button-primary btn-activate-theme" data-theme="dark">Activate</button>
                </div>
              </div>
              <div class="theme-card" id="theme-light">
                <div class="theme-img" style="background:#ffffff; color:#2271b1; border-bottom:1px solid #ddd;">Light Professional</div>
                <div class="theme-info">
                  <h3 style="margin:0 0 10px; font-size:15px;">Light Professional Theme</h3>
                  <button class="wp-button-primary btn-activate-theme" data-theme="light">Activate</button>
                </div>
              </div>
            </div>
          </div>

          <!-- View: Plugins -->
          <div class="wrap" id="view-plugins">
            <h1 class="wp-heading-inline">Plugins</h1>
            <hr class="wp-header-end">
            <table class="wp-list-table">
              <thead><tr><th>Plugin</th><th>Description</th></tr></thead>
              <tbody id="plugins-tbody">
                <!-- Injected via JS -->
              </tbody>
            </table>
          </div>

          <!-- View: Users -->
          <div class="wrap" id="view-users">
            <h1 class="wp-heading-inline">Users</h1>
            <hr class="wp-header-end">
            <table class="wp-list-table">
              <thead><tr><th>Username</th><th>Email</th><th>Role</th></tr></thead>
              <tbody>
                <tr>
                  <td><strong>admin</strong></td>
                  <td id="table-user-email"></td>
                  <td>Administrator</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- View: Tools -->
          <div class="wrap" id="view-tools">
            <h1 class="wp-heading-inline">Tools</h1>
            <hr class="wp-header-end">
            <div class="postbox">
              <div class="postbox-header">Database Reset</div>
              <div class="postbox-body">
                <p>This tool will wipe all LocalStorage edits, themes, plugins, and posts.</p>
                <button class="wp-button-primary" id="wp-tool-reset" style="background:#d63638; border-color:#d63638;">Reset Entire Site</button>
              </div>
            </div>
          </div>

          <!-- View: Settings -->
          <div class="wrap" id="view-settings">
            <h1 class="wp-heading-inline">General Settings</h1>
            <hr class="wp-header-end">
            <table class="form-table">
              <tr>
                <th><label>Administration Email</label></th>
                <td><input type="email" id="wp-new-email" class="wp-input-admin regular-text"></td>
              </tr>
              <tr>
                <th><label>Administration Password</label></th>
                <td><input type="text" id="wp-new-pass" class="wp-input-admin regular-text"></td>
              </tr>
            </table>
            <p class="submit"><button class="wp-button-primary" id="wp-save-creds">Save Credentials</button></p>
          </div>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', adminHTML);

    const trigger = document.querySelector('.footer-copy');
    if (trigger) {
      trigger.style.cursor = 'pointer';
      trigger.title = 'Admin Login';
    }
    
    const loginOverlay = document.getElementById('wp-login-overlay');
    const adminWrap = document.getElementById('wp-admin-wrap');
    
    function showNotice(msg) {
      document.getElementById('wp-notice-msg').textContent = msg;
      const notice = document.getElementById('wp-notice');
      notice.style.display = 'block';
      setTimeout(() => notice.style.display = 'none', 3000);
    }

    // --- Dynamic Render Functions ---
    function renderContentForm() {
      const savedContent = JSON.parse(localStorage.getItem('siteContent') || '{}');
      const table = document.getElementById('wp-content-fields');
      let html = '';
      editableConfig.forEach(field => {
        let defaultVal = '';
        const el = document.querySelector(field.selector);
        if (el) defaultVal = el.innerHTML.trim();
        const currentVal = savedContent[field.id] !== undefined ? savedContent[field.id] : defaultVal;
        html += `
          <tr>
            <th><label>${field.label}</label></th>
            <td><textarea id="edit-${field.id}" class="wp-input-admin large-text">${currentVal}</textarea></td>
          </tr>
        `;
      });
      table.innerHTML = html;
      
      const email = localStorage.getItem('adminEmail');
      document.getElementById('table-user-email').textContent = email;
      document.getElementById('wp-new-email').value = email;
      document.getElementById('wp-new-pass').value = localStorage.getItem('adminPassword');
    }

    function renderTheme() {
      const active = localStorage.getItem('activeTheme');
      document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
      const card = document.getElementById('theme-' + active);
      if(card) card.classList.add('active');
    }

    function renderPlugins() {
      const activePlugins = JSON.parse(localStorage.getItem('activePlugins') || '{}');
      const tbody = document.getElementById('plugins-tbody');
      const pluginsList = [
        { id: 'cursor-glow', name: 'Cursor Glow', desc: 'Adds a beautiful purple radial glow following the mouse.' },
        { id: 'wa-button', name: 'WhatsApp Floating Button', desc: 'Floating chat button in the bottom right corner.' }
      ];
      let html = '';
      pluginsList.forEach(p => {
        const isActive = activePlugins[p.id];
        const statusClass = isActive ? 'status-active' : 'status-inactive';
        const actionText = isActive ? 'Deactivate' : 'Activate';
        html += `
          <tr>
            <td>
              <strong>${p.name}</strong> <span class="plugin-status ${statusClass}">${isActive ? 'Active' : 'Inactive'}</span><br>
              <span class="row-actions">
                <span class="toggle-plugin" data-id="${p.id}">${actionText}</span>
              </span>
            </td>
            <td>${p.desc}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
      
      document.querySelectorAll('.toggle-plugin').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          const currentPlugins = JSON.parse(localStorage.getItem('activePlugins') || '{}');
          currentPlugins[id] = !currentPlugins[id];
          localStorage.setItem('activePlugins', JSON.stringify(currentPlugins));
          applyGlobalState();
          renderPlugins();
          showNotice('Plugin status updated.');
        });
      });
    }

    function renderPosts() {
      const posts = JSON.parse(localStorage.getItem('postsList') || '[]');
      const tbody = document.getElementById('posts-tbody');
      let html = '';
      posts.forEach(p => {
        html += `
          <tr>
            <td>
              <strong>${p.title}</strong>
              <div class="row-actions"><span class="delete-post delete" data-id="${p.id}">Trash</span></div>
            </td>
            <td>${p.author}</td>
            <td>Published<br>${p.date}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
      document.getElementById('glance-posts').textContent = posts.length;

      document.querySelectorAll('.delete-post').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.getAttribute('data-id'));
          const current = JSON.parse(localStorage.getItem('postsList') || '[]');
          localStorage.setItem('postsList', JSON.stringify(current.filter(x => x.id !== id)));
          renderPosts();
          showNotice('Post moved to Trash.');
        });
      });
    }

    function renderMedia() {
      const media = JSON.parse(localStorage.getItem('mediaList') || '[]');
      const grid = document.getElementById('media-grid');
      let html = '';
      media.forEach((m, idx) => {
        html += `
          <div style="position:relative; width:150px; height:150px; background:#e0e0e0; border:1px solid #c3c4c7; display:flex; align-items:center; justify-content:center; overflow:hidden;">
            ${m.includes('/') ? `<img src="${m}" style="width:100%;height:100%;object-fit:cover;">` : `<span style="color:#8c8f94;">${m}</span>`}
            <span class="delete-media" data-idx="${idx}" style="position:absolute; top:5px; right:5px; background:red; color:white; width:20px; height:20px; text-align:center; cursor:pointer; border-radius:3px; line-height:20px;">✕</span>
          </div>
        `;
      });
      grid.innerHTML = html;
      
      document.querySelectorAll('.delete-media').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'));
          const current = JSON.parse(localStorage.getItem('mediaList') || '[]');
          current.splice(idx, 1);
          localStorage.setItem('mediaList', JSON.stringify(current));
          renderMedia();
          showNotice('Media deleted.');
        });
      });
    }

    // --- Events ---
    
    // Login
    if (trigger) {
      trigger.addEventListener('click', () => {
        loginOverlay.style.display = 'flex';
      });
    }
    document.getElementById('wp-close-login').addEventListener('click', () => { loginOverlay.style.display = 'none'; });
    
    document.getElementById('wp-login-btn').addEventListener('click', () => {
      const e = document.getElementById('wp-email-in').value;
      const p = document.getElementById('wp-pass-in').value;
      
      if (e === localStorage.getItem('adminEmail') && p === localStorage.getItem('adminPassword')) {
        loginOverlay.style.display = 'none';
        adminWrap.style.display = 'flex';
        
        renderContentForm();
        renderTheme();
        renderPlugins();
        renderPosts();
        renderMedia();
      } else {
        document.getElementById('wp-login-err').style.display = 'block';
      }
    });

    // Close Admin
    const closeAdmin = () => { adminWrap.style.display = 'none'; };
    document.getElementById('wp-bar-site').addEventListener('click', closeAdmin);
    document.getElementById('wp-logout-btn').addEventListener('click', closeAdmin);

    // Sidebar
    document.querySelectorAll('.wp-menu-item').forEach(item => {
      item.addEventListener('click', () => {
        if(item.id === 'wp-collapse-menu') return;
        document.querySelectorAll('.wp-menu-item').forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.wrap').forEach(v => v.classList.remove('active'));
        item.classList.add('active');
        const target = item.getAttribute('data-target');
        if (target) document.getElementById(target).classList.add('active');
      });
    });

    // Handle Forms
    document.getElementById('wp-save-creds').addEventListener('click', () => {
      localStorage.setItem('adminEmail', document.getElementById('wp-new-email').value);
      localStorage.setItem('adminPassword', document.getElementById('wp-new-pass').value);
      renderContentForm();
      showNotice('Credentials saved.');
    });

    document.getElementById('wp-save-content').addEventListener('click', () => {
      const toSave = {};
      editableConfig.forEach(field => {
        toSave[field.id] = document.getElementById('edit-' + field.id).value;
      });
      localStorage.setItem('siteContent', JSON.stringify(toSave));
      applyGlobalState();
      showNotice('Pages updated.');
    });
    
    document.getElementById('btn-add-post').addEventListener('click', () => {
      const title = document.getElementById('new-post-title').value;
      if (title) {
        const current = JSON.parse(localStorage.getItem('postsList') || '[]');
        current.push({ id: Date.now(), title, author: 'admin', date: new Date().toLocaleDateString() });
        localStorage.setItem('postsList', JSON.stringify(current));
        document.getElementById('new-post-title').value = '';
        renderPosts();
        showNotice('Post published.');
      }
    });

    document.getElementById('btn-add-media').addEventListener('click', () => {
      const url = document.getElementById('new-media-url').value;
      if (url) {
        const current = JSON.parse(localStorage.getItem('mediaList') || '[]');
        current.push(url);
        localStorage.setItem('mediaList', JSON.stringify(current));
        document.getElementById('new-media-url').value = '';
        renderMedia();
        showNotice('Media uploaded.');
      }
    });

    document.querySelectorAll('.btn-activate-theme').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = e.target.getAttribute('data-theme');
        localStorage.setItem('activeTheme', theme);
        applyGlobalState();
        renderTheme();
        showNotice('New theme activated.');
      });
    });

    // Reset
    document.getElementById('wp-tool-reset').addEventListener('click', () => {
      if (confirm('Are you sure you want to reset EVERYTHING? This will delete all local data.')) {
        localStorage.clear();
        location.reload();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdminUI);
  } else {
    initAdminUI();
  }

})();
