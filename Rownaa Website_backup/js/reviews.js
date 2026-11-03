// ReviewsManager - Manages reviews and ratings (Phase 5)
(function(global) {
  const STORAGE_KEY = 'rownaa_reviews_db';

  class ReviewsManagerClass {
    constructor() {
      this.reviews = this._load();
    }

    _load() {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        try {
          return JSON.parse(data);
        } catch(e) {
          console.error("Reviews load error:", e);
        }
      }
      return [];
    }

    _save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reviews));
    }

    getAll() {
      return this.reviews;
    }

    getByBookingId(bookingId) {
      return this.reviews.find(r => r.bookingId === bookingId) || null;
    }

    addReview(reviewData) {
      const newReview = {
        id: 'REV-' + Math.floor(Math.random()*10000),
        bookingId: reviewData.bookingId,
        customerId: reviewData.customerId,
        rating: reviewData.rating,
        comment: reviewData.comment || '',
        createdAt: new Date().toISOString()
      };
      this.reviews.push(newReview);
      this._save();
      return newReview;
    }
  }

  global.ReviewsManager = new ReviewsManagerClass();
})(window);
