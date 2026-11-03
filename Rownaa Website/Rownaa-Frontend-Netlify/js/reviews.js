// =========================================================
// ROWNAA REVIEWS CLIENT ENGINE
// Connects to /api/reviews with live SQLite persistence
// =========================================================

(function(global) {
  class ReviewsManagerClass {
    constructor() {
      this.reviews = [];
      this.init();
    }

    async init() {
      if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
        try {
          const stored = localStorage.getItem('rownaa_reviews');
          if (stored) this.reviews = JSON.parse(stored);
        } catch (e) {}
        return;
      }
      try {
        const res = await fetch('/api/reviews', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          this.reviews = data.reviews || [];
        }
      } catch (e) {
        console.warn('Reviews fetch failed:', e);
      }
    }

    async fetchAll() {
      await this.init();
      return this.reviews;
    }

    getAll() {
      return this.reviews;
    }

    getByBookingId(bookingId) {
      return this.reviews.find(r => r.bookingId === bookingId) || null;
    }

    async addReview(reviewData) {
      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(reviewData)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.review) {
            this.reviews.push(data.review);
            return data.review;
          }
        }
      } catch (e) {
        console.error('Failed to submit review to server:', e);
      }
      return null;
    }
  }

  global.ReviewsManager = new ReviewsManagerClass();
})(window);
