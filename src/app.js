// src/app.js
import { router } from './routes.js';
import './style.css';
import { openDB } from 'idb';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DB_NAME = 'recap-db';
const STORE_NAME = 'stories'; // Ganti dari 'movies' ke 'stories'

openDB(DB_NAME, 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      console.log;
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
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      console.log('✅ Service Worker terdaftar:', reg);

      // Tunggu sampai service worker aktif
      if (reg.installing) {
        await new Promise(resolve => {
          reg.installing.addEventListener('statechange', function listener(e) {
            if (e.target.state === 'activated') {
              resolve();
            }
          });
        });
      } else if (reg.waiting) {
        await new Promise(resolve => {
          reg.waiting.addEventListener('statechange', function listener(e) {
            if (e.target.state === 'activated') {
              resolve();
            }
          });
        });
      }

      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });

        console.log('✅ Push Notification berhasil disubscribe');
      } else {
        console.warn('❌ Izin notifikasi ditolak');
      }
    } catch (err) {
      console.error('❌ Error saat mendaftarkan Service Worker atau Push:', err);
    }
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'marker-icon-2x.png',
  iconUrl: 'marker-icon.png',
  shadowUrl: 'marker-shadow.png'
});
