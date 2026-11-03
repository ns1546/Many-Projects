const CACHE_NAME = 'combine-alarm-v3.5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

// Network-First with offline cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/') || event.request.url.startsWith('ws')) {
    return;
  }

  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Push Notification Handler (Wakes up mobile device and lock screen)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: event.data.text() };
    }
  }

  const title = data.title ? `⏰ Combine Alarm: ${data.title}` : '🚨 SQUAD COMBINE ALARM!';
  const options = {
    body: `Time: ${data.time || 'NOW'} • Tap to open & complete wake-up challenge`,
    tag: 'combine-alarm-' + (data.alarmId || 'alert'),
    renotify: true,
    requireInteraction: true,
    vibrate: [600, 200, 600, 200, 1000],
    data: data,
    actions: [
      { action: 'open', title: 'WAKE UP (CHECK IN)' },
      { action: 'snooze', title: 'SNOOZE 5M' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        windowClients.forEach((client) => {
          client.postMessage({
            type: 'PUSH_ALARM_TRIGGERED',
            alarm: data
          });
        });
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});

