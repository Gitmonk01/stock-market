// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHEbf1hPnMsEwAhinYRAEeKE1YCdkwpW0",
  authDomain: "stock-market-e0e77.firebaseapp.com",
  projectId: "stock-market-e0e77",
  storageBucket: "stock-market-e0e77.firebasestorage.app",
  messagingSenderId: "1078197991978",
  appId: "1:1078197991978:web:6828be5c579f5ff0196153"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(); // Set up Google provider

setPersistence(auth, browserLocalPersistence); // Ensures persistence

const db = getFirestore(app);

export { auth, provider, db };
