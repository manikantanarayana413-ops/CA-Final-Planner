function renderProfilePage() {
  if (!STATE.profile) return;

  // Left sidebar display info
  const avatarCircle = document.getElementById('prof-avatar-circle');
  if (avatarCircle && STATE.profile.name) {
    avatarCircle.textContent = STATE.profile.name.charAt(0).toUpperCase();
  }
  
  const displayName = document.getElementById('prof-display-name');
  if (displayName) displayName.textContent = STATE.profile.name;
  
  const displayEmail = document.getElementById('prof-display-email');
  if (displayEmail) displayEmail.textContent = STATE.profile.email;

  const displayMode = document.getElementById('prof-display-mode');
  if (displayMode) {
    const isArticle = STATE.profile.studentMode === 'articleship';
    displayMode.textContent = isArticle ? 'ðŸ’¼ Articleship Mode' : 'ðŸŽ“ Full-Time Mode';
    displayMode.className = `mode-badge ${isArticle ? 'articleship' : 'fulltime'} mt-2`;
  }

  // Populate form fields
  document.getElementById('profile-name-input').value = STATE.profile.name || '';
  document.getElementById('profile-email-input').value = STATE.profile.email || '';
  document.getElementById('profile-mode-select').value = STATE.profile.studentMode || 'fulltime';
  
  // Attempts dropdown
  const attemptSelect = document.getElementById('profile-attempt-select');
  if (attemptSelect) {
    attemptSelect.innerHTML = ATTEMPTS.map(a => 
      `<option value="${a.id}" ${STATE.profile.attempt === a.id ? 'selected' : ''}>${a.label}</option>`
    ).join('');
  }

  // Articleship fields
  document.getElementById('profile-office-days').value = STATE.profile.officeDays || 6;
  document.getElementById('profile-office-hrs').value = STATE.profile.officeHrs || 9;
  document.getElementById('profile-exam-leave').value = STATE.profile.preExamLeave || 45;

  // Hours targets
  document.getElementById('profile-hours-daily').value = STATE.profile.dailyHours || 8;
  document.getElementById('profile-hours-weekday').value = STATE.profile.weekdayHours || 3;
  document.getElementById('profile-hours-weekend').value = STATE.profile.weekendHours || 7;

  // Exclude Sundays
  document.getElementById('profile-exclude-sundays').checked = !!STATE.profile.excludeSundays;

  toggleProfileArticleshipFields();
}
window.renderProfilePage = renderProfilePage;

function toggleProfileArticleshipFields() {
  const mode = document.getElementById('profile-mode-select').value;
  const fields = document.getElementById('profile-articleship-fields');
  if (fields) {
    if (mode === 'articleship') {
      fields.classList.remove('hidden');
    } else {
      fields.classList.add('hidden');
    }
  }
}
window.toggleProfileArticleshipFields = toggleProfileArticleshipFields;

function saveDedicatedProfileSettings() {
  if (!STATE.profile) return;

  const name = document.getElementById('profile-name-input').value.trim();
  const email = document.getElementById('profile-email-input').value.trim();
  const mode = document.getElementById('profile-mode-select').value;
  const attempt = document.getElementById('profile-attempt-select').value;
  
  const officeDays = parseInt(document.getElementById('profile-office-days').value || '6', 10);
  const officeHrs = parseInt(document.getElementById('profile-office-hrs').value || '9', 10);
  const preExamLeave = parseInt(document.getElementById('profile-exam-leave').value || '45', 10);

  const dailyHours = parseInt(document.getElementById('profile-hours-daily').value || '8', 10);
  const weekdayHours = parseInt(document.getElementById('profile-hours-weekday').value || '3', 10);
  const weekendHours = parseInt(document.getElementById('profile-hours-weekend').value || '7', 10);
  
  const excludeSundays = document.getElementById('profile-exclude-sundays').checked;

  if (!name || !email) {
    showToast('âŒ Please fill in your name and email.', 'error');
    return;
  }

  let needsRegen = false;
  if (STATE.profile.attempt !== attempt || STATE.profile.excludeSundays !== excludeSundays || STATE.profile.studentMode !== mode) {
    needsRegen = true;
  }

  // Update State
  STATE.profile.name = name;
  STATE.profile.email = email;
  STATE.profile.studentMode = mode;
  STATE.profile.attempt = attempt;
  STATE.profile.officeDays = officeDays;
  STATE.profile.officeHrs = officeHrs;
  STATE.profile.preExamLeave = preExamLeave;
  STATE.profile.dailyHours = dailyHours;
  STATE.profile.weekdayHours = weekdayHours;
  STATE.profile.weekendHours = weekendHours;
  STATE.profile.excludeSundays = excludeSundays;

  saveProfileState();

  if (needsRegen) {
    showToast('ðŸ”„ Core plan updated! Regenerating timetable...');
    setTimeout(() => {
      // Re-trigger timetable generator from app.js using the updated profile settings
      if (typeof generateStudyPlanner === 'function') {
        // Seed onboarding data temporarily so planner reads it
        onboardingData = { ...onboardingData, ...STATE.profile };
        generateStudyPlanner();
      } else {
        window.location.reload();
      }
    }, 1500);
  } else {
    showToast('âœ… Profile and study targets successfully updated!');
    renderProfilePage();
    renderDashboard();
    navigateTo('dashboard');
  }
}
window.saveDedicatedProfileSettings = saveDedicatedProfileSettings;

// â”€â”€ BACKUP, EXPORT & RESET ACTIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function exportDataBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(STATE));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `ca_final_planner_backup_${new Date().toISOString().split('T')[0]}.json`);
  dlAnchorElem.click();
  showToast('ðŸ“¥ Backup downloaded successfully!');
}
window.exportDataBackup = exportDataBackup;

function importDataBackup(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const parsedData = JSON.parse(e.target.result);
      if (parsedData.profile) {
        STATE = parsedData;
        saveProfileState();
        showToast('âœ… Backup imported successfully! Reloading...');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast('âŒ Invalid backup file format.', 'error');
      }
    } catch (err) {
      showToast('âŒ Failed to parse backup file.', 'error');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}
window.importDataBackup = importDataBackup;

function confirmResetAll() {
  if (confirm("ðŸš¨ WARNING: Are you absolutely sure you want to hard reset the study planner? This will permanently delete all your progress, customized timetable records, and daily logs!")) {
    clearAllData();
  }
}
window.confirmResetAll = confirmResetAll;

// ── UNIFIED SYSTEM ADMIN PANEL LOGIC ────────────────────────
function promptAdminLogin() {
  const passwordInput = prompt("Enter Admin Password:");
  if (passwordInput === null) return; // User cancelled
  
  if (passwordInput === ADMIN_PASSWORD) {
    showToast('🔑 Access granted. Welcome, Admin!');
    navigateTo('admin');
  } else {
    showToast('❌ Invalid admin password!', 'error');
  }
}
window.promptAdminLogin = promptAdminLogin;

let adminUnsubUsers = null;
let adminUnsubFeedback = null;

function renderAdminPage() {
  const statUsers = document.getElementById('admin-stat-users');
  const statStreak = document.getElementById('admin-stat-streak');
  const statFeedback = document.getElementById('admin-stat-feedback');

  if (FEATURES.firebaseEnabled && typeof firebase !== 'undefined' && db) {
    if (!adminUnsubUsers) {
      adminUnsubUsers = db.collection('users').onSnapshot(snap => {
        let allUsers = [];
        snap.forEach(doc => allUsers.push(doc.data()));
        
        if (statUsers) statUsers.textContent = allUsers.length;
        if (statStreak) statStreak.textContent = allUsers.reduce((acc, curr) => acc + (curr.streak || 0), 0);
        
        const table = document.getElementById('admin-users-table');
        if (table) {
          table.innerHTML = allUsers.map(u => `
            <tr>
              <td style="font-weight:600;">${u.name || 'Unknown'}<br/><span class="text-3xs text-secondary">${u.email || ''}</span></td>
              <td><span class="mode-badge ${u.studentMode === 'articleship' ? 'articleship' : 'fulltime'}">${u.studentMode || 'Unknown'}</span></td>
              <td style="text-transform:uppercase;font-weight:700;">${u.attempt || 'N/A'}</td>
              <td>🔥 ${u.streak || 0}</td>
              <td class="text-3xs text-secondary">${u.lastLogin ? new Date(u.lastLogin.toDate ? u.lastLogin.toDate() : u.lastLogin).toLocaleDateString() : 'N/A'}</td>
            </tr>
          `).join('');
        }
      });
    }

    if (!adminUnsubFeedback) {
      adminUnsubFeedback = db.collection('feedback').orderBy("createdAt", "desc").onSnapshot(snap => {
        let feedbackList = [];
        snap.forEach(doc => feedbackList.push(doc.data()));
        
        if (statFeedback) statFeedback.textContent = feedbackList.length;
        
        const feedbackContainer = document.getElementById('admin-feedback-list');
        if (feedbackContainer) {
          if (feedbackList.length > 0) {
            feedbackContainer.innerHTML = feedbackList.map(f => `
              <div style="background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:var(--radius-sm);padding:0.75rem;margin-bottom:0.5rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;font-weight:700;color:var(--gold)">
                  <span>${'⭐'.repeat(f.stars || 5)}</span>
                  <span style="color:var(--text-secondary);font-weight:400;font-size:0.65rem;">${f.feature || 'General'}</span>
                </div>
                <p class="text-xs mt-1" style="color:var(--text-primary)">"${f.text || 'No comment.'}"</p>
                <div class="text-3xs text-secondary mt-1 text-right">— ${f.mode || 'Student'}</div>
              </div>
            `).join('');
          } else {
            feedbackContainer.innerHTML = `<p class="text-xs text-muted text-center" style="padding:2rem 0;">No student feedback submitted yet.</p>`;
          }
        }
      });
    }
  } else {
     if (statUsers) statUsers.textContent = "Offline";
  }

  // Set current broadcast textarea value
  const currentAnnounce = localStorage.getItem('admin_broadcast') || '';
  const area = document.getElementById('admin-broadcast-msg');
  if (area) area.value = currentAnnounce;
}
window.renderAdminPage = renderAdminPage;

function publishAdminBroadcast() {
  const msg = document.getElementById('admin-broadcast-msg').value.trim();
  if (msg) {
    localStorage.setItem('admin_broadcast', msg);
    showToast('ðŸ“¢ Global broadcast banner published successfully!');
    renderAdminPage();
    renderDashboard();
  } else {
    showToast('âŒ Broadcast announcement message cannot be blank!', 'error');
  }
}
window.publishAdminBroadcast = publishAdminBroadcast;

function clearAdminBroadcast() {
  localStorage.removeItem('admin_broadcast');
  const area = document.getElementById('admin-broadcast-msg');
  if (area) area.value = '';
  showToast('ðŸ“¢ Broadcast banner cleared.');
  renderAdminPage();
  renderDashboard();
}
window.clearAdminBroadcast = clearAdminBroadcast;

// â”€â”€ DRAG AND DROP TRACKER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// To allow moving sessions between days or reordering.
let draggedSession = null;
let draggedFromDate = null;
let draggedFromIndex = null;

function initDragAndDrop() {
  const list = document.getElementById('log-sessions-list');
  if (!list) return;
  
  // Make items draggable
  const items = list.querySelectorAll('.session-item');
  items.forEach((item, index) => {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', (e) => {
      draggedSession = STATE.tracker[STATE.currentDate].sessions[index];
      draggedFromDate = STATE.currentDate;
      draggedFromIndex = index;
      e.dataTransfer.effectAllowed = 'move';
      item.style.opacity = '0.5';
    });
    
    item.addEventListener('dragend', () => {
      item.style.opacity = '1';
    });
  });

  // Make list a drop target
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!draggedSession) return;
    
    // If dropping on same day, just append to bottom for now
    // In a full implementation, calculate insertion index.
    if (draggedFromDate === STATE.currentDate) {
      STATE.tracker[STATE.currentDate].sessions.splice(draggedFromIndex, 1);
      STATE.tracker[STATE.currentDate].sessions.push(draggedSession);
    } else {
      // Moved from another day
      STATE.tracker[draggedFromDate].sessions.splice(draggedFromIndex, 1);
      if (!STATE.tracker[STATE.currentDate]) {
        STATE.tracker[STATE.currentDate] = { sessions: [], notes: '' };
      }
      STATE.tracker[STATE.currentDate].sessions.push(draggedSession);
    }
    
    saveProfileState();
    renderTracker();
    draggedSession = null;
  });
}

// Hook into renderTracker via override
const originalRenderTracker = window.renderTracker;
window.renderTracker = function() {
  if (originalRenderTracker) originalRenderTracker();
  initDragAndDrop();
};

// â”€â”€ MOCK TEST TRACKER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function initMockSelect() {
  const select = document.getElementById('mock-subject-select');
  if (select && STATE.profile) {
    const activeSubs = getActiveSubjects(STATE.profile.groupChoice);
    select.innerHTML = activeSubs.map(s => \`<option value="\${s.id}">\${s.name}</option>\`).join('');
  }
}

function renderMockTests() {
  const list = document.getElementById('mock-tests-list');
  if (!list) return;
  
  initMockSelect();

  if (!STATE.mocks || STATE.mocks.length === 0) {
    list.innerHTML = '<p class="text-sm text-muted">No mock tests added yet.</p>';
    return;
  }
  
  list.innerHTML = STATE.mocks.sort((a,b) => new Date(b.date) - new Date(a.date)).map((m, idx) => {
    const sub = CA_DATA.subjects[m.subjectId] || { name: 'Unknown', color: '#888' };
    const pct = m.marks;
    const col = pct >= 60 ? 'var(--emerald)' : (pct >= 40 ? 'var(--gold)' : 'var(--danger)');
    return \`
      <div class="card mb-3 p-3" style="border-left: 4px solid \${col}">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-weight:700;font-size:0.9rem">\${sub.shortName}: \${m.series}</div>
            <div class="text-xs text-secondary">\${m.date}</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:1.2rem;font-weight:800;color:\${col}">\${m.marks} <span style="font-size:0.7rem;color:var(--text-secondary)">/ 100</span></div>
          </div>
        </div>
      </div>
    \`;
  }).join('');
}

function saveMockTest() {
  const subjectId = document.getElementById('mock-subject-select').value;
  const series = document.getElementById('mock-series-input').value.trim();
  const dateStr = document.getElementById('mock-date-input').value;
  const marks = parseInt(document.getElementById('mock-marks-input').value);

  if (!series || !dateStr || isNaN(marks) || marks < 0 || marks > 100) {
    showToast('âš ï¸ Please fill all details correctly.');
    return;
  }

  if (!STATE.mocks) STATE.mocks = [];
  STATE.mocks.push({ id: Date.now(), subjectId, series, date: dateStr, marks });
  saveProfileState();
  renderMockTests();
  showToast('ðŸ“ Mock result saved!');
}
window.saveMockTest = saveMockTest;

// â”€â”€ FRIENDS & GROUPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function renderFriends() {
  const codeEl = document.getElementById('my-friend-code');
  if (codeEl && STATE.profile) {
    codeEl.value = STATE.profile.friendCode || generateFriendCode();
  }

  const lb = document.getElementById('friends-leaderboard');
  if (!lb) return;

  if (!STATE.friends || STATE.friends.length === 0) {
    lb.innerHTML = '<p class="text-sm text-muted">You haven\\'t added any friends yet.</p>';
    return;
  }

  // Calculate my score (completed hours this week)
  const myHours = getWeeklyHours(STATE.tracker);
  const leaderList = [
    { name: 'You', hours: myHours, isMe: true }
  ];

  // In a real app, we would fetch friends' hours from Firebase.
  // Here we just display mock data for the added friends.
  STATE.friends.forEach(f => {
    leaderList.push({ name: f.name, hours: f.hours || Math.floor(Math.random() * 20 + 10), isMe: false });
  });

  leaderList.sort((a,b) => b.hours - a.hours);

  lb.innerHTML = leaderList.map((l, idx) => \`
    <div style="display:flex;align-items:center;padding:0.75rem;background:rgba(255,255,255,0.02);border-radius:var(--radius-sm);margin-bottom:0.5rem;border:1px solid \${l.isMe ? 'var(--gold)' : 'transparent'}">
      <div style="font-size:1.2rem;font-weight:800;width:30px;color:var(--text-secondary)">\${idx + 1}</div>
      <div style="flex:1;font-weight:700;\${l.isMe ? 'color:var(--gold)' : ''}">\${l.name}</div>
      <div style="font-weight:800">\${l.hours} <span class="text-xs text-muted">hrs</span></div>
    </div>
  \`).join('');
}

function generateFriendCode() {
  const code = 'CA-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  STATE.profile.friendCode = code;
  saveProfileState();
  return code;
}

function copyFriendCode() {
  const code = document.getElementById('my-friend-code').value;
  navigator.clipboard.writeText(code);
  showToast('ðŸ“‹ Friend code copied!');
}
window.copyFriendCode = copyFriendCode;

function addFriend() {
  const code = document.getElementById('add-friend-input').value.trim().toUpperCase();
  if (!code) return;
  if (code === STATE.profile.friendCode) {
    showToast('âš ï¸ You cannot add yourself.');
    return;
  }

  if (!STATE.friends) STATE.friends = [];
  if (STATE.friends.find(f => f.code === code)) {
    showToast('âš ï¸ Friend already added.');
    return;
  }

  // Mock adding friend
  STATE.friends.push({ name: 'CA Champ ' + code.substring(3), code: code, hours: 0 });
  saveProfileState();
  document.getElementById('add-friend-input').value = '';
  renderFriends();
  showToast('ðŸ¤ Friend added to your group!');
}
window.addFriend = addFriend;

function getWeeklyHours(trackerObj) {
  let hrs = 0;
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const dStr = today.toISOString().split('T')[0];
    if (trackerObj[dStr]) {
      hrs += trackerObj[dStr].sessions.filter(s => s.completed).reduce((a,b) => a + b.hours, 0);
    }
    today.setDate(today.getDate() - 1);
  }
  return hrs;
}

// Hook into navigation to render sections
const originalNavigateTo = window.navigateTo;
window.navigateTo = function(sectionId, isPopState = false) {
  if (originalNavigateTo) originalNavigateTo(sectionId, isPopState);
  if (sectionId === 'mocks') renderMockTests();
  if (sectionId === 'friends') renderFriends();
};
