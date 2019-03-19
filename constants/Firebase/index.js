import * as firebase from 'firebase';

const config = {
  apiKey: "AIzaSyDToX6FivoDIJ5yU9ajpq_OBuSV8V3CH98",
    authDomain: "sa-familytracker.firebaseapp.com",
    databaseURL: "https://sa-familytracker.firebaseio.com",
    projectId: "sa-familytracker",
    storageBucket: "sa-familytracker.appspot.com",
    messagingSenderId: "455075260734"
};

firebase.initializeApp(config);

const FIREBASE = firebase;
const FIREBASE_AUTH = firebase.auth();
const FIREBASE_DATABASE = firebase.database();
const FIREBASE_STORAGE = firebase.storage();


export {
  FIREBASE,
  FIREBASE_AUTH, 
  FIREBASE_DATABASE, 
  FIREBASE_STORAGE, 
};
