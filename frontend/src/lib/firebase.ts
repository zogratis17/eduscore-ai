// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add your own Firebase configuration from your project settings
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "AIzaSyAwffTTlfJmKFP_Gc1MKMHOroh5ibQMQsU",
  authDomain: "eduscoreai.firebaseapp.com",
  projectId: "eduscoreai",
  storageBucket: "eduscoreai.firebasestorage.app",
  messagingSenderId: "1018692794556",
  appId: "1:1018692794556:web:3fd68429a2326391a8b8b9",
  measurementId: "G-HWCMSPHVRL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
