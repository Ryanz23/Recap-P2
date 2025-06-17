export function showLoginForm() {
  return `
    <div class="login-container">
      
      <section class="login-form-section">
        <h2>Masuk ke Recap</h2>
        <form id="login-form" autocomplete="on">
          <div class="input-group">
            <span class="input-icon">@</span>
            <input type="email" id="email" name="email" placeholder="Email" required autocomplete="username" />
          </div>
          <div class="input-group">
            <span class="input-icon">🔒</span>
            <input type="password" id="password" name="password" placeholder="Password" required autocomplete="current-password" />
          </div>
          <button class="login-btn" type="submit">Masuk</button>
        </form>
        <div class="login-extra">
          <a href="#">Lupa password?</a>
        </div>
        <div id="login-message" class="login-message"></div>
      </section>
    </div>
  `;
}

export function showStoryList(stories, savedIds = []) {
  return `
    <nav class="navbar">
      <div class="nav-left">
        <button id="home-btn">Home</button>
        <button id="add-btn">Tambah Cerita</button>
        <button id="saved-btn">Saved Stories</button>
      </div>
      <div class="nav-right">
        <button id="logout-btn">Logout</button>
      </div>
    </nav>
    <div id="stories-list" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 16px; margin: 24px 0;">
      ${stories.map(story => `
        <div class="story-card" style="width: 300px; border: 1px solid #ccc; border-radius: 8px; padding: 12px; background: #fff;">
          <img src="${story.photoUrl}" alt="Poster film oleh ${story.name}" style="width:100%; border-radius: 6px;">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <p><b>Tanggal:</b> ${new Date(story.createdAt).toLocaleString()}</p>
          <p><b>Lokasi:</b> ${story.lat && story.lon ? `${story.lat}, ${story.lon}` : 'Tidak ada lokasi'}</p>
          <button class="save-btn" data-id="${story.id}" ${savedIds.includes(story.id) ? 'disabled' : ''}>${savedIds.includes(story.id) ? 'Saved' : 'Save'}</button>
        </div>
      `).join('')}
    </div>
    <div id="map" style="height: 300px; margin-top: 32px; border-radius: 12px; overflow: hidden;"></div>
  `;
}

export function showAddStoryForm() {
  return `
    <section class="add-story-section">
      <h2>Tambah Cerita</h2>
      <form id="add-story-form" class="add-story-form">
        <div class="form-row">
          <label for="description">Sinopsis Cerita</label>
          <textarea id="description" name="description" placeholder="Tulis sinopsis cerita..." required></textarea>
        </div>
        <div class="form-row">
          <label for="photo">Poster Cerita</label>
          <input type="file" id="photo" name="photo" accept="image/*" required>
        </div>
        <div class="form-row">
          <img id="preview" style="display:none;max-width:100%;margin-bottom:1rem;" />
        </div>
        <div class="form-row">
          <video id="video" autoplay playsinline style="max-width: 100%; border-radius: 8px;"></video>
          <canvas id="canvas" width="640" height="480" style="display: none;"></canvas>
        </div>
        <div class="form-row">
          <button type="button" id="capture-btn">Ambil dari Kamera</button>
        </div>
        <div class="form-row">
          <label for="lat">Latitude</label>
          <input type="text" id="lat" name="lat" required>
          <label for="lon" style="margin-left:1rem;">Longitude</label>
          <input type="text" id="lon" name="lon" required>
        </div>
        <div id="map-add" style="height: 300px; margin: 24px 0; border-radius: 12px;"></div>
        <div class="form-row button-row">
          <button type="submit">Tambah Cerita</button>
          <button type="button" id="cancel-btn">Batal</button>
        </div>
        <div id="add-story-message"></div>
      </form>
    </section>
  `;
}

export function showNotFound() {
  return `<h2>404 - Halaman Tidak Ditemukan</h2>
    <button id="back-home">Kembali ke Beranda</button>`;
}

export function showSavedStories(stories) {
  return `
    <nav>
      <button id="home-btn">Home</button>
      <button id="logout-btn">Logout</button>
    </nav>
    <h2>Saved Stories</h2>
    <div id="saved-list" style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">
      ${stories.length === 0 ? '<p>Tidak ada story yang disimpan.</p>' : stories.map(story => `
        <div class="story-card" style="width: 300px; border: 1px solid #ccc; border-radius: 8px; padding: 12px; background: #fff;">
          <img src="${story.photoUrl}" alt="Poster film oleh ${story.name}" style="width:100%; border-radius: 6px;">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <p><b>Tanggal:</b> ${new Date(story.createdAt).toLocaleString()}</p>
          <p><b>Lokasi:</b> ${story.lat && story.lon ? `${story.lat}, ${story.lon}` : 'Tidak ada lokasi'}</p>
          <button class="delete-saved-btn" data-id="${story.id}">Hapus</button>
        </div>
      `).join('')}
    </div>
  `;
}

export function bindLoginForm(container, onSubmit) {
  const form = container.querySelector('#login-form');
  const message = container.querySelector('#login-message');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.querySelector('#email').value;
    const password = form.querySelector('#password').value;
    await onSubmit(email, password, msg => message.textContent = msg);
  });
}

export function bindStoryListEvents(container, handlers, stories) {
  const addBtn = container.querySelector('#add-btn');
  if (addBtn && handlers.onAdd) addBtn.onclick = handlers.onAdd;
  container.querySelector('#logout-btn').onclick = handlers.onLogout;
  container.querySelector('#home-btn').onclick = handlers.onHome;
  container.querySelector('#saved-btn').onclick = handlers.onSaved;

  container.querySelectorAll('.save-btn').forEach(btn => {
    btn.onclick = () => handlers.onSave(btn.dataset.id);
  });

  if (typeof L !== 'undefined') {
    setTimeout(() => {
      const map = L.map('map').setView([-6.2, 106.8], 5);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      handlers.onMapReady(map, stories);
    }, 100);
  }
}

export function bindSavedListEvents(container, handlers) {
  const homeBtn = container.querySelector('#home-btn');
  if (homeBtn) homeBtn.onclick = handlers.onHome;

  const logoutBtn = container.querySelector('#logout-btn');
  if (logoutBtn) logoutBtn.onclick = handlers.onLogout;

  container.querySelectorAll('.delete-saved-btn').forEach(btn => {
    btn.onclick = () => handlers.onDelete(btn.dataset.id);
  });
}

export function bindAddStoryForm(container, onSubmit) {
  const form = container.querySelector('#add-story-form');
  const message = container.querySelector('#add-story-message');
  const video = container.querySelector('#video');
  const canvas = container.querySelector('#canvas');
  const captureBtn = container.querySelector('#capture-btn');
  const cancelBtn = container.querySelector('#cancel-btn');
  let stream;

  // Peta
  if (typeof L !== 'undefined') {
    const mapContainer = container.querySelector('#map-add');
    const map = L.map(mapContainer).setView([-2.5489, 118.0149], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    map.on('click', function(e) {
      form.querySelector('#lat').value = e.latlng.lat;
      form.querySelector('#lon').value = e.latlng.lng;
    });
  }

  // Kamera
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        stream = s;
        video.srcObject = stream;
      });
  }

  captureBtn.addEventListener('click', () => {
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      const fileInput = form.querySelector('#photo');
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
    }, 'image/jpeg');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (stream) stream.getTracks().forEach(track => track.stop());
    const formData = new FormData();
    formData.append('description', form.querySelector('#description').value);
    formData.append('lat', form.querySelector('#lat').value);
    formData.append('lon', form.querySelector('#lon').value);
    formData.append('photo', form.querySelector('#photo').files[0]);
    await onSubmit(formData, msg => message.textContent = msg, () => {});
  });

  cancelBtn.addEventListener('click', () => {
    window.location.hash = '#/';
  });
}
