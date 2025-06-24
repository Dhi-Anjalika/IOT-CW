import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDOaBq9jDk6yQQQhRCvpIQ3hfBoyDBHlhk",
  authDomain: "smartbottle-5eeba.firebaseapp.com",
  databaseURL: "https://smartbottle-5eeba-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smartbottle-5eeba",
  storageBucket: "smartbottle-5eeba.appspot.com",
  messagingSenderId: "500981280771",
  appId: "1:500981280771:android:6f10205bde584a0cf0de36"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default db;
