// ============================================================
// FIREBASE CONFIG — CA Final Planner
// Replace these placeholder values with your Firebase project
// credentials from https://console.firebase.google.com
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCuRePAuLSQzdRTX1YSxhVcnRc8c_d-tqo",
  authDomain: "ca-final-planner.firebaseapp.com",
  projectId: "ca-final-planner",
  storageBucket: "ca-final-planner.firebasestorage.app",
  messagingSenderId: "305661559745",
  appId: "1:305661559745:web:448a75e3c20249a89c6540",
  measurementId: "G-0B0R37BKND"
};

// Admin password (change this once you deploy)
const ADMIN_PASSWORD = "cafinal@admin2025"; // Change this after deploying

// Feature flags
const FEATURES = {
  firebaseEnabled: true,    // Firebase is now LIVE with real credentials
  analyticsEnabled: true,   // Firebase Analytics enabled
  adminEnabled: true,       // Admin panel always enabled
};

// Initialize Firebase (only if credentials are provided)
let db = null;
let auth = null;
let firebaseApp = null;

function initFirebase() {
  if (!FEATURES.firebaseEnabled || FIREBASE_CONFIG.apiKey === "YOUR_API_KEY") {
    console.info("ℹ️  Running in offline mode (localStorage only). Add Firebase credentials to enable cloud sync.");
    return false;
  }
  try {
    firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
    auth = firebase.auth();
    db   = firebase.firestore();
    console.info("✅ Firebase connected successfully.");
    return true;
  } catch (e) {
    console.error("❌ Firebase init failed:", e);
    return false;
  }
}

// Save user to Firestore (called after onboarding)
async function saveUserToFirestore(profile) {
  if (!db) return;
  try {
    await db.collection("users").doc(profile.email || profile.id).set({
      ...profile,
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (e) { console.error("Firestore save failed:", e); }
}

// Log daily activity to Firestore
async function logActivityToFirestore(userId, date, data) {
  if (!db) return;
  try {
    await db.collection("activity").doc(`${userId}_${date}`).set({
      userId, date, ...data,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (e) { console.error("Activity log failed:", e); }
}

// Save feedback to Firestore
async function saveFeedbackToFirestore(feedback) {
  if (!db) return;
  try {
    await db.collection("feedback").add({
      ...feedback,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) { console.error("Feedback save failed:", e); }
}

// Fetch all users (admin only)
async function fetchAllUsers() {
  if (!db) return [];
  try {
    const snap = await db.collection("users").orderBy("lastLogin", "desc").get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error("Fetch users failed:", e); return []; }
}

// Fetch all feedback (admin only)
async function fetchAllFeedback() {
  if (!db) return [];
  try {
    const snap = await db.collection("feedback").orderBy("createdAt", "desc").get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) { console.error("Fetch feedback failed:", e); return []; }
}
