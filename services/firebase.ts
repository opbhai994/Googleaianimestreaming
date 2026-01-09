import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// ============================================================================
// INSTRUCTIONS:
// I have pre-filled the IDs I could see in your screenshot.
// YOU ONLY NEED TO PASTE THE API KEY.
// 
// 1. In your Firebase Console "SDK setup" box (from your screenshot),
//    SCROLL DOWN to find the line starting with "apiKey".
// 2. Copy that long string (it starts with "AIza...").
// 3. Paste it below.
// ============================================================================

const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY", // <--- PASTE YOUR COPIED KEY HERE
  
  authDomain: "anime-india-web.firebaseapp.com",
  projectId: "anime-india-web",
  storageBucket: "anime-india-web.firebasestorage.app",
  messagingSenderId: "1049601130514", // Derived from your App ID
  appId: "1:1049601130514:web:57bbc185fd9d32f9abd8cb"
};

// Helper to check if a value is configured (not empty and not a placeholder)
const isConfigured = (value: string) => value && value.length > 0 && !value.includes("REPLACE_WITH");

// Check if ALL required keys are present
export const isFirebaseInitialized = 
  isConfigured(firebaseConfig.apiKey) && 
  isConfigured(firebaseConfig.projectId) &&
  isConfigured(firebaseConfig.appId);

if (!isFirebaseInitialized) {
  console.log("%c Firebase Keys Missing ", "background: orange; color: black; font-weight: bold; padding: 4px;");
  console.log("Please update services/firebase.ts with your actual Firebase configuration.");
}

let app;
let dbInstance: Firestore | null = null;

if (isFirebaseInitialized) {
  try {
    app = initializeApp(firebaseConfig);
    dbInstance = getFirestore(app);
    console.log("%c Firebase Initialized ", "background: green; color: white; font-weight: bold; padding: 4px;");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export const db = dbInstance;