var firebaseConfig = {
    apiKey: "AIzaSyBN8gSKR2mYomBRSACQLdaRth_qSmb03cg",
  authDomain: "alisveris-listesi-a8201.firebaseapp.com",
  projectId: "alisveris-listesi-a8201",
  storageBucket: "alisveris-listesi-a8201.firebasestorage.app",
  messagingSenderId: "323343315611",
  appId: "1:323343315611:web:f6440c4faca65615378c3e",
  measurementId: "G-JCVZBD44CY"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();