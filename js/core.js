// ============================================================
// INITIALIZATION & SPA ROUTING
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Start decorative stars background
  initStarsCanvas();

  // 2. Load data from local storage (offline-first)
  loadStateFromStorage();

  // 3. Set up all static event listeners
  setupStaticListeners();

  // 4. Initialize Firebase (fails gracefully offline)
  initFirebase();
  if (typeof initAuthListener === 'function') {
    initAuthListener();
  }

  // 5. Set up URL routing / back-button support
  setupRouting();

  // 6. Hide loading screen gracefully
  setTimeout(() => {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.pointerEvents = 'none';
      setTimeout(() => loader.classList.add('hidden'), 500);
    }
  }, 1400);
});

// ─── Static Listener Setup ───────────────────────────────────
function setupStaticListeners() {
  // Landing page CTAs
  document.getElementById('hero-start-btn')?.addEventListener('click', startOnboarding);
  document.getElementById('footer-start-btn')?.addEventListener('click', startOnboarding);
  document.getElementById('hero-learn-btn')?.addEventListener('click', () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Calendar month navigation
  document.getElementById('prev-month-btn')?.addEventListener('click', () => adjustCalMonth(-1));
  document.getElementById('next-month-btn')?.addEventListener('click', () => adjustCalMonth(1));

  // Tracker date navigation
  document.getElementById('prev-day-btn')?.addEventListener('click', () => adjustTrackerDate(-1));
  document.getElementById('next-day-btn')?.addEventListener('click', () => adjustTrackerDate(1));
  document.getElementById('add-session-btn')?.addEventListener('click', showAddSessionForm);

  // Profile avatar → dedicated Profile page
  document.getElementById('nav-avatar')?.addEventListener('click', () => navigateTo('profile'));

  // Desktop nav links
  document.querySelectorAll('.nav-link[data-section]').forEach(link => {
    link.addEventListener('click', () => {
      const section = link.getAttribute('data-section');
      if (section) navigateTo(section);
    });
  });
}

// ─── Load state from localStorage ────────────────────────────
function loadStateFromStorage() {
  try {
    const profile  = localStorage.getItem(KEYS.profile);
    const timetable = localStorage.getItem(KEYS.timetable);
    const tracker  = localStorage.getItem(KEYS.tracker);
    const revision = localStorage.getItem(KEYS.revision);
    const mocks    = localStorage.getItem(KEYS.mocks);
    const friends  = localStorage.getItem(KEYS.friends);

    if (profile) {
      STATE.profile   = JSON.parse(profile);
      STATE.timetable = timetable  ? JSON.parse(timetable)  : [];
      STATE.tracker   = tracker    ? JSON.parse(tracker)    : {};
      STATE.revision  = revision   ? JSON.parse(revision)   : {};
      STATE.mocks     = mocks      ? JSON.parse(mocks)      : [];
      STATE.friends   = friends    ? JSON.parse(friends)    : [];

      if (typeof calculateStreak === 'function') calculateStreak();

      // Load Pomodoro Count
      const savedPomoDate = localStorage.getItem(KEYS.pomoDate);
      const todayStr = new Date().toISOString().split('T')[0];
      if (savedPomoDate === todayStr) {
        STATE.pomo.completedToday = parseInt(localStorage.getItem(KEYS.pomoCount) || '0', 10);
      } else {
        localStorage.setItem(KEYS.pomoDate, todayStr);
        localStorage.setItem(KEYS.pomoCount, '0');
        STATE.pomo.completedToday = 0;
      }

      // Show Nav
      document.getElementById('main-nav')?.classList.remove('hidden');
    }
  } catch (e) {
    console.error('Failed to load localStorage state:', e);
  }
}

// ─── Save state to localStorage (and sync to Firestore) ──────
function saveProfileState() {
  localStorage.setItem(KEYS.profile,   JSON.stringify(STATE.profile));
  localStorage.setItem(KEYS.timetable, JSON.stringify(STATE.timetable));
  localStorage.setItem(KEYS.tracker,   JSON.stringify(STATE.tracker));
  localStorage.setItem(KEYS.revision,  JSON.stringify(STATE.revision));
  localStorage.setItem(KEYS.mocks,     JSON.stringify(STATE.mocks   || []));
  localStorage.setItem(KEYS.friends,   JSON.stringify(STATE.friends || []));

  // Sync to Firebase if enabled
  if (FEATURES.firebaseEnabled && STATE.profile) {
    saveUserToFirestore({
      ...STATE.profile,
      timetable: STATE.timetable,
      tracker:   STATE.tracker,
      revision:  STATE.revision,
      mocks:     STATE.mocks    || [],
      friends:   STATE.friends  || [],
      streak:    STATE.streak   || 0,
    });
  }
}

// ─── Hard Reset ───────────────────────────────────────────────
function clearAllData() {
  localStorage.clear();
  STATE.profile   = null;
  STATE.timetable = [];
  STATE.tracker   = {};
  STATE.revision  = {};
  STATE.mocks     = [];
  STATE.friends   = [];
  STATE.streak    = 0;
  STATE.timetableEditMode = false;

  document.getElementById('main-nav')?.classList.add('hidden');
  navigateTo('landing');
  showToast('🔄 App successfully reset.');
}

// ─── SPA Router ───────────────────────────────────────────────
function navigateTo(sectionId, isPopState = false) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(sec => sec.classList.add('hidden'));

  // Show target section
  const activeSec = document.getElementById(`section-${sectionId}`);
  if (activeSec) {
    activeSec.classList.remove('hidden');
    STATE.activeSection = sectionId;

    if (!isPopState) {
      history.pushState({ section: sectionId }, '', `#${sectionId}`);
    }
  } else {
    // Fallback: if section doesn't exist, go to landing
    if (sectionId !== 'landing') {
      navigateTo('landing', isPopState);
      return;
    }
  }

  // Update desktop nav active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
  });

  // Update mobile nav active state
  document.querySelectorAll('.m-nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
  });

  // Guard: redirect unauthenticated users away from app sections
  if (!STATE.profile) {
    if (sectionId !== 'landing' && sectionId !== 'onboarding') {
      navigateTo('landing', isPopState);
      return;
    }
  }

  // Render content for the active section
  if (STATE.profile) {
    switch (sectionId) {
      case 'dashboard': renderDashboard();       break;
      case 'timetable': renderTimetable();       break;
      case 'revision':  renderRevisionPlanner(); break;
      case 'tracker':   renderTracker();         break;
      case 'resources': renderResources();       break;
      case 'strategy':  renderStrategyHub();     break;
      case 'profile':   renderProfilePage();     break;
      case 'admin':     renderAdminPage();       break;
      case 'mocks':     renderMockTests();       break;
      case 'friends':   renderFriends();         break;
      case 'feedback':  initFeedbackStars();     break;
    }

    // Apply admin feature flags
    if (typeof applyFeatureFlags === 'function') applyFeatureFlags();
  }

  // Scroll to top on navigation
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.navigateTo = navigateTo;

// ─── Setup URL routing & back/forward button support ─────────
function setupRouting() {
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.section) {
      navigateTo(e.state.section, true);
    } else {
      navigateTo(STATE.profile ? 'dashboard' : 'landing', true);
    }
  });

  // Initial route based on URL hash
  const hash = window.location.hash.substring(1);
  if (STATE.profile) {
    if (hash && document.getElementById(`section-${hash}`)) {
      navigateTo(hash, true);
    } else {
      navigateTo('dashboard', true);
    }
  } else {
    navigateTo('landing', true);
  }
}

// ─── Stars Canvas Background ──────────────────────────────────
function initStarsCanvas() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const stars = [];
  const count = 120;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  for (let i = 0; i < count; i++) {
    stars.push({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      r:     Math.random() * 1.5 + 0.3,
      alpha: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.015 + 0.004,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed;
      const opacity = Math.abs(Math.sin(s.alpha)) * 0.4;
      ctx.beginPath();
      ctx.fillStyle = `rgba(245, 197, 24, ${opacity})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ─── Cross-tab state sync (offline mode only) ────────────────
window.addEventListener('storage', (e) => {
  if (e.key && Object.values(KEYS).includes(e.key)) {
    // Only sync if not using Firebase real-time listener
    if (!FEATURES.firebaseEnabled || !auth || !auth.currentUser) {
      loadStateFromStorage();
      if (STATE.profile) {
        navigateTo(STATE.activeSection, true);
      } else {
        navigateTo('landing', true);
      }
    }
  }
});
