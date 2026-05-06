// ════════════════════════════════════════════════════════════════════
// STORAGE LAYER
// Auto-detects Firebase config in env. Falls back to localStorage.
// ════════════════════════════════════════════════════════════════════

const firebaseEnabled = !!import.meta.env.VITE_FIREBASE_API_KEY;

let fdb = null;
let firestoreModule = null;
let initPromise = null;

async function ensureFirebase() {
  if (!firebaseEnabled) return false;
  if (fdb) return true;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const { initializeApp } = await import('firebase/app');
    firestoreModule = await import('firebase/firestore');
    const app = initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    });
    fdb = firestoreModule.getFirestore(app);
    console.log('🔥 Connected to Firebase Firestore');
    return true;
  })();
  return initPromise;
}

if (!firebaseEnabled) {
  console.log('💾 Using localStorage. Set VITE_FIREBASE_API_KEY in .env to use Firebase.');
}

const KEY = (k) => `tts:${k}`;

export const db = {
  async get(k, fallback = null) {
    try {
      if (await ensureFirebase()) {
        const { doc, getDoc } = firestoreModule;
        const snap = await getDoc(doc(fdb, 'app', k));
        return snap.exists() ? snap.data().value : fallback;
      }
      const raw = localStorage.getItem(KEY(k));
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.error('db.get failed', k, e);
      return fallback;
    }
  },
  async set(k, value) {
    try {
      if (await ensureFirebase()) {
        const { doc, setDoc } = firestoreModule;
        await setDoc(doc(fdb, 'app', k), { value, updatedAt: Date.now() });
        return true;
      }
      localStorage.setItem(KEY(k), JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('db.set failed', k, e);
      return false;
    }
  },
  async del(k) {
    try {
      if (await ensureFirebase()) {
        const { doc, deleteDoc } = firestoreModule;
        await deleteDoc(doc(fdb, 'app', k));
        return true;
      }
      localStorage.removeItem(KEY(k));
      return true;
    } catch (e) {
      console.error('db.del failed', k, e);
      return false;
    }
  },
};

export const isFirebaseConnected = firebaseEnabled;

/* ────────────────────────────────────────────────────────────────────
   CLOUDINARY — unsigned image upload
   Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env
   ──────────────────────────────────────────────────────────────────── */
export const cloudinaryEnabled =
  !!(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME && import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

export async function uploadToCloudinary(file) {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Cloudinary is not configured.\n\nAdd these lines to your .env file:\n  VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name\n  VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset\n\nThen restart the dev server.'
    );
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.secure_url;
}
