// ============================================================
// ONBOARDING WIZARD LOGIC (7 STEPS)
// ============================================================

let currentStep = 1;
const totalSteps = 7;
let onboardingData = {
  name: '',
  email: '',
  studentMode: 'fulltime', // 'fulltime' or 'articleship'
  articleScheme: 'new',    // 'new' (2yr) or 'old' (3yr)
  officeDays: 6,
  officeHrs: 9,
  attempt: 'nov2026',
  groupChoice: 'both',     // 'both', 'g1', 'g2'
  subjectProgress: {},     // fr: 30, afm: 0 etc.
  chapterRatings: {},      // fr_1: 'Strong' etc.
  dailyHours: 8,
  weekdayHours: 3,
  weekendHours: 7,
  preExamLeave: 45,
  pomoPreference: 'yes',
  revisionCount: 2,        // 1, 2, 3
  mockFrequency: 'weekly'  // 'weekly', 'biweekly', 'none'
};

function startOnboarding() {
  // If Firebase is enabled and user is NOT signed in, prompt login first
  if (FEATURES.firebaseEnabled && typeof firebase !== 'undefined' && auth && !auth.currentUser) {
    showLoginModal();
    showToast('Please Log In or Sign Up first to save your plan to the cloud.');
    return;
  }
  currentStep = 1;
  document.getElementById('modal-overlay').classList.remove('hidden');
  renderWizardStep();
}

function closeWizard() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

function wizardNext() {
  if (!validateWizardStep()) return;
  saveWizardStepData();
  
  if (currentStep < totalSteps) {
    currentStep++;
    renderWizardStep();
  } else {
    // Generate everything and complete onboarding!
    generateStudyPlanner();
  }
}

function wizardBack() {
  if (currentStep > 1) {
    currentStep--;
    renderWizardStep();
  }
}

function validateWizardStep() {
  if (currentStep === 1) {
    const name = document.getElementById('wiz-name')?.value.trim();
    const email = document.getElementById('wiz-email')?.value.trim();
    if (!name || !email) {
      showToast('âš ï¸ Please enter your name and email to get started.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('âš ï¸ Please enter a valid email address.');
      return false;
    }
  }
  return true;
}

function saveWizardStepData() {
  if (currentStep === 1) {
    onboardingData.name = document.getElementById('wiz-name').value;
    onboardingData.email = document.getElementById('wiz-email').value;
  } else if (currentStep === 2) {
    // mode card values are saved on selection, double checked here
  } else if (currentStep === 3) {
    onboardingData.attempt = document.getElementById('wiz-attempt').value;
  } else if (currentStep === 4) {
    // Save sliders progress
    const activeSubjects = getActiveSubjects(onboardingData.groupChoice);
    activeSubjects.forEach(sub => {
      const slider = document.getElementById(`progress-${sub.id}`);
      if (slider) {
        onboardingData.subjectProgress[sub.id] = parseInt(slider.value);
      }
    });
  } else if (currentStep === 5) {
    // Save chapter ratings
    const activeSubjects = getActiveSubjects(onboardingData.groupChoice);
    activeSubjects.forEach(sub => {
      sub.chapters.forEach(ch => {
        const ratingSelect = document.getElementById(`rating-${sub.id}-${ch.id}`);
        if (ratingSelect) {
          onboardingData.chapterRatings[`${sub.id}_${ch.id}`] = ratingSelect.value;
        }
      });
    });
  } else if (currentStep === 6) {
    if (onboardingData.studentMode === 'fulltime') {
      onboardingData.dailyHours = parseInt(document.getElementById('wiz-daily-hours').value);
    } else {
      onboardingData.weekdayHours = parseInt(document.getElementById('wiz-weekday-hours').value);
      onboardingData.weekendHours = parseInt(document.getElementById('wiz-weekend-hours').value);
      onboardingData.preExamLeave = parseInt(document.getElementById('wiz-pre-leave').value);
    }
  } else if (currentStep === 7) {
    onboardingData.revisionCount = parseInt(document.getElementById('wiz-rev-count').value);
    onboardingData.mockFrequency = document.getElementById('wiz-mock-freq').value;
  }
}

function selectWizardMode(mode) {
  onboardingData.studentMode = mode;
  document.querySelectorAll('.wiz-mode-card').forEach(card => {
    if (card.getAttribute('data-mode') === mode) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  const articleBlock = document.getElementById('wiz-articleship-details');
  if (mode === 'articleship') {
    articleBlock?.classList.remove('hidden');
  } else {
    articleBlock?.classList.add('hidden');
  }
}

function selectWizardGroup(group) {
  onboardingData.groupChoice = group;
  document.querySelectorAll('.wiz-group-card').forEach(card => {
    if (card.getAttribute('data-group') === group) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function selectWizardScheme(scheme) {
  onboardingData.articleScheme = scheme;
  document.querySelectorAll('.wiz-scheme-card').forEach(card => {
    if (card.getAttribute('data-scheme') === scheme) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });
}

function getActiveSubjects(group) {
  const allSub = Object.values(CA_DATA.subjects);
  if (group === 'g1') return allSub.filter(s => s.group === 1);
  if (group === 'g2') return allSub.filter(s => s.group === 2);
  return allSub; // both
}

function renderWizardStep() {
  const numSpan = document.getElementById('wizard-step-num');
  const titleDiv = document.getElementById('wizard-step-title');
  const emojiDiv = document.getElementById('wizard-step-emoji');
  const bar = document.getElementById('wizard-progress-bar');
  const body = document.getElementById('wizard-body');
  const backBtn = document.getElementById('wizard-back-btn');
  const nextBtn = document.getElementById('wizard-next-btn');

  // Progress Bar
  const pct = (currentStep / totalSteps) * 100;
  if(bar) bar.style.width = `${pct}%`;
  if(numSpan) numSpan.textContent = currentStep;

  // Back button display
  if(backBtn) backBtn.style.display = currentStep > 1 ? 'block' : 'none';
  if(nextBtn) nextBtn.textContent = currentStep === totalSteps ? 'Finish & Generate ðŸš€' : 'Continue â†’';

  let html = '';

  if (currentStep === 1) {
    titleDiv.textContent = "Welcome to CA Final Planner";
    emojiDiv.textContent = "ðŸ‘‹";
    html = `
      <p class="mb-4 text-muted text-sm">Let's craft the perfect study layout specifically suited for you. Please tell us your name and email to start your journey.</p>
      <div class="form-group">
        <label>Full Name</label>
        <input type="text" class="form-input" id="wiz-name" value="${onboardingData.name}" placeholder="e.g. Rahul Sharma" required/>
      </div>
      <div class="form-group mt-3">
        <label>Email Address</label>
        <input type="email" class="form-input" id="wiz-email" value="${onboardingData.email}" placeholder="rahul@example.com" required/>
      </div>
      <div class="mt-4 p-3 info-box border border-gold" style="border-radius: var(--radius-md); background: rgba(245, 197, 24, 0.05)">
        <p class="text-sm" style="color: var(--gold)">ðŸ”’ <strong>Privacy First:</strong> Your profile, study log, and timetables are saved locally. Cloud synchronization activates once Firebase is set up.</p>
      </div>
    `;
  } 
  else if (currentStep === 2) {
    titleDiv.textContent = "What is your student status?";
    emojiDiv.textContent = "ðŸŽ“";
    
    html = `
      <p class="mb-4 text-muted text-sm">We build entirely different schedule algorithms based on whether you are studying full-time or doing articleship.</p>
      <div class="wiz-mode-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1.5rem">
        <div class="option-card wiz-mode-card ${onboardingData.studentMode === 'fulltime' ? 'selected' : ''}" data-mode="fulltime" onclick="selectWizardMode('fulltime')" style="--option-color:#6366f1;--option-rgb:99,102,241">
          <div class="check-mark">âœ“</div>
          <div class="opt-icon" style="font-size:2.5rem;margin-bottom:0.5rem">ðŸŽ“</div>
          <div class="opt-title" style="font-weight:700">Full-Time Student</div>
          <p class="text-xs text-muted mt-2">I study 8-12 hours daily. No office responsibilities. standard attempt prep.</p>
        </div>
        <div class="option-card wiz-mode-card ${onboardingData.studentMode === 'articleship' ? 'selected' : ''}" data-mode="articleship" onclick="selectWizardMode('articleship')" style="--option-color:#f59e0b;--option-rgb:245,158,11">
          <div class="check-mark">âœ“</div>
          <div class="opt-icon" style="font-size:2.5rem;margin-bottom:0.5rem">ðŸ’¼</div>
          <div class="opt-title" style="font-weight:700">Articleship Student</div>
          <p class="text-xs text-muted mt-2">I work in an audit/tax firm. Have office hours. Can study early mornings & weekends.</p>
        </div>
      </div>

      <div id="wiz-articleship-details" class="${onboardingData.studentMode === 'articleship' ? '' : 'hidden'}">
        <div class="card p-3 mb-3 border-cyan" style="background: rgba(6,182,212,0.03)">
          <div class="card-title text-sm" style="color:var(--cyan)">ðŸ’¼ Articleship Settings</div>
          
          <div class="grid-2 mt-2">
            <div class="form-group">
              <label class="text-xs">Articleship Scheme</label>
              <div style="display:flex;gap:0.5rem;margin-top:0.25rem">
                <div class="option-card wiz-scheme-card flex-1 py-2 ${onboardingData.articleScheme === 'new' ? 'selected' : ''}" data-scheme="new" onclick="selectWizardScheme('new')" style="--option-color:#06b6d4;font-size:0.8rem">
                  2-Year IPT
                </div>
                <div class="option-card wiz-scheme-card flex-1 py-2 ${onboardingData.articleScheme === 'old' ? 'selected' : ''}" data-scheme="old" onclick="selectWizardScheme('old')" style="--option-color:#f43f5e;font-size:0.8rem">
                  3-Year Articles
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label class="text-xs">Office Days per Week</label>
              <select class="form-select mt-1" id="wiz-office-days" onchange="onboardingData.officeDays = parseInt(this.value)">
                <option value="6" ${onboardingData.officeDays === 6 ? 'selected' : ''}>6 Days (Mon - Sat)</option>
                <option value="5" ${onboardingData.officeDays === 5 ? 'selected' : ''}>5 Days (Mon - Fri)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  else if (currentStep === 3) {
    titleDiv.textContent = "Select Attempt & Exam Group";
    emojiDiv.textContent = "ðŸ“…";
    
    let attemptOptions = ATTEMPTS.map(att => `<option value="${att.id}" ${onboardingData.attempt === att.id ? 'selected' : ''}>${att.label}</option>`).join('');
    
    html = `
      <p class="mb-4 text-muted text-sm">Choose your planned attempt date and which CA Final exam group you are targeting.</p>
      
      <div class="form-group mb-4">
        <label>Target Exam Attempt</label>
        <select class="form-select mt-1" id="wiz-attempt">
          ${attemptOptions}
        </select>
      </div>

      <label class="mb-2 block">Which Exam Group?</label>
      <div class="wiz-group-grid" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:0.75rem">
        <div class="option-card wiz-group-card py-3 ${onboardingData.groupChoice === 'both' ? 'selected' : ''}" data-group="both" onclick="selectWizardGroup('both')" style="--option-color:#8b5cf6">
          <div class="opt-title text-sm" style="font-weight:700">Both Groups</div>
          <p class="text-2xs text-muted mt-1">All 6 Papers</p>
        </div>
        <div class="option-card wiz-group-card py-3 ${onboardingData.groupChoice === 'g1' ? 'selected' : ''}" data-group="g1" onclick="selectWizardGroup('g1')" style="--option-color:#6366f1">
          <div class="opt-title text-sm" style="font-weight:700">Group 1 Only</div>
          <p class="text-2xs text-muted mt-1">FR, AFM, Audit</p>
        </div>
        <div class="option-card wiz-group-card py-3 ${onboardingData.groupChoice === 'g2' ? 'selected' : ''}" data-group="g2" onclick="selectWizardGroup('g2')" style="--option-color:#10b981">
          <div class="opt-title text-sm" style="font-weight:700">Group 2 Only</div>
          <p class="text-2xs text-muted mt-1">DT, IDT, IBS</p>
        </div>
      </div>
    `;
  }
  else if (currentStep === 4) {
    titleDiv.textContent = "Syllabus Completion Status";
    emojiDiv.textContent = "ðŸ“Š";
    
    const activeSubjects = getActiveSubjects(onboardingData.groupChoice);
    let progressSliders = activeSubjects.map(sub => {
      let val = onboardingData.subjectProgress[sub.id] || 0;
      return `
        <div class="form-group mb-3 p-2 border-card" style="background:rgba(255,255,255,0.02);border-radius:var(--radius-md);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.4rem">
            <span style="font-weight:700;font-size:0.85rem">${sub.emoji} ${sub.name}</span>
            <span id="label-${sub.id}" style="font-weight:700;color:${sub.color};font-size:0.85rem">${val}% done</span>
          </div>
          <input type="range" class="form-range" id="progress-${sub.id}" min="0" max="100" step="5" value="${val}" 
            oninput="document.getElementById('label-${sub.id}').textContent = this.value + '% done'" style="accent-color:${sub.color}"/>
        </div>
      `;
    }).join('');

    html = `
      <p class="mb-3 text-muted text-sm">Estimate how much percentage of the syllabus classes or self-reading you have completed for each paper.</p>
      <div style="max-height: 280px; overflow-y: auto; padding-right: 0.5rem">
        ${progressSliders}
      </div>
    `;
  }
  else if (currentStep === 5) {
    titleDiv.textContent = "Chapter Difficulty Ratings";
    emojiDiv.textContent = "ðŸ“–";
    
    const activeSubjects = getActiveSubjects(onboardingData.groupChoice);
    
    let subjectBlocks = activeSubjects.map(sub => {
      let chapterRows = sub.chapters.map(ch => {
        let savedRating = onboardingData.chapterRatings[`${sub.id}_${ch.id}`] || 'Average';
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:0.35rem 0;border-bottom:1px solid rgba(255,255,255,0.03);">
            <div style="flex:1;padding-right:0.75rem;">
              <span class="badge ${ch.cat === 'A' ? 'badge-a' : ch.cat === 'B' ? 'badge-b' : 'badge-c'}" style="margin-right:0.3rem">${ch.cat}</span>
              <span class="text-xs" style="font-weight:500;">${ch.name}</span>
            </div>
            <select class="form-select" id="rating-${sub.id}-${ch.id}" style="padding:0.15rem 0.4rem;font-size:0.75rem;width:95px;height:auto">
              <option value="Strong" ${savedRating === 'Strong' ? 'selected' : ''}>ðŸŸ¢ Strong</option>
              <option value="Average" ${savedRating === 'Average' ? 'selected' : ''}>ðŸŸ¡ Average</option>
              <option value="Weak" ${savedRating === 'Weak' ? 'selected' : ''}>ðŸ”´ Weak</option>
            </select>
          </div>
        `;
      }).join('');

      return `
        <div class="mb-4 border-card p-3" style="background:rgba(255,255,255,0.02);border-radius:var(--radius-md);">
          <div style="font-weight:700;color:${sub.color};margin-bottom:0.5rem;border-bottom:1px solid rgba(255,255,255,0.05);padding-bottom:0.25rem">${sub.emoji} ${sub.name}</div>
          <div style="display:flex;flex-direction:column;">
            ${chapterRows}
          </div>
        </div>
      `;
    }).join('');

    html = `
      <p class="mb-3 text-muted text-sm">Rate your understanding of key chapters. This determines revision target hours! (A/B/C displays ICAI priority).</p>
      <div style="max-height: 280px; overflow-y: auto; padding-right: 0.5rem">
        ${subjectBlocks}
      </div>
    `;
  }
  else if (currentStep === 6) {
    titleDiv.textContent = "Available Study Hours";
    emojiDiv.textContent = "â±ï¸";
    
    if (onboardingData.studentMode === 'fulltime') {
      html = `
        <p class="mb-4 text-muted text-sm">How many hours can you realistically commit to studying each day?</p>
        <div class="form-group">
          <label>Daily Study Hours (Recommended: 8â€“12)</label>
          <input type="number" class="form-input mt-1" id="wiz-daily-hours" min="4" max="16" value="${onboardingData.dailyHours}"/>
        </div>
        <p class="text-xs text-muted mt-3">ðŸ’¡ <strong>Pro Strategy:</strong> Aim for consistency. 8 focused hours beats 12 distracted hours.</p>
      `;
    } else {
      html = `
        <p class="mb-4 text-muted text-sm">Set realistic hours that fit around your office schedule.</p>
        <div class="form-group mb-3">
          <label>Weekday Study Hours (Recommended: 2â€“3)</label>
          <input type="number" class="form-input mt-1" id="wiz-weekday-hours" min="1" max="6" value="${onboardingData.weekdayHours}"/>
        </div>
        <div class="form-group mb-3">
          <label>Weekend Study Hours (Recommended: 6â€“8)</label>
          <input type="number" class="form-input mt-1" id="wiz-weekend-hours" min="4" max="12" value="${onboardingData.weekendHours}"/>
        </div>
        <div class="form-group mb-3">
          <label>Pre-Exam Study Leave (Days)</label>
          <input type="number" class="form-input mt-1" id="wiz-pre-leave" min="15" max="120" value="${onboardingData.preExamLeave}"/>
        </div>
        <p class="text-2xs text-muted" style="color:var(--cyan)">ðŸ’¡ During your pre-exam study leave, the system automatically upgrades your schedule to Full-Time hours!</p>
      `;
    }
  }
  else if (currentStep === 7) {
    titleDiv.textContent = "Revision & Mock Goals";
    emojiDiv.textContent = "ðŸŽ¯";
    
    html = `
      <p class="mb-4 text-muted text-sm">Complete your layout setup by selecting revision cycles and mock exam frequency targets.</p>
      
      <div class="form-group mb-3">
        <label>Number of Revision Cycles (AIR standard is 3)</label>
        <select class="form-select mt-1" id="wiz-rev-count">
          <option value="3" ${onboardingData.revisionCount === 3 ? 'selected' : ''}>3 Revisions (Highly Recommended for AIR)</option>
          <option value="2" ${onboardingData.revisionCount === 2 ? 'selected' : ''}>2 Revisions (Realistic & Recommended)</option>
          <option value="1" ${onboardingData.revisionCount === 1 ? 'selected' : ''}>1 Revision (Last-mile speed review)</option>
        </select>
      </div>

      <div class="form-group mb-3">
        <label>Mock Exam Frequency (RTPs, MTPs, Past Papers)</label>
        <select class="form-select mt-1" id="wiz-mock-freq">
          <option value="weekly" ${onboardingData.mockFrequency === 'weekly' ? 'selected' : ''}>Every Weekend (Recommended)</option>
          <option value="biweekly" ${onboardingData.mockFrequency === 'biweekly' ? 'selected' : ''}>Bi-weekly (Every 14 days)</option>
          <option value="none" ${onboardingData.mockFrequency === 'none' ? 'selected' : ''}>Only during Pre-exam Leave</option>
        </select>
      </div>
      
      <p class="text-xs text-muted mt-3">ðŸŽ¯ Your study schedule will allocate specific slots for solving mock exams, based on this selection.</p>
    `;
  }

  body.innerHTML = html;
  
  // Step indicator dots
  const dotsContainer = document.getElementById('wizard-step-dots');
  if (dotsContainer) {
    let dotsHtml = '';
    for (let i = 1; i <= totalSteps; i++) {
      dotsHtml += `<div class="step-dot ${i === currentStep ? 'active' : ''}"></div>`;
    }
    dotsContainer.innerHTML = dotsHtml;
  }
}

// Global functions exposed to window so index.html's onclick attributes can trigger them
window.wizardNext = wizardNext;
window.wizardBack = wizardBack;
window.selectWizardMode = selectWizardMode;
window.selectWizardGroup = selectWizardGroup;
window.selectWizardScheme = selectWizardScheme;

// ============================================================
// TIMETABLE GENERATION ALGORITHM (PLANNER)
// ============================================================

function generateStudyPlanner() {
  const profile = {
    name: onboardingData.name,
    email: onboardingData.email,
    id: onboardingData.email.replace(/[^a-zA-Z0-9]/g, '_'),
    studentMode: onboardingData.studentMode,
    articleScheme: onboardingData.articleScheme,
    officeDays: onboardingData.officeDays,
    attempt: onboardingData.attempt,
    groupChoice: onboardingData.groupChoice,
    dailyHours: onboardingData.dailyHours,
    weekdayHours: onboardingData.weekdayHours,
    weekendHours: onboardingData.weekendHours,
    preExamLeave: onboardingData.preExamLeave,
    revisionCount: onboardingData.revisionCount,
    mockFrequency: onboardingData.mockFrequency,
    registeredAt: new Date().toISOString()
  };

  const selectedSubjects = getActiveSubjects(profile.groupChoice);
  const attemptObj = ATTEMPTS.find(att => att.id === profile.attempt);
  const examDate = new Date(attemptObj.date);
  const today = new Date();
  
  // Calculate total days from today to exam date
  const msDiff = examDate - today;
  let totalDays = Math.ceil(msDiff / (1000 * 60 * 60 * 24));
  if (totalDays <= 0) totalDays = 120; // Fallback to 120 days if exam is in the past/today

  // Initialize chapter revision states
  const revisionState = {};
  selectedSubjects.forEach(sub => {
    revisionState[sub.id] = {};
    sub.chapters.forEach(ch => {
      const rateKey = `${sub.id}_${ch.id}`;
      const rating = onboardingData.chapterRatings[rateKey] || 'Average';
      revisionState[sub.id][ch.id] = {
        rating: rating,
        done: onboardingData.subjectProgress[sub.id] >= 100 // Done if subject progress is marked 100%
      };
    });
  });

  // Calculate study phase timelines
  // Phase 1 (Conceptual): 55%, Phase 2 (Practice): 30%, Phase 3 (Exam Ready): 15%
  const phase1Days = Math.round(totalDays * 0.55);
  const phase2Days = Math.round(totalDays * 0.30);
  const phase3Days = totalDays - phase1Days - phase2Days;

  const timetable = [];
  let currentDateCursor = new Date(today);

  // Determine subject sequential blocks
  // To avoid boredom, we rotate 2 subjects at a time. Let's make pairings!
  const pairings = [];
  for (let i = 0; i < selectedSubjects.length; i += 2) {
    const p = [selectedSubjects[i]];
    if (selectedSubjects[i+1]) p.push(selectedSubjects[i+1]);
    pairings.push(p);
  }

  // Flattened chapters of selected subjects for Phase 1 distribution
  const chaptersToSchedule = [];
  selectedSubjects.forEach(sub => {
    const isSubjectCompleted = onboardingData.subjectProgress[sub.id] || 0;
    // Only schedule chapters that are not completed
    const chaptersPct = Math.round((isSubjectCompleted / 100) * sub.chapters.length);
    const pendingChapters = sub.chapters.slice(chaptersPct);
    
    pendingChapters.forEach(ch => {
      chaptersToSchedule.push({
        subjectId: sub.id,
        chapter: ch,
        estimatedHours: ch.hrs
      });
    });
  });

  let chapterIndex = 0;

  for (let d = 0; d < totalDays; d++) {
    const dayStr = currentDateCursor.toISOString().split('T')[0];
    const isSunday = currentDateCursor.getDay() === 0;
    const isWeekend = isSunday || (profile.officeDays === 5 && currentDateCursor.getDay() === 6);
    
    if (profile.excludeSundays && isSunday) {
      timetable.push({
        dayIndex: d + 1,
        date: dayStr,
        phase: 1,
        hoursTarget: 0,
        modeText: 'Sunday Off',
        sessions: [],
        notes: ''
      });
      currentDateCursor.setDate(currentDateCursor.getDate() + 1);
      continue;
    }

    // Determine study phase
    let currentPhase = 1;
    if (d >= phase1Days + phase2Days) currentPhase = 3;
    else if (d >= phase1Days) currentPhase = 2;

    // Check if within pre-exam study leave
    const daysRemaining = totalDays - d;
    const isLeave = profile.studentMode === 'articleship' && daysRemaining <= profile.preExamLeave;
    
    // Allocate study hours for this day
    let hoursTarget = profile.dailyHours;
    let modeText = 'Full-Time';
    
    if (profile.studentMode === 'articleship') {
      if (isLeave) {
        hoursTarget = profile.dailyHours; // Upgraded to full-time study hours
        modeText = 'Exam Study Leave ðŸš€';
      } else if (isWeekend) {
        hoursTarget = profile.weekendHours;
        modeText = 'Weekend Power Session';
      } else {
        hoursTarget = profile.weekdayHours;
        modeText = 'Articleship Weekday';
      }
    }

    // Distribute daily hours into study blocks (sessions)
    const sessions = [];
    
    if (currentPhase === 1) {
      // PHASE 1: CONCEPTUAL CLARITY
      // Distribute chapters sequentially
      let hoursAllocated = 0;
      while (hoursAllocated < hoursTarget && chapterIndex < chaptersToSchedule.length) {
        const item = chaptersToSchedule[chapterIndex];
        const remainingChapterHrs = item.estimatedHours;
        const hoursAvailable = hoursTarget - hoursAllocated;
        
        if (remainingChapterHrs <= hoursAvailable) {
          sessions.push({
            subjectId: item.subjectId,
            chapterId: item.chapter.id,
            chapterName: item.chapter.name,
            hours: remainingChapterHrs,
            type: 'concept',
            completed: false
          });
          hoursAllocated += remainingChapterHrs;
          chapterIndex++;
        } else {
          // Chapter split across days
          sessions.push({
            subjectId: item.subjectId,
            chapterId: item.chapter.id,
            chapterName: item.chapter.name,
            hours: hoursAvailable,
            type: 'concept',
            completed: false
          });
          item.estimatedHours -= hoursAvailable;
          hoursAllocated += hoursAvailable;
        }
      }
      
      // Fallback if all chapters allocated before Phase 1 ends: review/practice
      if (sessions.length === 0) {
        const sub = selectedSubjects[d % selectedSubjects.length];
        sessions.push({
          subjectId: sub.id,
          chapterId: 0,
          chapterName: 'General Subject Practice & RTPs',
          hours: hoursTarget,
          type: 'practice',
          completed: false
        });
      }
    } 
    else if (currentPhase === 2) {
      // PHASE 2: RIGOROUS PRACTICE (RTPs, MTPs, Past Papers)
      // Pick a subject based on day rotation
      const subIndex = Math.floor((d - phase1Days) / 3) % selectedSubjects.length;
      const sub = selectedSubjects[subIndex];
      
      // Schedule solving past papers or mock exams
      const isMockDay = profile.mockFrequency === 'weekly' && currentDateCursor.getDay() === 0;
      const sessionType = isMockDay ? 'mocktest' : 'practice';
      const taskLabel = isMockDay ? `Solve 3-Hour Mock Exam for ${sub.shortName}` : `Rigorous Practice: Past Papers / RTPs of ${sub.shortName}`;

      sessions.push({
        subjectId: sub.id,
        chapterId: -1,
        chapterName: taskLabel,
        hours: hoursTarget,
        type: sessionType,
        completed: false
      });
    } 
    else {
      // PHASE 3: EXAM READY
      // Fast paced revisions uing personal summary notes
      const subIndex = Math.floor((d - phase1Days - phase2Days) / 2) % selectedSubjects.length;
      const sub = selectedSubjects[subIndex];
      
      sessions.push({
        subjectId: sub.id,
        chapterId: -2,
        chapterName: `Rapid Revision & Formula Sheet Review of ${sub.shortName}`,
        hours: hoursTarget,
        type: 'revision',
        completed: false
      });
    }

    // Weekly Consolidation Day insertion (Every 7 days, take a breather/buffer session)
    if (d > 0 && d % 7 === 0) {
      sessions.forEach(s => {
        s.chapterName = `Buffer/Consolidation: ${s.chapterName}`;
        s.hours = Math.max(1, s.hours - 1);
      });
    }

    timetable.push({
      dayIndex: d + 1,
      date: dayStr,
      phase: currentPhase,
      hoursTarget: hoursTarget,
      modeText: modeText,
      sessions: sessions,
      notes: ''
    });

    currentDateCursor.setDate(currentDateCursor.getDate() + 1);
  }

  // Update app STATE
  STATE.profile = profile;
  STATE.timetable = timetable;
  STATE.revision = revisionState;
  
  // Seed initial tracker structure
  STATE.tracker = {};
  timetable.forEach(t => {
    STATE.tracker[t.date] = {
      sessions: t.sessions.map(s => ({ ...s })),
      notes: ''
    };
  });

  saveProfileState();

  // Also save email+timetable to Firestore so login can restore it
  if (FEATURES.firebaseEnabled && typeof firebase !== 'undefined' && auth && auth.currentUser) {
    // Attach current Firebase user's email to the profile
    profile.email = profile.email || auth.currentUser.email;
    saveUserToFirestore({
      ...profile,
      timetable: timetable,
      tracker:   STATE.tracker,
      revision:  revisionState,
    });
  }

  closeWizard();
  showToast('ðŸŒŸ Your personalised timetable has been generated!');
  document.getElementById('main-nav')?.classList.remove('hidden');
  navigateTo('dashboard');
}

