// ============================================================
// INITIALIZATION & SPA ROUTING
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Hide loader and start stars canvas
  initStarsCanvas();
  loadStateFromStorage();
  setupRouting();
  
  // Set up event listeners for landing page and wizard
  document.getElementById('hero-start-btn')?.addEventListener('click', startOnboarding);
  document.getElementById('footer-start-btn')?.addEventListener('click', startOnboarding);
  document.getElementById('hero-learn-btn')?.addEventListener('click', () => {
    document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  // Calendar month buttons
  document.getElementById('prev-month-btn')?.addEventListener('click', () => adjustCalMonth(-1));
  document.getElementById('next-month-btn')?.addEventListener('click', () => adjustCalMonth(1));

  // Tracker day buttons
  document.getElementById('prev-day-btn')?.addEventListener('click', () => adjustTrackerDate(-1));
  document.getElementById('next-day-btn')?.addEventListener('click', () => adjustTrackerDate(1));
  document.getElementById('add-session-btn')?.addEventListener('click', showAddSessionForm);

  // Profile avatar click - Navigate to the dedicated Profile Page
  document.getElementById('nav-avatar')?.addEventListener('click', () => {
    navigateTo('profile');
  });

  // Initialize Firebase (fails gracefully if in offline mode)
  initFirebase();

  // Hide loading screen after 1.2s for beautiful intro
  setTimeout(() => {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.classList.add('hidden'), 500);
    }
  }, 1200);
});

// Load state from localStorage
function loadStateFromStorage() {
  try {
    const profile = localStorage.getItem(KEYS.profile);
    const timetable = localStorage.getItem(KEYS.timetable);
    const tracker = localStorage.getItem(KEYS.tracker);
    const revision = localStorage.getItem(KEYS.revision);
    
    if (profile) {
      STATE.profile = JSON.parse(profile);
      STATE.timetable = timetable ? JSON.parse(timetable) : [];
      STATE.tracker = tracker ? JSON.parse(tracker) : {};
      STATE.revision = revision ? JSON.parse(revision) : {};
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
    console.error("Failed to load local storage state:", e);
  }
}

// Save profile state
function saveProfileState() {
  localStorage.setItem(KEYS.profile, JSON.stringify(STATE.profile));
  localStorage.setItem(KEYS.timetable, JSON.stringify(STATE.timetable));
  localStorage.setItem(KEYS.tracker, JSON.stringify(STATE.tracker));
  localStorage.setItem(KEYS.revision, JSON.stringify(STATE.revision));
  
  // Sync to Firebase if enabled
  if (FEATURES.firebaseEnabled && STATE.profile) {
    saveUserToFirestore({
      ...STATE.profile,
      timetable: STATE.timetable,
      tracker: STATE.tracker,
      revision: STATE.revision
    });
  }
}

// Reset data helper
function clearAllData() {
  localStorage.clear();
  STATE.profile = null;
  STATE.timetable = [];
  STATE.tracker = {};
  STATE.revision = {};
  STATE.streak = 0;
  
  document.getElementById('main-nav')?.classList.add('hidden');
  navigateTo('landing');
  showToast('ðŸ”„ App successfully reset.');
}

// Simple Router
function navigateTo(sectionId, isPopState = false) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(sec => sec.classList.add('hidden'));

  const activeSec = document.getElementById(`section-${sectionId}`);
  if (activeSec) {
    activeSec.classList.remove('hidden');
    STATE.activeSection = sectionId;
    
    if (!isPopState) {
      history.pushState({ section: sectionId }, '', `#${sectionId}`);
    }
  }

  // Update navbar links
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    if (link.getAttribute('data-section') === sectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Render content depending on section
  if (STATE.profile) {
    if (sectionId === 'dashboard') renderDashboard();
    else if (sectionId === 'timetable') renderTimetable();
    else if (sectionId === 'revision') renderRevisionPlanner();
    else if (sectionId === 'tracker') renderTracker();
    else if (sectionId === 'resources') renderResources();
    else if (sectionId === 'strategy') renderStrategyHub();
    else if (sectionId === 'profile') renderProfilePage();
    else if (sectionId === 'admin') renderAdminPage();
    else if (sectionId === 'feedback') initFeedbackStars();
    
    // Apply admin feature flags dynamically
    if (typeof applyFeatureFlags === 'function') applyFeatureFlags();
  } else if (sectionId !== 'landing' && sectionId !== 'onboarding') {
    // Redirect un-onboarded users
    navigateTo('landing');
  }
}
window.navigateTo = navigateTo;

function setupRouting() {
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.section) {
      navigateTo(e.state.section, true);
    } else {
      if (STATE.profile) navigateTo('dashboard', true);
    }
  });

  const hash = window.location.hash.substring(1); // Remove #
  if (STATE.profile) {
    if (hash && document.getElementById(`section-${hash}`)) {
      navigateTo(hash, true);
    } else {
      navigateTo('dashboard', true);
    }
  } else {
    navigateTo('landing', true);
  }

  // Set up nav-link click handlers
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const section = link.getAttribute('data-section');
      navigateTo(section);
    });
  });
}

// ============================================================
// BEAUTIFUL PARTICLE STARS BACKGROUND
// ============================================================

function initStarsCanvas() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let stars = [];
  const count = 100;
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resize);
  resize();
  
  for(let i=0; i<count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      d: Math.random() * count,
      alpha: Math.random(),
      speed: Math.random() * 0.02 + 0.005
    });
  }
  
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    stars.forEach(s => {
      ctx.beginPath();
      s.alpha += s.speed;
      let opacity = Math.abs(Math.sin(s.alpha));
      ctx.fillStyle = `rgba(245, 197, 24, ${opacity * 0.35})`; // Soft gold twinkling
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

