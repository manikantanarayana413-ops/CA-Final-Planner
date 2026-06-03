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
 * Save user profile to Firestore
 */
async function saveUserToFirestore(user) {
  if (!window.db || !user) return;
  
  try {
    const uid = (user.uid || user.id || user.email.replace(/[^a-zA-Z0-9]/g, '_'));
    const userRef = window.db.collection('users').doc(uid);
    
    await userRef.set({
      uid: uid,
      email: user.email,
      name: user.name || 'Student',
      displayName: user.displayName || user.name || 'Student',
      photoURL: user.photoURL || '',
      authMethod: user.authMethod || 'google',
      profileCompleted: user.profileCompleted !== undefined ? user.profileCompleted : true,
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: user.createdAt || firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log("✅ User saved to Firestore");
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

/**
 * Save feedback to Firestore
 */
async function saveFeedbackToFirestore(feedbackObj) {
  if (!window.db) return false;
  
  try {
    await window.db.collection('feedback').add({
      ...feedbackObj,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ Feedback submitted to Firestore");
    return true;
  } catch (e) {
    console.error("❌ Feedback submission failed:", e);
    return false;
  }
}

// Export to window
window.saveUserToFirestore = saveUserToFirestore;
window.loadUserProfile = loadUserProfile;
window.saveUserStudyData = saveUserStudyData;
window.loadUserStudyData = loadUserStudyData;
window.submitFeedback = submitFeedback;
window.saveFeedbackToFirestore = saveFeedbackToFirestore;
window.getBroadcastMessages = getBroadcastMessages;

