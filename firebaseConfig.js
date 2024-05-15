// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAaQPgTlQnwywOczMJB6821TKfgM1sv-tk",
  authDomain: "savev-d820f.firebaseapp.com",
  databaseURL: "https://savev-d820f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "savev-d820f",
  storageBucket: "savev-d820f.appspot.com",
  messagingSenderId: "1070062035569",
  appId: "1:1070062035569:web:0b072bee8276d43e7cf1d0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const firestore = getFirestore(app);

export default app;