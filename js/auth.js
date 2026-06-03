// ============================================================
// GOOGLE AUTHENTICATION — CA Final Planner
// ============================================================

// Auth state listener
function initGoogleSignIn() {
  if (!window.firebase) {
    console.warn("⚠️ Firebase not loaded");
    return;
  }

  try {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        console.log("✅ Auth state: logged in -", user.email);
        handleUserLoggedIn(user);
      } else {
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
      if (window.saveUserToFirestore) window.saveUserToFirestore(user);
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

// Handle login
async function handleUserLoggedIn(user) {
  console.log("📱 Processing login for:", user.email);
  
  // Ensure STATE exists
  if (!window.STATE) {
    window.STATE = { profile: null };
  }

  // Load user profile from Firestore
  const profile = await loadUserProfile(user.uid);
  console.log("📋 Loaded profile:", profile ? 'exists' : 'new user');

  if (profile && profile.profileCompleted) {
    // Returning user - load from Firestore and set dashboard
    STATE.profile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      profileCompleted: true,
      ...profile
    };

    console.log("✅ Returning user - loading dashboard");
    localStorage.setItem('ca_final_profile', JSON.stringify(STATE.profile));

    // Show nav
    const nav = document.getElementById("main-nav");
    if (nav) nav.classList.remove("hidden");

    // Delay navigation to ensure all resources loaded
    setTimeout(() => {
      if (window.navigateTo) {
        window.navigateTo("dashboard");
      }
    }, 100);
  } else {
    // New user - show onboarding wizard
    STATE.profile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
      profileCompleted: false
    };

    console.log("🆕 New user - starting onboarding");
    localStorage.setItem('ca_final_profile', JSON.stringify(STATE.profile));

    // Show nav
    const nav = document.getElementById("main-nav");
    if (nav) nav.classList.remove("hidden");

    // Start onboarding wizard
    if (window.startOnboarding) {
      window.startOnboarding();
    }
  }
}

// Handle logout
function handleUserLoggedOut() {
  console.log("👋 User logged out");
  
  if (!window.STATE) window.STATE = {};
  
  window.STATE.profile = null;
  window.STATE.timetable = [];
  window.STATE.tracker = {};
  window.STATE.revision = {};
  
  // Clear localStorage
  localStorage.removeItem('ca_final_profile');
  localStorage.removeItem('ca_final_timetable');
  localStorage.removeItem('ca_final_tracker');
  localStorage.removeItem('ca_final_revision');

  const nav = document.getElementById("main-nav");
  if (nav) nav.classList.add("hidden");

  if (window.navigateTo) window.navigateTo("landing");
}

// Setup auth initialization on page load
function setupAuthInit() {
  console.log("=== AUTH INIT ===");
  
  if (window.initGoogleSignIn) {
    window.initGoogleSignIn();
    console.log("✅ Google Auth listener attached");
  }
}

// Run on document ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAuthInit);
} else {
  setupAuthInit();
}

// Expose to window for debugging
window.handleUserLoggedIn = handleUserLoggedIn;
window.handleUserLoggedOut = handleUserLoggedOut;
window.signInWithGoogle = signInWithGoogle;
