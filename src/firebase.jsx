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

// Debug: Log Firebase config (remove in production)
if (import.meta.env.DEV) {
  console.log('Firebase Config:', {
    apiKey: VITE_FIREBASE_APP_API_KEY ? 'Set' : 'Missing',
    authDomain: VITE_FIREBASE_APP_AUTH_DOMAIN ? 'Set' : 'Missing',
    projectId: VITE_FIREBASE_APP_PROJECT_ID ? 'Set' : 'Missing',
    storageBucket: VITE_FIREBASE_APP_STORAGE_BUCKET ? 'Set' : 'Missing',
    messagingSenderId: VITE_FIREBASE_APP_MESSAGING_SENDER_ID ? 'Set' : 'Missing',
    appId: VITE_FIREBASE_APP_APP_ID ? 'Set' : 'Missing'
  });
}

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
    
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase configuration is incomplete. Some features may not work.');
    console.warn('Missing values:', Object.entries(firebaseConfig)
      .filter(([key, value]) => !value || value === "")
      .map(([key]) => key)
    );
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  
  // Provide fallback objects to prevent crashes
  firebaseApp = null;
  auth = null;
  phoneProvider = null;
}

export { firebaseApp, auth, phoneProvider };