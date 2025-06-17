import { login, saveToken, getToken, clearToken, addStory } from './model.js';
import { saveStory, getAllStories, deleteStory } from './idb.js';
import { 
  showLoginForm, showStoryList, showAddStoryForm, showSavedStories,
  bindLoginForm, bindStoryListEvents, bindAddStoryForm, bindSavedListEvents
} from './view.js';
import { getStories } from './model.js';

export function initApp(container) {
  // Hanya tampilkan login
  renderLogin(container);
}

export function renderLogin(container) {
  container.innerHTML = showLoginForm();
  bindLoginForm(container, async (email, password, setMessage) => {
    setMessage('Loading...');
    const result = await login(email, password);
    if (!result.error) {
      saveToken(result.loginResult.token);
      window.location.hash = '#/';
    } else {
      setMessage('Login gagal: ' + result.message);
    }
  });
}

// Fungsi untuk menampilkan daftar cerita
export async function loadStories(container) {
  container.innerHTML = '<p>Loading stories...</p>';
  try {
    const token = getToken();
    if (!token) {
      window.location.hash = '#/login';
      return;
    }
    // Ganti baris ini:
    // const stories = await fetchStories(token);
    // Menjadi:
    const response = await getStories(token);
    if (response.error) {
      container.innerHTML = `<p>Error loading stories: ${response.message}</p>`;
      return;
    }
    const stories = response.listStory || [];
    container.innerHTML = showStoryList(stories);
    // Pastikan handlers sudah didefinisikan sebelum dipakai
    bindStoryListEvents(container, {
      onAdd: () => window.location.hash = '#/add',
      onLogout: () => {
        clearToken();
        renderLogin(container);
      },
      onHome: () => window.location.hash = '#/',
      onSaved: () => window.location.hash = '#/saved',
      onSave: async (id) => {
        const story = stories.find(s => s.id === id);
        if (story) {
          await saveStory(story);
          loadStories(container);
        }
      },
      onMapReady: (map, stories) => {
        stories.forEach(story => {
          if (story.lat && story.lon) {
            L.marker([story.lat, story.lon]).addTo(map)
              .bindPopup(`<b>${story.name}</b><br>${story.description}`);
          }
        });
      }
    }, stories);
  } catch (err) {
    container.innerHTML = `<p>Error loading stories: ${err.message}</p>`;
  }
}

export async function renderAddStory(container) {
  container.innerHTML = showAddStoryForm();
  bindAddStoryForm(container, async (formData, setMessage, stopCamera) => {
    const token = getToken();
    const result = await addStory(token, formData);
    setMessage(result.message);
    stopCamera();
    if (!result.error) {
      // Tambahkan setelah story berhasil dibuat
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          if (Notification.permission === 'granted') {
            reg.showNotification('Story berhasil dibuat', {
              body: `Anda telah membuat story baru dengan deskripsi: ${formData.get('description')}`
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                reg.showNotification('Story berhasil dibuat', {
                  body: `Anda telah membuat story baru dengan deskripsi: ${formData.get('description')}`
                });
              }
            });
          }
        });
      }
      window.location.hash = '#/';
    }
  });
}

// Halaman Saved Stories
export async function renderSavedStories(container) {
  const saved = await getAllStories();
  container.innerHTML = showSavedStories(saved);
  bindSavedListEvents(container, {
    onHome: () => window.location.hash = '#/',
    onLogout: () => {
      clearToken();
      renderLogin(container);
    },
    onDelete: async (id) => {
      await deleteStory(id);
      renderSavedStories(container);
    }
  });
}

export function renderLoginOrHome(container) {
  if (getToken()) {
    loadStories(container);
  } else {
    renderLogin(container);
  }
}

export async function loadSavedStoriesOffline() {
  const saved = await getAllStories();
  // Tampilkan data yang disimpan secara offline
  document.getElementById('offline-content').innerHTML = showSavedStories(saved);
}