import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  set,
  get,
  push,
  update,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyDwpOo0wfjNCA_-EVQqHgE5nM3-wo2g1-I",
  authDomain: "kkwm-5fe88.firebaseapp.com",
  projectId: "kkwm-5fe88",
  storageBucket: "kkwm-5fe88.firebasestorage.app",
  messagingSenderId: "497980134634",
  appId: "1:497980134634:web:0e7608cc1d3874ce357393",
  measurementId: "G-6G5V3STYEK",
  databaseURL: "https://kkwm-5fe88-default-rtdb.firebaseio.com/"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getDatabase(app);


export {
  auth,
  db,
  ref,
  set,
  get,
  push,
  update,
  remove
};