const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function testEveryInteractiveButton() {
  console.log('================================================================');
  console.log('   DEEP HUMAN REAL-LIFE INTERACTION & BUTTON CLICK SIMULATION   ');
  console.log('================================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const files = [
    'index.html',
    'find-cars.html',
    'checkout.html',
    'customer-panel.html',
    'owner-panel.html',
    'owner-register.html',
    'admin-panel.html',
    'login-sliding.html'
  ];

  const issues = [];
  function logDefect(page, element, event, issue) {
    issues.push({ page, element, event, issue });
    console.error(`❌ [${page}] <${element}> [${event}]: ${issue}`);
  }

  for (const file of files) {
    console.log(`\n--- Testing Interactive Elements on ${file} ---`);
    const filePath = path.join(rootDir, file);
    const html = fs.readFileSync(filePath, 'utf8');

    // Create DOM
    const virtualConsole = new (require('jsdom').VirtualConsole)();
    const runtimeErrors = [];
    virtualConsole.on('jsdomError', (err) => {
      // Ignore resource loading errors (external CDNs, network sockets)
      if (!err.message.includes('Could not load script') && !err.message.includes('Not implemented')) {
        runtimeErrors.push(err.message);
      }
    });
    virtualConsole.on('error', (err) => {
      runtimeErrors.push(typeof err === 'string' ? err : (err.message || err.toString()));
    });

    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      url: `http://localhost:3000/${file}`,
      virtualConsole,
      beforeParse(win) {
        win._IS_TEST_ENV = true;
        win.alert = (msg) => { console.log(`   [Alert on ${file}]: ${msg}`); };
        win.confirm = (msg) => true;
        win.prompt = () => '';
        // Mock state & storage
        win.localStorage = {
          _data: {},
          getItem(k) { return this._data[k] || null; },
          setItem(k, v) { this._data[k] = String(v); },
          removeItem(k) { delete this._data[k]; },
          clear() { this._data = {}; }
        };
        // Mock default authenticated session
        if (file === 'customer-panel.html') {
          win.rownaaSession = { id: 'cust-101', name: 'Tanvir Hossain', role: 'customer', phone: '+8801712345678' };
        } else if (file === 'owner-panel.html') {
          win.rownaaSession = { id: 'partner-202', name: 'Habib Enterprise', role: 'owner', phone: '+8801812345678' };
        } else if (file === 'admin-panel.html') {
          win.rownaaSession = { id: 'adm-1', name: 'System Admin', role: 'admin' };
        }
      }
    });

    const win = dom.window;
    const doc = win.document;

    // Check runtime errors during initial load
    if (runtimeErrors.length > 0) {
      runtimeErrors.forEach(err => logDefect(file, 'PAGE_LOAD', 'initialization', err));
    }

    // 1. Find all elements with onclick
    const onclickElements = Array.from(doc.querySelectorAll('[onclick]'));
    console.log(`Found ${onclickElements.length} elements with inline onclick.`);

    for (let i = 0; i < onclickElements.length; i++) {
      const el = onclickElements[i];
      const code = el.getAttribute('onclick') || '';
      const tag = el.tagName.toLowerCase();
      const idOrClass = el.id ? `#${el.id}` : (el.className ? `.${el.className.split(' ')[0]}` : tag);
      const label = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);

      // Try triggering click
      try {
        el.click();
      } catch (err) {
        logDefect(file, `${tag}${idOrClass} ("${label}")`, 'click()', `Exception when clicked: ${err.message}`);
      }
    }

    // 2. Find all <button> and <a> without onclick
    const otherButtons = Array.from(doc.querySelectorAll('button:not([onclick]), a:not([onclick])'));
    for (const btn of otherButtons) {
      const tag = btn.tagName.toLowerCase();
      const href = btn.getAttribute('href');
      const type = btn.getAttribute('type');
      const label = (btn.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30);

      if (tag === 'a' && href === '#') {
        logDefect(file, `a ("${label}")`, 'navigation', 'Dead anchor href="#" with no onclick handler!');
      }

      if (tag === 'button' && (!type || type === 'button') && !btn.onclick) {
        // Check if there are attached addEventListener or if it's dead
        // In JSDOM, let's see if clicking does anything or if it has form action
        const form = btn.closest('form');
        if (!form) {
          // If not in a form and no onclick, it might be unhandled
          // check if id exists and has listener in script
          if (btn.id) {
            const hasIdInScript = html.includes(btn.id);
            if (!hasIdInScript) {
              logDefect(file, `button#${btn.id} ("${label}")`, 'interaction', 'Button has no onclick, no form, and ID is not referenced in scripts.');
            }
          }
        }
      }
    }

    // 3. Find all <form> and test submission
    const forms = Array.from(doc.querySelectorAll('form'));
    for (const form of forms) {
      const id = form.id ? `#${form.id}` : 'form';
      try {
        const submitEvent = new win.Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
      } catch (err) {
        logDefect(file, `form${id}`, 'submit', `Exception on form submit: ${err.message}`);
      }
    }

    // 4. Find all <select> and test onchange
    const selects = Array.from(doc.querySelectorAll('select[onchange]'));
    for (const sel of selects) {
      const id = sel.id ? `#${sel.id}` : 'select';
      try {
        if (sel.options && sel.options.length > 1) {
          sel.selectedIndex = 1;
        }
        const changeEvent = new win.Event('change', { bubbles: true });
        sel.dispatchEvent(changeEvent);
      } catch (err) {
        logDefect(file, `select${id}`, 'change', `Exception on select change: ${err.message}`);
      }
    }
  }

  console.log(`\n================================================================`);
  console.log(`   SIMULATION FINISHED: Total Defects Logged: ${issues.length}   `);
  console.log(`================================================================`);

  setTimeout(() => {
    process.exit(issues.length === 0 ? 0 : 1);
  }, 300);

  return issues;
}

testEveryInteractiveButton().catch(err => {
  console.error('Fatal Test Runner Failure:', err);
  process.exit(1);
});
