// ============================================================
// AUTHENTICATION & LOGIN SYSTEM — CA Final Planner
// ============================================================

// Global Auth State
let currentAuthUser = null;

// Initialize Auth Listeners
function initAuthListeners() {
  if (!FEATURES.firebaseEnabled || !firebase || !firebase.auth) {
    console.log("Firebase auth not available, running in offline mode");
    return;
  }

  firebase.auth().onAuthStateChanged((user) => {
    currentAuthUser = user;
    console.log("Auth state changed:", user ? "User logged in" : "User logged out");
    
    if (user) {
      // User is signed in
      STATE.profile = {
        name: user.displayName || user.email.split('@')[0],
        email: user.email,
        uid: user.uid,
        id: user.uid
      };
      localStorage.setItem('ca_final_user_uid', user.uid);
      document.getElementById('main-nav')?.classList.remove('hidden');
      hideLoginModal();
      navigateTo('dashboard');
    } else {
      // User is signed out
      document.getElementById('main-nav')?.classList.add('hidden');
    }
  });
}

// Show Login Modal
function showLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// Hide Login Modal
function hideLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-error-msg').textContent = '';
  }
}

// Perform Login
async function performLogin() {
  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value.trim();
  const errorMsg = document.getElementById('login-error-msg');

  if (!email || !password) {
    errorMsg.textContent = '⚠️ Please enter email and password.';
    return;
  }

  if (!FEATURES.firebaseEnabled || !firebase) {
    errorMsg.textContent = '❌ Firebase not available. Running in offline mode.';
    return;
  }

  try {
    const result = await firebase.auth().signInWithEmailAndPassword(email, password);
    console.log("Login successful:", result.user.email);
    showToast(`✅ Welcome back, ${result.user.displayName || result.user.email}!`);
    hideLoginModal();
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    let msg = '❌ Login failed.';
    if (error.code === 'auth/user-not-found') {
      msg = '❌ User not found. Please sign up first.';
    } else if (error.code === 'auth/wrong-password') {
      msg = '❌ Incorrect password. Try again.';
    } else if (error.code === 'auth/invalid-email') {
      msg = '❌ Invalid email format.';
    }
    errorMsg.textContent = msg;
  }
}

// Perform Sign Up
async function performSignUp() {
  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value.trim();
  const errorMsg = document.getElementById('login-error-msg');

  if (!email || !password) {
    errorMsg.textContent = '⚠️ Please enter email and password.';
    return;
  }

  if (password.length < 6) {
    errorMsg.textContent = '⚠️ Password must be at least 6 characters.';
    return;
  }

  if (!FEATURES.firebaseEnabled || !firebase) {
    errorMsg.textContent = '❌ Firebase not available. Running in offline mode.';
    return;
  }

  try {
    const result = await firebase.auth().createUserWithEmailAndPassword(email, password);
    const user = result.user;
    
    // Set display name
    const name = email.split('@')[0];
    await user.updateProfile({ displayName: name });

    console.log("Sign up successful:", user.email);
    showToast(`🎉 Welcome to CA Final Planner, ${name}!`);
    
    // Start onboarding after signup
    currentAuthUser = user;
    STATE.profile = {
      name: name,
      email: user.email,
      uid: user.uid,
      id: user.uid
    };
    localStorage.setItem('ca_final_user_uid', user.uid);
    
    hideLoginModal();
    startOnboarding();
  } catch (error) {
    console.error("Sign up error:", error.code, error.message);
    let msg = '❌ Sign up failed.';
    if (error.code === 'auth/email-already-in-use') {
      msg = '❌ Email already in use. Please log in instead.';
    } else if (error.code === 'auth/invalid-email') {
      msg = '❌ Invalid email format.';
    } else if (error.code === 'auth/weak-password') {
      msg = '❌ Password is too weak (min 6 characters).';
    }
    errorMsg.textContent = msg;
  }
}

// Perform Logout
async function performLogout() {
  if (!FEATURES.firebaseEnabled || !firebase) {
    // Offline logout - just clear localStorage
    localStorage.clear();
    STATE.profile = null;
    STATE.timetable = [];
    STATE.tracker = {};
    STATE.revision = {};
    document.getElementById('main-nav')?.classList.add('hidden');
    navigateTo('landing');
    showToast('✅ Logged out successfully.');
    return;
  }

  try {
    await firebase.auth().signOut();
    console.log("Logout successful");
    
    // Clear local data
    localStorage.clear();
    STATE.profile = null;
    STATE.timetable = [];
    STATE.tracker = {};
    STATE.revision = {};
    
    document.getElementById('main-nav')?.classList.add('hidden');
    hideProfileModal();
    navigateTo('landing');
    showToast('✅ Logged out successfully.');
  } catch (error) {
    console.error("Logout error:", error);
    showToast('❌ Logout failed.');
  }
}

// Admin Login
function promptAdminLogin() {
  const password = prompt('🔒 Enter Admin Password:');
  if (password === ADMIN_PASSWORD) {
    STATE.profile = {
      name: 'Admin',
      email: 'admin@cafinalplanner.com',
      id: 'admin_' + Date.now(),
      isAdmin: true
    };
    localStorage.setItem(KEYS.profile, JSON.stringify(STATE.profile));
    document.getElementById('main-nav')?.classList.remove('hidden');
    navigateTo('admin');
    showToast('🔑 Admin mode activated.');
  } else if (password !== null) {
    showToast('❌ Incorrect admin password.');
  }
}

// Show Profile Modal
function showProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

// Hide Profile Modal
function hideProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Initialize Auth on page load
document.addEventListener('DOMContentLoaded', () => {
  initAuthListeners();
});

// Expose functions to window
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.performLogin = performLogin;
window.performSignUp = performSignUp;
window.performLogout = performLogout;
window.promptAdminLogin = promptAdminLogin;
window.showProfileModal = showProfileModal;
window.hideProfileModal = hideProfileModal;
