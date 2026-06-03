// ============================================================
// GOOGLE AUTHENTICATION — CA Final Planner
// ============================================================

let currentGoogleUser = null;

// Initialize Google Sign-In (called from index.html initApp)
function initGoogleSignIn() {
  if (!window.firebase) {
    console.warn("⚠️ Firebase not loaded");
    return;
  }

  try {
    // Auth state listener
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        currentGoogleUser = user;
        console.log("✅ Auth state: logged in -", user.email);
        handleUserLoggedIn(user);
      } else {
        currentGoogleUser = null;
        console.log("✅ Auth state: logged out");
        handleUserLoggedOut();
      }
    });
  } catch (e) {
    console.error("❌ Auth init failed:", e.message);
  }
}

// Google Sign-In button
function signInWithGoogle() {
  if (!window.firebase) {
    showToast("❌ Firebase not initialized", "error");
    return false;
  }

  const provider = new firebase.auth.GoogleAuthProvider();
  
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      console.log("✅ Signed in:", user.email);
      saveUserToFirestore(user);
      showToast(`👋 Welcome, ${user.displayName || 'Friend'}!`);
      return false;
    })
    .catch((error) => {
      if (error.code !== 'auth/cancelled-popup-request') {
        showToast(`❌ Sign-in failed: ${error.message}`, "error");
        console.error("Sign-in error:", error);
      }
      return false;
    });
  
  return false;
}

// Save user to Firestore
function saveUserToFirestore(user) {
  if (!window.db || !user) return;

  try {
    window.db.collection("users").doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "Student",
      photoURL: user.photoURL || "",
      authMethod: "google",
      profileCompleted: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      lastLogin: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(e => console.error("Save failed:", e.message));
  } catch (e) {
    console.error("❌ Save to Firestore failed:", e.message);
  }
}

// Load user profile from Firestore
async function loadUserFromFirestore(uid) {
  if (!window.db) return null;
  try {
    const doc = await window.db.collection("users").doc(uid).get();
    return doc.exists ? doc.data() : null;
  } catch (e) {
    console.error("❌ Load from Firestore failed:", e.message);
    return null;
  }
}

// Sign out
function signOutUser() {
  firebase.auth().signOut()
    .then(() => {
      currentGoogleUser = null;
      showToast("👋 Signed out");
      console.log("✅ Signed out");
      if (window.navigateTo) window.navigateTo("landing");
      return false;
    })
    .catch((error) => {
      showToast(`❌ Sign-out failed: ${error.message}`, "error");
      return false;
    });
  
  return false;
}

// Handle login
async function handleUserLoggedIn(user) {
  // Ensure STATE exists
  if (!window.STATE) {
    window.STATE = { profile: null };
  }

  // Load user profile
  const profile = await loadUserFromFirestore(user.uid);

  if (profile && profile.profileCompleted) {
    // Returning user - show dashboard
    window.STATE.profile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      ...profile
    };

    // Show nav & dashboard
    const nav = document.getElementById("main-nav");
    if (nav) nav.classList.remove("hidden");

    if (window.navigateTo) window.navigateTo("dashboard");
    if (window.renderDashboard) window.renderDashboard();
  } else {
    // New user - show onboarding
    window.STATE.profile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      profileCompleted: false
    };

    // Show nav & onboarding
    const nav = document.getElementById("main-nav");
    if (nav) nav.classList.remove("hidden");

    if (window.navigateTo) window.navigateTo("onboarding");
    if (window.renderWizardStep) window.renderWizardStep();
  }
}

// Handle logout
function handleUserLoggedOut() {
  if (!window.STATE) window.STATE = {};
  
  window.STATE.profile = null;
  window.STATE.timetable = [];
  window.STATE.tracker = {};
  window.STATE.revision = {};

  const nav = document.getElementById("main-nav");
  if (nav) nav.classList.add("hidden");

  if (window.navigateTo) window.navigateTo("landing");
}

// Helper to show profile menu
function showProfileMenu() {
  if (window.isUserLoggedIn && window.isUserLoggedIn()) {
    // Show logout option
    const confirmed = confirm("Sign out?");
    if (confirmed) {
      signOutUser();
    }
  }
  return false;
}

// Exports
window.initGoogleSignIn = initGoogleSignIn;
window.signInWithGoogle = signInWithGoogle;
window.signOutUser = signOutUser;

