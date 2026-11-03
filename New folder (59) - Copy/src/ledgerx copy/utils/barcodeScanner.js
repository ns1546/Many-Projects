/**
 * Global Hardware Barcode Scanner Keystroke Interceptor
 * Intercepts high-speed scanner wedges (<25ms per character) across the desktop app
 */

class BarcodeScannerListener {
  constructor() {
    this.buffer = '';
    this.lastTime = 0;
    this.thresholdMs = 30; // Max time between characters for hardware scanners
    this.callbacks = new Set();
    this.isListening = false;
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  start() {
    if (this.isListening || typeof window === 'undefined') return;
    window.addEventListener('keydown', this.onKeyDown);
    this.isListening = true;
  }

  stop() {
    if (!this.isListening || typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.onKeyDown);
    this.isListening = false;
  }

  subscribe(callback) {
    this.callbacks.add(callback);
    if (!this.isListening) this.start();
    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) this.stop();
    };
  }

  addListener(callback) {
    return this.subscribe(callback);
  }

  onKeyDown(e) {
    const now = Date.now();
    const timeDiff = now - this.lastTime;
    this.lastTime = now;

    // Enter indicates end of barcode
    if (e.key === 'Enter') {
      if (this.buffer.length >= 3 && timeDiff < this.thresholdMs * 2) {
        // High confidence hardware scan
        e.preventDefault();
        const scannedCode = this.buffer.trim();
        this.buffer = '';
        this.emit(scannedCode);
      } else {
        this.buffer = '';
      }
      return;
    }

    // Reset buffer if delay too long (manual human typing)
    if (timeDiff > this.thresholdMs && this.buffer.length > 0) {
      this.buffer = '';
    }

    // Only buffer printable characters
    if (e.key.length === 1) {
      this.buffer += e.key;
    }
  }

  emit(barcode) {
    this.callbacks.forEach((cb) => {
      try {
        cb(barcode);
      } catch (err) {
        console.error('Barcode subscriber error:', err);
      }
    });
  }
}

export const barcodeScanner = new BarcodeScannerListener();
