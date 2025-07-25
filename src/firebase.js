import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCjcN-cuDF3vLwCw-nhEnNMr0-94CxxdQI",
  authDomain: "pedido-facil-b1390.firebaseapp.com",
  projectId: "pedido-facil-b1390",
  storageBucket: "pedido-facil-b1390.appspot.com",
  messagingSenderId: "23816381323",
  appId: "1:23816381323:web:e7889b97461c9ce495c58e",
  measurementId: "G-11QDD8M2KQ",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
