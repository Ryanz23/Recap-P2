import { openDB } from 'idb';

const DB_NAME = 'recap-db';
const STORE_NAME = 'stories';

async function getDB() {
  return openDB(DB_NAME, 2, { // Ganti versi ke 2
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    }
  });
}

export async function saveStory(story) {
  const db = await getDB();
  await db.put(STORE_NAME, story);
}

export async function getStory(id) {
  const db = await getDB();
  return db.get(STORE_NAME, id);
}

export async function deleteStory(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}

export async function getAllStories() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}
