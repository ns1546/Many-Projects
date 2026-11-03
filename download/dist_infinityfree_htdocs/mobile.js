/**
 * JKH JESAN — COMPREHENSIVE MOBILE UI & UNIVERSAL LIGHTBOX SYSTEM (mobile.js)
 * Controls mobile header, animated hamburger toggle, drawer navigation,
 * and universal non-fullscreen image popup lightbox.
 */
document.addEventListener('DOMContentLoaded', () => {
    // ── 1. MOBILE DRAWER NAVIGATION CONTROLLER ────────────────────────────
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const mobileHeader = document.getElementById('mobile-header');
    const mobileDrawer = document.getElementById('mobile-nav-drawer');
    const drawerLinks = document.querySelectorAll('.mobile-drawer-link');

    let isMenuOpen = false;

    function openMobileMenu() {
        if (!mobileDrawer) return;
        isMenuOpen = true;
        if (mobileHeader) mobileHeader.classList.add('menu-open');
        mobileDrawer.classList.add('drawer-active');
        document.body.classList.add('mobile-nav-locked');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMobileMenu() {
        if (!mobileDrawer) return;
        isMenuOpen = false;
        if (mobileHeader) mobileHeader.classList.remove('menu-open');
        mobileDrawer.classList.remove('drawer-active');
        document.body.classList.remove('mobile-nav-locked');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    }

    function toggleMobileMenu(e) {
        if (e) e.stopPropagation();
        if (isMenuOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    if (toggleBtn && mobileDrawer) {
        toggleBtn.addEventListener('click', toggleMobileMenu);

        // Close when tapping any link inside the drawer
        drawerLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
            });
        });

        // Close if user taps outside the drawer content
        mobileDrawer.addEventListener('click', (e) => {
            if (e.target === mobileDrawer) {
                closeMobileMenu();
            }
        });
    }

    // ── 2. UNIVERSAL IMAGE LIGHTBOX MODAL (NON-FULLSCREEN, CLOSEABLE) ─────
    // Ensures a centered, elegant popup with proper margins on both PC & mobile.
    let lightboxEl = document.getElementById('universal-lightbox');
    if (!lightboxEl) {
        lightboxEl = document.createElement('div');
        lightboxEl.id = 'universal-lightbox';
        lightboxEl.className = 'universal-lightbox-backdrop';
        lightboxEl.innerHTML = `
            <div class="universal-lightbox-card" role="dialog" aria-modal="true" aria-label="Image Preview">
                <button type="button" id="lightbox-close-btn" class="universal-lightbox-close" aria-label="Close Picture Preview">
                    <i class="fas fa-times"></i>
                </button>
                <div class="universal-lightbox-img-wrap">
                    <img id="lightbox-modal-img" src="" alt="Full Picture Preview" class="universal-lightbox-img" />
                </div>
                <div class="universal-lightbox-footer">
                    <p id="lightbox-modal-caption" class="universal-lightbox-caption"></p>
                    <div class="universal-lightbox-badge">JKH JESAN ARCHIVE</div>
                </div>
            </div>
        `;
        document.body.appendChild(lightboxEl);
    }

    const modalImg = document.getElementById('lightbox-modal-img');
    const modalCaption = document.getElementById('lightbox-modal-caption');
    const closeBtn = document.getElementById('lightbox-close-btn');

    function openLightbox(src, captionText) {
        if (!lightboxEl || !modalImg) return;
        modalImg.src = src;
        modalImg.alt = captionText || 'JKH Jesan Visual Archive';
        if (modalCaption) {
            modalCaption.textContent = captionText || 'Studio & Production Session Visual';
        }
        lightboxEl.classList.add('active');
        document.body.classList.add('lightbox-locked');
    }

    function closeLightbox() {
        if (!lightboxEl) return;
        lightboxEl.classList.remove('active');
        document.body.classList.remove('lightbox-locked');
        if (modalImg) {
            setTimeout(() => {
                modalImg.src = '';
            }, 250);
        }
    }

    // Expose globally so inline scripts or buttons can invoke easily
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeLightbox();
        });
    }

    // Close on backdrop click (outside the inner card)
    if (lightboxEl) {
        lightboxEl.addEventListener('click', (e) => {
            if (e.target === lightboxEl) {
                closeLightbox();
            }
        });
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (lightboxEl && lightboxEl.classList.contains('active')) {
                closeLightbox();
            } else if (isMenuOpen) {
                closeMobileMenu();
            }
        }
    });

    // Delegated click listener for any image marked for lightbox
    document.addEventListener('click', (e) => {
        const targetImg = e.target.closest('img');
        if (!targetImg) return;

        // Check if image or its parent container is eligible for lightbox
        const isEligible = 
            targetImg.hasAttribute('data-lightbox') ||
            targetImg.closest('.masonry-item') ||
            targetImg.closest('#gallery-grid') ||
            targetImg.closest('.lightbox-trigger') ||
            targetImg.closest('.studio-preview-card') ||
            targetImg.classList.contains('lightbox-enabled') ||
            targetImg.classList.contains('gallery-img');

        // Ignore logo, avatar icons, or small UI icons
        if (targetImg.width < 50 && targetImg.height < 50) return;
        if (targetImg.id === 'lightbox-modal-img') return;

        if (isEligible) {
            e.preventDefault();
            const fullSrc = targetImg.getAttribute('data-full-src') || targetImg.currentSrc || targetImg.src;
            const caption = targetImg.getAttribute('data-caption') || targetImg.alt || targetImg.title || 'Studio & Archive Photograph';
            openLightbox(fullSrc, caption);
        }
    });
});
