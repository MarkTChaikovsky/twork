// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from 'firebase/storage';


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  apiKey: "AIzaSyBAKiQISXBS5lWv6UpiZfVCzvAGeQ5VyFo",
  authDomain: "t-work-fab52.firebaseapp.com",
  projectId: "t-work-fab52",
  storageBucket: "t-work-fab52.appspot.com",
  messagingSenderId: "831627802509",
  appId: "1:831627802509:web:c5925722a90b4b68cd2fc4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();