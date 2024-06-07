// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgG0ivvIvy5VBOmCdIRaGPotXnmdPvtfQ",
  authDomain: "savev-3a33f.firebaseapp.com",
  projectId: "savev-3a33f",
  storageBucket: "savev-3a33f.appspot.com",
  messagingSenderId: "1040934992019",
  appId: "1:1040934992019:web:4cbd31fdbd3bc1b9c0f566"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const firestore = getFirestore(app);

export default app;