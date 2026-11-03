// =========================================================
// ROWNAA APP JS — Interactions & Animations
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initParallax();
  initReveal();
  initBookingConsole();
  // initCounter();
  initNumbers();
});

// --- NAV HIDE ON SCROLL & BACKGROUND ---
function initNav() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  
  const burger = document.getElementById('nav-burger');
  const navCenter = document.getElementById('nav-center');
  if (burger && navCenter) {
    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      burger.classList.toggle('active');
      navCenter.classList.toggle('active');
    });
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target)) {
        burger.classList.remove('active');
        navCenter.classList.remove('active');
      }
    });
  }

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Background blur
    if (currentScroll > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    
    // Hide/show on scroll direction
    if (currentScroll > lastScroll && currentScroll > 200) {
      nav.classList.add('hidden');
    } else {
      nav.classList.remove('hidden');
    }
    lastScroll = currentScroll;
  }, { passive: true });
}

// --- PARALLAX EFFECTS ---
function initParallax() {
  const img = document.getElementById('hero-parallax-img');
  const hdLines = document.querySelectorAll('.hd-line');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    if (scrollY > window.innerHeight) return; // Stop calculating if out of view
    
    if (img) img.style.transform = `translateY(${scrollY * 0.4}px)`;
    
    hdLines.forEach(line => {
      const speed = parseFloat(line.dataset.speed || 0.1);
      line.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });
}

// --- REVEAL ON SCROLL ---
function initReveal() {
  const reveals = document.querySelectorAll('[data-reveal]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  
  reveals.forEach(el => observer.observe(el));
}

// --- NUMBER ANIMATION ---
function initNumbers() {
  const nums = document.querySelectorAll('.tsp-num');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const isFloat = target % 1 !== 0;
        const duration = 2000;
        const start = performance.now();
        
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 4); // Quartic ease out
          const val = ease * target;
          
          el.textContent = isFloat ? val.toFixed(1) : Math.floor(val);
          
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        
        requestAnimationFrame(tick);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  
  nums.forEach(num => observer.observe(num));
}

// --- BOOKING CONSOLE ---
function initBookingConsole() {
  const tabs = document.querySelectorAll('.bs-tab');
  const forms = document.querySelectorAll('.bs-form');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.remove('active'));
      
      tab.classList.add('active');
      const target = document.getElementById('bsf-' + tab.dataset.svc);
      if (target) target.classList.add('active');
    });
  });
}

// --- COUNTERS & SEAT LOGIC ---
const CAPS = { sedan: 4, suv: 6, microbus: 10, hiace: 12 };

window.cnt = function(id, delta) {
  const el = document.getElementById(id);
  if (!el) return;
  let val = Math.max(1, Math.min(30, parseInt(el.textContent) + delta));
  el.textContent = val;
  
  const map = { 'af-pax': 'airport', 'hf-pax': 'hourly', 'ic-pax': 'intercity', 'tf-pax': 'tour', 'cf-pax': 'corporate' };
  const svc = map[id];
  if (svc) updateSeats(svc, val);
}

function updateSeats(svc, pax) {
  const msg = document.getElementById('sm-' + svc);
  if (!msg) return;
  if (pax <= 4) { msg.classList.remove('show'); return; }
  
  let rem = pax;
  let res = [];
  if (rem > 6) { const c = Math.floor(rem / CAPS.hiace); if(c>0){ res.push(`${c}x Noah/Hiace`); rem -= c*CAPS.hiace; } }
  if (rem > 4) { const c = Math.ceil(rem / CAPS.suv); res.push(`${c}x SUV`); rem = 0; }
  else if (rem > 0) { res.push(`1x Sedan`); rem = 0; }
  
  msg.textContent = `Requires: ${res.join(' + ')}`;
  msg.classList.add('show');
}

window.goBook = function(svc) {
  let valid = true;
  const form = document.getElementById('bsf-' + svc);
  let loc = '';
  let date = '';
  let time = '';
  let pax = '1';

  if (form) {
    const inputs = form.querySelectorAll('input[type="text"]');
    inputs.forEach(i => {
      if (!i.value.trim()) {
        i.style.borderColor = 'var(--accent)';
        valid = false;
      } else {
        i.style.borderColor = '';
      }
    });

    if (svc === 'airport') {
      loc = document.getElementById('af-loc')?.value || '';
      date = document.getElementById('af-date')?.value || '';
      time = document.getElementById('af-time')?.value || '';
      pax = document.getElementById('af-pax')?.textContent || '1';
    } else if (svc === 'hourly') {
      loc = document.getElementById('hf-loc')?.value || '';
      const dt = document.getElementById('hf-start')?.value || '';
      if (dt) {
        const parts = dt.split('T');
        date = parts[0] || '';
        time = parts[1] || '';
      }
      pax = document.getElementById('hf-pax')?.textContent || '1';
    } else if (svc === 'intercity') {
      const from = document.getElementById('ic-from')?.value || 'Dhaka';
      const to = document.getElementById('ic-to')?.value || 'Chittagong';
      loc = `${from} to ${to}`;
      date = document.getElementById('ic-date')?.value || '';
      pax = document.getElementById('ic-pax')?.textContent || '1';
    } else if (svc === 'tour') {
      loc = document.getElementById('tf-dest')?.value || '';
      date = document.getElementById('tf-date')?.value || '';
      pax = document.getElementById('tf-pax')?.textContent || '1';
    } else if (svc === 'event') {
      loc = document.getElementById('ef-venue')?.value || '';
      date = document.getElementById('ef-date')?.value || '';
      pax = document.getElementById('ef-cars')?.textContent || '1';
    } else if (svc === 'corporate') {
      const pick = document.getElementById('cf-pick')?.value || '';
      const drop = document.getElementById('cf-drop')?.value || '';
      loc = pick && drop ? `${pick} to ${drop}` : (pick || drop);
      pax = document.getElementById('cf-pax')?.textContent || '1';
    }
  }

  if (valid) {
    let url = `find-cars.html?service=${encodeURIComponent(svc)}`;
    if (loc) url += `&location=${encodeURIComponent(loc)}`;
    if (date) url += `&date=${encodeURIComponent(date)}`;
    if (time) url += `&time=${encodeURIComponent(time)}`;
    if (pax) url += `&pax=${encodeURIComponent(pax)}`;
    window.location.href = url;
  } else {
    const invalidInput = form ? form.querySelector('input[type="text"][style*="var(--accent)"]') : null;
    if (invalidInput) {
      invalidInput.focus();
    }
  }
}

window.selectSvc = function(svc) {
  const section = document.getElementById('booking-section');
  if (section) {
    const top = section.getBoundingClientRect().top + window.pageYOffset - 100;
    window.scrollTo({ top, behavior: 'smooth' });
  }
  setTimeout(() => {
    const tab = document.querySelector(`.bs-tab[data-svc="${svc}"]`);
    if (tab) tab.click();
  }, 400);
}

// =========================================================
// CINEMATIC PHYSICS ENGINE (Phase 6 Upgrade)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initCursorLight();
  initMagneticElements();
  init3DTilt();
  initMaskReveals();
});

// --- CURSOR LIGHT TRACKING ---
function initCursorLight() {
  const cursor = document.getElementById('cursor-light');
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  
  // Smooth follow using linear interpolation
  function loop() {
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    cursor.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
    requestAnimationFrame(loop);
  }
  
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  loop();
}

// --- MAGNETIC HOVER PHYSICS ---
function initMagneticElements() {
  const magnetics = document.querySelectorAll('.magnetic');
  
  magnetics.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const h = rect.width / 2;
      const w = rect.height / 2;
      const x = e.clientX - rect.left - h;
      const y = e.clientY - rect.top - w;
      
      // Pull element towards mouse
      btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0px, 0px)`;
    });
  });
}

// --- 3D TILT PHYSICS (For Owner Section) ---
function init3DTilt() {
  const containers = document.querySelectorAll('.tilt-container');
  
  containers.forEach(container => {
    const el = container.querySelector('.tilt-element');
    if(!el) return;
    
    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate rotation based on mouse position relative to center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
      const rotateY = ((x - centerX) / centerX) * 10;
      
      el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });
    
    container.addEventListener('mouseleave', () => {
      el.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    });
  });
}

// --- CINEMATIC MASK REVEALS ---
function initMaskReveals() {
  const reveals = document.querySelectorAll('.mask-reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px" });
  
  reveals.forEach(el => observer.observe(el));
}
