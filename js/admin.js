// ============================================================
// CA FINAL PLANNER — ADMIN PANEL JAVASCRIPT
// ============================================================

// Admin states
let ADMIN_STATE = {
  isLogged: false,
  users: [],
  feedback: [],
  activeTab: 'users',
  charts: {}
};

// ============================================================
// INITIALIZATION & STARS CANVAS
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initStarsCanvas();

  // Initialize Firebase so db/auth are available for syncAdminData
  initFirebase();
  
  // Check if session already active
  if (sessionStorage.getItem('ca_admin_session') === 'active') {
    ADMIN_STATE.isLogged = true;
    document.getElementById('login-panel').classList.add('hidden');
    document.getElementById('admin-console').classList.remove('hidden');
    syncAdminData();
  }

  // Load existing broadcast preview
  loadBroadcastPreview();
  
  // Load existing flags
  loadFeatureFlags();
});

// Twinkling stars particle background
function initStarsCanvas() {
  const canvas = document.getElementById('stars-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let stars = [];
  const count = 80;
  
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
      alpha: Math.random(),
      speed: Math.random() * 0.015 + 0.005
    });
  }
  
  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    stars.forEach(s => {
      s.alpha += s.speed;
      let opacity = Math.abs(Math.sin(s.alpha));
      ctx.fillStyle = `rgba(245, 197, 24, ${opacity * 0.25})`; // Twinkling gold
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// ============================================================
// ADMIN PASSWORD CHECK & SESSION
// ============================================================

function loginAdmin() {
  const passInput = document.getElementById('admin-pass');
  if (!passInput) return;

  const entered = passInput.value.trim();
  
  if (entered === ADMIN_PASSWORD) {
    sessionStorage.setItem('ca_admin_session', 'active');
    ADMIN_STATE.isLogged = true;
    
    // Animate login panels
    document.getElementById('login-panel').classList.add('hidden');
    document.getElementById('admin-console').classList.remove('hidden');
    
    syncAdminData();
    showToast('🔓 Admin console successfully unlocked!');
  } else {
    showToast('❌ Invalid admin password. Please try again.');
    passInput.focus();
    passInput.select();
  }
}
window.loginAdmin = loginAdmin;

function logoutAdmin() {
  sessionStorage.removeItem('ca_admin_session');
  ADMIN_STATE.isLogged = false;
  document.getElementById('login-panel').classList.remove('hidden');
  document.getElementById('admin-console').classList.add('hidden');
  showToast('🔒 Admin session terminated.');
}
window.logoutAdmin = logoutAdmin;

// ============================================================
// RETRIEVE AND GENERATE DATA (MOCK SUPPORT FOR OFFLINE DEMO)
// ============================================================

async function syncAdminData() {
  showToast('🔄 Syncing admin database logs...');
  
  if (FEATURES.firebaseEnabled) {
    // Real Firebase database sync
    ADMIN_STATE.users = await fetchAllUsers();
    ADMIN_STATE.feedback = await fetchAllFeedback();
  } else {
    // Generate beautiful realistic mock data for instant wow factor offline!
    generateMockAdminData();
  }

  // Check if current user is stored in local storage and add it to the user list
  try {
    const localProfile = localStorage.getItem('ca_final_profile');
    if (localProfile) {
      const parsed = JSON.parse(localProfile);
      const trackerObj = JSON.parse(localStorage.getItem('ca_final_tracker') || '{}');
      const revObj = JSON.parse(localStorage.getItem('ca_final_revision') || '{}');
      
      // Compute total chapter completion percentage
      let totalChaptersCount = 0;
      let completedChaptersCount = 0;
      Object.keys(revObj).forEach(subId => {
        const chapters = revObj[subId];
        Object.keys(chapters).forEach(chId => {
          totalChaptersCount++;
          if (chapters[chId].done) completedChaptersCount++;
        });
      });
      const pct = totalChaptersCount > 0 ? Math.round((completedChaptersCount / totalChaptersCount) * 100) : 0;
      
      // Calculate current streak
      let localStreak = 0;
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLog = trackerObj[todayStr];
      const todayDone = todayLog && todayLog.sessions.some(s => s.completed);
      let cursor = new Date();
      if (!todayDone) cursor.setDate(cursor.getDate() - 1);
      
      while(true) {
        const checkStr = cursor.toISOString().split('T')[0];
        const log = trackerObj[checkStr];
        if (log && log.sessions.some(s => s.completed)) {
          localStreak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }

      // Check if user already in list, if so merge, otherwise push
      const existingIdx = ADMIN_STATE.users.findIndex(u => u.email === parsed.email);
      const formattedLocal = {
        name: parsed.name + " (You)",
        email: parsed.email,
        studentMode: parsed.studentMode,
        attempt: parsed.attempt,
        groupChoice: parsed.groupChoice,
        revisionCount: parsed.revisionCount,
        completionPercent: pct,
        streak: localStreak,
        lastLogin: new Date().toISOString()
      };

      if (existingIdx >= 0) {
        ADMIN_STATE.users[existingIdx] = formattedLocal;
      } else {
        ADMIN_STATE.users.unshift(formattedLocal);
      }
    }
  } catch(e) {
    console.error("Local user profile loading failed u/admin:", e);
  }

  // Populate counters
  renderStatsCounters();
  
  // Render tables & grids
  renderUsersTable();
  renderFeedbackCards();
  
  // Render Analytics Charts
  renderAnalyticsCharts();
  
  showToast('🟢 Portal synchronization complete.');
}
window.syncAdminData = syncAdminData;

function generateMockAdminData() {
  ADMIN_STATE.users = [
    { name: "Aditya Singhal", email: "aditya.singhal@outlook.com", studentMode: "fulltime", attempt: "nov2025", groupChoice: "both", revisionCount: 3, completionPercent: 85, streak: 12, lastLogin: "2026-05-31T11:45:00Z" },
    { name: "Priya Marwah", email: "priya.tax@gmail.com", studentMode: "articleship", attempt: "nov2026", groupChoice: "g2", revisionCount: 2, completionPercent: 40, streak: 8, lastLogin: "2026-05-31T09:12:00Z" },
    { name: "Vikram Malhotra", email: "vikram.ca.afm@yahoo.com", studentMode: "articleship", attempt: "nov2025", groupChoice: "both", revisionCount: 2, completionPercent: 75, streak: 0, lastLogin: "2026-05-30T18:30:00Z" },
    { name: "Anjali Gupta", email: "anjali.air3@gmail.com", studentMode: "fulltime", attempt: "may2026", groupChoice: "both", revisionCount: 3, completionPercent: 95, streak: 27, lastLogin: "2026-05-31T12:04:00Z" },
    { name: "Rohan Deshmukh", email: "rohan.audit@co.in", studentMode: "articleship", attempt: "may2027", groupChoice: "g1", revisionCount: 2, completionPercent: 15, streak: 3, lastLogin: "2026-05-28T07:22:00Z" },
    { name: "Kritika Sethi", email: "kritika.sethi@gmail.com", studentMode: "fulltime", attempt: "nov2026", groupChoice: "both", revisionCount: 2, completionPercent: 50, streak: 5, lastLogin: "2026-05-31T10:15:00Z" },
    { name: "Abhishek Jain", email: "abhishek.jain@icai.org", studentMode: "articleship", attempt: "nov2026", groupChoice: "both", revisionCount: 1, completionPercent: 35, streak: 0, lastLogin: "2026-05-29T14:40:00Z" },
    { name: "Megha Nair", email: "megha.nair@live.com", studentMode: "fulltime", attempt: "nov2025", groupChoice: "g1", revisionCount: 2, completionPercent: 90, streak: 15, lastLogin: "2026-05-30T22:10:00Z" },
    { name: "Suresh Pillai", email: "suresh.pillai@rediff.com", studentMode: "articleship", attempt: "may2026", groupChoice: "both", revisionCount: 2, completionPercent: 65, streak: 9, lastLogin: "2026-05-31T06:18:00Z" },
    { name: "Divya Teja", email: "divya.teja@outlook.com", studentMode: "fulltime", attempt: "nov2026", groupChoice: "g2", revisionCount: 2, completionPercent: 30, streak: 4, lastLogin: "2026-05-31T08:50:00Z" }
  ];

  // Loaded from storage if admin feedback exists, else use standard mock feedback
  const storedFb = localStorage.getItem('offline_feedback');
  if (storedFb) {
    ADMIN_STATE.feedback = JSON.parse(storedFb);
  } else {
    ADMIN_STATE.feedback = [
      { id: "fb_1", studentName: "Aditya Singhal", studentEmail: "aditya.singhal@outlook.com", rating: 5, favoriteFeature: "Personalized Timetable", comments: "Amazing dark glassmorphism design! The sequential study generator allocated my daily hours beautifully.", studentMode: "fulltime", submittedAt: "2026-05-31T11:50:00Z", status: "actioned" },
      { id: "fb_2", studentName: "Priya Marwah", studentEmail: "priya.tax@gmail.com", rating: 4, favoriteFeature: "Articleship Schedule", comments: "Great layout! As an articles student in a mid-size firm, the office hours layout maps perfectly. Can we add optional SPOM tracking?", studentMode: "articleship", submittedAt: "2026-05-31T09:15:00Z", status: "pending" },
      { id: "fb_3", studentName: "Vikram Malhotra", studentEmail: "vikram.ca.afm@yahoo.com", rating: 5, favoriteFeature: "Excel Download", comments: "SheetJS Excel download works flawless! I color-coded the rows and printed it for my room wall. Lifesaver.", studentMode: "articleship", submittedAt: "2026-05-30T18:42:00Z", status: "actioned" },
      { id: "fb_4", studentName: "Anjali Gupta", studentEmail: "anjali.air3@gmail.com", rating: 5, favoriteFeature: "Chapter-wise Revision Planner", comments: "Perfect ABC categorization helper. Ratings reflect my true weak chapters. AIR strategy works!", studentMode: "fulltime", submittedAt: "2026-05-31T12:08:00Z", status: "pending" },
      { id: "fb_5", studentName: "Rohan Deshmukh", studentEmail: "rohan.audit@co.in", rating: 3, favoriteFeature: "Daily Tracker", comments: "Daily notes are good, but I would love if we can log hours with a stopwatch overlay widget.", studentMode: "articleship", submittedAt: "2026-05-28T07:30:00Z", status: "pending" }
    ];
  }
}

// ============================================================
// STATS COUNTERS CARDS
// ============================================================

function renderStatsCounters() {
  const totUsers = document.getElementById('stat-total-users');
  const actToday = document.getElementById('stat-active-today');
  const fbCount = document.getElementById('stat-feedback-count');
  const bestStreak = document.getElementById('stat-best-streak');

  if(totUsers) totUsers.textContent = ADMIN_STATE.users.length;
  
  // Calculate active today (last active date is current date)
  const todayStr = new Date().toISOString().split('T')[0];
  const activeCount = ADMIN_STATE.users.filter(u => u.lastLogin.includes(todayStr)).length;
  if(actToday) actToday.textContent = activeCount;

  if(fbCount) fbCount.textContent = ADMIN_STATE.feedback.length;

  // Max streak
  const max = ADMIN_STATE.users.reduce((acc, curr) => Math.max(acc, curr.streak), 0);
  if(bestStreak) bestStreak.textContent = `${max} days`;
}

// ============================================================
// TAB SWITCHING (ROUTER)
// ============================================================

function switchAdminTab(tabId) {
  ADMIN_STATE.activeTab = tabId;
  
  const sections = document.querySelectorAll('.admin-section');
  sections.forEach(sec => sec.classList.add('hidden'));

  const activeSec = document.getElementById(`admin-sec-${tabId}`);
  if (activeSec) activeSec.classList.remove('hidden');

  // Update tabs buttons
  const tabBtns = document.querySelectorAll('.admin-nav-btn');
  tabBtns.forEach(btn => {
    if (btn.getAttribute('onclick').includes(tabId)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Highlight charts redraw on analytics tab load
  if (tabId === 'analytics') {
    setTimeout(renderAnalyticsCharts, 50);
  }
}
window.switchAdminTab = switchAdminTab;

// ============================================================
// STUDENT DIRECTORY SEARCH AND FILTERS
// ============================================================

function renderUsersTable(filteredList = null) {
  const tbody = document.getElementById('users-table-body');
  if (!tbody) return;

  const list = filteredList || ADMIN_STATE.users;
  
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-secondary);padding:2rem;">No student records found matching filters.</td></tr>`;
    return;
  }

  const attemptsMap = {};
  CA_DATA.examAttempts.forEach(att => attemptsMap[att.id] = att.label);

  tbody.innerHTML = list.map(u => {
    const isToday = u.lastLogin.includes(new Date().toISOString().split('T')[0]);
    const loginText = isToday ? '<span style="color:var(--emerald);font-weight:700">Online Today</span>' : new Date(u.lastLogin).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    
    return `
      <tr>
        <td style="font-weight:700;color:var(--admin-gold)">${u.name}</td>
        <td>${u.email}</td>
        <td>
          <span class="badge" style="background:rgba(${u.studentMode === 'articleship' ? '245,158,11,0.15' : '99,102,241,0.15'});color:${u.studentMode === 'articleship' ? 'var(--admin-gold)' : 'var(--admin-purple)'}">
            ${u.studentMode === 'articleship' ? '💼 Articleship' : '🎓 Full-Time'}
          </span>
        </td>
        <td>${attemptsMap[u.attempt] || u.attempt}</td>
        <td>
          <span style="font-weight:700;">${u.groupChoice === 'both' ? 'Both Groups' : u.groupChoice === 'g1' ? 'Group 1 Only' : 'Group 2 Only'}</span>
        </td>
        <td style="text-align:center">${u.revisionCount || 2} Revs</td>
        <td>
          <div style="display:flex;align-items:center;gap:0.4rem">
            <span style="font-weight:700;width:30px;">${u.completionPercent}%</span>
            <div style="height:5px;flex:1;min-width:60px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${u.completionPercent}%;background:var(--admin-cyan);border-radius:3px;transition:width 0.5s ease"></div>
            </div>
          </div>
        </td>
        <td style="font-weight:700;color:var(--emerald);text-align:center">🔥 ${u.streak}</td>
        <td>${loginText}</td>
      </tr>
    `;
  }).join('');
}

function filterUsersTable() {
  const query = document.getElementById('user-search').value.toLowerCase().trim();
  const mode = document.getElementById('filter-mode').value;
  const group = document.getElementById('filter-group').value;

  const filtered = ADMIN_STATE.users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    const matchMode = mode === 'all' || u.studentMode === mode;
    const matchGroup = group === 'all' || u.groupChoice === group;
    return matchSearch && matchMode && matchGroup;
  });

  const label = document.getElementById('user-count-display');
  if (label) label.textContent = `Showing ${filtered.length} of ${ADMIN_STATE.users.length} students`;

  renderUsersTable(filtered);
}
window.filterUsersTable = filterUsersTable;

// ============================================================
// FEEDBACK PANEL GRID & INTERACTIONS
// ============================================================

function renderFeedbackCards(filteredList = null) {
  const container = document.getElementById('feedback-grid-container');
  if (!container) return;

  const list = filteredList || ADMIN_STATE.feedback;
  
  if (list.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;color:var(--text-secondary);padding:3rem;">No feedback submissions match the filters.</div>`;
    return;
  }

  container.innerHTML = list.map(fb => {
    const stars = "⭐".repeat(fb.rating);
    const isActioned = fb.status === 'actioned';
    const dateText = new Date(fb.submittedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'numeric', minute:'2-digit' });
    
    return `
      <div class="feedback-admin-card ${isActioned ? 'actioned' : 'pending'}">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong style="color:var(--admin-gold);font-size:0.95rem">${fb.studentName}</strong>
          <span class="badge" style="font-size:0.65rem;background:rgba(255,255,255,0.05)">${fb.studentMode.toUpperCase()}</span>
        </div>
        <div class="text-3xs text-secondary">${fb.studentEmail} · ${dateText}</div>
        
        <div class="feedback-stars-val">${stars}</div>
        
        <div style="font-size:0.75rem;font-weight:700;color:var(--admin-cyan);margin-top:0.25rem">
          Favorite: ${fb.favoriteFeature}
        </div>
        
        <p style="font-size:0.8rem;line-height:1.4;font-style:italic;color:var(--text-secondary);margin:0.25rem 0;" class="border-card p-2">
          "${fb.comments || 'No comments left.'}"
        </p>

        <div style="display:flex;gap:0.5rem;margin-top:auto" class="pt-2">
          <button class="btn btn-secondary btn-sm flex-1 py-1" style="font-size:0.72rem" onclick="toggleFeedbackStatus('${fb.id || fb.submittedAt}')">
            ${isActioned ? '🔄 Reopen Pending' : '✅ Mark Actioned'}
          </button>
          <a href="mailto:${fb.studentEmail}?subject=CA Final Planner Suggestions Reply" class="btn btn-ghost btn-sm py-1" style="font-size:0.72rem;border:1px solid rgba(255,255,255,0.08)">
            ✉️ Reply
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function filterFeedbackCards() {
  const rating = document.getElementById('fb-filter-rating').value;
  const status = document.getElementById('fb-filter-status').value;

  const filtered = ADMIN_STATE.feedback.filter(fb => {
    let matchRating = true;
    if (rating === '5') matchRating = fb.rating === 5;
    else if (rating === '4') matchRating = fb.rating >= 4;
    else if (rating === '3') matchRating = fb.rating <= 3;

    const matchStatus = status === 'all' || (status === 'actioned' && fb.status === 'actioned') || (status === 'pending' && fb.status !== 'actioned');
    
    return matchRating && matchStatus;
  });

  renderFeedbackCards(filtered);
}
window.filterFeedbackCards = filterFeedbackCards;

function toggleFeedbackStatus(fbId) {
  // Find feedback in array
  const item = ADMIN_STATE.feedback.find(fb => (fb.id === fbId || fb.submittedAt === fbId));
  if (item) {
    item.status = item.status === 'actioned' ? 'pending' : 'actioned';
    
    // Save to localStorage if offline
    if (!FEATURES.firebaseEnabled) {
      localStorage.setItem('offline_feedback', JSON.stringify(ADMIN_STATE.feedback));
    }
    
    filterFeedbackCards();
    showToast('💾 Feedback status successfully toggled.');
  }
}
window.toggleFeedbackStatus = toggleFeedbackStatus;

function exportFeedbackToCSV() {
  try {
    let csv = "Name,Email,Student Mode,Rating Stars,Favorite Feature,Comments,Date Submitted,Status\r\n";
    
    ADMIN_STATE.feedback.forEach(fb => {
      const name = `"${fb.studentName.replace(/"/g, '""')}"`;
      const email = `"${fb.studentEmail.replace(/"/g, '""')}"`;
      const comments = `"${(fb.comments || '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
      const feature = `"${fb.favoriteFeature.replace(/"/g, '""')}"`;
      
      csv += `${name},${email},${fb.studentMode},${fb.rating},${feature},${comments},${fb.submittedAt},${fb.status || 'pending'}\r\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `CA_Planner_Feedback_Center_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('🟢 Feedback CSV export successful!');
  } catch (e) {
    showToast('❌ Export failed. Try again.');
  }
}
window.exportFeedbackToCSV = exportFeedbackToCSV;

// ============================================================
// DYNAMIC ANALYTICS PLOTTING ENGINE (CHART.JS)
// ============================================================

function renderAnalyticsCharts() {
  if (ADMIN_STATE.activeTab !== 'analytics') return;
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js not yet loaded — analytics charts skipped.');
    return;
  }

  // Clear existing instances to prevent overlays
  Object.values(ADMIN_STATE.charts).forEach(ch => {
    if (ch && typeof ch.destroy === 'function') ch.destroy();
  });
  ADMIN_STATE.charts = {};

  // Setup options with beautiful gold/dark transparent theme styling
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#f8fafc', font: { family: 'Inter', size: 10 } }
      }
    }
  };

  // 1. Chart: Student Modes Doughnut
  const canvas1 = document.getElementById('chart-modes');
  if (canvas1) {
    const fulltime = ADMIN_STATE.users.filter(u => u.studentMode === 'fulltime').length;
    const articles = ADMIN_STATE.users.filter(u => u.studentMode === 'articleship').length;

    ADMIN_STATE.charts.modes = new Chart(canvas1, {
      type: 'doughnut',
      data: {
        labels: ['🎓 Full-time Study', '💼 Articleship'],
        datasets: [{
          data: [fulltime, articles],
          backgroundColor: ['rgba(124, 58, 237, 0.75)', 'rgba(245, 158, 11, 0.75)'],
          borderColor: ['#7c3aed', '#f59e0b'],
          borderWidth: 2
        }]
      },
      options: {
        ...commonOptions,
        cutout: '60%'
      }
    });
  }

  // 2. Chart: Attempts Spread
  const canvas2 = document.getElementById('chart-attempts');
  if (canvas2) {
    const attemptsMap = {};
    CA_DATA.examAttempts.forEach(att => attemptsMap[att.id] = 0);
    
    ADMIN_STATE.users.forEach(u => {
      if (attemptsMap[u.attempt] !== undefined) attemptsMap[u.attempt]++;
    });

    const labels = CA_DATA.examAttempts.map(att => att.label);
    const dataVals = CA_DATA.examAttempts.map(att => attemptsMap[att.id]);

    ADMIN_STATE.charts.attempts = new Chart(canvas2, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Students registered',
          data: dataVals,
          backgroundColor: 'rgba(6, 182, 212, 0.6)',
          borderColor: '#06b6d4',
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        ...commonOptions,
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94a3b8', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  // 3. Chart: Study hours commitments (Articleship weekday/weekend vs Fulltime)
  const canvas3 = document.getElementById('chart-hours');
  if (canvas3) {
    ADMIN_STATE.charts.hours = new Chart(canvas3, {
      type: 'bar',
      data: {
        labels: ['Full-time Study', 'Articles (Weekday)', 'Articles (Weekend)'],
        datasets: [{
          label: 'Avg Daily Study Hours Target',
          data: [9, 2.5, 7.5],
          backgroundColor: ['rgba(124, 58, 237, 0.6)', 'rgba(245, 158, 11, 0.6)', 'rgba(16, 185, 129, 0.6)'],
          borderColor: ['#7c3aed', '#f59e0b', '#10b981'],
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        ...commonOptions,
        scales: {
          x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  }

  // 4. Chart: Ratings split
  const canvas4 = document.getElementById('chart-ratings');
  if (canvas4) {
    const ratingsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ADMIN_STATE.feedback.forEach(fb => {
      if (ratingsCount[fb.rating] !== undefined) ratingsCount[fb.rating]++;
    });

    ADMIN_STATE.charts.ratings = new Chart(canvas4, {
      type: 'doughnut',
      data: {
        labels: ['⭐ 5 Stars', '⭐ 4 Stars', '⭐ 3 Stars & below'],
        datasets: [{
          data: [ratingsCount[5], ratingsCount[4], ratingsCount[3] + ratingsCount[2] + ratingsCount[1]],
          backgroundColor: ['rgba(16, 185, 129, 0.75)', 'rgba(6, 182, 212, 0.75)', 'rgba(239, 68, 68, 0.75)'],
          borderColor: ['#10b981', '#06b6d4', '#ef4444'],
          borderWidth: 2
        }]
      },
      options: {
        ...commonOptions,
        cutout: '60%'
      }
    });
  }
}

// ============================================================
// SETTINGS & BROADCAST MESSAGES
// ============================================================

function publishBroadcast() {
  const text = document.getElementById('broadcast-input').value.trim();
  
  if (!text) {
    showToast('⚠️ Please write some broadcast announcement first.');
    return;
  }

  localStorage.setItem('admin_broadcast', text);
  loadBroadcastPreview();
  showToast('🚀 Global broadcast published successfully! Students will view this on next sync.');
}
window.publishBroadcast = publishBroadcast;

function clearBroadcast() {
  localStorage.removeItem('admin_broadcast');
  document.getElementById('broadcast-input').value = '';
  loadBroadcastPreview();
  showToast('🗑️ Active broadcast banner removed.');
}
window.clearBroadcast = clearBroadcast;

function loadBroadcastPreview() {
  const text = localStorage.getItem('admin_broadcast');
  const preview = document.getElementById('active-broadcast-preview');
  if (preview) {
    preview.textContent = text ? `"${text}"` : 'None active';
    preview.style.color = text ? 'var(--admin-gold)' : 'var(--text-secondary)';
  }
}

function loadFeatureFlags() {
  // Seed defaults if empty
  if(localStorage.getItem('flag_excel') === null) localStorage.setItem('flag_excel', 'true');
  if(localStorage.getItem('flag_pomo') === null) localStorage.setItem('flag_pomo', 'true');

  const excelEl = document.getElementById('flag-excel');
  const pomoEl  = document.getElementById('flag-pomo');
  const dbEl    = document.getElementById('flag-db');

  if (excelEl) excelEl.checked = localStorage.getItem('flag_excel') === 'true';
  if (pomoEl)  pomoEl.checked  = localStorage.getItem('flag_pomo') === 'true';
  if (dbEl)    dbEl.checked    = FEATURES.firebaseEnabled;
}

function toggleFeatureFlag(flag, enabled) {
  if (flag === 'excel') {
    localStorage.setItem('flag_excel', enabled ? 'true' : 'false');
    showToast(`💾 Excel export flag set to: ${enabled}`);
  } else if (flag === 'pomodoro') {
    localStorage.setItem('flag_pomo', enabled ? 'true' : 'false');
    showToast(`💾 Pomodoro FAB widget flag set to: ${enabled}`);
  } else if (flag === 'database') {
    FEATURES.firebaseEnabled = enabled;
    showToast(`💾 Firebase cloud syncing flag toggled to: ${enabled}`);
  }
}
window.toggleFeatureFlag = toggleFeatureFlag;

// Helper global toast
function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = msg;

  container.appendChild(toast);
  
  setTimeout(() => toast.style.opacity = '1', 50);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
