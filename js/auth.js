// ============================================================
// GOOGLE AUTHENTICATION MODULE — CA Final Planner
// ============================================================

let currentGoogleUser = null;
let isAuthInitialized = false;

// Initialize Google Sign-In
function initGoogleSignIn() {
  if (isAuthInitialized) return;
  
  if (!window.firebase || !window.firebase.auth) {
    console.warn("Firebase auth not ready");
    return;
  }

  try {
    // Set up auth state listener
    firebase.auth().onAuthStateChanged((user) => {
      currentGoogleUser = user;
      if (user) {
        onUserLoggedIn(user);
      } else {
        onUserLoggedOut();
      }
    });
    
    isAuthInitialized = true;
    console.log("✅ Google Sign-In initialized");
  } catch (e) {
    console.error("Google Sign-In init failed:", e);
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
    
    showToast(`👋 Welcome, ${user.displayName}!`, 'success');
    return user;
  } catch (error) {
    if (error.code === 'auth/popup-blocked') {
      showToast('❌ Pop-up blocked. Enable pop-ups and try again.', 'error');
    } else if (error.code !== 'auth/cancelled-popup-request') {
      showToast(`❌ Sign-in failed: ${error.message}`, 'error');
    }
    console.error("Google sign-in error:", error);
    return null;
  }
}

// Save Google user to Firestore
async function saveGoogleUserToFirestore(user) {
  if (!window.db || !user) return;
  
  try {
    const docId = user.email.replace(/[^a-zA-Z0-9]/g, '_');
    await window.db.collection("users").doc(docId).set({
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      googleId: user.uid,
      authMethod: 'google',
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    
    console.log("✅ User saved to Firestore");
  } catch (e) {
    console.error("Firestore save failed:", e);
  }
}

// Load user profile from Firestore
async function loadGoogleUserProfile(email) {
  if (!window.db || !email) return null;
  
  try {
    const docId = email.replace(/[^a-zA-Z0-9]/g, '_');
    const doc = await window.db.collection("users").doc(docId).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error("Firestore load failed:", e);
    return null;
  }
}

// Sign out
async function signOutUser() {
  try {
    await firebase.auth().signOut();
    currentGoogleUser = null;
    showToast('👋 Signed out successfully', 'success');
    navigateTo('landing');
  } catch (error) {
    showToast(`❌ Sign-out failed: ${error.message}`, 'error');
  }
}

// Called when user logs in
async function onUserLoggedIn(user) {
  console.log("✅ User logged in:", user.email);
  
  // Load user's data from Firestore
  const profile = await loadGoogleUserProfile(user.email);
  
  // Set up STATE with user data
  if (profile && profile.profileCompleted) {
    STATE.profile = profile;
    STATE.profile.email = user.email;
    STATE.profile.name = user.displayName;
    STATE.profile.photo = user.photoURL;
    
    // Load their saved data
    loadUserData(STATE.profile.email);
    
    // Show dashboard
    document.getElementById('main-nav')?.classList.remove('hidden');
    navigateTo('dashboard');
  } else {
    // First time user - go to onboarding
    document.getElementById('main-nav')?.classList.remove('hidden');
    navigateTo('onboarding');
  }
}

// Called when user logs out
function onUserLoggedOut() {
  console.log("User logged out");
  STATE.profile = null;
  STATE.timetable = [];
  STATE.tracker = {};
  STATE.revision = {};
  localStorage.clear();
  document.getElementById('main-nav')?.classList.add('hidden');
  navigateTo('landing');
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

