// ============================================================
// FIREBASE CONFIG — CA Final Planner
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

// Admin password
const ADMIN_PASSWORD = "Mani@2005";

// Feature flags
const FEATURES = {
  firebaseEnabled: true,
  analyticsEnabled: true,
  adminEnabled: true,
};

// GLOBAL ACCESS: Attach to window so other scripts can find them
window.db = null;
window.auth = null;

function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn("⚠️ Firebase SDK not loaded. Running in offline mode.");
    FEATURES.firebaseEnabled = false;
    return false;
  }

  if (!FEATURES.firebaseEnabled) {
    return false;
  }

  try {
    // Avoid double-initialization
    if (!firebase.apps.length) {
      firebase.initializeApp(FIREBASE_CONFIG);
    }

    // Assign to global window object
    window.auth = firebase.auth();
    window.db = firebase.firestore();

    // Enable offline persistence
    window.db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
      console.warn('Firestore persistence status:', err.code);
    });

    console.info("✅ Firebase initialized successfully and globally accessible.");
    return true;
  } catch (e) {
    console.error("❌ Firebase init failed:", e);
    return false;
  }
}

// Run immediately
initFirebase();

// ── FIRESTORE HELPERS ────────────────────────────────────────

// Use window.db instead of local db variable
async function saveUserToFirestore(data) {
  if (!window.db || !data || !data.email) return;
  try {
    const docId = data.email.replace(/[^a-zA-Z0-9]/g, '_');
    await window.db.collection("users").doc(docId).set({
      ...data,
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
  } catch (e) { console.error("Firestore save failed:", e); }
}

async function loadUserFromFirestore(email) {
  if (!window.db || !email) return null;
  try {
    const docId = email.replace(/[^a-zA-Z0-9]/g, '_');
    const doc = await window.db.collection("users").doc(docId).get();
    return doc.exists ? doc.data() : null;
  } catch (e) { return null; }
}

// (Keep other helper functions as is, just replace 'db' with 'window.db')
