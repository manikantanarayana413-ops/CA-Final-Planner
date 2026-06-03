# Testing Guide - CA Final Planner Sign-In Fix

## Current State After Fixes
✅ **Loader hides automatically after 1.2 seconds** - Added back to core.js  
✅ **Landing page should show** - Routing set to 'landing' by default  
✅ **Auth listener attached** - auth.js runs setupAuthInit() on DOMContentLoaded  
✅ **Profile persistence** - Firebase auth saves to localStorage  
✅ **Auto-navigation** - If profile exists, redirects to dashboard after 100ms  

## Expected Behavior

### 1. First-time Visitor (No Login)
- Loader hides after 1.2s
- Landing page shows with hero section
- "Sign in with Google" button works
- "Start Planning Now" starts onboarding wizard
- Navigation hidden (no profile yet)

### 2. Returning User (Already Logged In)
- Loader hides after 1.2s
- Firebase auth detects existing login
- Profile loaded from localStorage
- Navigation appears
- Auto-redirects to dashboard after 100ms

### 3. New User After Google Sign-In
- Click "Sign in with Google"
- Firebase auth completes
- Profile saved to localStorage
- Navigation appears
- Onboarding wizard starts (profileCompleted: false)

### 4. Logout
- Click "Logout" (if implemented) or clear cookies
- Profile cleared from localStorage
- Navigation hidden
- Landing page shown

## Common Issues to Check

### If Loader Stays Visible:
- Check browser console for errors
- Verify core.js loaded (should see "CORE.JS INIT" and "✅ Core.js initialized")
- Check that setTimeout for loader runs (after 1.2s)

### If Landing Page Not Showing:
- Verify `navigateTo('landing')` called in setupRouting
- Check STATE.profile is null/false
- Verify no Firebase auth interfering

### If Navigation Not Appearing After Login:
- Check auth.js logs ("Processing login for:", "Loaded profile:")
- Verify STATE.profile set correctly
- Check localStorage has 'ca_final_profile' key
- Verify document.getElementById("main-nav").classList.remove("hidden")

## Browser Console Logs to Expect

```
=== CORE.JS INIT ===
✅ Google Auth listener attached (from auth.js)
✅ Core.js initialized
📍 Navigating to: landing Profile exists: false
```

**After Google Sign-in:**
```
📱 Processing login for: user@example.com
📋 Loaded profile: exists
✅ Returning user - loading dashboard
📍 Navigating to: dashboard Profile exists: true
```

## Files Modified

1. **js/core.js** - v9
   - Added loader hiding mechanism
   - Added auto-redirect to dashboard if profile exists
   - Better routing logic for initial load

2. **js/auth.js** - v9
   - Proper DOMContentLoaded listener
   - Profile persistence to localStorage
   - Enhanced logging

3. **index.html** - v8
   - Removed duplicate init code
   - Cleaner script loading order

## Quick Fix Commands
```bash
# Check file versions
git diff js/core.js
git diff js/auth.js
git diff index.html

# Reset if needed
git checkout HEAD -- js/core.js
git checkout HEAD -- js/auth.js
git checkout HEAD -- index.html
```

## Next Steps if Issues Persist
1. Open browser Developer Tools (F12)
2. Check Console tab for errors
3. Check Application > Local Storage for profile data
4. Verify network requests for Firebase/auth scripts
