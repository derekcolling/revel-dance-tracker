// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase, ref, onValue, set, get } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
    // apiKey: "YOUR_API_KEY",
    // authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    // databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    // projectId: "YOUR_PROJECT_ID",
    // storageBucket: "YOUR_PROJECT_ID.appspot.com",
    // messagingSenderId: "123456789",
    // appId: "1:123456789:web:abcdef123456"
};

let app, database;

try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
} catch (e) {
    console.warn("Firebase not properly configured yet. Using mock demo mode.");
    database = null; // We will handle null fallback in the respective JS files
}

export { database, ref, onValue, set, get };
