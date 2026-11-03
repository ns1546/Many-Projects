/**
 * TAWSIF MAHBUB — OFFICIAL EDITORIAL PORTFOLIO LOGIC
 * Dynamic interactive filters, smooth navigation, and modal view controllers.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
      const isOpen = mobileDrawer.classList.contains('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
      });
    });
  }

  // 2. Filmography Filter Tabs System
  const filterButtons = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  function applyFilter(category) {
    // Update active button state
    filterButtons.forEach(btn => {
      if (btn.getAttribute('data-filter') === category) {
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Filter cards
    workCards.forEach(card => {
      const cardCategories = card.getAttribute('data-category') || '';
      if (category === 'all' || cardCategories.includes(category)) {
        card.style.display = 'flex';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(12px)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 200);
      }
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-filter');
      applyFilter(category);
    });
  });

  // 3. Connect Pillar Category Links to Filter System
  const pillarLinks = document.querySelectorAll('.pillar-link');
  pillarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetFilter = link.getAttribute('data-filter');
      if (targetFilter) {
        applyFilter(targetFilter);
      }
    });
  });

  // 4. Subtle Parallax / Mouse tilt for Hero Actor Cutout
  const heroStage = document.querySelector('.hero-stage');
  const heroActor = document.getElementById('heroActorImg');

  if (heroStage && heroActor && window.innerWidth > 992) {
    heroStage.addEventListener('mousemove', (e) => {
      const rect = heroStage.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const moveX = (x / rect.width) * 14;
      const moveY = (y / rect.height) * 8;
      
      heroActor.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(1.01)`;
    });

    heroStage.addEventListener('mouseleave', () => {
      heroActor.style.transform = 'translate3d(0, 0, 0) scale(1)';
    });
  }

  // 5. Header Elevation on Scroll
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.boxShadow = '0 6px 20px rgba(21, 20, 18, 0.06)';
      header.style.padding = '0.85rem 0';
    } else {
      header.style.boxShadow = 'none';
      header.style.padding = '1.1rem 0';
    }
  });

  console.log('Tawsif Mahbub Editorial Portfolio loaded successfully.');
});
