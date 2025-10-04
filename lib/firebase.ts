import { initializeApp } from "firebase/app";
import {
  getFirestore,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAffBMfX9NHVgSg_w4a8ZKa55vmp0eHb2w",
  authDomain: "dd5tools.firebaseapp.com",
  databaseURL: "https://dd5tools.firebaseio.com",
  projectId: "dd5tools",
  storageBucket: "dd5tools.appspot.com",
  messagingSenderId: "1096592466642",
  appId: "1:1096592466642:web:f03ea81d304964f1f1030b",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
