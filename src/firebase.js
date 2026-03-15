import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-OX4a1yB38y3HtbBgVDhUw5pj5XY6QGA",
  authDomain: "weeklyexpence.firebaseapp.com",
  projectId: "weeklyexpence",
  storageBucket: "weeklyexpence.firebasestorage.app",
  messagingSenderId: "76832656149",
  appId: "G-1Z1G8N57BT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);