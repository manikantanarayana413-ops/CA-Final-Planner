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

// Firebase instances — initialized in initFirebase()
let db   = null;
let auth = null;
let firebaseAppInstance = null;

function initFirebase() {
  // Guard: only run if Firebase SDK is available
  if (typeof firebase === 'undefined') {
    console.warn("⚠️ Firebase SDK not loaded. Running in offline mode.");
    FEATURES.firebaseEnabled = false;
    return false;
  }

  if (!FEATURES.firebaseEnabled) {
    console.info("ℹ️ Firebase disabled via feature flag. Running in offline mode.");
    return false;
  }

  try {
    // Avoid double-initialization
    if (firebase.apps && firebase.apps.length > 0) {
      firebaseAppInstance = firebase.apps[0];
    } else {
      firebaseAppInstance = firebase.initializeApp(FIREBASE_CONFIG);
    }

    auth = firebase.auth();
    db   = firebase.firestore();

    // Enable offline persistence for Firestore (graceful fallback)
    db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence unavailable (multiple tabs open).');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not supported in this browser.');
      }
    });

    // Firebase Analytics (optional, only in production)
    if (FEATURES.analyticsEnabled && typeof firebase.analytics === 'function') {
      try { firebase.analytics(); } catch(e) { /* silently ignore */ }
    }

    console.info("✅ Firebase initialized successfully.");
    return true;
  } catch (e) {
    console.error("❌ Firebase init failed:", e);
    FEATURES.firebaseEnabled = false;
    return false;
  }
}

// ── FIRESTORE HELPERS ────────────────────────────────────────

// Save full user data to Firestore (keyed by email)
async function saveUserToFirestore(data) {
  if (!db || !data || !data.email) return;
  try {
    const docId = data.email.replace(/[^a-zA-Z0-9]/g, '_');
    const payload = {
      ...data,
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    await db.collection("users").doc(docId).set(payload, { merge: true });
    console.info("💾 Data saved to Firestore for:", data.email);
  } catch (e) {
    console.error("Firestore save failed:", e);
  }
}

// Load user profile from Firestore by email
async function loadUserFromFirestore(email) {
  if (!db || !email) return null;
  try {
    const docId = email.replace(/[^a-zA-Z0-9]/g, '_');
    const doc = await db.collection("users").doc(docId).get();
    if (doc.exists) {
      return doc.data();
    }
    return null;
  } catch (e) {
    console.error("Firestore load failed:", e);
    return null;
  }
}

// Save feedback to Firestore
async function saveFeedbackToFirestore(feedback) {
  if (!db) return;
  try {
    await db.collection("feedback").add({
      ...feedback,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) {
    console.error("Feedback save failed:", e);
  }
}

// Fetch all users (admin only)
async function fetchAllUsers() {
  if (!db) return [];
  try {
    const snap = await db.collection("users").orderBy("lastLogin", "desc").limit(100).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Fetch users failed:", e);
    return [];
  }
}

// Fetch all feedback (admin only)
async function fetchAllFeedback() {
  if (!db) return [];
  try {
    const snap = await db.collection("feedback").orderBy("createdAt", "desc").limit(50).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("Fetch feedback failed:", e);
    return [];
  }
}
