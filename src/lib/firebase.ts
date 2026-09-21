// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDcHSdnyWxjqE9SFYKI1Weuyu1CXUv5bKQ",
  authDomain: "dase-hotel.firebaseapp.com",
  projectId: "dase-hotel",
  storageBucket: "dase-hotel.firebasestorage.app",
  messagingSenderId: "282366591422",
  appId: "1:282366591422:web:7cb41bbc6d5ca0fa8939ef"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const storage = getStorage(app);