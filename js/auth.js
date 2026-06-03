// ============================================================
// GOOGLE AUTHENTICATION MODULE — CA Final Planner
// ============================================================

let currentGoogleUser = null;
let isAuthInitialized = false;

// Initialize Google Sign-In
function initGoogleSignIn() {
  if (isAuthInitialized) return;
  
  if (!window.firebase || !window.firebase.auth) {
    console.warn("⚠️ Firebase auth not ready");
    return;
  }

  try {
    // Set up auth state listener
    // This will fire after ALL scripts load, so app.js functions will exist
    firebase.auth().onAuthStateChanged((user) => {
      console.log("Auth state changed:", user ? user.email : "logged out");
      currentGoogleUser = user;
      
      if (user) {
        // Delay to ensure app.js is loaded
        setTimeout(() => onUserLoggedIn(user), 100);
      } else {
        setTimeout(() => onUserLoggedOut(), 100);
      }
    });
    
    isAuthInitialized = true;
    console.log("✅ Google Sign-In initialized");
  } catch (e) {
    console.error("❌ Google Sign-In init failed:", e);
  }
}

// Google Sign-In button click
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      'prompt': 'consent'
    });
    
    const result = await firebase.auth().signInWithPopup(provider);
    const user = result.user;
    
    // Save user profile to Firestore
    await saveGoogleUserToFirestore(user);
    
    if (window.showToast) {
      showToast(`👋 Welcome, ${user.displayName}!`, 'success');
    }
    
    return user;
  } catch (error) {
    let message = '❌ Sign-in failed';
    if (error.code === 'auth/popup-blocked') {
      message = '❌ Pop-up blocked. Enable pop-ups and try again.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.log("User cancelled sign-in");
      return null;
    } else {
      message = `❌ Sign-in failed: ${error.message}`;
    }
    
    if (window.showToast) {
      showToast(message, 'error');
    }
    
    console.error("Google sign-in error:", error);
    return null;
  }
}

// Save Google user to Firestore with proper user ID
async function saveGoogleUserToFirestore(user) {
  if (!window.db || !user) return;
  
  try {
    // Use Firebase UID as the document ID (more reliable than email)
    const userId = user.uid;
    
    await window.db.collection("users").doc(userId).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Student',
      photoURL: user.photoURL || '',
      authMethod: 'google',
      profileCompleted: false,
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log("✅ User saved to Firestore:", userId);
  } catch (e) {
    console.error("❌ Firestore save failed:", e);
  }
}

// Load user profile from Firestore by UID
async function loadGoogleUserProfile(uid) {
  if (!window.db || !uid) return null;
  
  try {
    const doc = await window.db.collection("users").doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error("❌ Firestore load failed:", e);
    return null;
  }
}

// Sign out
async function signOutUser() {
  try {
    if (window.firebase && window.firebase.auth) {
      await firebase.auth().signOut();
    }
    currentGoogleUser = null;
    
    if (window.showToast) {
      showToast('👋 Signed out successfully', 'success');
    }
    
    // navigateTo will be called by onUserLoggedOut
  } catch (error) {
    if (window.showToast) {
      showToast(`❌ Sign-out failed: ${error.message}`, 'error');
    }
  }
}

// Called when user logs in
async function onUserLoggedIn(user) {
  console.log("✅ User logged in:", user.email);
  
  // Wait for app.js to be fully loaded
  if (!window.STATE || !window.navigateTo) {
    console.warn("⚠️ App not fully loaded yet, waiting...");
    setTimeout(() => onUserLoggedIn(user), 500);
    return;
  }
  
  // Load user's profile from Firestore
  const profile = await loadGoogleUserProfile(user.uid);
  
  // Initialize STATE if not already done
  if (!window.STATE) {
    window.STATE = {};
  }
  
  // Check if user completed onboarding
  if (profile && profile.profileCompleted) {
    // User completed onboarding before
    window.STATE.profile = profile;
    window.STATE.profile.email = user.email;
    window.STATE.profile.name = user.displayName;
    window.STATE.profile.photo = user.photoURL;
    
    // Show nav and dashboard
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.remove('hidden');
    
    window.navigateTo('dashboard');
    window.renderDashboard();
  } else {
    // First time user - go to onboarding wizard
    console.log("First time user, showing onboarding");
    
    window.STATE.profile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      profileCompleted: false
    };
    
    // Show nav
    const nav = document.getElementById('main-nav');
    if (nav) nav.classList.remove('hidden');
    
    // Show onboarding
    window.navigateTo('onboarding');
    
    if (window.renderWizardStep) {
      window.renderWizardStep();
    }
  }
}

// Called when user logs out
function onUserLoggedOut() {
  console.log("👋 User logged out");
  
  if (!window.STATE) {
    window.STATE = {};
  }
  
  window.STATE.profile = null;
  window.STATE.timetable = [];
  window.STATE.tracker = {};
  window.STATE.revision = {};
  
  if (window.localStorage) {
    try {
      localStorage.clear();
    } catch (e) {}
  }
  
  // Hide nav
  const nav = document.getElementById('main-nav');
  if (nav) nav.classList.add('hidden');
  
  // Go to landing
  if (window.navigateTo) {
    window.navigateTo('landing');
  }
}

// Get current user
function getCurrentUser() {
  return currentGoogleUser;
}

// Check if user is authenticated
function isUserLoggedIn() {
  return currentGoogleUser !== null;
}

// Export to window
window.initGoogleSignIn = initGoogleSignIn;
window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;
window.getCurrentUser = getCurrentUser;
window.isUserLoggedIn = isUserLoggedIn;

