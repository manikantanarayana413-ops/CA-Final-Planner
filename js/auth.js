// ============================================================
// AUTHENTICATION & LOGIN SYSTEM — CA Final Planner
// ============================================================

// Global Auth State
let currentAuthUser = null;
let pendingSignUpEmail = null;

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
    showLoginStep();
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
    pendingSignUpEmail = null;
    showLoginStep();
  }
}

// Show Login Step (email + password)
function showLoginStep() {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const loginBtn = document.getElementById('login-submit-btn');
  const signupBtn = document.getElementById('login-signup-btn');
  const backBtn = document.getElementById('login-back-btn');
  const verifySection = document.getElementById('login-verify-section');

  emailInput.style.display = 'block';
  passwordInput.style.display = 'block';
  loginBtn.style.display = 'inline-block';
  signupBtn.style.display = 'inline-block';
  backBtn.style.display = 'none';
  if (verifySection) verifySection.style.display = 'none';

  emailInput.placeholder = 'your@email.com';
  passwordInput.placeholder = '••••••••';
}

// Show Signup Step (email only)
function showSignupStep() {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const loginBtn = document.getElementById('login-submit-btn');
  const signupBtn = document.getElementById('login-signup-btn');
  const backBtn = document.getElementById('login-back-btn');
  const verifySection = document.getElementById('login-verify-section');

  emailInput.style.display = 'block';
  passwordInput.style.display = 'none';
  loginBtn.style.display = 'none';
  signupBtn.textContent = '📧 Send Sign-Up Link';
  signupBtn.style.display = 'inline-block';
  backBtn.style.display = 'inline-block';
  if (verifySection) verifySection.style.display = 'none';

  emailInput.placeholder = 'Enter your email';
  emailInput.value = '';
  document.getElementById('login-error-msg').textContent = '';
}

// Show Verification Sent Step
function showVerificationStep(email) {
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const loginBtn = document.getElementById('login-submit-btn');
  const signupBtn = document.getElementById('login-signup-btn');
  const backBtn = document.getElementById('login-back-btn');
  const verifySection = document.getElementById('login-verify-section');

  emailInput.style.display = 'none';
  passwordInput.style.display = 'none';
  loginBtn.style.display = 'none';
  signupBtn.style.display = 'none';
  backBtn.style.display = 'inline-block';
  if (verifySection) {
    verifySection.style.display = 'block';
    document.getElementById('verify-email-display').textContent = email;
    pendingSignUpEmail = email;
  }

  document.getElementById('login-error-msg').textContent = '';
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
    } else if (error.code === 'auth/invalid-credential') {
      msg = '❌ Invalid email or password.';
    }
    errorMsg.textContent = msg;
  }
}

// Perform Sign Up (Email Only - Send Link)
async function performSignUp() {
  const email = document.getElementById('login-email')?.value.trim();
  const errorMsg = document.getElementById('login-error-msg');

  if (!email) {
    errorMsg.textContent = '⚠️ Please enter your email address.';
    return;
  }

  if (!email.includes('@')) {
    errorMsg.textContent = '⚠️ Please enter a valid email address.';
    return;
  }

  if (!FEATURES.firebaseEnabled || !firebase) {
    errorMsg.textContent = '❌ Firebase not available. Running in offline mode.';
    return;
  }

  try {
    // Check if user already exists
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      // If this succeeds, user exists
      showToast('📧 User exists! Password reset link sent. Check your email.');
      errorMsg.textContent = '✅ If this email is registered, password reset link has been sent.';
      return;
    } catch (checkError) {
      if (checkError.code !== 'auth/user-not-found') {
        throw checkError;
      }
      // User not found, proceed with signup
    }

    // Create new user with temporary password
    const tempPassword = Math.random().toString(36).slice(-12); // Random secure password
    const result = await firebase.auth().createUserWithEmailAndPassword(email, tempPassword);
    const user = result.user;

    // Set display name
    const name = email.split('@')[0];
    await user.updateProfile({ displayName: name });

    // Send password setup link (using sendPasswordResetEmail)
    await firebase.auth().sendPasswordResetEmail(email);

    console.log("Sign up email sent:", email);
    showToast('📧 Sign-up link sent! Check your email to set your password.');

    // Show verification step
    showVerificationStep(email);
    pendingSignUpEmail = email;
  } catch (error) {
    console.error("Sign up error:", error.code, error.message);
    let msg = '❌ Sign up failed.';
    if (error.code === 'auth/email-already-in-use') {
      msg = '✅ Email already registered! Password reset link sent.';
      showToast('📧 Check your email for password setup link.');
    } else if (error.code === 'auth/invalid-email') {
      msg = '❌ Invalid email format.';
    } else if (error.code === 'auth/weak-password') {
      msg = '❌ System error. Please try again.';
    }
    errorMsg.textContent = msg;
  }
}

// Go Back from Signup to Login
function goBackToLogin() {
  showLoginStep();
  pendingSignUpEmail = null;
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
window.goBackToLogin = goBackToLogin;
window.showLoginStep = showLoginStep;
window.showSignupStep = showSignupStep;
window.performLogout = performLogout;
window.promptAdminLogin = promptAdminLogin;
window.showProfileModal = showProfileModal;
window.hideProfileModal = hideProfileModal;
