const API_URL = 'https://story-api.dicoding.dev/v1';

export async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await response.json();
  } catch (err) {
    return { error: true, message: 'Gagal login. Cek koneksi internet.' };
  }
}

export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function clearToken() {
  localStorage.removeItem('token');
}

// Register user baru
export async function register(name, email, password) {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return response.json();
}

export async function addStory(token, formData) {
  try {
    const response = await fetch(`${API_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    return await response.json();
  } catch (err) {
    return { error: true, message: 'Gagal menambah cerita. Cek koneksi internet.' };
  }
}

export async function getStories(token) {
  try {
    const response = await fetch(`${API_URL}/stories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    return { error: true, message: 'Gagal mengambil cerita.' };
  }
}
