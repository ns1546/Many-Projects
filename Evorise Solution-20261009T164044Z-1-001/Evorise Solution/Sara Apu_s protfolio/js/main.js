/* Sumaiya Sara portfolio - interactions */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  document.documentElement.classList.add('js');

  /* ---------- Footer year ---------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Hero photo fallback ---------- */
  ['heroPhoto', 'whyPhoto'].forEach(function (id) {
    var img = document.getElementById(id);
    if (!img) return;
    img.addEventListener('error', function onErr() {
      img.removeEventListener('error', onErr);
      img.classList.add('is-photo');
      img.src = 'assets/hero.jpg';
    });
  });

  /* ---------- Sticky header shadow ---------- */
  var header = $('#siteHeader');
  function onScroll() { if (header) header.classList.toggle('is-stuck', window.scrollY > 10); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav with Backdrop (Audit Item 2) ---------- */
  var toggle = $('#navToggle');
  var links = $('#navLinks');
  var backdrop = $('.nav-backdrop');

  if (!backdrop && links) {
    backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);
  }

  function setMenu(open) {
    if (!links || !toggle) return;
    links.classList.toggle('open', open);
    if (backdrop) backdrop.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    var use = toggle.querySelector('use');
    if (use) use.setAttribute('href', open ? '#i-close' : '#i-menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (toggle) toggle.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });
  if (links) {
    $$('a', links).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  }

  /* ---------- Active nav link on scroll ---------- */
  var sectionIds = ['home', 'services', 'experience', 'portfolio', 'results', 'blog'];
  var navAnchors = {};
  if (links) {
    $$('a[href^="#"]', links).forEach(function (a) { navAnchors[a.getAttribute('href').slice(1)] = a; });
  }
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && navAnchors[e.target.id]) {
          Object.keys(navAnchors).forEach(function (k) { navAnchors[k].classList.remove('is-active'); });
          navAnchors[e.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sectionIds.forEach(function (id) { var el = document.getElementById(id); if (el) spy.observe(el); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 90 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Services: hovered / focused card turns orange ---------- */
  var cards = $$('.svc-card');
  function activate(card) {
    cards.forEach(function (c) { c.classList.toggle('is-active', c === card); });
  }
  if (cards.length) {
    activate(cards[1] || cards[0]);
    cards.forEach(function (c) {
      c.addEventListener('mouseenter', function () { activate(c); });
      c.addEventListener('focusin', function () { activate(c); });
    });
  }

  /* ---------- Swipe helper ---------- */
  function swipe(el, onLeft, onRight) {
    if (!el) return;
    var x0 = null;
    el.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    el.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) { dx < 0 ? onLeft() : onRight(); }
    });
    el.addEventListener('pointercancel', function () { x0 = null; });
  }

  /* ---------- Portfolio carousel ---------- */
  var pfTrack = $('#pfTrack');
  var pfSlides = $$('.pf-slide', pfTrack);
  var pfIndex = 0;
  var pfTitle = $('#pfTitle');
  var pfDesc = $('#pfDesc');
  var pfTags = $('#pfTags');
  function decode(s) { var t = document.createElement('textarea'); t.innerHTML = s; return t.value; }
  function pfGo(i) {
    if (!pfTrack || !pfSlides.length) return;
    pfIndex = (i + pfSlides.length) % pfSlides.length;
    pfTrack.style.transform = 'translateX(' + (-pfIndex * 100) + '%)';
    var s = pfSlides[pfIndex];
    if (pfTitle) pfTitle.textContent = decode(s.getAttribute('data-title'));
    if (pfDesc) pfDesc.textContent = decode(s.getAttribute('data-desc'));
    if (pfTags) {
      pfTags.innerHTML = '';
      s.getAttribute('data-tags').split('|').forEach(function (t) {
        var li = document.createElement('li'); li.textContent = t; pfTags.appendChild(li);
      });
    }
    pfSlides.forEach(function (sl, k) { sl.setAttribute('aria-hidden', k === pfIndex ? 'false' : 'true'); });
  }
  if (pfSlides.length) {
    var pfPrev = $('#pfPrev');
    var pfNext = $('#pfNext');
    if (pfPrev) pfPrev.addEventListener('click', function () { pfGo(pfIndex - 1); });
    if (pfNext) pfNext.addEventListener('click', function () { pfGo(pfIndex + 1); });
    swipe($('#pfCarousel'), function () { pfGo(pfIndex + 1); }, function () { pfGo(pfIndex - 1); });
    pfGo(0);
  }

  /* ---------- Results slider with Dots & Auto-Carousel (Audit Item 4) ---------- */
  var tTrack = $('#tTrack');
  var tCards = $$('.t-card', tTrack);
  var tCarousel = $('#tCarousel');
  var tIndex = 2;
  var tTimer = null;

  // Create dot indicators dynamically
  var tDotsWrap = null;
  if (tCarousel && tCards.length) {
    tDotsWrap = document.createElement('div');
    tDotsWrap.className = 't-dots';
    tDotsWrap.id = 'tDots';
    tCards.forEach(function (_, idx) {
      var dot = document.createElement('button');
      dot.className = 't-dot' + (idx === tIndex ? ' is-active' : '');
      dot.setAttribute('aria-label', 'Go to result slide ' + (idx + 1));
      dot.addEventListener('click', function () { tGo(idx); tAuto(); });
      tDotsWrap.appendChild(dot);
    });
    var tControls = $('.t-controls', tCarousel);
    if (tControls) tControls.before(tDotsWrap);
    else tCarousel.appendChild(tDotsWrap);
  }

  function tLayout() {
    if (!tCards.length || !tTrack) return;
    var vw = tTrack.parentElement.clientWidth;
    var c = tCards[tIndex];
    if (!c) return;
    var offset = vw / 2 - (c.offsetLeft + c.offsetWidth / 2);
    tTrack.style.transform = 'translateX(' + offset + 'px)';
    tCards.forEach(function (card, k) { card.classList.toggle('is-active', k === tIndex); });

    // Update dots
    if (tDotsWrap) {
      $$('.t-dot', tDotsWrap).forEach(function (dot, k) {
        dot.classList.toggle('is-active', k === tIndex);
      });
    }
  }

  function tGo(i) {
    if (!tCards.length) return;
    tIndex = (i + tCards.length) % tCards.length;
    tLayout();
  }

  function tAuto() {
    clearInterval(tTimer);
    tTimer = setInterval(function () { tGo(tIndex + 1); }, 5000);
  }

  if (tCards.length) {
    var tPrev = $('#tPrev');
    var tNext = $('#tNext');
    if (tPrev) tPrev.addEventListener('click', function () { tGo(tIndex - 1); tAuto(); });
    if (tNext) tNext.addEventListener('click', function () { tGo(tIndex + 1); tAuto(); });
    tCards.forEach(function (c, k) { c.addEventListener('click', function () { if (k !== tIndex) { tGo(k); tAuto(); } }); });
    swipe(tCarousel, function () { tGo(tIndex + 1); tAuto(); }, function () { tGo(tIndex - 1); tAuto(); });
    if (tCarousel) {
      tCarousel.addEventListener('mouseenter', function () { clearInterval(tTimer); });
      tCarousel.addEventListener('mouseleave', tAuto);
    }
    window.addEventListener('resize', tLayout);
    window.addEventListener('load', tLayout);
    tLayout();
    tAuto();
  }

  /* ---------- Case Study Overlay Modal (Audit Item 3) ---------- */
  var caseStudyData = {
    1: {
      tag: "E-Commerce Ads & Scaling",
      title: "E-Commerce Brand Scaling: 8.87x ROAS Lift",
      stat1: "8.87×", lbl1: "Return On Ad Spend",
      stat2: "$1.00", lbl2: "Cost Per Purchase",
      stat3: "$1.85M+", lbl3: "Tracked Revenue",
      desc: "Comprehensive restructuring of paid acquisition funnels across Meta & Google Ads. Re-engineered creative angles, introduced dynamic catalog retargeting, and optimized daily ad sets to scale spend from $5,000/mo to $45,000/mo while maintaining an exceptional 8.87x ROAS.",
      deliverables: [
        "TOFU / MOFU / BOFU Audience Funnel Segmentation",
        "Meta Pixel & Server-Side GTM Conversions API Integration",
        "A/B Testing of Video Creatives & Hook Rates",
        "Daily CPA & Budget Capping Automation"
      ]
    },
    2: {
      tag: "Tracking & Analytics",
      title: "Server-Side GTM & CAPI: 99.8% Data Accuracy",
      stat1: "+38%", lbl1: "Recaptured Sales",
      stat2: "99.8%", lbl2: "Attribution Accuracy",
      stat3: "9.4/10", lbl3: "Event Match Quality",
      desc: "Deployed Google Tag Manager Server Container using Stape.io & Meta Conversions API (CAPI). Implemented event deduplication with unique Event IDs across Purchase, AddToCart, and InitiateCheckout touchpoints, successfully bypassing iOS 14.5+ tracking blockades.",
      deliverables: [
        "Google Tag Manager Server-Side Container Configuration",
        "Meta Conversions API (CAPI) & Stape.io Setup",
        "Event Deduplication via Unique Event IDs",
        "First-Party Cookie Lifetime Extension"
      ]
    },
    3: {
      tag: "Google Search & Lead Gen",
      title: "High-Intent B2B Lead Gen: -62% Cost Per Lead",
      stat1: "-62%", lbl1: "Lower Acquisition Cost",
      stat2: "$0.07", lbl2: "Cost / Messaging Conv.",
      stat3: "58%", lbl3: "Interaction Rate",
      desc: "Designed laser-targeted Google Search & Messaging ad campaigns for high-ticket B2B service inquiries. Built negative keyword lists, optimized landing page CRO, and set up WhatsApp lead routing, driving 910 qualified inquiries at $0.07 per message.",
      deliverables: [
        "Google Search Campaign Architecture & Match Types",
        "Negative Keyword Exclusion & Quality Score Optimization",
        "WhatsApp & Direct Message Lead Conversion Setup",
        "Ad Copy & CTR A/B Testing"
      ]
    },
    4: {
      tag: "Local SEO & Geo-Targeting",
      title: "Local Business Search Growth: +480% Phone Calls",
      stat1: "4.8×", lbl1: "Inbound Call Volume",
      stat2: "#1 Rank", lbl2: "Google Map Pack Position",
      stat3: "100%", lbl3: "Verified GBP Optimization",
      desc: "Optimized Google Business Profile (GBP), NAP citation consistency, localized schema markup, and geo-targeted review generation for a multi-location service client, establishing top #1 ranking across local search map packs.",
      deliverables: [
        "Google Business Profile (GBP) Full Audit & Optimization",
        "Local NAP Citation Building & Consistency Audit",
        "Geo-Targeted Review Collection Protocol",
        "Localized Structured Schema Data Implementation"
      ]
    }
  };

  var caseModal = $('#caseModal');
  var caseModalBody = $('#caseModalBody');
  var caseModalClose = $('#caseModalClose');
  var caseModalBackdrop = $('#caseModalBackdrop');

  function openCaseModal(cardId) {
    var data = caseStudyData[cardId] || caseStudyData[1];
    if (!caseModal || !caseModalBody) return;

    var listHtml = data.deliverables.map(function (item) {
      return '<li><svg class="ico"><use href="#i-check"/></svg> ' + item + '</li>';
    }).join('');

    caseModalBody.innerHTML =
      '<span class="case-modal-tag">' + data.tag + '</span>' +
      '<h2 class="case-modal-title" id="caseModalTitle">' + data.title + '</h2>' +
      '<div class="case-modal-grid">' +
        '<div class="case-modal-stat"><strong>' + data.stat1 + '</strong><span>' + data.lbl1 + '</span></div>' +
        '<div class="case-modal-stat"><strong>' + data.stat2 + '</strong><span>' + data.lbl2 + '</span></div>' +
        '<div class="case-modal-stat"><strong>' + data.stat3 + '</strong><span>' + data.lbl3 + '</span></div>' +
      '</div>' +
      '<p class="case-modal-desc">' + data.desc + '</p>' +
      '<h4 style="font-size:1.15rem; color:#fff; margin-bottom:.8rem; font-weight:600;">Key Engineering Deliverables:</h4>' +
      '<ul class="case-modal-list">' + listHtml + '</ul>' +
      '<div style="text-align:right; margin-top:1.5rem;">' +
        '<a href="contact.html" class="btn btn-primary">Book Consultation <svg class="ico"><use href="#i-arrow-ur"/></svg></a>' +
      '</div>';

    caseModal.classList.add('is-open');
    caseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeCaseModal() {
    if (!caseModal) return;
    caseModal.classList.remove('is-open');
    caseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (caseModalClose) caseModalClose.addEventListener('click', closeCaseModal);
  if (caseModalBackdrop) caseModalBackdrop.addEventListener('click', closeCaseModal);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && caseModal && caseModal.classList.contains('is-open')) {
      closeCaseModal();
    }
  });

  // Attach modal trigger listeners
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-case-id]');
    if (trigger) {
      e.preventDefault();
      var cardId = trigger.getAttribute('data-case-id');
      openCaseModal(cardId);
    }
  });

  /* ---------- Forms ---------- */
  var EMAIL = 'sumaiyasara230@gmail.com';
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  var ctaForm = $('#ctaForm');
  if (ctaForm) {
    ctaForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#ctaEmail').value.trim();
      var msg = $('#ctaMsg');
      if (!validEmail(v)) { msg.textContent = 'Please enter a valid email address.'; $('#ctaEmail').focus(); return; }
      msg.textContent = 'Opening your email app to book a call with Sumaiya…';
      var subject = encodeURIComponent('Book a call with Sumaiya Sara');
      var body = encodeURIComponent('Hi Sumaiya,\n\nI would like to book a call about my project.\n\nMy email: ' + v + '\n');
      window.location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + body;
    });
  }

  var newsForm = $('#newsForm');
  if (newsForm) {
    newsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('#newsEmail').value.trim();
      var msg = $('#newsMsg');
      if (!validEmail(v)) { msg.textContent = 'Please enter a valid email address.'; return; }
      msg.textContent = 'Opening your email app to subscribe…';
      var subject = encodeURIComponent('Subscribe me to Sumaiya Sara’s updates');
      var body = encodeURIComponent('Please add this email to your updates list: ' + v);
      window.location.href = 'mailto:' + EMAIL + '?subject=' + subject + '&body=' + body;
    });
  }
  /* ---------- Image Modal for Gallery / Proof of Work (Item 3) ---------- */
  var imgModal = $('#imgModal');
  var imgModalTarget = $('#imgModalTarget');
  var imgModalClose = $('#imgModalClose');
  var imgModalBackdrop = $('#imgModalBackdrop');

  function openImgModal(src) {
    if (!imgModal || !imgModalTarget) return;
    imgModalTarget.src = src;
    imgModal.classList.add('is-open');
    imgModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeImgModal() {
    if (!imgModal) return;
    imgModal.classList.remove('is-open');
    imgModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (imgModalClose) imgModalClose.addEventListener('click', closeImgModal);
  if (imgModalBackdrop) imgModalBackdrop.addEventListener('click', closeImgModal);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && imgModal && imgModal.classList.contains('is-open')) closeImgModal();
  });

  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('pow-img') || e.target.classList.contains('shot-img')) {
      openImgModal(e.target.src);
    }
  });

})();
