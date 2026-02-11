import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: "AIzaSyBYeQj4FEpWt79BfBJ2ZTXa0lEbMkEsnDk",
  authDomain: "ousewebinar.firebaseapp.com",
  projectId: "ousewebinar",
  storageBucket: "ousewebinar.firebasestorage.app",
  messagingSenderId: "921349588311",
  appId: "1:921349588311:web:e2c0c0ef622fec5f30aa12",
  measurementId: "G-276F0L5PH1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;