// ============================================================
// FIREBASE CONFIG — CA Final Planner with Google Auth
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

// Feature flags
const FEATURES = {
  firebaseEnabled: true,
  googleAuthEnabled: true,
  analyticsEnabled: true,
};

// GLOBAL ACCESS
window.db = null;
window.auth = null;

function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.warn("⚠️ Firebase SDK not loaded. Running in offline mode.");
    FEATURES.firebaseEnabled = false;
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
      if (err.code !== 'failed-precondition') {
        console.warn('Firestore persistence status:', err.code);
      }
    });

    console.log("✅ Firebase initialized with Google Auth enabled");
    return true;
  } catch (e) {
    console.error("❌ Firebase init failed:", e);
    FEATURES.firebaseEnabled = false;
    return false;
  }
}

// Initialize immediately when script loads
initFirebase();

// ── FIRESTORE HELPERS FOR GOOGLE AUTH ────────────────────

/**
 * Save Google user profile to Firestore
 * Called after successful Google login
 */
async function saveGoogleUserProfile(googleUser) {
  if (!window.db || !googleUser) return;
  
  try {
    const userId = googleUser.uid;
    const userRef = window.db.collection('users').doc(userId);
    
    await userRef.set({
      uid: googleUser.uid,
      email: googleUser.email,
      displayName: googleUser.displayName || 'Student',
      photoURL: googleUser.photoURL || '',
      authMethod: 'google',
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log("✅ Google user saved to Firestore");
    return true;
  } catch (e) {
    console.error("❌ Save user profile failed:", e);
    return false;
  }
}

/**
 * Load user profile from Firestore by UID
 */
async function loadUserProfile(uid) {
  if (!window.db || !uid) return null;
  
  try {
    const doc = await window.db.collection('users').doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error("❌ Load profile failed:", e);
    return null;
  }
}

/**
 * Save user's study data (timetable, tracker, etc)
 * Path: users/{uid}/data/
 */
async function saveUserStudyData(uid, dataType, data) {
  if (!window.db || !uid || !dataType) return;
  
  try {
    const dataRef = window.db.collection('users').doc(uid).collection('data').doc(dataType);
    await dataRef.set(data, { merge: true });
    console.log(`✅ Saved ${dataType} for user ${uid}`);
  } catch (e) {
    console.error(`❌ Save study data (${dataType}) failed:`, e);
  }
}

/**
 * Load user's study data
 */
async function loadUserStudyData(uid, dataType) {
  if (!window.db || !uid || !dataType) return null;
  
  try {
    const doc = await window.db.collection('users').doc(uid).collection('data').doc(dataType).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error(`❌ Load study data (${dataType}) failed:`, e);
    return null;
  }
}

/**
 * Submit feedback to Firestore
 */
async function submitFeedback(feedbackData) {
  if (!window.db || !window.auth.currentUser) return;
  
  try {
    await window.db.collection('feedback').add({
      ...feedbackData,
      userId: window.auth.currentUser.uid,
      userEmail: window.auth.currentUser.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log("✅ Feedback submitted");
    return true;
  } catch (e) {
    console.error("❌ Feedback submission failed:", e);
    return false;
  }
}

/**
 * Get broadcast messages (admin announcements)
 */
async function getBroadcastMessages() {
  if (!window.db) return [];
  
  try {
    const snapshot = await window.db.collection('broadcast')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    return snapshot.docs[0].data();
  } catch (e) {
    console.error("❌ Load broadcast failed:", e);
    return null;
  }
}

// Export to window
window.saveGoogleUserProfile = saveGoogleUserProfile;
window.loadUserProfile = loadUserProfile;
window.saveUserStudyData = saveUserStudyData;
window.loadUserStudyData = loadUserStudyData;
window.submitFeedback = submitFeedback;
window.getBroadcastMessages = getBroadcastMessages;

