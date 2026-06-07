// ============================================================
// DASHBOARD RENDERING & INTERACTIVITY
// ============================================================

function renderDashboard() {
  if (!STATE.profile) return;

  // Greetings based on local time
  const welcomeGreeting = document.getElementById('welcome-greeting');
  const welcomeSubtitle = document.getElementById('welcome-subtitle');
  if (welcomeGreeting) {
    const hrs = new Date().getHours();
    let greet = 'Good morning';
    if (hrs >= 12 && hrs < 17) greet = 'Good afternoon';
    else if (hrs >= 17) greet = 'Good evening';
    welcomeGreeting.innerHTML = `${greet}, <span style="color:var(--gold)">${STATE.profile.name}</span>! ðŸ‘‹`;
  }

  // Countdown timer
  const attemptObj = ATTEMPTS.find(att => att.id === STATE.profile.attempt);
  const examDate = new Date(attemptObj.date);
  const today = new Date();
  const msDiff = examDate - today;
  const daysCountdown = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
  const cdNum = document.getElementById('days-countdown');
  if (cdNum) cdNum.textContent = daysCountdown > 0 ? daysCountdown : '0';

  // Current study phase badge
  const todayStr = today.toISOString().split('T')[0];
  const todayPlan = STATE.timetable.find(t => t.date === todayStr) || STATE.timetable[0];
  
  const phaseIndicator = document.getElementById('phase-indicator');
  const phaseIcon = document.getElementById('phase-icon');
  const phaseName = document.getElementById('phase-name');
  
  if (todayPlan) {
    const phaseObj = CA_DATA.phases[todayPlan.phase];
    if (phaseIcon) phaseIcon.textContent = phaseObj.icon;
    if (phaseName) phaseName.textContent = phaseObj.name;
    if (phaseIndicator) {
      phaseIndicator.style.background = `rgba(${todayPlan.phase === 1 ? '99,102,241' : todayPlan.phase === 2 ? '245,158,11' : '16,185,129'}, 0.15)`;
      phaseIndicator.style.border = `1px solid ${phaseObj.color}`;
      phaseIndicator.style.color = phaseObj.color;
    }
  }

  // Streak update
  calculateStreak();
  const streakNum = document.getElementById('streak-number');
  const streakBest = document.getElementById('streak-best');
  const navStreak = document.getElementById('nav-streak-val');
  if (streakNum) streakNum.textContent = STATE.streak;
  if (navStreak) navStreak.textContent = STATE.streak;
  if (streakBest) streakBest.textContent = `Best: ${STATE.bestStreak} days`;

  // Avatar setting
  const avatar = document.getElementById('nav-avatar');
  if (avatar && STATE.profile.name) {
    avatar.textContent = STATE.profile.name.charAt(0).toUpperCase();
  }

  // Group choice info card
  const groupCard = document.getElementById('group-info-content');
  if (groupCard) {
    let groupText = STATE.profile.groupChoice === 'both' ? 'Both Groups (All 6 Papers)' : STATE.profile.groupChoice === 'g1' ? 'Group 1 (FR, AFM, Audit)' : 'Group 2 (DT, IDT, IBS)';
    groupCard.innerHTML = `
      <div style="font-weight:700;margin-bottom:0.25rem">${groupText}</div>
      <div class="text-xs text-secondary mt-1">Target Attempt: <strong>${attemptObj.label}</strong></div>
      <div class="text-xs text-secondary mt-1">Status: <strong>${STATE.profile.studentMode === 'articleship' ? 'Articleship Student' : 'Full-Time Student'}</strong></div>
    `;
  }

  // Articleship Tip of the Day
  const articleCard = document.getElementById('article-tip-card');
  const articleText = document.getElementById('article-tip-text');
  if (STATE.profile.studentMode === 'articleship') {
    if (articleCard) articleCard.style.display = 'block';
    
    // Choose a random subject's articleship tip or general articleship info
    const subs = getActiveSubjects(STATE.profile.groupChoice);
    const randSub = subs[Math.floor(Math.random() * subs.length)];
    if (articleText) {
      articleText.textContent = randSub.articleTip || "Try to study 2 hours in the morning before heading to office. Early morning focus is unshakeable.";
    }
  } else {
    if (articleCard) articleCard.style.display = 'none';
  }

  // Subject Progress Rings (Renders dynamic SVG progress rings)
  const grid = document.getElementById('subject-rings-grid');
  if (grid) {
    const activeSubs = getActiveSubjects(STATE.profile.groupChoice);
    grid.innerHTML = activeSubs.map(sub => {
      // Calculate average chapter completion from STATE.revision
      const subRev = STATE.revision[sub.id] || {};
      const chs = sub.chapters;
      const completedCount = Object.values(subRev).filter(c => c.done).length;
      const pct = chs.length > 0 ? Math.round((completedCount / chs.length) * 100) : 0;
      
      const circumference = 2 * Math.PI * 30; // Radius=30, Circumference â‰ˆ 188.4
      const strokeOffset = circumference - (pct / 100) * circumference;

      return `
        <div class="subject-ring-card" onclick="navigateTo('revision')" style="cursor:pointer">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle class="ring-bg" cx="40" cy="40" r="30" stroke-width="6"/>
            <circle class="ring-fill" cx="40" cy="40" r="30" stroke-width="6"
              stroke-dasharray="${circumference}" stroke-dashoffset="${strokeOffset}" stroke="${sub.color}"/>
          </svg>
          <div class="ring-percentage" style="color:${sub.color}">${pct}%</div>
          <div class="ring-title mt-2">${sub.shortName}</div>
        </div>
      `;
    }).join('');
  }

  // Today's Study Sessions List
  const todayLogs = STATE.tracker[todayStr] || { sessions: [], notes: '' };
  const sessionsList = document.getElementById('today-sessions-list');
  if (sessionsList) {
    if (todayLogs.sessions.length > 0) {
      sessionsList.innerHTML = todayLogs.sessions.map((s, idx) => {
        const sub = CA_DATA.subjects[s.subjectId] || { shortName: 'Buffer', color: '#888' };
        return `
          <div class="session-item" style="border-left:4px solid ${sub.color};background:rgba(255,255,255,0.02);padding:0.6rem;border-radius:0 4px 4px 0;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div class="text-xs" style="font-weight:700;">${sub.shortName}: ${s.chapterName}</div>
              <div class="text-2xs text-secondary mt-1">${s.hours} hours planned</div>
            </div>
            <input type="checkbox" ${s.completed ? 'checked' : ''} onchange="toggleTodaySession(${idx}, this.checked)" style="width:18px;height:18px;accent-color:${sub.color};cursor:pointer;"/>
          </div>
        `;
      }).join('');
    } else {
      sessionsList.innerHTML = `<p class="text-xs text-muted">No specific chapters scheduled for today. Take a breather or use the buffer session.</p>`;
    }
  }

  // Today's study hours progress bar
  const hoursTargetDiv = document.getElementById('hours-target-content');
  if (hoursTargetDiv) {
    const plannedHrs = todayPlan ? todayPlan.hoursTarget : 8;
    const completedHrs = todayLogs.sessions.filter(s => s.completed).reduce((acc, curr) => acc + curr.hours, 0);
    const progressPct = plannedHrs > 0 ? Math.min(100, Math.round((completedHrs / plannedHrs) * 100)) : 0;
    
    hoursTargetDiv.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.82rem;margin-bottom:0.4rem">
        <span>Daily Target: <strong>${plannedHrs} hours</strong></span>
        <span style="color:var(--gold);font-weight:700;">${completedHrs} hrs completed (${progressPct}%)</span>
      </div>
      <div class="modal-progress" style="height:10px;">
        <div class="modal-progress-bar" style="width:${progressPct}%;background:linear-gradient(90deg, var(--gold), #ff9f43);"></div>
      </div>
    `;
  }

  // Weekly Overview Strip (Renders 7 days around today)
  const weekStrip = document.getElementById('week-strip');
  if (weekStrip) {
    const days = [];
    const dateCursor = new Date(today);
    dateCursor.setDate(dateCursor.getDate() - 3); // Start 3 days ago

    for (let i = 0; i < 7; i++) {
      const dayStr = dateCursor.toISOString().split('T')[0];
      const plan = STATE.timetable.find(t => t.date === dayStr);
      const log = STATE.tracker[dayStr] || { sessions: [], notes: '' };
      
      const isToday = dayStr === todayStr;
      const totalPlanned = plan ? plan.hoursTarget : 0;
      const totalDone = log.sessions.filter(s => s.completed).reduce((acc, curr) => acc + curr.hours, 0);
      
      let fillPct = totalPlanned > 0 ? Math.min(100, Math.round((totalDone / totalPlanned) * 100)) : 0;
      let statusColor = '#444';
      if (fillPct >= 99) statusColor = 'var(--emerald)';
      else if (fillPct > 0) statusColor = 'var(--gold)';

      const weekdayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const dayName = weekdayNames[dateCursor.getDay()];
      const dayNum = dateCursor.getDate();

      days.push(`
        <div class="week-strip-day ${isToday ? 'active' : ''}" onclick="selectTrackerDate('${dayStr}')" style="cursor:pointer;">
          <div class="strip-day-name text-2xs text-secondary">${dayName}</div>
          <div class="strip-day-num font-bold my-1" style="font-size:1.1rem;color:${isToday ? 'var(--gold)' : 'inherit'}">${dayNum}</div>
          <div style="width:10px;height:10px;border-radius:50%;background:${statusColor};margin:0 auto"></div>
        </div>
      `);
      dateCursor.setDate(dateCursor.getDate() + 1);
    }
    weekStrip.innerHTML = days.join('');
  }

  // Render broadcast banner from admin if present
  const broadcastText = localStorage.getItem('admin_broadcast');
  const broadcastBanner = document.getElementById('broadcast-banner');
  const broadcastTextSpan = document.getElementById('broadcast-text');
  if (broadcastBanner && broadcastTextSpan) {
    if (broadcastText) {
      broadcastTextSpan.textContent = broadcastText;
      broadcastBanner.classList.remove('hidden');
    } else {
      broadcastBanner.classList.add('hidden');
    }
  }
}

function toggleTodaySession(idx, completed) {
  const todayStr = new Date().toISOString().split('T')[0];
  if (!STATE.tracker[todayStr]) {
    STATE.tracker[todayStr] = { sessions: [], notes: '' };
  }
  
  if (STATE.tracker[todayStr].sessions[idx]) {
    STATE.tracker[todayStr].sessions[idx].completed = completed;
    
    // Check off the core schedule also so state mirrors perfectly
    const timetableDay = STATE.timetable.find(t => t.date === todayStr);
    if (timetableDay && timetableDay.sessions[idx]) {
      timetableDay.sessions[idx].completed = completed;
    }

    saveProfileState();
    calculateStreak();
    renderDashboard();
    showToast(completed ? 'ðŸŽ‰ Study session marked complete!' : 'â³ Session marked pending.');
  }
}
window.toggleTodaySession = toggleTodaySession;

// ============================================================
// STUDY STREAK CALCULATING LOGIC
// ============================================================

function calculateStreak() {
  const todayStr = new Date().toISOString().split('T')[0];
  let streak = 0;
  let maxStreak = 0;
  
  // Sort all logged dates in descending order
  const loggedDates = Object.keys(STATE.tracker).sort((a,b) => new Date(b) - new Date(a));
  
  let dateCursor = new Date();
  
  // Check if study logged for today
  const todayLog = STATE.tracker[todayStr];
  const todayDone = todayLog && todayLog.sessions.some(s => s.completed);
  
  if (!todayDone) {
    // If not done today, streak might have broken or is starting from yesterday
    dateCursor.setDate(dateCursor.getDate() - 1);
  }

  // Iterate backwards and count consecutive active days
  while (true) {
    const cursorStr = dateCursor.toISOString().split('T')[0];
    const log = STATE.tracker[cursorStr];
    const done = log && log.sessions.some(s => s.completed);
    
    if (done) {
      streak++;
      dateCursor.setDate(dateCursor.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate historic best streak
  let tempStreak = 0;
  // Reverse chronological sort to count gaps
  const revDates = [...loggedDates].reverse();
  let prevDate = null;

  revDates.forEach(dateStr => {
    const log = STATE.tracker[dateStr];
    const done = log && log.sessions.some(s => s.completed);
    
    if (done) {
      if (prevDate) {
        const diff = new Date(dateStr) - new Date(prevDate);
        const days = Math.round(diff / (1000 * 60 * 60 * 24));
        if (days === 1) {
          tempStreak++;
        } else if (days > 1) {
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = dateStr;
    }
  });
  
  maxStreak = Math.max(maxStreak, tempStreak);

  STATE.streak = streak;
  STATE.bestStreak = Math.max(maxStreak, STATE.bestStreak);
}

// ============================================================
// TIMETABLE RENDERING (CALENDAR & LIST VIEWS)
// ============================================================

function renderTimetable() {
  if (!STATE.profile || STATE.timetable.length === 0) return;

  // Render Subject Legend
  const legend = document.getElementById('subject-legend');
  if (legend) {
    const activeSubs = getActiveSubjects(STATE.profile.groupChoice);
    legend.innerHTML = activeSubs.map(s => `
      <div style="display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;font-weight:600;">
        <span style="width:10px;height:10px;border-radius:2px;background:${s.color};display:inline-block"></span>
        <span>${s.shortName}</span>
      </div>
    `).join('') + `
      <div style="display:flex;align-items:center;gap:0.4rem;font-size:0.75rem;font-weight:600;margin-left:auto">
        <span style="width:10px;height:10px;border-radius:2px;background:#444;display:inline-block"></span>
        <span>Rest/Buffer</span>
      </div>
    `;
  }

  const monthLabel = document.getElementById('cal-month-label');
  const mNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  if (monthLabel) {
    monthLabel.textContent = `${mNames[STATE.calCurrentMonth.getMonth()]} ${STATE.calCurrentMonth.getFullYear()}`;
  }

  if (STATE.calViewMode === 'calendar') {
    document.getElementById('calendar-view')?.classList.remove('hidden');
    document.getElementById('list-view')?.classList.add('hidden');
    renderCalendarGrid();
  } else {
    document.getElementById('calendar-view')?.classList.add('hidden');
    document.getElementById('list-view')?.classList.remove('hidden');
    renderTimetableWeekList();
  }
}

function setCalView(mode) {
  STATE.calViewMode = mode;
  document.getElementById('cal-view-btn').className = mode === 'calendar' ? 'active' : '';
  document.getElementById('list-view-btn').className = mode === 'list' ? 'active' : '';
  renderTimetable();
}
window.setCalView = setCalView;

function adjustCalMonth(val) {
  STATE.calCurrentMonth.setMonth(STATE.calCurrentMonth.getMonth() + val);
  renderTimetable();
}

function renderCalendarGrid() {
  const headers = document.getElementById('cal-headers');
  const daysGrid = document.getElementById('cal-days-grid');
  if (!headers || !daysGrid) return;

  const wNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  headers.innerHTML = wNames.map(w => `<div class="cal-header">${w}</div>`).join('');

  // Calculate padding days for start of month
  const year = STATE.calCurrentMonth.getFullYear();
  const month = STATE.calCurrentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalMonthDays = new Date(year, month + 1, 0).getDate();

  const gridCells = [];
  
  // Padding cells
  for (let p = 0; p < firstDayIndex; p++) {
    gridCells.push(`<div class="cal-day other-month"></div>`);
  }

  // Actual day cells
  for (let d = 1; d <= totalMonthDays; d++) {
    const cellDateObj = new Date(year, month, d);
    const dStr = cellDateObj.toISOString().split('T')[0];
    
    // Find timetable item for this day
    const dayPlan = STATE.timetable.find(t => t.date === dStr);
    const dayLog = STATE.tracker[dStr] || { sessions: [], notes: '' };
    
    let cellHtml = '';
    
    if (dayPlan) {
      const isToday = dStr === new Date().toISOString().split('T')[0];
      const hasRest = dayPlan.sessions.length === 0;
      
      let cellClass = `cal-day ${isToday ? 'today' : ''}`;
      
      // Determine background color block matching the first study session's subject
      let bgStyle = 'background: rgba(255,255,255,0.02);';
      let accentCol = '#444';
      if (dayPlan.sessions.length > 0) {
        const firstSession = dayPlan.sessions[0];
        const sub = CA_DATA.subjects[firstSession.subjectId];
        if (sub) {
          bgStyle = `background: rgba(${hexToRgb(sub.color)}, 0.08); border: 1px solid rgba(${hexToRgb(sub.color)}, 0.25);`;
          accentCol = sub.color;
        }
      }

      // Check completions
      const allDone = dayPlan.sessions.length > 0 && dayLog.sessions.every(s => s.completed);
      const checkMark = allDone ? `<span style="color:var(--emerald);font-size:0.75rem;margin-left:auto;">âœ“</span>` : '';

      // Build sessions bullet list
      const bullets = dayPlan.sessions.map((s, sIdx) => {
        const sub = CA_DATA.subjects[s.subjectId] || { shortName: 'Rest' };
        let editControls = '';
        if (STATE.timetableEditMode) {
          // Adjust hours (+/- 0.5) and delete (âœ•) controls
          editControls = `
            <span style="display:inline-flex;gap:2px;margin-left:auto;align-items:center;background:rgba(0,0,0,0.6);border-radius:3px;padding:1px 3px;">
              <span onclick="adjustTimetableSessionHours('${dStr}', ${sIdx}, 0.5); event.stopPropagation();" style="cursor:pointer;padding:0 2px;color:var(--success);font-weight:900;" title="Increase target hours">+</span>
              <span onclick="adjustTimetableSessionHours('${dStr}', ${sIdx}, -0.5); event.stopPropagation();" style="cursor:pointer;padding:0 2px;color:var(--danger);font-weight:900;" title="Decrease target hours">-</span>
              <span onclick="deleteTimetableSession('${dStr}', ${sIdx}); event.stopPropagation();" style="cursor:pointer;padding:0 2px;color:var(--danger);font-size:0.6rem;margin-left:2px;" title="Delete session">âœ•</span>
            </span>
          `;
        }
        return `
          <div class="cal-session-chip" 
            ${STATE.timetableEditMode ? `draggable="true" ondragstart="handleTimetableDragStart(event, '${dStr}', ${sIdx})"` : ''}
            style="color:${sub.color || '#888'};margin-top:2px;display:flex;align-items:center;width:100%;font-size:0.65rem;cursor:${STATE.timetableEditMode ? 'grab' : 'pointer'};">
            <span style="font-weight:500;">â€¢ ${sub.shortName || 'Rest'}: ${s.hours}h</span>
            ${editControls}
          </div>
        `;
      }).join('');

      cellHtml = `
        <div class="${cellClass}" style="${bgStyle}" onclick="selectTrackerDate('${dStr}')"
          ${STATE.timetableEditMode ? `ondragover="handleTimetableDragOver(event)" ondrop="handleTimetableDrop(event, '${dStr}')"` : ''}>
          <div style="display:flex;align-items:center;">
            <span class="cal-date font-bold">${d}</span>
            ${checkMark}
          </div>
          <div class="calendar-bullets-wrap mt-1" style="display:flex;flex-direction:column;gap:2px;">
            ${bullets}
          </div>
          ${STATE.timetableEditMode ? `<div class="text-center text-muted" style="border-top:1px dashed var(--border);margin-top:4px;font-size:0.6rem;cursor:pointer;padding-top:2px;" onclick="addCustomTimetableSession('${dStr}'); event.stopPropagation();">+ Add Session</div>` : ''}
        </div>
      `;
    } else {
      // Out of timetable bounds
      cellHtml = `
        <div class="cal-day other-month" style="opacity:0.4;">
          <span class="cal-date">${d}</span>
        </div>
      `;
    }
    
    gridCells.push(cellHtml);
  }

  daysGrid.innerHTML = gridCells.join('');
}

function renderTimetableWeekList() {
  const container = document.getElementById('week-list-container');
  if (!container) return;

  // Group timetable items into weeks (7 days blocks)
  const weeks = [];
  let currentWeek = [];

  STATE.timetable.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === STATE.timetable.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  container.innerHTML = weeks.map((wk, wIdx) => {
    const firstDate = new Date(wk[0].date).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    const lastDate = new Date(wk[wk.length - 1].date).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
    
    const dayRows = wk.map(d => {
      const log = STATE.tracker[d.date] || { sessions: [], notes: '' };
      const allDone = d.sessions.length > 0 && log.sessions.every(s => s.completed);
      const rowDateStr = new Date(d.date).toLocaleDateString('en-IN', { weekday:'short', day:'numeric' });
      
      const sessionBadges = d.sessions.map(s => {
        const sub = CA_DATA.subjects[s.subjectId] || { shortName: 'Buffer', color: '#888' };
        return `<span class="badge" style="background:rgba(${hexToRgb(sub.color)}, 0.15);color:${sub.color};font-size:0.7rem;margin-right:0.3rem">${sub.shortName}: ${s.chapterName} (${s.hours}h)</span>`;
      }).join('');

      return `
        <div style="display:flex;align-items:center;padding:0.6rem 0;border-bottom:1px solid rgba(255,255,255,0.03);flex-wrap:wrap;gap:0.5rem">
          <div style="font-weight:700;font-size:0.82rem;width:90px;">${rowDateStr}</div>
          <div style="flex:1;display:flex;flex-wrap:wrap;gap:0.25rem;">
            ${sessionBadges || '<span class="text-muted text-xs">Buffer / Break</span>'}
          </div>
          <button class="btn btn-secondary btn-sm py-1 px-2" style="font-size:0.75rem;" onclick="selectTrackerDate('${d.date}')">
            ${allDone ? 'âœ… Done' : 'ðŸ“… View Tracker'}
          </button>
        </div>
      `;
    }).join('');

    return `
      <div class="card mb-4">
        <div class="card-title text-sm" style="color:var(--gold)">ðŸ“… Week ${wIdx + 1} (${firstDate} - ${lastDate})</div>
        <div class="mt-2" style="display:flex;flex-direction:column">
          ${dayRows}
        </div>
      </div>
    `;
  }).join('');
}

function hexToRgb(hex) {
  hex = hex.replace('#','');
  if(hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  const r = parseInt(hex.substring(0,2), 16);
  const g = parseInt(hex.substring(2,4), 16);
  const b = parseInt(hex.substring(4,6), 16);
  return `${r}, ${g}, ${b}`;
}

// =<ctrl42>==========================================================
// REVISION PLANNER RENDERING & ABC SYSTEM
// ============================================================

let revActiveSubject = '';

function renderRevisionPlanner() {
  if (!STATE.profile) return;

  const tabs = document.getElementById('revision-subject-tabs');
  const activeSubs = getActiveSubjects(STATE.profile.groupChoice);
  
  if (!revActiveSubject || !activeSubs.find(s => s.id === revActiveSubject)) {
    revActiveSubject = activeSubs[0].id;
  }

  // Subject tabs
  if (tabs) {
    tabs.innerHTML = activeSubs.map(s => `
      <button class="tab-btn ${s.id === revActiveSubject ? 'active' : ''}" 
        onclick="setRevActiveSubject('${s.id}')" style="border-bottom:2px solid ${s.id === revActiveSubject ? s.color : 'transparent'};color:${s.id === revActiveSubject ? s.color : 'inherit'}">
        ${s.shortName}
      </button>
    `).join('');
  }

  // Revision Chapters List Header
  const activeSubObj = CA_DATA.subjects[revActiveSubject];
  const header = document.getElementById('revision-chapters-header');
  if (header && activeSubObj) {
    const chapters = activeSubObj.chapters;
    const completedCount = Object.values(STATE.revision[revActiveSubject] || {}).filter(c => c.done).length;
    header.innerHTML = `
      <h3 style="font-size:1.1rem;font-weight:700;color:${activeSubObj.color}">${activeSubObj.emoji} ${activeSubObj.name}</h3>
      <span class="badge" style="background:rgba(${hexToRgb(activeSubObj.color)},0.15);color:${activeSubObj.color}">${completedCount} / ${chapters.length} chapters revised</span>
    `;
  }

  // Chapters rendering
  const list = document.getElementById('chapters-list');
  if (list && activeSubObj) {
    const chaptersState = STATE.revision[revActiveSubject] || {};
    list.innerHTML = activeSubObj.chapters.map(ch => {
      const stateObj = chaptersState[ch.id] || { rating: 'Average', done: false };
      
      // Calculate realistic target revision hours based on category and user difficulty rating
      // ABC Priority: A gets 100% time, B gets 60% time, C gets 30% time
      let targetHrs = ch.hrs;
      if (stateObj.rating === 'Strong') targetHrs = Math.max(1, Math.round(ch.hrs * 0.4));
      else if (stateObj.rating === 'Average') targetHrs = Math.max(1, Math.round(ch.hrs * 0.7));

      if (ch.cat === 'B') targetHrs = Math.max(1, Math.round(targetHrs * 0.7));
      else if (ch.cat === 'C') targetHrs = Math.max(1, Math.round(targetHrs * 0.4));

      return `
        <div class="chapter-card-rev" style="border-left:4px solid ${stateObj.done ? 'var(--emerald)' : activeSubObj.color};padding:0.75rem 1rem;background:rgba(255,255,255,0.02);border-radius:0 6px 6px 0;margin-bottom:0.75rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem">
          <div style="flex:1;min-width:200px;">
            <div style="display:flex;align-items:center;gap:0.5rem">
              <span class="badge ${ch.cat === 'A' ? 'badge-a' : ch.cat === 'B' ? 'badge-b' : 'badge-c'}">${ch.cat}</span>
              <span style="font-weight:700;font-size:0.88rem;color:${stateObj.done ? 'var(--text-secondary)' : '#fff'}">${ch.name}</span>
            </div>
            <div class="text-2xs text-secondary mt-1">${ch.desc}</div>
          </div>

          <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
            <div class="text-xs">
              â±ï¸ target: <strong>${targetHrs}h</strong>
            </div>

            <!-- Self-rating dropdown -->
            <select class="form-select" onchange="updateChapterRating('${activeSubObj.id}', ${ch.id}, this.value)" style="padding:0.2rem 0.5rem;font-size:0.75rem;width:105px;height:auto;">
              <option value="Strong" ${stateObj.rating === 'Strong' ? 'selected' : ''}>ðŸŸ¢ Strong</option>
              <option value="Average" ${stateObj.rating === 'Average' ? 'selected' : ''}>ðŸŸ¡ Average</option>
              <option value="Weak" ${stateObj.rating === 'Weak' ? 'selected' : ''}>ðŸ”´ Weak</option>
            </select>

            <!-- Complete check-off checkbox -->
            <label style="display:flex;align-items:center;gap:0.35rem;cursor:pointer;font-size:0.8rem;font-weight:700">
              <input type="checkbox" ${stateObj.done ? 'checked' : ''} onchange="toggleChapterDone('${activeSubObj.id}', ${ch.id}, this.checked)" style="width:18px;height:18px;accent-color:var(--emerald)"/>
              <span>Revise Done</span>
            </label>
          </div>
        </div>
      `;
    }).join('');
  }

  // Revision progress bars in sidebar
  const revBars = document.getElementById('rev-subject-bars');
  if (revBars) {
    revBars.innerHTML = activeSubs.map(s => {
      const subRev = STATE.revision[s.id] || {};
      const totalCh = s.chapters.length;
      const completedCh = Object.values(subRev).filter(c => c.done).length;
      const pct = totalCh > 0 ? Math.round((completedCh / totalCh) * 100) : 0;

      return `
        <div style="margin-bottom:0.75rem">
          <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.25rem">
            <span style="font-weight:700;">${s.shortName}</span>
            <span>${pct}% revised (${completedCh}/${totalCh})</span>
          </div>
          <div class="modal-progress" style="height:6px;">
            <div class="modal-progress-bar" style="width:${pct}%;background:${s.color}"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Revision tips in sidebar
  const tipsDiv = document.getElementById('rev-strategy-tips');
  if (tipsDiv && activeSubObj) {
    tipsDiv.innerHTML = activeSubObj.tips.map(t => `
      <div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:0.5rem;padding-left:0.6rem;border-left:2px solid var(--cyan)">
        ${t}
      </div>
    `).join('');
  }
}

function setRevActiveSubject(subId) {
  revActiveSubject = subId;
  renderRevisionPlanner();
}
window.setRevActiveSubject = setRevActiveSubject;

function updateChapterRating(subId, chId, rating) {
  if (!STATE.revision[subId]) STATE.revision[subId] = {};
  if (!STATE.revision[subId][chId]) STATE.revision[subId][chId] = { rating: 'Average', done: false };
  
  STATE.revision[subId][chId].rating = rating;
  saveProfileState();
  renderRevisionPlanner();
  showToast('ðŸ’¾ Difficulty rating updated.');
}
window.updateChapterRating = updateChapterRating;

function toggleChapterDone(subId, chId, done) {
  if (!STATE.revision[subId]) STATE.revision[subId] = {};
  if (!STATE.revision[subId][chId]) STATE.revision[subId][chId] = { rating: 'Average', done: false };

  STATE.revision[subId][chId].done = done;
  saveProfileState();
  renderRevisionPlanner();
  renderDashboard();
  
  // Show toast
  showToast(done ? 'ðŸŽ‰ Chapter marked fully revised!' : 'ðŸ”„ Chapter reset.');
}
window.toggleChapterDone = toggleChapterDone;

// ============================================================
// DAILY STUDY TRACKER LOGGING SYSTEM
// ============================================================

function renderTracker() {
  if (!STATE.profile) return;

  const dateDisplay = document.getElementById('tracker-date-display');
  if (dateDisplay) {
    const dObj = new Date(STATE.currentDate);
    dateDisplay.textContent = dObj.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Update tracker streak count
  calculateStreak();
  const trackStreak = document.getElementById('tracker-streak');
  if (trackStreak) trackStreak.textContent = STATE.streak;

  const todayLogs = STATE.tracker[STATE.currentDate] || { sessions: [], notes: '' };

  // Render log sessions
  const logsList = document.getElementById('log-sessions-list');
  if (logsList) {
    if (todayLogs.sessions.length > 0) {
      logsList.innerHTML = todayLogs.sessions.map((s, idx) => {
        const sub = CA_DATA.subjects[s.subjectId] || { shortName: 'Buffer', color: '#888' };
        return `
          <div class="session-item" style="border-left:4px solid ${sub.color};background:rgba(255,255,255,0.02);padding:0.75rem;border-radius:0 6px 6px 0;margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">
            <div>
              <div class="text-sm" style="font-weight:700;">${sub.shortName}: ${s.chapterName}</div>
              <div class="text-xs text-secondary mt-1">${s.hours} hours Â· ${s.type.toUpperCase()}</div>
            </div>
            <div style="display:flex;align-items:center;gap:0.75rem">
              <label style="display:flex;align-items:center;gap:0.35rem;cursor:pointer;font-size:0.8rem;font-weight:700">
                <input type="checkbox" ${s.completed ? 'checked' : ''} onchange="toggleTrackerSession(${idx}, this.checked)" style="width:18px;height:18px;accent-color:${sub.color};"/>
                <span>Done</span>
              </label>
              <button class="btn btn-ghost p-1" style="font-size:0.8rem" onclick="deleteTrackerSession(${idx})" title="Delete">âŒ</button>
            </div>
          </div>
        `;
      }).join('');
    } else {
      logsList.innerHTML = `<p class="text-sm text-muted py-3">No study sessions logged for this day. Click the button below to add your custom session!</p>`;
    }
  }

  // Populating Add Session Select options
  const activeSubs = getActiveSubjects(STATE.profile.groupChoice);
  const subSelect = document.getElementById('log-subject-select');
  if (subSelect && subSelect.children.length === 0) {
    subSelect.innerHTML = activeSubs.map(s => `<option value="${s.id}">${s.emoji} ${s.name}</option>`).join('');
    // Trigger chapter population for the first subject
    populateTrackerChaptersSelect(activeSubs[0].id);
    subSelect.addEventListener('change', (e) => populateTrackerChaptersSelect(e.target.value));
  }

  // Populate Notes
  const notesInput = document.getElementById('daily-notes-input');
  if (notesInput) {
    notesInput.value = todayLogs.notes || '';
  }

  // Populate Stats Sidebar
  const statsDiv = document.getElementById('today-stats-display');
  if (statsDiv) {
    const totalPlanned = STATE.timetable.find(t => t.date === STATE.currentDate)?.hoursTarget || 0;
    const totalLogged = todayLogs.sessions.reduce((acc, curr) => acc + curr.hours, 0);
    const totalDone = todayLogs.sessions.filter(s => s.completed).reduce((acc, curr) => acc + curr.hours, 0);
    
    statsDiv.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;text-align:center;">
        <div class="border-card p-2" style="background:rgba(255,255,255,0.02)">
          <div class="text-2xs text-secondary">TODAY TARGET</div>
          <div class="font-bold text-lg" style="color:var(--cyan)">${totalPlanned}h</div>
        </div>
        <div class="border-card p-2" style="background:rgba(255,255,255,0.02)">
          <div class="text-2xs text-secondary">COMPLETED STUDY</div>
          <div class="font-bold text-lg" style="color:var(--emerald)">${totalDone}h</div>
        </div>
      </div>
    `;
  }

  // Weekly Stats
  const weekStatsDiv = document.getElementById('week-stats-display');
  if (weekStatsDiv) {
    const todayObj = new Date(STATE.currentDate);
    const startOfWeek = new Date(todayObj);
    startOfWeek.setDate(todayObj.getDate() - todayObj.getDay()); // Sunday
    
    let weeklyTarget = 0;
    let weeklyDone = 0;

    for (let i = 0; i < 7; i++) {
      const cursorStr = startOfWeek.toISOString().split('T')[0];
      const plan = STATE.timetable.find(t => t.date === cursorStr);
      const log = STATE.tracker[cursorStr] || { sessions: [], notes: '' };
      
      weeklyTarget += plan ? plan.hoursTarget : 0;
      weeklyDone += log.sessions.filter(s => s.completed).reduce((acc, curr) => acc + curr.hours, 0);
      startOfWeek.setDate(startOfWeek.getDate() + 1);
    }

    const pct = weeklyTarget > 0 ? Math.round((weeklyDone / weeklyTarget) * 100) : 0;

    weekStatsDiv.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:0.25rem">
        <span>Weekly Target Completed</span>
        <span style="font-weight:700;color:var(--gold);">${weeklyDone} / ${weeklyTarget} hrs (${pct}%)</span>
      </div>
      <div class="modal-progress" style="height:6px;">
        <div class="modal-progress-bar" style="width:${pct}%;background:linear-gradient(90deg, var(--cyan), var(--emerald));"></div>
      </div>
    `;
  }

  // Recent logs list
  const recentDiv = document.getElementById('recent-log-display');
  if (recentDiv) {
    const sortedKeys = Object.keys(STATE.tracker)
      .filter(k => STATE.tracker[k].sessions.some(s => s.completed))
      .sort((a,b) => new Date(b) - new Date(a))
      .slice(0, 3);
      
    if (sortedKeys.length > 0) {
      recentDiv.innerHTML = sortedKeys.map(k => {
        const totalHrs = STATE.tracker[k].sessions.filter(s => s.completed).reduce((acc, curr) => acc + curr.hours, 0);
        return `<div style="margin-bottom:0.4rem;display:flex;justify-content:space-between">
          <span>${new Date(k).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
          <strong>${totalHrs} hours studied</strong>
        </div>`;
      }).join('');
    } else {
      recentDiv.innerHTML = `<span class="text-muted text-xs">No active study history found yet. Clear your daily plans above!</span>`;
    }
  }

  // Re-initialize drag-and-drop after DOM is re-rendered
  if (typeof initDragAndDrop === 'function') initDragAndDrop();
}

function populateTrackerChaptersSelect(subId) {
  const chSelect = document.getElementById('log-chapter-select');
  const sub = CA_DATA.subjects[subId];
  if (chSelect && sub) {
    chSelect.innerHTML = sub.chapters.map(c => `<option value="${c.id}">${c.name} (Cat ${c.cat})</option>`).join('') + `<option value="0">General Study / Revision</option>`;
  }
}

function adjustTrackerDate(val) {
  const d = new Date(STATE.currentDate);
  d.setDate(d.getDate() + val);
  STATE.currentDate = d.toISOString().split('T')[0];
  renderTracker();
}

function selectTrackerDate(dateStr) {
  STATE.currentDate = dateStr;
  navigateTo('tracker');
}
window.selectTrackerDate = selectTrackerDate;

function toggleTrackerSession(idx, completed) {
  const log = STATE.tracker[STATE.currentDate];
  if (log && log.sessions[idx]) {
    log.sessions[idx].completed = completed;
    
    // Mirror update to timetable
    const timetableDay = STATE.timetable.find(t => t.date === STATE.currentDate);
    if (timetableDay && timetableDay.sessions[idx]) {
      timetableDay.sessions[idx].completed = completed;
    }

    saveProfileState();
    calculateStreak();
    renderTracker();
    showToast(completed ? 'ðŸŽ‰ Session completed!' : 'ðŸ”„ Session set to pending.');
  }
}
window.toggleTrackerSession = toggleTrackerSession;

function deleteTrackerSession(idx) {
  const log = STATE.tracker[STATE.currentDate];
  if (log && log.sessions[idx]) {
    log.sessions.splice(idx, 1);
    
    // Also delete from timetable schedule for mirror fidelity
    const timetableDay = STATE.timetable.find(t => t.date === STATE.currentDate);
    if (timetableDay && timetableDay.sessions[idx]) {
      timetableDay.sessions.splice(idx, 1);
    }

    saveProfileState();
    calculateStreak();
    renderTracker();
    showToast('ðŸ—‘ï¸ Session deleted from logs.');
  }
}
window.deleteTrackerSession = deleteTrackerSession;

function showAddSessionForm() {
  document.getElementById('add-session-form')?.classList.remove('hidden');
}

function hideAddForm() {
  document.getElementById('add-session-form')?.classList.add('hidden');
}
window.hideAddForm = hideAddForm;

function saveLogSession() {
  const subId = document.getElementById('log-subject-select').value;
  const chId = parseInt(document.getElementById('log-chapter-select').value);
  const hrs = parseFloat(document.getElementById('log-hours-input').value);
  const type = document.getElementById('log-type-select').value;
  
  if (isNaN(hrs) || hrs <= 0) {
    showToast('âš ï¸ Please enter a valid number of study hours.');
    return;
  }

  const sub = CA_DATA.subjects[subId];
  let chName = 'General Study';
  if (chId > 0 && sub) {
    chName = sub.chapters.find(c => c.id === chId)?.name || 'General';
  }

  const newSession = {
    subjectId: subId,
    chapterId: chId,
    chapterName: chName,
    hours: hrs,
    type: type,
    completed: true // Manual sessions are default marked as completed
  };

  if (!STATE.tracker[STATE.currentDate]) {
    STATE.tracker[STATE.currentDate] = { sessions: [], notes: '' };
  }
  
  // Add to log
  STATE.tracker[STATE.currentDate].sessions.push(newSession);

  // Add to timetable day for calendar preview sync
  const timetableDay = STATE.timetable.find(t => t.date === STATE.currentDate);
  if (timetableDay) {
    timetableDay.sessions.push({ ...newSession });
  }

  saveProfileState();
  calculateStreak();
  renderTracker();
  hideAddForm();
  showToast('ðŸ’¾ Study session successfully added.');
}
window.saveLogSession = saveLogSession;

function saveNotes() {
  const text = document.getElementById('daily-notes-input').value;
  if (!STATE.tracker[STATE.currentDate]) {
    STATE.tracker[STATE.currentDate] = { sessions: [], notes: '' };
  }
  STATE.tracker[STATE.currentDate].notes = text;
  saveProfileState();
  showToast('ðŸ“ Daily notes saved.');
}
window.saveNotes = saveNotes;

// ============================================================
// FREE RESOURCES HUB RENDERING
// ============================================================

let resActiveSubject = '';

function renderResources() {
  if (!STATE.profile) return;

  const tabs = document.getElementById('resources-subject-tabs');
  const activeSubs = getActiveSubjects(STATE.profile.groupChoice);

  if (!resActiveSubject || !activeSubs.find(s => s.id === resActiveSubject)) {
    resActiveSubject = activeSubs[0].id;
  }

  // Render subject tabs
  if (tabs) {
    tabs.innerHTML = activeSubs.map(s => `
      <button class="tab-btn ${s.id === resActiveSubject ? 'active' : ''}" 
        onclick="setResActiveSubject('${s.id}')" style="border-bottom:2px solid ${s.id === resActiveSubject ? s.color : 'transparent'};color:${s.id === resActiveSubject ? s.color : 'inherit'}">
        ${s.shortName}
      </button>
    `).join('');
  }

  // Subject-wise YouTube Channels Grid
  const activeSubObj = CA_DATA.subjects[resActiveSubject];
  const ytGrid = document.getElementById('youtube-resources-grid');
  if (ytGrid && activeSubObj) {
    ytGrid.innerHTML = activeSubObj.ytChannels.map(yt => `
      <div class="feature-card flex-col" style="--accent-color:${activeSubObj.color};">
        <div style="font-size:2rem;margin-bottom:0.5rem">ðŸŽ¥</div>
        <h4 style="font-size:0.95rem;font-weight:700;">${yt.name}</h4>
        <p class="text-xs text-muted mt-2" style="flex:1;">${yt.desc}</p>
        <a href="${yt.url}" target="_blank" class="btn btn-ghost btn-sm mt-3" style="width:fit-content;color:${activeSubObj.color}">
          Watch Free Content â†—
        </a>
      </div>
    `).join('');
  }

  // Official ICAI Resources Grid
  const icaiGrid = document.getElementById('icai-resources-grid');
  if (icaiGrid) {
    icaiGrid.innerHTML = CA_DATA.freeResources.map(res => `
      <div class="feature-card flex-col" style="--accent-color:var(--gold);">
        <div style="font-size:1.8rem;margin-bottom:0.4rem">${res.icon}</div>
        <h4 style="font-size:0.9rem;font-weight:700;">${res.name}</h4>
        <p class="text-2xs text-muted mt-1" style="flex:1;">${res.desc}</p>
        <a href="${res.url}" target="_blank" class="btn btn-secondary btn-sm mt-3" style="font-size:0.75rem;padding:0.25rem 0.6rem">
          Visit Resource â†—
        </a>
      </div>
    `).join('');
  }
}

function setResActiveSubject(subId) {
  resActiveSubject = subId;
  renderResources();
}
window.setResActiveSubject = setResActiveSubject;

// ============================================================
// STRATEGY HUB & POMODORO TIMER SYSTEM
// ============================================================

function renderStrategyHub() {
  if (!STATE.profile) return;

  // Phase cards
  const phaseGrid = document.getElementById('phase-cards-grid');
  if (phaseGrid) {
    phaseGrid.innerHTML = Object.keys(CA_DATA.phases).map(phaseKey => {
      const ph = CA_DATA.phases[phaseKey];
      const tasksList = ph.tasks.map(t => `<li class="text-xs mt-1">â€¢ ${t}</li>`).join('');
      return `
        <div class="feature-card flex-col" style="--accent-color:${ph.color};">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">
            <span style="font-size:1.5rem">${ph.icon}</span>
            <h4 style="font-weight:700;font-size:1rem;color:${ph.color}">${ph.name}</h4>
          </div>
          <div style="font-size:0.72rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--text-secondary)">${ph.ratio}</div>
          <p class="text-xs text-muted my-2">${ph.desc}</p>
          <ul style="list-style:none;padding:0;margin-top:auto">
            ${tasksList}
          </ul>
        </div>
      `;
    }).join('');
  }

  // Articleship Schedule template block
  const schedSection = document.getElementById('article-schedule-section');
  const schedGrid = document.getElementById('article-schedule-grid');
  if (STATE.profile.studentMode === 'articleship') {
    schedSection?.classList.remove('hidden');
    
    if (schedGrid) {
      // Weekday slots
      const weekdayHtml = CA_DATA.articleSchedules.weekday.slots.map(s => `
        <div style="display:flex;gap:0.75rem;padding:0.4rem 0;border-bottom:1px solid rgba(255,255,255,0.03);align-items:flex-start">
          <div style="font-size:1.1rem">${s.icon}</div>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between">
              <span class="text-xs font-bold">${s.label}</span>
              <span class="badge" style="font-size:0.65rem;background:rgba(255,255,255,0.05);">${s.time}</span>
            </div>
            <p class="text-3xs text-secondary mt-1">${s.desc}</p>
          </div>
        </div>
      `).join('');

      // Weekend slots
      const weekendHtml = CA_DATA.articleSchedules.weekend.slots.map(s => `
        <div style="display:flex;gap:0.75rem;padding:0.4rem 0;border-bottom:1px solid rgba(255,255,255,0.03);align-items:flex-start">
          <div style="font-size:1.1rem">${s.icon}</div>
          <div style="flex:1">
            <div style="display:flex;justify-content:space-between">
              <span class="text-xs font-bold">${s.label}</span>
              <span class="badge" style="font-size:0.65rem;background:rgba(255,255,255,0.05);">${s.time}</span>
            </div>
            <p class="text-3xs text-secondary mt-1">${s.desc}</p>
          </div>
        </div>
      `).join('');

      schedGrid.innerHTML = `
        <div class="card p-3">
          <div class="card-title text-sm" style="color:var(--cyan)">ðŸ“… Monday - Saturday Routine</div>
          <div class="mt-2" style="display:flex;flex-direction:column;gap:0.4rem">${weekdayHtml}</div>
        </div>
        <div class="card p-3">
          <div class="card-title text-sm" style="color:var(--gold)">ðŸ“… Sunday Study Blitz</div>
          <div class="mt-2" style="display:flex;flex-direction:column;gap:0.4rem">${weekendHtml}</div>
        </div>
      `;
    }
  } else {
    schedSection?.classList.add('hidden');
  }

  // Proven Study Techniques Grid
  const techGrid = document.getElementById('techniques-grid');
  if (techGrid) {
    techGrid.innerHTML = CA_DATA.techniques.map(t => `
      <div class="card p-3" style="display:flex;gap:0.75rem;align-items:flex-start">
        <div style="font-size:1.8rem">${t.icon}</div>
        <div>
          <h4 style="font-size:0.85rem;font-weight:700;">${t.name}</h4>
          <p class="text-xs text-secondary mt-1">${t.desc}</p>
        </div>
      </div>
    `).join('');
  }
}

// ðŸ… Pomodoro timer features
function togglePomoPanel() {
  const panel = document.getElementById('pomo-panel-wrap');
  panel?.classList.toggle('hidden');
  document.getElementById('pomodoro-widget')?.classList.remove('hidden');
}
window.togglePomoPanel = togglePomoPanel;

function setPomoMode(mode) {
  STATE.pomo.mode = mode;
  STATE.pomo.isRunning = false;
  clearInterval(STATE.pomo.timer);

  const btns = document.querySelectorAll('.pomo-mode-btn');
  btns.forEach(btn => {
    if (btn.getAttribute('onclick').includes(mode)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (mode === 'focus') STATE.pomo.timeLeft = 25 * 60;
  else if (mode === 'short') STATE.pomo.timeLeft = 5 * 60;
  else if (mode === 'long') STATE.pomo.timeLeft = 30 * 60;

  updatePomoDisplay();
  const playBtn = document.getElementById('pomo-play-btn');
  if(playBtn) playBtn.textContent = 'â–¶';
}
window.setPomoMode = setPomoMode;

function togglePomo() {
  const playBtn = document.getElementById('pomo-play-btn');
  if (STATE.pomo.isRunning) {
    STATE.pomo.isRunning = false;
    clearInterval(STATE.pomo.timer);
    if(playBtn) playBtn.textContent = 'â–¶';
    showToast('ðŸ… Timer paused.');
  } else {
    STATE.pomo.isRunning = true;
    if(playBtn) playBtn.textContent = 'â¸';
    STATE.pomo.timer = setInterval(() => {
      if (STATE.pomo.timeLeft > 0) {
        STATE.pomo.timeLeft--;
        updatePomoDisplay();
      } else {
        handlePomoCompletion();
      }
    }, 1000);
    showToast('ðŸ… Focus session started. Let\'s go!');
  }
}
window.togglePomo = togglePomo;

function pomoPrev() {
  setPomoMode(STATE.pomo.mode);
  showToast('ðŸ… Timer reset.');
}
window.pomoPrev = pomoPrev;

function pomoSkip() {
  handlePomoCompletion(true);
}
window.pomoSkip = pomoSkip;

function updatePomoDisplay() {
  const min = Math.floor(STATE.pomo.timeLeft / 60);
  const sec = STATE.pomo.timeLeft % 60;
  const timeStr = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  
  const display = document.getElementById('pomo-time-display');
  if(display) display.textContent = timeStr;

  // Update circular ring SVG
  const ring = document.getElementById('pomo-ring-fill');
  if (ring) {
    let max = 25 * 60;
    if (STATE.pomo.mode === 'short') max = 5 * 60;
    else if (STATE.pomo.mode === 'long') max = 30 * 60;

    const circumference = 377; // 2 * Math.PI * 60
    const pct = STATE.pomo.timeLeft / max;
    const offset = circumference - (pct * circumference);
    ring.style.strokeDashoffset = offset;
  }

  // Update Pomodoro Counts
  const countDisp = document.getElementById('pomo-count');
  if (countDisp) countDisp.textContent = STATE.pomo.completedToday;
}

function handlePomoCompletion(skipped = false) {
  STATE.pomo.isRunning = false;
  clearInterval(STATE.pomo.timer);
  const playBtn = document.getElementById('pomo-play-btn');
  if(playBtn) playBtn.textContent = 'â–¶';

  // Synth Audio Beep alert
  playBeep();

  if (!skipped) {
    if (STATE.pomo.mode === 'focus') {
      STATE.pomo.completedToday++;
      localStorage.setItem(KEYS.pomoCount, STATE.pomo.completedToday);
      
      const randQuote = CA_DATA.quotes[Math.floor(Math.random() * CA_DATA.quotes.length)];
      showToast(`ðŸ† Focus completed! "${randQuote.text}" - ${randQuote.author}`);
      setPomoMode('short');
    } else {
      showToast('ðŸŒ… Break completed. Time to focus!');
      setPomoMode('focus');
    }
  } else {
    showToast('â­ Session skipped.');
    setPomoMode('focus');
  }
}

// Generate simple browser synthetic sound for Pomodoro completion
function playBeep() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A note
    
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.85);
  } catch (e) {
    console.warn("Speech/sound engine disabled:", e);
  }
}

// ============================================================
// SHARE FEEDBACK FORM
// ============================================================

function initFeedbackStars() {
  const stars = document.querySelectorAll('.rating-star');
  const label = document.getElementById('rating-label');
  
  const ratingTexts = {
    1: 'ðŸ”´ Bad - Needs major improvements',
    2: 'ðŸŸ  Okay - Missing key features',
    3: 'ðŸŸ¡ Good - Useful, but can be better',
    4: 'ðŸŸ¢ Great - Love the design & features!',
    5: 'ðŸ† Outstanding! Absolute game changer!'
  };

  stars.forEach(st => {
    st.addEventListener('mouseenter', () => {
      const val = parseInt(st.getAttribute('data-val'));
      highlightStars(val);
    });

    st.addEventListener('mouseleave', () => {
      highlightStars(STATE.selectedFbStars);
    });

    st.addEventListener('click', () => {
      const val = parseInt(st.getAttribute('data-val'));
      STATE.selectedFbStars = val;
      highlightStars(val);
      if (label) label.textContent = ratingTexts[val];
    });
  });
}

function highlightStars(val) {
  const stars = document.querySelectorAll('.rating-star');
  stars.forEach(st => {
    const sVal = parseInt(st.getAttribute('data-val'));
    if (sVal <= val) {
      st.style.transform = 'scale(1.2)';
      st.style.filter = 'grayscale(0)';
    } else {
      st.style.transform = 'scale(1)';
      st.style.filter = 'grayscale(1)';
    }
  });
}

function selectFbMode(card) {
  document.querySelectorAll('[data-fb-mode]').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
}
window.selectFbMode = selectFbMode;

async function submitFeedback() {
  const rating = STATE.selectedFbStars;
  const feature = document.getElementById('feedback-feature').value;
  const text = document.getElementById('feedback-text').value.trim();
  const selectedModeCard = document.querySelector('[data-fb-mode].selected');
  const mode = selectedModeCard ? selectedModeCard.getAttribute('data-fb-mode') : 'unknown';

  if (rating === 0) {
    showToast('âš ï¸ Please provide a star rating before submitting.');
    return;
  }

  const feedbackObj = {
    studentId: STATE.profile?.id || 'anonymous',
    studentName: STATE.profile?.name || 'Anonymous',
    studentEmail: STATE.profile?.email || 'anon@example.com',
    rating: rating,
    favoriteFeature: feature || 'General',
    comments: text,
    studentMode: mode,
    submittedAt: new Date().toISOString()
  };

  // Submit to Firebase if credentials are active
  if (FEATURES.firebaseEnabled) {
    await saveFeedbackToFirestore(feedbackObj);
  } else {
    // Offline simulated storage
    const feed = JSON.parse(localStorage.getItem('offline_feedback') || '[]');
    feed.push(feedbackObj);
    localStorage.setItem('offline_feedback', JSON.stringify(feed));
  }

  showToast('ðŸ“¨ Thank you for your feedback! It helps us improve CA Final Planner.');
  
  // Clear inputs
  STATE.selectedFbStars = 0;
  highlightStars(0);
  document.getElementById('feedback-feature').value = '';
  document.getElementById('feedback-text').value = '';
  document.querySelectorAll('[data-fb-mode]').forEach(c => c.classList.remove('selected'));
  const label = document.getElementById('rating-label');
  if (label) label.textContent = '';
}
window.submitFeedback = submitFeedback;

// ============================================================
// EXCEL GENERATION USING SHEETJS (MULTI-SHEET WORKBOOK)
// ============================================================

function downloadExcel() {
  if (!STATE.profile || STATE.timetable.length === 0) {
    showToast('âš ï¸ Please generate a study planner first.');
    return;
  }

  // If SheetJS not loaded (no internet), fall back to CSV download
  if (typeof XLSX === 'undefined' || window.__cdnFailed?.xlsx) {
    downloadCSVFallback();
    return;
  }
  
  try {
    showToast('ðŸ“¥ Building your premium Excel sheet...');

    // 1. SHEET: MY PROFILE
    const profileData = [
      ["CA Final Study Planner â€” Your Tailor-Made Companion"],
      ["="],
      ["Student Name", STATE.profile.name],
      ["Email Address", STATE.profile.email],
      ["Study Mode", STATE.profile.studentMode === 'articleship' ? 'Articleship Student' : 'Full-Time Student'],
      ["Articleship Scheme", STATE.profile.articleScheme === 'new' ? 'New Scheme (2-Yr IPT)' : 'Old Scheme (3-Yr)'],
      ["Exam Target Attempt", ATTEMPTS.find(a => a.id === STATE.profile.attempt)?.label || STATE.profile.attempt],
      ["Target Group", STATE.profile.groupChoice === 'both' ? 'Both Groups' : STATE.profile.groupChoice === 'g1' ? 'Group 1' : 'Group 2'],
      ["Weekday Study Hours", STATE.profile.studentMode === 'articleship' ? STATE.profile.weekdayHours + ' hours' : 'N/A'],
      ["Weekend Study Hours", STATE.profile.studentMode === 'articleship' ? STATE.profile.weekendHours + ' hours' : 'N/A'],
      ["Daily Target Study Hours", STATE.profile.studentMode === 'fulltime' ? STATE.profile.dailyHours + ' hours' : 'N/A'],
      ["Pre-Exam Leave Duration", STATE.profile.studentMode === 'articleship' ? STATE.profile.preExamLeave + ' days' : 'N/A'],
      ["Target Revision Cycles", STATE.profile.revisionCount + ' Revisions'],
      ["Mock Test Frequency", STATE.profile.mockFrequency],
      ["Generated At", new Date(STATE.profile.registeredAt).toLocaleString()]
    ];
    const wsProfile = XLSX.utils.aoa_to_sheet(profileData);

    // 2. SHEET: MASTER TIMETABLE
    const timetableRows = [
      ["Day Index", "Date", "Study Phase", "Mode Category", "Session Topic", "Target Hours", "Status"]
    ];

    STATE.timetable.forEach(t => {
      const log = STATE.tracker[t.date] || { sessions: [] };
      if (t.sessions.length > 0) {
        t.sessions.forEach(s => {
          const sub = CA_DATA.subjects[s.subjectId] || { shortName: 'Buffer' };
          timetableRows.push([
            `Day ${t.dayIndex}`,
            t.date,
            `Phase ${t.phase}`,
            t.modeText,
            `${sub.shortName}: ${s.chapterName}`,
            s.hours,
            s.completed ? "COMPLETED" : "PENDING"
          ]);
        });
      } else {
        timetableRows.push([
          `Day ${t.dayIndex}`,
          t.date,
          `Phase ${t.phase}`,
          t.modeText,
          "Buffer / Decompression Day",
          t.hoursTarget,
          "REST"
        ]);
      }
    });
    const wsTimetable = XLSX.utils.aoa_to_sheet(timetableRows);

    // 3. SHEET: REVISION PROGRESS LIST
    const revRows = [
      ["Subject Code", "Subject Name", "Chapter Name", "ICAI Category (A/B/C)", "Self-Rating", "Completion Status"]
    ];

    const activeSubs = getActiveSubjects(STATE.profile.groupChoice);
    activeSubs.forEach(s => {
      const subRev = STATE.revision[s.id] || {};
      s.chapters.forEach(ch => {
        const stateObj = subRev[ch.id] || { rating: 'Average', done: false };
        revRows.push([
          s.shortName,
          s.name,
          ch.name,
          ch.cat,
          stateObj.rating,
          stateObj.done ? "REVISED DONE" : "PENDING REVISION"
        ]);
      });
    });
    const wsRevision = XLSX.utils.aoa_to_sheet(revRows);

    // 4. SHEET: FREE RESOURCE CATALOG
    const resRows = [
      ["Resource Name", "Category", "URL Link", "Description"]
    ];

    CA_DATA.freeResources.forEach(res => {
      resRows.push([
        res.name,
        res.category.toUpperCase(),
        res.url,
        res.desc
      ]);
    });

    activeSubs.forEach(s => {
      s.ytChannels.forEach(yt => {
        resRows.push([
          `${s.shortName}: ${yt.name}`,
          "YOUTUBE FACULTY",
          yt.url,
          yt.desc
        ]);
      });
    });
    const wsResources = XLSX.utils.aoa_to_sheet(resRows);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsProfile, "My Profile");
    XLSX.utils.book_append_sheet(wb, wsTimetable, "Study Timetable");
    XLSX.utils.book_append_sheet(wb, wsRevision, "Chapter Revision Plan");
    XLSX.utils.book_append_sheet(wb, wsResources, "Study Resources");

    const fileName = `CA_Final_Study_Planner_${STATE.profile.name.replace(/\s+/g, '_')}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showToast('ðŸŸ¢ Excel downloaded successfully! Check your downloads.');
  } catch (e) {
    console.error("Excel build failed:", e);
    showToast('âŒ Excel download failed. Trying CSV fallback...');
    downloadCSVFallback();
  }
}

// CSV fallback when SheetJS CDN is unavailable (offline mode)
function downloadCSVFallback() {
  try {
    showToast('ðŸ“¥ Downloading your timetable as CSV...');
    const rows = [
      ['Date', 'Phase', 'Mode', 'Session Topic', 'Hours', 'Status']
    ];
    STATE.timetable.forEach(t => {
      if (t.sessions && t.sessions.length > 0) {
        t.sessions.forEach(s => {
          const sub = CA_DATA.subjects[s.subjectId] || { shortName: 'Buffer' };
          rows.push([t.date, `Phase ${t.phase}`, t.modeText, `${sub.shortName}: ${s.chapterName}`, s.hours, s.completed ? 'DONE' : 'PENDING']);
        });
      } else {
        rows.push([t.date, `Phase ${t.phase}`, t.modeText, 'Buffer Day', t.hoursTarget, 'REST']);
      }
    });

    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CA_Final_Timetable_${STATE.profile.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('âœ… CSV downloaded! Open with Excel or Google Sheets.');
  } catch (err) {
    showToast('âŒ Download failed. Please check your browser settings.');
  }
}
window.downloadCSVFallback = downloadCSVFallback;
window.downloadExcel = downloadExcel;



// ============================================================
// APP LEVEL TOAST MESSAGES
// ============================================================


function showToast(msg) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast-box';
  toast.innerHTML = msg;

  container.appendChild(toast);
  
  // Animation triggers
  setTimeout(() => toast.style.opacity = '1', 50);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}
window.showToast = showToast;

function applyFeatureFlags() {
  const excelFlag = localStorage.getItem('flag_excel');
  const excelBtns = document.querySelectorAll('#excel-download-btn, [onclick="downloadExcel()"]');
  excelBtns.forEach(btn => {
    if (excelFlag === 'false') {
      btn.style.display = 'none';
    } else {
      btn.style.display = 'inline-block';
    }
  });

  const pomoFlag = localStorage.getItem('flag_pomo');
  const pomoWidget = document.getElementById('pomodoro-widget');
  if (pomoWidget) {
    if (pomoFlag === 'false') {
      pomoWidget.classList.add('hidden');
    } else {
      pomoWidget.classList.remove('hidden');
    }
  }
}
window.applyFeatureFlags = applyFeatureFlags;

// ─── CUSTOM TIMETABLE TUNING & DRAG & DROP LOGIC ──────────────
let dragSubjectId = null;
let dragChapterName = null;
let dragHours = 1;
let dragFromDate = null;
let dragFromIndex = null;

function toggleTimetableEditMode() {
  STATE.timetableEditMode = !STATE.timetableEditMode;
  const btn = document.getElementById('timetable-edit-toggle-btn');
  
  if (btn) {
    if (STATE.timetableEditMode) {
      btn.textContent = 'ðŸ’¾ Finish Tuning';
      btn.style.background = 'var(--gold)';
      btn.style.color = '#000';
      showToast('âš™ï¸ Custom Timetable Tuning Active! Drag chips or use controls to reschedule.');
    } else {
      btn.textContent = 'âš™ï¸ Tune Timetable';
      btn.style.background = '';
      btn.style.color = 'var(--gold)';
      showToast('âœ… Custom changes successfully saved & locked!');
    }
  }
  
  renderCalendarGrid();
}
window.toggleTimetableEditMode = toggleTimetableEditMode;

function adjustTimetableSessionHours(dateStr, sessionIdx, delta) {
  // Update in timetable Day
  const dayPlan = STATE.timetable.find(t => t.date === dateStr);
  if (dayPlan && dayPlan.sessions[sessionIdx]) {
    const s = dayPlan.sessions[sessionIdx];
    s.hours = Math.max(0.5, s.hours + delta);
    
    // Recalculate day hours target
    dayPlan.hoursTarget = dayPlan.sessions.reduce((acc, curr) => acc + curr.hours, 0);

    // Sync to Tracker logs
    if (STATE.tracker[dateStr] && STATE.tracker[dateStr].sessions[sessionIdx]) {
      STATE.tracker[dateStr].sessions[sessionIdx].hours = s.hours;
    }
    
    saveProfileState();
    renderCalendarGrid();
    showToast(`â±ï¸ Adjust hours target for session to ${s.hours} hours.`);
  }
}
window.adjustTimetableSessionHours = adjustTimetableSessionHours;

function deleteTimetableSession(dateStr, sessionIdx) {
  if (confirm("Are you sure you want to delete this study session from your timetable?")) {
    const dayPlan = STATE.timetable.find(t => t.date === dateStr);
    if (dayPlan) {
      dayPlan.sessions.splice(sessionIdx, 1);
      dayPlan.hoursTarget = dayPlan.sessions.reduce((acc, curr) => acc + curr.hours, 0);
      
      // Update Tracker logs
      if (STATE.tracker[dateStr]) {
        STATE.tracker[dateStr].sessions.splice(sessionIdx, 1);
      }
      
      saveProfileState();
      renderCalendarGrid();
      showToast('ðŸ—‘ï¸ Study session deleted from schedule.');
    }
  }
}
window.deleteTimetableSession = deleteTimetableSession;

function addCustomTimetableSession(dateStr) {
  const activeSubs = getActiveSubjects(STATE.profile.groupChoice);
  const subjectOptions = activeSubs.map(s => `<option value="${s.id}">${s.shortName}</option>`).join('');
  
  const modalHtml = `
    <div id="custom-session-prompt" class="modal-overlay" style="z-index: 9999;">
      <div class="modal-container" style="max-width:400px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:var(--radius-xl);padding:2rem;">
        <div class="modal-header">
          <div style="font-size:1.1rem;font-weight:700;color:var(--gold)">Add Custom Session</div>
          <button class="btn btn-ghost" onclick="document.getElementById('custom-session-prompt').remove()" style="font-size:1.2rem;padding:0;height:auto">Ã—</button>
        </div>
        <div class="modal-body">
          <div class="form-group mb-3">
            <label>Subject</label>
            <select class="form-select" id="cs-sub-select">${subjectOptions}</select>
          </div>
          <div class="form-group mb-3">
            <label>Topic / Description</label>
            <input type="text" class="form-input" id="cs-desc-input" placeholder="e.g. Solve Ind AS 115 Compiler Questions"/>
          </div>
          <div class="form-group mb-4">
            <label>Target Hours</label>
            <input type="number" class="form-input" id="cs-hrs-input" min="0.5" max="12" step="0.5" value="2"/>
          </div>
          <button class="btn btn-primary btn-full" onclick="saveCustomTimetableSession('${dateStr}')">Save Session</button>
        </div>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = modalHtml;
  document.body.appendChild(div.firstElementChild);
}
window.addCustomTimetableSession = addCustomTimetableSession;

function saveCustomTimetableSession(dateStr) {
  const subId = document.getElementById('cs-sub-select').value;
  const desc = document.getElementById('cs-desc-input').value.trim() || 'Custom Revision Session';
  const hrs = parseFloat(document.getElementById('cs-hrs-input').value || '2');

  const dayPlan = STATE.timetable.find(t => t.date === dateStr);
  if (dayPlan) {
    const newSession = {
      subjectId: subId,
      chapterId: -5,
      chapterName: desc,
      hours: hrs,
      type: 'practice',
      completed: false
    };

    dayPlan.sessions.push(newSession);
    dayPlan.hoursTarget = dayPlan.sessions.reduce((acc, curr) => acc + curr.hours, 0);

    // Sync Tracker
    if (!STATE.tracker[dateStr]) {
      STATE.tracker[dateStr] = { sessions: [], notes: '' };
    }
    STATE.tracker[dateStr].sessions.push({ ...newSession });

    saveProfileState();
    renderCalendarGrid();
    document.getElementById('custom-session-prompt').remove();
    showToast('âœ¨ Custom study session added!');
  }
}
window.saveCustomTimetableSession = saveCustomTimetableSession;

// HTML5 Drag and Drop Handlers
function handleTimetableDragStart(e, dateStr, sessionIdx) {
  const dayPlan = STATE.timetable.find(t => t.date === dateStr);
  if (dayPlan && dayPlan.sessions[sessionIdx]) {
    const s = dayPlan.sessions[sessionIdx];
    dragSubjectId = s.subjectId;
    dragChapterName = s.chapterName;
    dragHours = s.hours;
    dragFromDate = dateStr;
    dragFromIndex = sessionIdx;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragChapterName);
  }
}
window.handleTimetableDragStart = handleTimetableDragStart;

function handleTimetableDragOver(e) {
  e.preventDefault();
}
window.handleTimetableDragOver = handleTimetableDragOver;

function handleTimetableDrop(e, targetDateStr) {
  e.preventDefault();
  if (!dragFromDate || dragFromDate === targetDateStr) return;

  const sourceDay = STATE.timetable.find(t => t.date === dragFromDate);
  const targetDay = STATE.timetable.find(t => t.date === targetDateStr);

  if (sourceDay && targetDay) {
    // Remove from source
    const draggedItem = sourceDay.sessions.splice(dragFromIndex, 1)[0];
    sourceDay.hoursTarget = sourceDay.sessions.reduce((acc, curr) => acc + curr.hours, 0);
    
    // Add to target
    targetDay.sessions.push(draggedItem);
    targetDay.hoursTarget = targetDay.sessions.reduce((acc, curr) => acc + curr.hours, 0);

    // Sync Tracker logs
    if (STATE.tracker[dragFromDate]) {
      STATE.tracker[dragFromDate].sessions.splice(dragFromIndex, 1);
    }
    if (!STATE.tracker[targetDateStr]) {
      STATE.tracker[targetDateStr] = { sessions: [], notes: '' };
    }
    STATE.tracker[targetDateStr].sessions.push({ ...draggedItem });

    saveProfileState();
    renderCalendarGrid();
    showToast(`ðŸ”„ Rescheduled session to ${new Date(targetDateStr).toLocaleDateString()}!`);
    
    // Reset drag fields
    dragFromDate = null;
    dragFromIndex = null;
  }
}
window.handleTimetableDrop = handleTimetableDrop;
