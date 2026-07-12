import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, GoogleAuthProvider, setPersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_NEW,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_NEW,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_NEW,
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_NEW,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_NEW,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_NEW,
};

// Check if config is valid to avoid crashing with obscure Firebase errors
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined' && !!firebaseConfig.projectId;

let app: FirebaseApp | undefined;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (isConfigValid) {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);

        // Only set persistence in a browser environment
        if (typeof window !== 'undefined') {
            setPersistence(auth, browserLocalPersistence).catch((err) => {
                console.warn("Firebase persistence could not be initialized:", err);
            });
        }
    } catch (error) {
        console.error("❌ Firebase initialization failed:", error);
        // Fallback to stubs to prevent total app failure
        auth = {} as Auth;
        db = {} as Firestore;
        storage = {} as FirebaseStorage;
    }
} else {
    if (typeof window !== 'undefined') {
        console.error(
            "❌ Firebase configuration is missing or invalid. Please check your .env file.",
            "Expected: NEXT_PUBLIC_FIREBASE_API_KEY_NEW, etc.",
            "Current State:", {
                hasApiKey: !!firebaseConfig.apiKey,
                hasProjectId: !!firebaseConfig.projectId,
                apiKeyVal: firebaseConfig.apiKey === 'undefined' ? 'Literal "undefined" string detected' : 'Missing'
            }
        );
    }
    // Provide empty objects to prevent immediate crashes in components importing these
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const uploadFile = async (file: File, path: string): Promise<string> => {
    if (!isConfigValid || !storage) {
        throw new Error("Firebase Storage is not configured. Check your environment variables.");
    }
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
};

export { app, auth, db, storage };
