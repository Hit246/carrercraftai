import { initializeApp, getApps, getApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_NEW,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_NEW,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_NEW,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_NEW,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_NEW,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_NEW,
};

// Check if config is valid to avoid crashing with obscure Firebase errors
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!isConfigValid && typeof window !== 'undefined') {
    console.error(
        "❌ Firebase configuration is missing. Please ensure your .env file has all NEXT_PUBLIC_FIREBASE_* variables set correctly.",
        "Current Config:", firebaseConfig
    );
}

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

// Only set persistence in a browser environment and if config is valid
if (typeof window !== 'undefined' && isConfigValid) {
    setPersistence(auth, browserLocalPersistence).catch((err) => {
        console.warn("Firebase persistence could not be initialized:", err);
    });
}

const db = getFirestore(app);
const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
};

export { app, auth, db, storage };
