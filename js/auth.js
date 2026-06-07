// ============================================================
// CA FINAL PLANNER - AUTHENTICATION
// Auth logic, Modals, Firebase Sync
// ============================================================

// ── MODAL HELPERS ─────────────────────────────────────────────
function showLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.remove('hidden');
    const err = document.getElementById('login-error-msg');
    if (err) { err.textContent = ''; err.style.color = 'var(--red)'; }
  }
}
function hideLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) modal.classList.add('hidden');
}
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;

// ── SIGN UP ───────────────────────────────────────────────────
async function performSignUp() {
  const email    = (document.getElementById('login-email')?.value || '').trim();
  const pass     = document.getElementById('login-password')?.value || '';
  const errorMsg = document.getElementById('login-error-msg');

  const setError = (msg) => { if (errorMsg) { errorMsg.style.color = 'var(--red)'; errorMsg.textContent = msg; } };
  const setOk    = (msg) => { if (errorMsg) { errorMsg.style.color = 'var(--emerald)'; errorMsg.textContent = msg; } };

  if (!email || !pass) { setError('Please enter both email and password.'); return; }
  if (pass.length < 6) { setError('Password must be at least 6 characters.'); return; }

  if (!FEATURES.firebaseEnabled || typeof firebase === 'undefined' || !auth) {
    setError('Cannot sign up — Firebase is not connected. Check your internet connection.');
    return;
  }

  try {
    setOk('Creating account...');
    const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
    const user = userCredential.user;
    
    setOk('Sending verification email...');
    await user.sendEmailVerification();
    
    setOk('✅ Account created! Please check your email to verify your account, then launch your study wizard...');
    setTimeout(() => {
      hideLoginModal();
      startOnboarding();
    }, 2500);
  } catch (error) {
    console.error('Sign up error:', error);
    setError(friendlyAuthError(error.code, error.message));
  }
}
window.performSignUp = performSignUp;

// ── LOG IN ────────────────────────────────────────────────────
let unsubscribeSnapshot = null;

async function performLogin() {
  const email    = (document.getElementById('login-email')?.value || '').trim();
  const pass     = document.getElementById('login-password')?.value || '';
  const errorMsg = document.getElementById('login-error-msg');

  const setError = (msg) => { if (errorMsg) { errorMsg.style.color = 'var(--red)'; errorMsg.textContent = msg; } };
  const setOk    = (msg) => { if (errorMsg) { errorMsg.style.color = 'var(--emerald)'; errorMsg.textContent = msg; } };

  if (!email || !pass) { setError('Please enter both email and password.'); return; }

  if (!FEATURES.firebaseEnabled || typeof firebase === 'undefined' || !auth) {
    setError('Cannot log in — Firebase is not connected. Check your internet connection.');
    return;
  }

  try {
    setOk('Signing in...');
    const { user } = await auth.signInWithEmailAndPassword(email, pass);

    if (!user.emailVerified) {
      setError('Please verify your email address before logging in.');
      await auth.signOut();
      return;
    }

    setOk('Loading your study plan in real-time...');
    
    const docId = user.email.replace(/[^a-zA-Z0-9]/g, '_');
    
    setupUserSnapshotListener(docId);

    hideLoginModal();
    document.getElementById('main-nav')?.classList.remove('hidden');
    navigateTo('dashboard');
    showToast('👋 Welcome back!');

  } catch (error) {
    console.error('Login error:', error);
    setError(friendlyAuthError(error.code, error.message));
  }
}
window.performLogin = performLogin;

function setupUserSnapshotListener(docId) {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
  }
  unsubscribeSnapshot = db.collection("users").doc(docId).onSnapshot((doc) => {
    if (doc.exists) {
      const savedData = doc.data();
      if (savedData && savedData.name) {
        const { timetable, tracker, revision, mocks, friends, lastLogin, updatedAt, ...profileFields } = savedData;
        STATE.profile   = profileFields;
        STATE.timetable = Array.isArray(timetable) ? timetable : [];
        STATE.tracker   = tracker   || {};
        STATE.revision  = revision  || {};
        STATE.mocks     = mocks     || [];
        STATE.friends   = friends   || [];

        // Save locally just for quick reload cache
        localStorage.setItem(KEYS.profile, JSON.stringify(STATE.profile));
        localStorage.setItem(KEYS.timetable, JSON.stringify(STATE.timetable));
        localStorage.setItem(KEYS.tracker, JSON.stringify(STATE.tracker));
        localStorage.setItem(KEYS.revision, JSON.stringify(STATE.revision));

        hideLoginModal();
        document.getElementById('main-nav')?.classList.remove('hidden');
        
        if (typeof calculateStreak === 'function') calculateStreak();
        
        // Re-render UI depending on current screen
        if (STATE.activeSection === 'landing') {
          navigateTo('dashboard');
        } else {
          navigateTo(STATE.activeSection, true);
        }
      }
    } else {
       // No profile yet, launch wizard
       hideLoginModal();
       startOnboarding();
       showToast('Welcome! Let\'s set up your personalized study plan 🚀');
    }
  }, (err) => {
    console.error("Firestore snapshot error:", err);
  });
}
window.setupUserSnapshotListener = setupUserSnapshotListener;

function initAuthListener() {
  if (!FEATURES.firebaseEnabled || typeof firebase === 'undefined' || !auth) {
    return;
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      if (user.emailVerified) {
        const docId = user.email.replace(/[^a-zA-Z0-9]/g, '_');
        if (!unsubscribeSnapshot) {
          setupUserSnapshotListener(docId);
        }
      }
    } else {
      // User logged out from another tab/session
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }
      if (STATE.profile) {
        Object.values(KEYS).forEach(k => localStorage.removeItem(k));
        STATE.profile   = null;
        STATE.timetable = [];
        STATE.tracker   = {};
        STATE.revision  = {};
        STATE.mocks     = [];
        STATE.friends   = [];
        document.getElementById('main-nav')?.classList.add('hidden');
        if (typeof hideProfileModal === 'function') hideProfileModal();
        navigateTo('landing');
        showToast('🔄 Session ended. Logged out.');
      }
    }
  });
}
window.initAuthListener = initAuthListener;


// ── LOGOUT ───────────────────────────────────────────────────
function performLogout() {
  if (unsubscribeSnapshot) {
    unsubscribeSnapshot();
    unsubscribeSnapshot = null;
  }
  if (FEATURES.firebaseEnabled && typeof firebase !== 'undefined' && auth) {
    auth.signOut().catch(console.error);
  }
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  STATE.profile   = null;
  STATE.timetable = [];
  STATE.tracker   = {};
  STATE.revision  = {};
  STATE.mocks     = [];
  STATE.friends   = [];
  document.getElementById('main-nav')?.classList.add('hidden');
  
  if (typeof hideProfileModal === 'function') hideProfileModal();
  
  navigateTo('landing');
}
window.performLogout = performLogout;

// ── AUTH ERROR MESSAGES ───────────────────────────────────────
function friendlyAuthError(code, fallback) {
  const map = {
    'auth/user-not-found':       'No account found with this email. Please Sign Up first.',
    'auth/wrong-password':       'Incorrect password. Please try again.',
    'auth/invalid-email':        'Please enter a valid email address.',
    'auth/email-already-in-use': 'This email is already registered. Please Log In instead.',
    'auth/weak-password':        'Password must be at least 6 characters.',
    'auth/too-many-requests':    'Too many failed attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/invalid-credential':   'Invalid email or password. Please check and try again.',
  };
  return map[code] || fallback || 'An unexpected error occurred. Please try again.';
}


