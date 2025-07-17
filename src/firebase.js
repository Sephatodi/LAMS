 
import { initializeApp } from "firebase/app";
import {
  browserSessionPersistence,
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
  signInAnonymously,
  signInWithPopup
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "lams-9f1f8.firebaseapp.com",
  projectId: "lams-9f1f8",
  storageBucket: "lams-9f1f8.appspot.com",
  messagingSenderId: "117615549530",
  appId: "1:117615549530:web:d4c3d482ff21067c6b4c63",
  measurementId: "G-H3586XMQKV"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserSessionPersistence)
  .catch((error) => {
    console.error("Persistence setting error:", error);
  });

const handleGuestLogin = async () => {
  try {
    await setPersistence(auth, browserSessionPersistence);
    return await signInAnonymously(auth);
  } catch (error) {
    console.error("Guest login error:", error);
    throw error;
  }
};

const getFriendlyAuthError = (error) => {
  switch (error.code) {
    case 'auth/too-many-requests':
      return 'Too many requests. Please wait before trying again.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
};

export {
  auth,
  db,
  FacebookAuthProvider, getFriendlyAuthError, GoogleAuthProvider, handleGuestLogin,
  signInWithPopup
};
