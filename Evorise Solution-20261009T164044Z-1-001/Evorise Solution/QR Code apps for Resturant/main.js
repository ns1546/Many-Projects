document.addEventListener('DOMContentLoaded', function() {
    const pageFlip = new St.PageFlip(document.getElementById('flip-book'), {
        width: 400, // base width
        height: 550, // base height
        size: 'stretch',
        minWidth: 315,
        maxWidth: 500,
        minHeight: 420,
        maxHeight: 700,
        drawShadow: true,
        showCover: true,
        usePortrait: true, // allow portrait on mobile (1 page)
        mobileScrollSupport: false, // prevent scrolling when flipping
        maxShadowOpacity: 0.5
    });

    // Load pages
    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    // Button controls
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    prevBtn.addEventListener('click', () => {
        pageFlip.flipPrev();
    });

    nextBtn.addEventListener('click', () => {
        pageFlip.flipNext();
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            pageFlip.flipNext();
        } else if (e.key === 'ArrowLeft') {
            pageFlip.flipPrev();
        }
    });

    // Handle button visibility
    pageFlip.on('flip', (e) => {
        // e.data is the page index
        if (e.data === 0) {
            prevBtn.style.opacity = '0.5';
            prevBtn.style.pointerEvents = 'none';
        } else {
            prevBtn.style.opacity = '1';
            prevBtn.style.pointerEvents = 'auto';
        }
        
        if (e.data === pageFlip.getPageCount() - 1 || (e.data === pageFlip.getPageCount() - 2 && pageFlip.getOrientation() === 'landscape')) {
             nextBtn.style.opacity = '0.5';
             nextBtn.style.pointerEvents = 'none';
        } else {
             nextBtn.style.opacity = '1';
             nextBtn.style.pointerEvents = 'auto';
        }
    });
    
    // Initial state
    prevBtn.style.opacity = '0.5';
    prevBtn.style.pointerEvents = 'none';
});
