/**
 * IndexedDB storage utility for persisting the user's calming audio track and metadata.
 */

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface TrackData {
  id: string;
  title: string;
  artist: string;
  genre: string;
  releaseDate: string;
  linerNotes: string;
  quote?: string;
  artworkUrl: string;
  isCustomUploaded: boolean;
  audioBlob?: Blob;
  audioUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  lyrics?: LyricLine[];
}

const DB_NAME = 'SerenadeSingleTrackDB';
const DB_VERSION = 1;
const STORE_NAME = 'single_track';

export function openTrackDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTrackToDB(track: TrackData): Promise<void> {
  const db = await openTrackDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    // clone to avoid serializing transient blob URLs if any
    const dataToSave = {
      ...track,
      audioUrl: undefined, // regenerates at runtime from blob
    };
    const req = store.put(dataToSave);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function loadTrackFromDB(): Promise<TrackData | null> {
  const db = await openTrackDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get('primary_single');
    req.onsuccess = () => {
      const data = req.result as TrackData | undefined;
      if (!data) {
        resolve(null);
        return;
      }
      if (data.audioBlob) {
        data.audioUrl = URL.createObjectURL(data.audioBlob);
      }
      resolve(data);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearTrackFromDB(): Promise<void> {
  const db = await openTrackDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete('primary_single');
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}
