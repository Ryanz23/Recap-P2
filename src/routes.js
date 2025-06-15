import { loadStories, renderLogin, renderAddFilm, renderSavedStories } from './presenter.js';
import { showNotFound } from './view.js';

export function router(container) {
  const hash = window.location.hash;
  if (hash === '#/add') {
    renderAddFilm(container);
  } else if (hash === '#/saved') {
    renderSavedStories(container);
  } else if (hash === '#/login' || !hash) {
    renderLogin(container);
  } else if (hash === '#/' || hash === '') {
    loadStories(container);
  } else {
    container.innerHTML = showNotFound();
    const backBtn = container.querySelector('#back-home');
    if (backBtn) {
      backBtn.onclick = () => window.location.hash = '#/';
    }
  }
}

