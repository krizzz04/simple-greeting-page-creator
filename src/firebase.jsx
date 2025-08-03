const VITE_FIREBASE_APP_API_KEY = import.meta.env.VITE_FIREBASE_APP_API_KEY || "";
const VITE_FIREBASE_APP_AUTH_DOMAIN = import.meta.env.VITE_FIREBASE_APP_AUTH_DOMAIN || "";
const VITE_FIREBASE_APP_PROJECT_ID = import.meta.env.VITE_FIREBASE_APP_PROJECT_ID || "";
const VITE_FIREBASE_APP_STORAGE_BUCKET = import.meta.env.VITE_FIREBASE_APP_STORAGE_BUCKET || "";
const VITE_FIREBASE_APP_MESSAGING_SENDER_ID = import.meta.env.VITE_FIREBASE_APP_MESSAGING_SENDER_ID || "";
const VITE_FIREBASE_APP_APP_ID = import.meta.env.VITE_FIREBASE_APP_APP_ID || "";

import { initializeApp } from "firebase/app";
import { getAuth, PhoneAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: VITE_FIREBASE_APP_API_KEY,
  authDomain: VITE_FIREBASE_APP_AUTH_DOMAIN,
  projectId: VITE_FIREBASE_APP_PROJECT_ID,
  storageBucket: VITE_FIREBASE_APP_STORAGE_BUCKET,
  messagingSenderId: VITE_FIREBASE_APP_MESSAGING_SENDER_ID,
  appId: VITE_FIREBASE_APP_APP_ID
};

// Initialize Firebase only if config is valid
let firebaseApp;
let auth;
let phoneProvider;

try {
  // Check if Firebase config is complete
  const isConfigValid = Object.values(firebaseConfig).every(value => value && value !== "");
  
  if (isConfigValid) {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    phoneProvider = new PhoneAuthProvider(auth);

    // Add error handling for Firebase auth
    auth.onAuthStateChanged((user) => {
      // Handle auth state changes
    }, (error) => {
      console.warn('Firebase auth error:', error);
    });
  } else {
    console.warn('Firebase configuration is incomplete. Some features may not work.');
  }
} catch (error) {
  console.warn('Firebase initialization error:', error);
}

export { firebaseApp, auth, phoneProvider };