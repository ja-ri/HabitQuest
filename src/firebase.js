// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBuKZnYyo3tDYJidJdnWehe_Cif7f9A9uk",
  authDomain: "habitquest-bd571.firebaseapp.com",
  projectId: "habitquest-bd571",
  storageBucket: "habitquest-bd571.firebasestorage.app",
  messagingSenderId: "307400292338",
  appId: "1:307400292338:web:cf4e0eb0015f80b4341d6b",
  measurementId: "G-59W8PZE7D7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);