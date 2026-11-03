/* ============================================
   ROWNAA — main.js
   All interactive logic. No demo functions.
   Every function maps to real state / API intent.
   ============================================ */

// ============ NAVBAR SCROLL EFFECT ============
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ============ SERVICE TAB SWITCHING ============
const serviceTabs = document.querySelectorAll('.service-tab');
const bookingForms = document.querySelectorAll('.booking-form');

serviceTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetService = tab.dataset.service;

    // Remove active from all tabs
    serviceTabs.forEach(t => t.classList.remove('active'));
    // Remove active from all forms
    bookingForms.forEach(f => f.classList.remove('active'));

    // Activate clicked tab
    tab.classList.add('active');
    // Activate corresponding form
    const targetForm = document.getElementById('form-' + targetService);
    if (targetForm) {
      targetForm.classList.add('active');
      // Animate form in
      targetForm.style.opacity = '0';
      targetForm.style.transform = 'translateY(6px)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          targetForm.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
          targetForm.style.opacity = '1';
          targetForm.style.transform = 'translateY(0)';
        });
      });
    }
  });
});

// ============ COUNTER LOGIC WITH SEAT MATCHING ============
// Seat capacity data per car type
const CAR_CAPACITY = {
  sedan: 4,
  suv: 6,
  microbus: 10,
  hiace: 12
};

/**
 * Adjusts a counter's value.
 * @param {string} counterId - The ID of the counter value element
 * @param {number} delta - +1 or -1
 */
function adjustCount(counterId, delta) {
  const el = document.getElementById(counterId);
  if (!el) return;
  let current = parseInt(el.textContent, 10);
  current = Math.max(1, Math.min(30, current + delta));
  el.textContent = current;

  // Derive which service this counter belongs to
  const serviceMap = {
    'airport-count': 'airport',
    'hourly-count': 'hourly',
    'intercity-count': 'intercity',
    'tour-count': 'tour',
    'corp-count': 'corporate'
  };

  const service = serviceMap[counterId];
  if (service) {
    updateSeatHint(service, current);
  }
}

/**
 * Calculates the optimal car combination for given passenger count.
 * Returns { cars: [{type, count}], totalSeats }
 */
function calculateRequiredCars(passengerCount) {
  if (passengerCount <= 0) return { cars: [], totalSeats: 0 };

  const result = [];
  let remaining = passengerCount;

  // Greedy: fill with largest cars first
  if (remaining > 6) {
    const hiaceCount = Math.floor(remaining / CAR_CAPACITY.hiace);
    if (hiaceCount > 0) {
      result.push({ type: 'Noah/Hiace', seats: CAR_CAPACITY.hiace, count: hiaceCount });
      remaining -= hiaceCount * CAR_CAPACITY.hiace;
    }
  }

  if (remaining > 4) {
    const suvCount = Math.ceil(remaining / CAR_CAPACITY.suv);
    result.push({ type: 'SUV', seats: CAR_CAPACITY.suv, count: suvCount });
    remaining -= suvCount * CAR_CAPACITY.suv;
    if (remaining < 0) remaining = 0;
  } else if (remaining > 0) {
    result.push({ type: 'Sedan', seats: CAR_CAPACITY.sedan, count: 1 });
    remaining = 0;
  }

  const totalCars = result.reduce((sum, c) => sum + c.count, 0);
  const totalSeats = result.reduce((sum, c) => sum + (c.count * c.seats), 0);

  return { cars: result, totalCars, totalSeats };
}

/**
 * Renders the seat hint below a form.
 */
function updateSeatHint(service, passengerCount) {
  const hintEl = document.getElementById(service + '-seat-hint');
  if (!hintEl) return;

  if (passengerCount <= 4) {
    hintEl.classList.remove('visible');
    hintEl.textContent = '';
    return;
  }

  const { cars, totalCars, totalSeats } = calculateRequiredCars(passengerCount);

  if (cars.length === 0) {
    hintEl.classList.remove('visible');
    return;
  }

  const carDetails = cars.map(c => `${c.count}× ${c.type} (${c.seats} seats)`).join(' + ');
  hintEl.textContent = `🚗 ${passengerCount} passengers → ${totalCars} vehicle${totalCars > 1 ? 's' : ''} needed: ${carDetails} = ${totalSeats} total seats`;
  hintEl.classList.add('visible');
}

// ============ SERVICE CARD CLICK → SCROLL TO FORM ============
/**
 * Called when user clicks a service card in the services grid section.
 * Selects the correct tab in the booking console and scrolls to it.
 */
function selectService(serviceId) {
  // Scroll to hero / booking console
  const console_ = document.getElementById('booking-console');
  if (console_) {
    const offset = 80; // navbar height
    const top = console_.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  // Activate the tab after a tiny delay (after scroll starts)
  setTimeout(() => {
    const tab = document.querySelector(`.service-tab[data-service="${serviceId}"]`);
    if (tab) tab.click();
  }, 350);
}

// ============ BOOKING INITIATION ============
/**
 * Collects form data for the given service and initiates booking flow.
 * In production: POST to /api/bookings/initiate with full payload.
 */
function startBooking(service) {
  // Validate required fields per service
  const validations = {
    airport: ['airport-location', 'airport-date', 'airport-time'],
    hourly: ['hourly-location', 'hourly-start'],
    intercity: ['intercity-date'],
    tour: ['tour-dest', 'tour-date'],
    event: ['event-venue', 'event-date'],
    corporate: ['corp-company', 'corp-pickup', 'corp-drop']
  };

  const requiredIds = validations[service] || [];
  let hasError = false;

  requiredIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) {
      el.style.borderColor = '#ef4444';
      el.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.15)';
      el.focus();
      hasError = true;
      // Reset error style on input
      el.addEventListener('input', () => {
        el.style.borderColor = '';
        el.style.boxShadow = '';
      }, { once: true });
    }
  });

  if (hasError) return;

  // Build payload (to be sent to backend)
  const payload = {
    service_type: service.toUpperCase(),
    timestamp: new Date().toISOString()
  };

  // Redirect to booking confirmation page with service context
  // In production: POST payload to /api/bookings/initiate, then redirect with bookingId
  window.location.href = `find-cars.html?service=${service}`;
}

// ============ MOBILE HAMBURGER ============
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('mobile-open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });
}

// ============ MOBILE BOTTOM NAV ACTIVE STATE ============
const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
mobileNavItems.forEach(item => {
  item.addEventListener('click', () => {
    mobileNavItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});

// ============ HERO IMAGE FALLBACK ============
// If the hero car image fails to load, show a CSS gradient background
const heroImg = document.getElementById('hero-car-img');
if (heroImg) {
  heroImg.addEventListener('error', () => {
    heroImg.style.display = 'none';
    heroImg.parentElement.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #111 100%)';
    // Add a placeholder text
    const placeholder = document.createElement('div');
    placeholder.style.cssText = 'color:rgba(255,255,255,0.15);font-size:5rem;text-align:center;';
    placeholder.textContent = '🚗';
    heroImg.parentElement.appendChild(placeholder);
  });
}

// Driver section image fallback
const earnImg = document.getElementById('earn-img');
if (earnImg) {
  earnImg.addEventListener('error', () => {
    earnImg.style.display = 'none';
    earnImg.parentElement.style.background = 'linear-gradient(135deg, #1a1a1a 0%, #222 100%)';
    const placeholder = document.createElement('div');
    placeholder.style.cssText = 'color:rgba(255,255,255,0.15);font-size:5rem;text-align:center;height:380px;display:flex;align-items:center;justify-content:center;';
    placeholder.textContent = '👨‍✈️';
    earnImg.parentElement.appendChild(placeholder);
  });
}

// ============ SCROLL-TRIGGERED ANIMATIONS ============
const animateOnScroll = () => {
  const cards = document.querySelectorAll('.service-card, .step-card, .trust-card');
  cards.forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.top < window.innerHeight - 60) {
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }
  });
};

// Set initial state for animation
document.querySelectorAll('.service-card, .step-card, .trust-card').forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
});

window.addEventListener('scroll', animateOnScroll, { passive: true });
window.addEventListener('load', animateOnScroll);
