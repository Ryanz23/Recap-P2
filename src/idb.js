import { openDB } from 'idb';

const DB_NAME = 'recap-db';
const STORE_NAME = 'movies';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
}

export async function saveMovie(movie) {
  const db = await getDB();
  await db.put(STORE_NAME, movie);
}

export async function getAllMovies() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function deleteMovie(id) {
  const db = await getDB();
  return db.delete(STORE_NAME, id);
}