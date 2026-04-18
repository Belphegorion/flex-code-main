# Browser Refresh Profile Routing Bug - Deep Analysis & Fix

## Executive Summary
Users are incorrectly redirected to "Complete Your Profile" on browser refresh due to **redundant & failed API calls** during authentication hydration. The bug exists in multiple locations with defensive fallbacks that default profile completion status to `false` when they should trust the backend response.

---

## Root Cause Analysis

### Issue #1: Redundant API Calls
**Location:** `src/pages/ProfileSetup.jsx` and `frontend/src/pages/ProfileSetup.jsx`

```javascript
// ❌ WRONG - Makes ANOTHER API call despite user already loaded
const checkProfileStatus = async () => {
  const res = await api.get('/profile-setup/status');  // Redundant!
  if (res.profileCompleted) {
    navigate(getDashboardRoute());
  }
};
```

**Problem:**
- Already has `user.profileCompleted` from AuthContext
- Makes additional API call that might fail or return stale data
- Doesn't use the user state already provided by context

### Issue #2: Defensive Fallback Trap
**Location:** `frontend/src/context/AuthContext.jsx` Line 40-51

```javascript
const loadUser = async () => {
  try {
    const userData = await authService.getProfile();
    let userWithProfile = { ...userData.user };  // Has profileCompleted ✓
    
    try {
      const profileStatus = await authService.getProfileStatus();
      userWithProfile.profileCompleted = profileStatus.profileCompleted;  // Overwrites!
    } catch (profileError) {
      // ❌ TRAP: Defaults to false if second call fails!
      if (userWithProfile.profileCompleted === undefined) {
        console.warn("Could not fetch profile status, assuming incomplete for safety");
        userWithProfile.profileCompleted = false;  // BUG!
      }
    }
    setUser(userWithProfile);
  } catch (error) {
    logout();
  }
};
```

**Why This Fails:**
1. `getProfile()` returns user with valid `profileCompleted` value ✓
2. But then it tries to call `getProfileStatus()` to "double-check"
3. If this second call fails (network issue, token expired, server error), the catch block runs
4. **Even though profileCompleted was already true**, the defensive code might override it

### Issue #3: Timing/Race Condition
**Location:** `src/pages/ProfileSetup.jsx` and `frontend/src/pages/ProfileSetup.jsx`

```javascript
export default function ProfileSetup() {
  const { user, updateUser } = useAuth();  // Might not be loaded yet!
  
  useEffect(() => {
    checkProfileStatus();  // Calls API before ensuring user is loaded
  }, []);
  
  // ...later...
  const getDashboardRoute = () => {
    if (user?.role === 'worker') return '/worker';  // Can be null!
    // ...
  };
}
```

**Problem:**
- `user` might be `null` when ProfileSetup mounts (still loading)
- Page makes API call before checking if user is loaded
- Creates race condition between user loading and route decision

### Issue #4: Path Splitting
There are **2 separate frontend codebases**:
- `src/` (root) - Used by main vite.config.js
- `frontend/` (docker) - Used by docker build

Both have authentication issues but at different severities.

---

## Authentication Flow on Browser Refresh

### Current (Broken) Flow:
```
1. Browser refresh (F5)
2. App initializes
3. AuthProvider useEffect runs
4. loadUser() called
5. GET /api/auth/profile
   ├─ Response: { user: { ..., profileCompleted: true, ... }, ... }
   └─ ✓ Correct data from backend
6. AuthContext stores user
7. Meanwhile, route guard checks user...
8. But ProfileSetup page ALSO makes its own check:
   GET /api/profile-setup/status
   ├─ If fails → defaults profileCompleted to FALSE
   └─ ❌ User redirected to setup even though already complete!
```

### Expected (Correct) Flow:
```
1. Browser refresh (F5)
2. App initializes
3. AuthProvider useEffect runs
4. loadUser() called
5. GET /api/auth/profile
   ├─ Response: { user: { ..., profileCompleted: true, ... }, ... }
   └─ ✓ Correct data from backend
6. AuthContext stores user (profileCompleted: true)
7. ProtectedRoute checks user.profileCompleted
8. If true → renders protected page
9. If false → redirects to /profile-setup
✓ Single source of truth: backend response
```

---

## Backend Response Structure - CORRECT ✓

### Login endpoint (`/api/auth/login`) - Line 89:
```javascript
res.json({
  message: 'Login successful',
  user: { 
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    kycStatus: user.kycStatus,
    badges: user.badges,
    ratingAvg: user.ratingAvg,
    profileCompleted: user.profileCompleted,  // ✓ Included
    profilePhoto: user.profilePhoto,
    badge
  },
  accessToken: access.token,
  refreshToken: refresh.token
});
```

### Profile endpoint (`/api/auth/profile`) - Line 143:
```javascript
res.json({ 
  user: { 
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    kycStatus: user.kycStatus,
    badges: user.badges,
    ratingAvg: user.ratingAvg,
    profileCompleted: user.profileCompleted,  // ✓ Included
    profilePhoto: user.profilePhoto,
    badge 
  } 
});
```

✅ **Backend is correct** - includes profileCompleted in all auth responses

---

## Frontend Issues

### ❌ Check `src/context/AuthContext.jsx`:
- ✓ Simple and correct
- Trusts backend response

### ❌ Check `frontend/src/context/AuthContext.jsx`:
- Makes redundant call to getProfileStatus()
- Has defensive fallback that could set to false
- Potential for conflicting data sources

### ❌ Check `src/pages/ProfileSetup.jsx`:
- Makes redundant call to /profile-setup/status
- Doesn't use user.profileCompleted from context
- Returns stale data if API fails

### ❌ Check `frontend/src/pages/ProfileSetup.jsx`:
- Same issues as src version

### ✓ ProtectedRoute:
- Correctly checks `requireProfileComplete && !user.profileCompleted`
- Default `requireProfileComplete={true}` is correct

---

## The Fix Applied & Remaining Work

### ✅ Already Fixed:
1. Added `profileCompleted` field to User schema (backend/src/models/User.js)
2. Updated LoginForm in both `src/` and `frontend/src/` to use login response value

### 🔧 Still Need to Fix:
1. **Remove redundant API call** from `src/pages/ProfileSetup.jsx`
2. **Simplify AuthContext** in `frontend/src/context/AuthContext.jsx`
3. **Remove redundant API call** from `frontend/src/pages/ProfileSetup.jsx`
4. **Add loading check** before accessing user.role in ProfileSetup
5. **Update ProfileSetup** to trust AuthContext over additional API calls
6. **Add debug logging** to track profile completion status

---

## API Endpoints Reference

| Endpoint | Purpose | Returns | Used By |
|----------|---------|---------|---------|
| `POST /auth/register` | User registration | `{ user, accessToken, refreshToken }` | SignupForm |
| `POST /auth/login` | User login | `{ user, accessToken, refreshToken }` | LoginForm |
| `GET /auth/profile` | Load user on app init | `{ user }` | AuthContext.loadUser() |
| `GET /profile-setup/status` | Check profile completion | `{ profileCompleted, role, hasProfile }` | ❌ REDUNDANT - Don't use |
| `POST /profile-setup/worker` | Complete worker profile | `{ message, profile }` | WorkerProfileSetup |
| `POST /profile-setup/organizer` | Complete organizer profile | `{ message }` | OrganizerProfileSetup |
| `POST /profile-setup/sponsor` | Complete sponsor profile | `{ message, sponsor }` | SponsorProfileSetup |

---

## Files to Modify

1. ✅ `backend/src/models/User.js` - FIXED
2. ✅ `src/components/auth/LoginForm.jsx` - FIXED
3. ✅ `frontend/src/components/auth/LoginForm.jsx` - FIXED
4. 🔧 `src/pages/ProfileSetup.jsx` - NEEDS FIX
5. 🔧 `frontend/src/pages/ProfileSetup.jsx` - NEEDS FIX
6. 🔧 `frontend/src/context/AuthContext.jsx` - NEEDS FIX

---

## Implementation Details

### Missing Schema Field Fix (✅ Done)
The `profileCompleted` field was missing from User schema definition, but now it's added:
```javascript
profileCompleted: { type: Boolean, default: false },
kycStatus: { type: String, enum: ['pending', 'approved', 'rejected', 'not_started'], default: 'not_started' },
```

### Login Response Fix (✅ Done)
Both LoginForm versions now use `data.user.profileCompleted` from login response instead of making redundant API calls.

### ProfileSetup Fix (🔧 Pending)
Should:
1. Check if user is loaded (not null)
2. Use `user.profileCompleted` from context
3. If true, navigate to dashboard immediately
4. If false show setup forms
5. Remove API call to /profile-setup/status

### AuthContext Fix for frontend (🔧 Pending)
Should:
1. Only call getProfile()
2. Trust the response entirely
3. Don't make secondary calls to getProfileStatus()
4. Remove defensive fallback

---

## Testing Plan

### Test Case 1: New User
1. Register new account
2. Redirect to /profile-setup ✓
3. Complete profile
4. Redirect to dashboard ✓

### Test Case 2: Existing User - Refresh
1. Login → Dashboard ✓
2. Browser refresh (F5) → **Should stay on dashboard (NOT redirect to setup)**
3. Check localStorage has tokens ✓
4. Check AuthContext loads user correctly ✓

### Test Case 3: Returning User - New Tab
1. Login in tab 1 → Dashboard ✓
2. Open new tab 3
3. Tab 3 → App initializes → AuthContext loads user ✓
4. Should go to dashboard (NOT setup) ✓

### Test Case 4: Token Expiry
1. Login → Dashboard ✓
2. Wait for access token to expire
3. Make API call → Should refresh token ✓
4. App should still work ✓

---

## Verification Checklist

After applying all fixes, verify:

- [ ] `profileCompleted` field exists in User schema with default `false`
- [ ] Login endpoint returns `profileCompleted` in user object
- [ ] Profile endpoint returns `profileCompleted` in user object
- [ ] Both AuthContext implementations use only `/auth/profile` endpoint
- [ ] LoginForm uses login response value for routing
- [ ] ProfileSetup uses `user.profileCompleted` from context
- [ ] ProfileSetup has loading check before accessing user.role
- [ ] ProfileSetup doesn't make redundant API calls
- [ ] ProtectedRoute correctly blocks access when profileCompleted is false
- [ ] No console warnings about profile status
- [ ] Browser refresh doesn't redirect to setup (for complete profiles)

---

## Performance Impact

**Before Fix:**
- On app load: 2+ API calls (getProfile + getProfileStatus)
- Potential timeout/error on secondary call
- Unnecessary network traffic

**After Fix:**
- On app load: 1 API call (getProfile)
- Faster app initialization
- No timeout scenarios
- Simpler error handling

---

Generated: April 18, 2026
