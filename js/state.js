// ============================================================
// CA FINAL PLANNER — CORE APPLICATION STATE
// ============================================================

// Global application state
let STATE = {
  profile: null,        // Student profile details
  timetable: [],        // Generated day-by-day timetable
  tracker: {},          // Daily logs, structure: { 'YYYY-MM-DD': { sessions: [], notes: '' } }
  revision: {},         // Chapter revision states, structure: { subjectId: { chapterId: { rating: 'Weak'|'Average'|'Strong', done: false } } }
  mocks: [],
  friends: [],
  currentDate: new Date().toISOString().split('T')[0], // Selected tracker date
  activeSection: 'landing',
  calCurrentMonth: new Date(),
  calViewMode: 'calendar', // 'calendar' or 'list'
  streak: 0,
  bestStreak: 0,
  selectedFbStars: 0,
  timetableEditMode: false,  // Whether calendar is in edit/drag mode
  pomo: {
    timer: null,
    mode: 'focus', // 'focus', 'short', 'long'
    timeLeft: 25 * 60,
    isRunning: false,
    completedToday: 0
  }
};

// Available attempts from CA_DATA
const ATTEMPTS = CA_DATA.examAttempts;

// LocalStorage Keys
const KEYS = {
  profile:   'ca_final_profile',
  timetable: 'ca_final_timetable',
  tracker:   'ca_final_tracker',
  revision:  'ca_final_revision',
  mocks:     'ca_final_mocks',
  friends:   'ca_final_friends',
  pomoCount: 'ca_final_pomo_count',
  pomoDate:  'ca_final_pomo_date'
};
