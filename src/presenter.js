import { login, getStories, saveToken, getToken, clearToken, addStory } from './model.js';
import { saveMovie, getAllMovies, deleteMovie } from './idb.js';
import { 
  showLoginForm, showStoryList, showAddFilmForm, showSavedStories,
  bindLoginForm, bindStoryListEvents, bindAddFilmForm, bindSavedListEvents
} from './view.js';

export function initApp(container) {
  if (getToken()) {
    loadStories(container);
  } else {
    renderLogin(container);
  }
}

export function renderLogin(container) {
  if (document.startViewTransition) {
    document.startViewTransition(() => {
      container.innerHTML = showLoginForm();
      bindLoginForm(container, async (email, password, setMessage) => {
        setMessage('Logging in...');
        const result = await login(email, password);
        if (!result.error) {
          saveToken(result.loginResult.token);
          loadStories(container);
        } else {
          setMessage('Login gagal: ' + result.message);
        }
      });
    });
  } else {
    container.innerHTML = showLoginForm();
    bindLoginForm(container, async (email, password, setMessage) => {
      setMessage('Logging in...');
      const result = await login(email, password);
      if (!result.error) {
        saveToken(result.loginResult.token);
        loadStories(container);
      } else {
        setMessage('Login gagal: ' + result.message);
      }
    });
  }
}

// Fungsi untuk menampilkan daftar film
export async function loadStories(container) {
  const token = getToken();
  const result = await getStories(token);
  if (result.error && result.message === 'Offline') {
    // Ambil data dari IndexedDB
    const savedStories = await getAllMovies();
    container.innerHTML = showStoryList(savedStories);
    container.innerHTML += '<p>Anda sedang offline. Data diambil dari penyimpanan lokal.</p>';
  } else {
    // Ambil semua id story yang sudah disimpan di IndexedDB
    const saved = await getAllMovies();
    const savedIds = saved.map(s => s.id);

    if (!result.error) {
      container.innerHTML = showStoryList(result.listStory, savedIds);
      bindStoryListEvents(container, {
        onHome: () => window.location.hash = '#/',
        onAdd: () => window.location.hash = '#/add',
        onSaved: () => window.location.hash = '#/saved',
        onLogout: () => {
          clearToken();
          renderLogin(container);
        },
        onSave: async (id) => {
          const story = result.listStory.find(s => s.id === id);
          await saveMovie(story);
          loadStories(container);
        },
        onMapReady: (map, stories) => {
          const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '...' });
          const sat = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', { attribution: '...' });
          map.addLayer(osm);
          L.control.layers({ "OSM": osm, "Satellite": sat }).addTo(map);

          stories.forEach(story => {
            if (story.lat && story.lon) {
              const marker = L.marker([story.lat, story.lon]).addTo(map);
              marker.bindPopup(`<b>${story.name}</b><br>${story.description}`);
            }
          });
        }
      }, result.listStory);
    } else {
      container.innerHTML = '<p>Gagal memuat data.</p>';
    }
  }
}

export async function renderAddFilm(container) {
  container.innerHTML = showAddFilmForm();
  bindAddFilmForm(container, async (formData, setMessage, stopCamera) => {
    const token = getToken();
    const result = await addStory(token, formData);
    setMessage(result.message);
    stopCamera();
    if (!result.error) {
      // Tambahkan setelah story berhasil dibuat
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification('Story berhasil dibuat', {
            body: `Anda telah membuat story baru dengan deskripsi: ${formData.get('description')}`
          });
        });
      }
      window.location.hash = '#/';
    }
  });
}

// Halaman Saved Stories
export async function renderSavedStories(container) {
  const saved = await getAllMovies();
  container.innerHTML = showSavedStories(saved);
  bindSavedListEvents(container, {
    onHome: () => window.location.hash = '#/',
    onLogout: () => {
      clearToken();
      renderLogin(container);
    },
    onDelete: async (id) => {
      await deleteMovie(id);
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
  const saved = await getAllMovies();
  // Tampilkan data yang disimpan secara offline
  document.getElementById('offline-content').innerHTML = showSavedStories(saved);
}
