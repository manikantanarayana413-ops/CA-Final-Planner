// ============================================================
// CA FINAL PLANNER - AUTHENTICATION
// ============================================================

window.isLoginMode = true;

function toggleAuthMode() {
  window.isLoginMode = !window.isLoginMode;
  const title = document.getElementById('modal-title');
  const btn = document.getElementById('auth-main-btn');
  const toggleText = document.getElementById('toggle-text');

  if (window.isLoginMode) {
    title.textContent = 'Log In';
    btn.textContent = 'Log In';
    toggleText.innerHTML = 'Don\'t have an account? <a href="#" onclick="toggleAuthMode(); return false;">Sign Up</a>';
  } else {
    title.textContent = 'Sign Up';
    btn.textContent = 'Sign Up';
    toggleText.innerHTML = 'Already have an account? <a href="#" onclick="toggleAuthMode(); return false;">Log In</a>';
  }
}
window.toggleAuthMode = toggleAuthMode;

async function handleAuthAction() {
  if (window.isLoginMode) await performLogin();
  else await performSignUp();
}
window.handleAuthAction = handleAuthAction;

async function performSignUp() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const errorMsg = document.getElementById('login-error-msg');

  if (!email || !pass) { errorMsg.textContent = "Enter email & password."; return; }

  try {
    errorMsg.textContent = "Creating account...";
    const userCredential = await window.auth.createUserWithEmailAndPassword(email, pass);
    
    // Explicitly send verification email
    await userCredential.user.sendEmailVerification();
    
    alert("Account created! A verification email has been sent. Please check your inbox.");
    hideLoginModal();
  } catch (error) {
    errorMsg.textContent = error.message;
  }
}
window.performSignUp = performSignUp;

async function performLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const errorMsg = document.getElementById('login-error-msg');

  try {
    await window.auth.signInWithEmailAndPassword(email, pass);
    hideLoginModal();
    location.reload();
  } catch (error) {
    errorMsg.textContent = error.message;
  }
}
window.performLogin = performLogin;

// (Keep your existing performLogout and friendlyAuthError functions below)
