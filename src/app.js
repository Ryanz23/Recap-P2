import { router } from './routes.js';
import './style.css';
import { openDB } from 'idb';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DB_NAME = 'recap-db';
const STORE_NAME = 'movies';

// Paksa buat object store saat aplikasi dijalankan
openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('main-content');
  router(container);
  window.addEventListener('hashchange', () => router(container));
});

if ('serviceWorker' in navigator && 'PushManager' in window) {
  window.addEventListener('load', async () => {
    const reg = await navigator.serviceWorker.register('/service-worker.js');
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      try {
        await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      } catch (err) {
        console.error('Push subscription error:', err);
      }
    }
  });
}

function urlBase64ToUint8Array(base64String) {
  // Kode helper yang benar, jangan ubah!
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

try {
  // fetch API
} catch (err) {
  // tampilkan pesan "Tidak bisa login saat offline"
}
