var firebaseConfig = {
  apiKey: "AIzaSyAZAFlNPXKZdlK7qC4DOgkfk1laECodyok",
  authDomain: "dugunliste.firebaseapp.com",
  projectId: "dugunliste",
  storageBucket: "dugunliste.firebasestorage.app",
  messagingSenderId: "201492782142",
  appId: "1:201492782142:web:97ff29a0e3497e378c056f",
  measurementId: "G-GMD68MXZCH"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();