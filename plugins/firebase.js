import firebase from "firebase/app";

import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyCOdZNgvpVFKBt-of0GdNdy7ZbkkRbrifQ",
  authDomain: "nuxt-blog-exercise.firebaseapp.com",
  projectId: "nuxt-blog-exercise",
  storageBucket: "nuxt-blog-exercise.appspot.com",
  messagingSenderId: "230824530134",
  appId: "1:230824530134:web:6aaa5280d3901f058ef977"
};

let app = null;

if(!firebase.apps.length){
  app = firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export const provider = new firebase.auth.GoogleAuthProvider();