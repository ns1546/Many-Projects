const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

async function testHumanJourneys() {
  console.log('=== RIGOROUS HUMAN PATHWAY & CROSS-PAGE AUDIT ===\n');
  const issues = [];

  function reportIssue(severity, page, flow, description) {
    issues.push({ severity, page, flow, description });
    console.log(`[${severity}] [${page}] [${flow}]: ${description}`);
  }

  // Read all HTML files
  const pages = {
    index: fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8'),
    findCars: fs.readFileSync(path.join(__dirname, '../find-cars.html'), 'utf8'),
    checkout: fs.readFileSync(path.join(__dirname, '../checkout.html'), 'utf8'),
    customerPanel: fs.readFileSync(path.join(__dirname, '../customer-panel.html'), 'utf8'),
    ownerPanel: fs.readFileSync(path.join(__dirname, '../owner-panel.html'), 'utf8'),
    ownerRegister: fs.readFileSync(path.join(__dirname, '../owner-register.html'), 'utf8'),
    adminPanel: fs.readFileSync(path.join(__dirname, '../admin-panel.html'), 'utf8'),
    loginSliding: fs.readFileSync(path.join(__dirname, '../login-sliding.html'), 'utf8'),
    login: fs.readFileSync(path.join(__dirname, '../login.html'), 'utf8'),
    register: fs.readFileSync(path.join(__dirname, '../register.html'), 'utf8'),
    invoice: fs.readFileSync(path.join(__dirname, '../invoice.html'), 'utf8')
  };

  // --------------------------------------------------------------------------
  // FLOW 1: Landing Page (index.html) -> Navigation, Search, Fleet & Booking links
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Flow 1: index.html Navigation & Booking Entry Points ---');
  const indexDom = new JSDOM(pages.index);
  const indexDoc = indexDom.window.document;

  // Check all buttons and links in index.html
  const indexLinks = Array.from(indexDoc.querySelectorAll('a, button'));
  indexLinks.forEach(el => {
    const href = el.getAttribute('href');
    const onclick = el.getAttribute('onclick');
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    
    // Check for broken links
    if (href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
      const cleanHref = href.split('?')[0].split('#')[0];
      const targetFile = path.join(__dirname, '../', cleanHref);
      if (!fs.existsSync(targetFile)) {
        reportIssue('CRITICAL', 'index.html', 'Navigation', `Dead link href="${href}" on element "${text}" - file does not exist!`);
      }
    }
  });

  // Check Booking Widget on index.html: Does it transition to find-cars or checkout?
  const searchBtn = indexDoc.querySelector('.search-btn, .btn-hero, #btn-search-cars, button[type="submit"]');
  console.log('Search/Hero action in index.html:', searchBtn ? searchBtn.outerHTML.slice(0, 100) : 'None found');

  // --------------------------------------------------------------------------
  // FLOW 2: Fleet Discovery (find-cars.html) -> Checkout Handoff
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Flow 2: find-cars.html -> checkout.html Parameter Handoff ---');
  const findCarsDom = new JSDOM(pages.findCars);
  const findCarsDoc = findCarsDom.window.document;
  
  // Check how find-cars.html links to checkout.html
  const fcScripts = pages.findCars;
  if (!fcScripts.includes('checkout.html')) {
    reportIssue('HIGH', 'find-cars.html', 'Checkout Handoff', 'find-cars.html does not contain references or links to checkout.html!');
  } else {
    // Check what query params find-cars passes to checkout
    console.log('Checking checkout URL formation in find-cars.html...');
    const match = fcScripts.match(/checkout\.html[^\s'"`]*/g);
    console.log('Found checkout references:', match);
  }

  // --------------------------------------------------------------------------
  // FLOW 3: checkout.html Receiving Vehicle & URL Params
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Flow 3: checkout.html Parameter Ingestion ---');
  const coScripts = pages.checkout;
  if (!coScripts.includes('URLSearchParams')) {
    reportIssue('HIGH', 'checkout.html', 'Param Ingestion', 'checkout.html does not parse URLSearchParams to read selected car or service!');
  } else {
    console.log('checkout.html parses URLSearchParams: YES');
  }

  // --------------------------------------------------------------------------
  // FLOW 4: Authentication & Redirect Loop
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Flow 4: Login Redirect Paths ---');
  const loginSlidingScripts = pages.loginSliding;
  if (loginSlidingScripts.includes('redirect')) {
    console.log('login-sliding.html supports ?redirect= parameter: YES');
  } else {
    reportIssue('HIGH', 'login-sliding.html', 'Auth Redirect', 'login-sliding.html does not honor ?redirect= parameter after login!');
  }

  // Check where customer login redirects by default
  const custRedirectMatch = loginSlidingScripts.match(/customer-panel\.html|customer/g);
  console.log('Customer panel references in login-sliding.html:', custRedirectMatch ? custRedirectMatch.length : 0);

  // --------------------------------------------------------------------------
  // FLOW 5: Customer Panel Navigation & Bookings Sync
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Flow 5: customer-panel.html Tab Transitions & Storage ---');
  const custDom = new JSDOM(pages.customerPanel);
  const custDoc = custDom.window.document;
  
  // Check all sidebar nav items
  const custNavs = Array.from(custDoc.querySelectorAll('.sidebar .nav-item, .mobile-nav .mn-item'));
  custNavs.forEach(nav => {
    const onclick = nav.getAttribute('onclick') || '';
    const href = nav.getAttribute('href') || '';
    const text = nav.textContent.trim().replace(/\s+/g, ' ');
    if (href === '#' && !onclick) {
      reportIssue('MEDIUM', 'customer-panel.html', 'Sidebar Navigation', `Dead nav link with no onclick: "${text}"`);
    }
  });

  // Check if invoice link in customer-panel actually exists or works
  const invoiceLink = custDoc.querySelector('a[href*="invoice"], [onclick*="invoice"]');
  console.log('Invoice link in customer-panel:', invoiceLink ? invoiceLink.outerHTML.slice(0, 120) : 'None found');

  // --------------------------------------------------------------------------
  // FLOW 6: Owner Panel & Owner Register Flow
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Flow 6: owner-register.html & owner-panel.html ---');
  const ownerRegScripts = pages.ownerRegister;
  if (!ownerRegScripts.includes('owner-panel.html')) {
    reportIssue('HIGH', 'owner-register.html', 'Partner Onboarding', 'owner-register.html does not redirect to owner-panel.html after successful registration!');
  } else {
    console.log('owner-register.html redirects to owner-panel.html: YES');
  }

  // Check owner panel adding vehicle
  const ownerDoc = (new JSDOM(pages.ownerPanel)).window.document;
  const addVehBtn = ownerDoc.querySelector('#btn-add-vehicle, button[onclick*="Vehicle"], button[onclick*="vehicle"]');
  console.log('Add vehicle button in owner-panel:', addVehBtn ? addVehBtn.outerHTML.slice(0, 100) : 'None');

  // --------------------------------------------------------------------------
  // FLOW 7: Admin Panel Actions
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Flow 7: admin-panel.html Control & Pricing Sync ---');
  const adminDoc = (new JSDOM(pages.adminPanel)).window.document;
  const adminNavs = Array.from(adminDoc.querySelectorAll('.nav-item'));
  console.log(`admin-panel.html has ${adminNavs.length} navigation tabs.`);

  // --------------------------------------------------------------------------
  // FLOW 8: JavaScript Errors & Unhandled References across ALL pages
  // --------------------------------------------------------------------------
  console.log('\n--- Checking Flow 8: Script Consistency & Module Loading Across All Pages ---');
  Object.entries(pages).forEach(([name, content]) => {
    // Check if script imports exist in workspace
    const scriptSrcs = Array.from(content.matchAll(/<script[^>]+src=["']([^"']+)["']/g)).map(m => m[1]);
    scriptSrcs.forEach(src => {
      if (!src.startsWith('http') && !src.startsWith('//') && !src.startsWith('/socket.io')) {
        const scriptFile = path.join(__dirname, '../', src.startsWith('/') ? src.slice(1) : src);
        if (!fs.existsSync(scriptFile)) {
          reportIssue('CRITICAL', `${name}.html`, 'Script Import', `Missing script file "${src}"!`);
        }
      }
    });

    // Check if css links exist in workspace
    const cssHrefs = Array.from(content.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/g)).map(m => m[1]);
    cssHrefs.forEach(href => {
      if (!href.startsWith('http') && !href.startsWith('//')) {
        const cssFile = path.join(__dirname, '../', href.startsWith('/') ? href.slice(1) : href);
        if (!fs.existsSync(cssFile)) {
          reportIssue('HIGH', `${name}.html`, 'CSS Link', `Missing stylesheet "${href}"!`);
        }
      }
    });
  });

  console.log(`\nAudit completed: Found ${issues.length} systemic issues.`);
  return issues;
}

testHumanJourneys().catch(err => {
  console.error('Audit Script Failed:', err);
});

