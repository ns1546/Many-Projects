// ====================================
// main.js — All interactive logic
// ====================================

// --- NAVBAR SCROLL ---
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

// --- HAMBURGER ---
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('mobile-open');
    hamburger.classList.toggle('open', open);
  });
}

// --- SERVICE TAB SWITCHING ---
const stabs = document.querySelectorAll('.stab');
const bforms = document.querySelectorAll('.bform');
stabs.forEach(tab => {
  tab.addEventListener('click', () => {
    stabs.forEach(t => t.classList.remove('active'));
    bforms.forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    const form = document.getElementById('form-' + tab.dataset.service);
    if (form) {
      form.classList.add('active');
      form.style.opacity = '0';
      form.style.transform = 'translateY(8px)';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        form.style.transition = 'opacity 0.22s ease,transform 0.22s ease';
        form.style.opacity = '1';
        form.style.transform = 'translateY(0)';
      }));
    }
  });
});

// --- PASSENGER COUNTER + SEAT MATCHING ---
const CAPS = { sedan: 4, suv: 6, microbus: 10, hiace: 12 };

function adj(id, delta) {
  const el = document.getElementById(id);
  if (!el) return;
  let v = Math.max(1, Math.min(30, parseInt(el.textContent) + delta));
  el.textContent = v;
  const svcMap = { 'air-pax': 'airport', 'hr-pax': 'hourly', 'ic-pax': 'intercity', 'tr-pax': 'tour', 'co-pax': 'corporate' };
  const svc = svcMap[id];
  if (svc) seatHint(svc, v);
}

function calcCars(n) {
  const res = [];
  if (n > 6) { const c = Math.floor(n / CAPS.hiace); if (c) { res.push({ t: 'Noah/Hiace', s: CAPS.hiace, c }); n -= c * CAPS.hiace; } }
  if (n > 4) { const c = Math.ceil(n / CAPS.suv); res.push({ t: 'SUV', s: CAPS.suv, c }); n = 0; }
  else if (n > 0) { res.push({ t: 'Sedan', s: CAPS.sedan, c: 1 }); n = 0; }
  return res;
}

function seatHint(svc, pax) {
  const el = document.getElementById('sh-' + svc);
  if (!el) return;
  if (pax <= 4) { el.className = 'seat-hint'; el.textContent = ''; return; }
  const cars = calcCars(pax);
  const total = cars.reduce((s, c) => s + c.c, 0);
  const seats = cars.reduce((s, c) => s + c.c * c.s, 0);
  const detail = cars.map(c => `${c.c}× ${c.t}`).join(' + ');
  el.textContent = `🚗 ${pax} passengers → ${total} vehicle${total > 1 ? 's' : ''}: ${detail} (${seats} seats total)`;
  el.className = 'seat-hint show';
}

// --- BOOKING INITIATION ---
const REQUIRED = {
  airport: ['air-loc', 'air-date', 'air-time'],
  hourly: ['hr-loc', 'hr-start'],
  intercity: ['ic-date'],
  tour: ['tr-dest', 'tr-date'],
  event: ['ev-venue', 'ev-date'],
  corporate: ['co-name', 'co-pick', 'co-drop']
};

function book(svc) {
  let ok = true;
  (REQUIRED[svc] || []).forEach(id => {
    const el = document.getElementById(id);
    if (!el || !el.value.trim()) {
      if (el) {
        el.style.borderColor = '#ef4444';
        el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.12)';
        el.addEventListener('input', () => { el.style.borderColor = ''; el.style.boxShadow = ''; }, { once: true });
        if (ok) el.focus();
      }
      ok = false;
    }
  });
  if (ok) window.location.href = `find-cars.html?service=${svc}`;
}

// --- SERVICE CARD → SCROLL & SELECT ---
function selectService(svc) {
  const console_ = document.getElementById('booking-console');
  if (console_) {
    const top = console_.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
  }
  setTimeout(() => {
    const tab = document.querySelector(`.stab[data-service="${svc}"]`);
    if (tab) tab.click();
  }, 380);
}

// --- AOS (Animate On Scroll) ---
function initAOS() {
  const els = document.querySelectorAll('[data-aos]');
  const observe = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.aosDelay || 0);
        setTimeout(() => e.target.classList.add('aos-animate'), delay);
        observe.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observe.observe(el));
}

// --- PARALLAX ---
const parallaxBg = document.getElementById('parallax-bg');
if (parallaxBg) {
  window.addEventListener('scroll', () => {
    const section = document.getElementById('stats-section');
    if (!section) return;
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      parallaxBg.style.transform = `translateY(${progress * 60 - 30}px)`;
    }
  }, { passive: true });
}

// --- STEP LINE ANIMATION ---
function animateStepLine() {
  const line = document.querySelector('.step-line');
  if (!line) return;
  const observe = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { line.classList.add('visible'); observe.disconnect(); }
  }, { threshold: 0.4 });
  observe.observe(line.parentElement);
}

// --- COUNTER ANIMATION ---
function animateCounters() {
  const nums = document.querySelectorAll('[data-target]');
  const observe = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target);
      const duration = 1800;
      const start = performance.now();
      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(ease * target);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }
      requestAnimationFrame(tick);
      observe.unobserve(el);
    });
  }, { threshold: 0.5 });
  nums.forEach(n => observe.observe(n));
}

// --- EARN BAR ANIMATION ---
function animateEarnBar() {
  const bar = document.querySelector('.eoc-fill');
  if (!bar) return;
  const observe = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { bar.classList.add('animate'); observe.disconnect(); }
  }, { threshold: 0.5 });
  observe.observe(bar);
}

// --- PARTICLE SYSTEM ---
function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const delay = Math.random() * 6;
    const dur = Math.random() * 8 + 6;
    p.style.cssText = `
      position:absolute;
      width:${size}px;height:${size}px;
      border-radius:50%;
      background:rgba(34,197,94,${Math.random() * 0.4 + 0.1});
      left:${x}%;
      bottom:-10px;
      animation:particleRise ${dur}s ${delay}s linear infinite;
    `;
    container.appendChild(p);
  }
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleRise {
      0%{transform:translateY(0) scale(1);opacity:0}
      10%{opacity:1}
      90%{opacity:0.6}
      100%{transform:translateY(-100vh) scale(0.3);opacity:0}
    }
  `;
  document.head.appendChild(style);
}

// --- IMAGE FALLBACKS ---
document.querySelectorAll('img[onerror]').forEach(img => {
  if (!img.complete || img.naturalHeight === 0) img.dispatchEvent(new Event('error'));
});

// --- INIT ALL ---
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  animateCounters();
  animateStepLine();
  animateEarnBar();
  initParticles();
});
