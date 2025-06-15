export function showLoginForm() {
  return `
    <h2>Login</h2>
    <form id="login-form">
      <label for="email">Email</label>
      <input type="email" id="email" placeholder="Email" required><br>
      <label for="password">Password</label>
      <input type="password" id="password" placeholder="Password" required><br>
      <button type="submit">Login</button>
    </form>
    <p id="login-message"></p>
  `;
}

export function showStoryList(stories, savedIds = []) {
  return `
    <nav>
      <button id="home-btn">Home</button>
      <button id="add-btn">Tambah Film</button>
      <button id="saved-btn">Saved Stories</button>
      <button id="logout-btn">Logout</button>
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
  `
}

export function showAddFilmForm() {
  return `
    <h2>Tambah Film</h2>
    <form id="add-film-form" enctype="multipart/form-data" style="max-width: 400px; margin: 0 auto;">
      <label for="description">Sinopsis</label>
      <textarea id="description" required placeholder="Tulis sinopsis film..."></textarea>
      <label for="photo">Poster Film</label>
      <input type="file" id="photo" accept="image/*" required>
      <div class="camera-section">
        <video id="video" width="200" autoplay></video>
        <button type="button" id="capture-btn">Ambil dari Kamera</button>
        <canvas id="canvas" width="200" height="150" style="display:none;"></canvas>
      </div>
      <label for="lat">Latitude</label>
      <input type="text" id="lat" required>
      <label for="lon">Longitude</label>
      <input type="text" id="lon" required>
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button type="submit">Tambah</button>
        <button type="button" id="cancel-btn">Batal</button>
      </div>
    </form>
    <div id="add-film-message"></div>
    <div id="map-add" style="height: 300px; margin-top: 32px; border-radius: 12px; overflow: hidden;"></div>
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

// Event binding untuk login
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

// Event binding untuk story list dan peta
export function bindStoryListEvents(container, handlers, stories) {
  container.querySelector('#add-btn').onclick = handlers.onAdd;
  container.querySelector('#logout-btn').onclick = handlers.onLogout;
  container.querySelector('#home-btn').onclick = handlers.onHome;
  container.querySelector('#saved-btn').onclick = handlers.onSaved;

  // Save button
  container.querySelectorAll('.save-btn').forEach(btn => {
    btn.onclick = () => handlers.onSave(btn.dataset.id);
  });

  // Map
  if (typeof L !== 'undefined') {
    setTimeout(() => {
      const map = L.map('map').setView([-6.2, 106.8], 5);
      handlers.onMapReady(map, stories);
    }, 100);
  }
}

export function bindSavedListEvents(container, handlers) {
  container.querySelector('#home-btn').onclick = handlers.onHome;
  container.querySelector('#logout-btn').onclick = handlers.onLogout;
  container.querySelectorAll('.delete-saved-btn').forEach(btn => {
    btn.onclick = () => handlers.onDelete(btn.dataset.id);
  });
}

// Event binding untuk tambah film, kamera, dan peta
export function bindAddFilmForm(container, onSubmit) {
  const form = container.querySelector('#add-film-form');
  const message = container.querySelector('#add-film-message');
  const video = container.querySelector('#video');
  const canvas = container.querySelector('#canvas');
  const captureBtn = container.querySelector('#capture-btn');
  const cancelBtn = container.querySelector('#cancel-btn');
  let stream;

  // Peta lokasi
  if (typeof L !== 'undefined') {
    const map = L.map(container.querySelector('#map-add')).setView([-2.5489, 118.0149], 5);
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

  // Tombol batal kembali ke menu utama
  cancelBtn.addEventListener('click', () => {
    window.location.hash = '#/';
  });
}
