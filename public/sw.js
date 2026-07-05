self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    const options = {
      body: data.body || '',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/' },
    };
    event.waitUntil(
      self.registration.showNotification(data.title || 'ChamaOS', options)
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('ChamaOS', { body: event.data.text() })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(urlToOpen);
    })
  );
});
