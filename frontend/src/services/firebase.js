import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

// Hardcoded configuration to debug env var issues
const firebaseConfig = {
  apiKey: "AIzaSyA9j8cqWMiuZDZgWvQ3CW2Lai2ZPwFtGmo",
  authDomain: "eduscoreai-44bc1.firebaseapp.com",
  projectId: "eduscoreai-44bc1",
  storageBucket: "eduscoreai-44bc1.firebasestorage.app",
  messagingSenderId: "1025404104596",
  appId: "1:1025404104596:web:4286a635d720ea1d7e2981",
  measurementId: "G-11R7KZY2DR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged };