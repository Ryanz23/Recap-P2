import { loadStories, renderLogin, renderAddStory, renderSavedStories } from './presenter.js';
import { showNotFound } from './view.js';
import { getToken } from './model.js';

export function router(container) {
  const hash = window.location.hash;
  const token = getToken();

  if ((!hash || hash === '#/login') && token) {
    window.location.hash = '#/';
    return;
  }
  if (!token && hash !== '#/login') {
    window.location.hash = '#/login';
    return;
  }

  if (hash === '#/login') {
    renderLogin(container);
  } else if (hash === '#/saved') {
    renderSavedStories(container);
  } else if (hash === '#/add') {
    renderAddStory(container);
  } else {
    loadStories(container); // beranda
  }
}

