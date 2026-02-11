import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwffTTlfJmKFP_Gc1MKMHOroh5ibQMQsU",
  authDomain: "eduscoreai.firebaseapp.com",
  projectId: "eduscoreai",
  storageBucket: "eduscoreai.firebasestorage.app",
  messagingSenderId: "1018692794556",
  appId: "1:1018692794556:web:3fd68429a2326391a8b8b9",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
