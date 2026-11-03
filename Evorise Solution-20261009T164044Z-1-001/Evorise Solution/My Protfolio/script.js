'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ─── SIDE DRAWER MENU ─── */
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.getElementById('nav-links');
  const navOverlay = document.getElementById('nav-overlay');
  const closeMenu = document.getElementById('close-menu');
  
  const openMenu = () => {
    navLinks.classList.add('open');
    navOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeMenuHandler = () => {
    navLinks.classList.remove('open');
    navOverlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (menuToggle && navLinks && navOverlay) {
    menuToggle.addEventListener('click', openMenu);
    navOverlay.addEventListener('click', closeMenuHandler);
    if(closeMenu) closeMenu.addEventListener('click', closeMenuHandler);

    // Close menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', closeMenuHandler);
    });
  }

  /* ─── HEADER SCROLL EFFECT ─── */
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.padding = '1rem 4rem';
      } else {
        header.style.padding = '1.5rem 4rem';
      }
    }, { passive: true });
  }

  /* ─── ACTIVE NAV LINK ─── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ─── CONTACT FORM WHATSAPP LOGIC ─── */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();

      // Basic Validation
      if (!name || !email || !message) {
        alert('Please fill in all required fields (Name, Email, and Message).');
        return;
      }

      // WhatsApp phone number
      const waNumber = '8801628500052';
      
      // Constructing the message payload
      const waText = `Hello Tahsin,%0A%0AI am ${encodeURIComponent(name)} (${encodeURIComponent(email)}).%0A%0A*Subject:* ${encodeURIComponent(subject || 'New Inquiry')}%0A%0A*Message:*%0A${encodeURIComponent(message)}`;
      
      // WhatsApp API URL
      const waUrl = `https://wa.me/${waNumber}?text=${waText}`;
      
      // Open in new tab
      window.open(waUrl, '_blank');
    });
  }

});
