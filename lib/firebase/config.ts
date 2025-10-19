import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

if (!getApps().length) {
  console.log('🔥 Initializing Firebase with config:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
  });

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);

  // Enable anonymous authentication automatically
  if (typeof window !== 'undefined') {
    import('firebase/auth').then(({ signInAnonymously, onAuthStateChanged }) => {
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          console.log('🔐 No user signed in, signing in anonymously...');
          signInAnonymously(auth)
            .then((result) => {
              console.log('✅ Anonymously signed in:', {
                uid: result.user.uid,
                isAnonymous: result.user.isAnonymous
              });
            })
            .catch((error) => {
              console.error('❌ Anonymous sign-in failed:', {
                code: error.code,
                message: error.message,
                details: error
              });
            });
        } else {
          console.log('✅ User authenticated:', {
            uid: user.uid,
            isAnonymous: user.isAnonymous,
            email: user.email
          });
        }
      });
    });
  }

  // 🔧 EMULATORS DISABLED - Using real Firebase
  // To use emulators, uncomment this block and run: firebase emulators:start
  // if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  //   try {
  //     connectFirestoreEmulator(db, 'localhost', 8080);
  //     connectAuthEmulator(auth, 'http://localhost:9099');
  //     connectStorageEmulator(storage, 'localhost', 9199);
  //     console.log('Connected to Firebase emulators');
  //   } catch (error) {
  //     console.log('Emulators not running, using real Firebase');
  //   }
  // }

  // 🔧 OFFLINE PERSISTENCE DISABLED - Preventing "client is offline" errors
  // To enable offline persistence, uncomment the code below
  // if (typeof window !== 'undefined') {
  //   enableMultiTabIndexedDbPersistence(db).catch((err) => {
  //     if (err.code === 'failed-precondition') {
  //       console.warn('Persistence failed: Multiple tabs open');
  //     } else if (err.code === 'unimplemented') {
  //       console.warn('Persistence not available in this browser');
  //     } else {
  //       console.error('Persistence error:', err);
  //     }
  //   });
  // }

  // Initialize analytics only in browser environment
  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
      }
    });
  }
} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { app, auth, db, storage, analytics };
