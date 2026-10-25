/**
 * Graceful Service Worker Registration for Technea PWA
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[Technea PWA] Service Worker registered with scope:', registration.scope);

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[Technea PWA] New content is available; please refresh.');
                  // Dispatch custom event if the UI wants to show an update banner
                  window.dispatchEvent(new CustomEvent('sw-update-available'));
                } else {
                  console.log('[Technea PWA] Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.warn('[Technea PWA] Service Worker registration failed:', error);
        });
    });
  }
}
