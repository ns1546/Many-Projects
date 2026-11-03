/* ====================================================
   CRZ TRAVEL AGENCY — ULTRA PREMIUM SCRIPT
   ==================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ===== PRELOADER ===== */
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add('hide');
    }, 1500); // Ensures the brand is seen briefly
  }

  /* ===== NAVBAR SCROLL EFFECT & MOBILE MENU ===== */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ===== SCROLL REVEAL ANIMATIONS ===== */
  const revealElements = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ===== HERO COVERFLOW DECK ===== */
  const cards = document.querySelectorAll('.flip-card-pro');
  let deckInterval;

  if (cards.length >= 5) {
    let positions = [];
    for (let i = 0; i < cards.length; i++) {
      if (i === 0) positions.push('card-active');
      else if (i === 1) positions.push('card-next1');
      else if (i === 2) positions.push('card-next2');
      else if (i === cards.length - 2) positions.push('card-prev2');
      else if (i === cards.length - 1) positions.push('card-prev1');
      else positions.push('card-hidden');
    }

    function updateDeck() {
      cards.forEach((card, index) => {
        card.className = `flip-card-pro ${positions[index]}`;
      });
    }

    function rotateDeck() {
      // Shift array to the right to move classes forward
      positions.unshift(positions.pop());
      updateDeck();
    }

    // Initialize
    updateDeck();
    deckInterval = setInterval(rotateDeck, 3500);

    // Pause on hover
    const deckContainer = document.getElementById('flipDeck');
    if (deckContainer) {
      deckContainer.addEventListener('mouseenter', () => clearInterval(deckInterval));
      deckContainer.addEventListener('mouseleave', () => {
        deckInterval = setInterval(rotateDeck, 3500);
      });
    }

    // Allow clicking a card to bring it to front
    cards.forEach(card => {
      card.addEventListener('click', function () {
        if (!this.classList.contains('card-active')) {
          clearInterval(deckInterval);
          // simple logic: just run rotate until this is active
          while (!this.classList.contains('card-active')) {
            rotateDeck();
          }
          deckInterval = setInterval(rotateDeck, 3500);
        }
      });
    });
  }

  /* ===== 3D PARALLAX ON HERO BACKGROUND ORBS ===== */
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;

      const orb1 = document.querySelector('.orb-1');
      const orb2 = document.querySelector('.orb-2');

      if (orb1) orb1.style.transform = `translate(${x * 80}px, ${y * 80}px)`;
      if (orb2) orb2.style.transform = `translate(${x * -60}px, ${y * -60}px)`;
    });
  }

  /* ===== CONTACT FORM HANDLING ===== */
  const contactForm = document.getElementById('proContactForm');
  const formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fd = new FormData(contactForm);
      let msg = '*Izanfly - New Inquiry*\n\n';
      msg += `*Name:* ${fd.get('name')}\n`;
      msg += `*Location:* ${fd.get('location')}\n`;
      msg += `*WhatsApp:* ${fd.get('whatsapp')}\n`;
      if (fd.get('email')) msg += `*Email:* ${fd.get('email')}\n`;
      msg += `*Service:* ${fd.get('service')}\n`;

      // Show success
      contactForm.classList.add('hidden');
      formSuccess.classList.remove('hidden');

      // Open WhatsApp
      setTimeout(() => {
        window.open('https://wa.me/+8801850033100?text=' + encodeURIComponent(msg), '_blank');
      }, 800);

      // Reset form after 5 seconds
      setTimeout(() => {
        contactForm.reset();
        contactForm.classList.remove('hidden');
        formSuccess.classList.add('hidden');
      }, 5000);
    });
  }

  /* ===== SMOOTH SCROLL FOR ANCHORS ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ===== STATS COUNTER ANIMATION ===== */
  const counters = document.querySelectorAll('.counter');
  const statsSection = document.querySelector('.stats-pro');
  let countersAnimated = false;

  if (statsSection && counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !countersAnimated) {
        countersAnimated = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          const duration = 2000; // 2 seconds
          const increment = target / (duration / 16); // 60fps

          let current = 0;
          const updateCounter = () => {
            current += increment;
            if (current < target) {
              counter.innerText = Math.ceil(current);
              requestAnimationFrame(updateCounter);
            } else {
              counter.innerText = target;
              if (target > 1000) {
                counter.innerText = (target / 1000).toFixed(1) + 'k+';
              } else {
                counter.innerText = target + '+';
              }
            }
          };
          updateCounter();
        });
      }
    }, { threshold: 0.5 });
    counterObserver.observe(statsSection);
  }

  /* ===== TESTIMONIALS: MOBILE SLIDER vs DESKTOP SCROLL ===== */
  const track = document.querySelector('.testimonial-track');
  if (track) {
    const isMobile = () => window.innerWidth <= 768;

    if (isMobile()) {
      /* ---- MOBILE: clean dot-navigation card slider ---- */
      const slider    = track.closest('.testimonial-slider');
      const cards     = Array.from(track.children);
      let   current   = 0;

      /* Wrap in a single-card viewport */
      track.style.cssText = 'display:flex; flex-direction:row; transition:transform 0.4s cubic-bezier(0.4,0,0.2,1); width:100%; will-change:transform;';
      cards.forEach(c => {
        c.style.cssText = 'min-width:100%; width:100%; flex-shrink:0; box-sizing:border-box;';
      });

      /* Dot indicators */
      const dotsWrap = document.createElement('div');
      dotsWrap.className = 'test-dots';
      const dots = cards.map((_, i) => {
        const d = document.createElement('button');
        d.className = 'test-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Review ' + (i + 1));
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
        return d;
      });
      slider.appendChild(dotsWrap);

      function goTo(idx) {
        current = idx;
        track.style.transform = `translateX(-${idx * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      }

      /* Auto-advance every 4 s */
      let autoAdv = setInterval(() => goTo((current + 1) % cards.length), 4000);
      slider.addEventListener('mouseenter', () => clearInterval(autoAdv));
      slider.addEventListener('mouseleave', () => { autoAdv = setInterval(() => goTo((current + 1) % cards.length), 4000); });

      /* Touch/swipe support */
      let startX = 0;
      track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend',   e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) goTo(diff > 0 ? Math.min(current + 1, cards.length - 1) : Math.max(current - 1, 0));
      });

    } else {
      /* ---- DESKTOP: original infinite-scroll cloning ---- */
      const items = Array.from(track.children);
      items.forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    }
  }

});
