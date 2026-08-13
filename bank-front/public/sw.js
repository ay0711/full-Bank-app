// Service Worker for Ayanfe Bank PWA
const CACHE_NAME = 'ayanfe-bank-v1';

self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Allow network request to proceed as normal
});
