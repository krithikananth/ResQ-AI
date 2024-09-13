# 🐛 Debug: Volunteer Dashboard Showing Zero Donations

## Issue
Volunteer dashboard shows "0" for all counts even though donations exist in the database.

## Root Cause Analysis

The volunteer dashboard is correctly filtering donations, but it's not receiving any from the backend API. This could be because:

1. **Backend query filter is correct** ✅ (already fixed)
2. **Frontend is correct** ✅ (already fixed)
3. **But donations might not be in database** ⚠️

---

## Step-by-Step Debug Process

### Step 1: Check Backend Logs

Open the **Backend Terminal** (where `npm run dev` is running in server folder) and look for these lines:

```
🔍 Donations query filter: {...} Role: volunteer
✅ Found X donations for role: volunteer
```

**If you see `Found 0 donations`**, the database doesn't have any donations OR the backend isn't running the updated code.

**If you see `Found 5+ donations`**, the backend is working - issue is in frontend.

---

### Step 2: Check Frontend Console Logs

1. Open browser (where localhost:3000 is open)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Login as volunteer: `volunteer1@gmail.com` / `password123`

Look for these console messages:
```
Loading donations API call...
Donations API response: {donations: Array(X)}
🔄 Loading pickup requests for volunteer...
Total donations received: X
✅ Available for pickup: X
```

**What to check:**
- `Total donations received:` should be **> 0** (if 0, backend not returning data)
- `Available for pickup:` should match or be close to total received

---

### Step 3: Manually Test Backend API

Open a **new terminal** and run this curl command:

```powershell
# First, get an auth token by logging in
curl -X POST http://localhost:5001/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"volunteer1@gmail.com\",\"password\":\"password123\"}'
```

**Copy the token from response** (looks like: `"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`)

Then test donations API:

```powershell
# Replace YOUR_TOKEN with the actual token
curl -X GET "http://localhost:5001/api/donations" `
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "donations": [
    {
      "_id": "...",
      "foodType": "cooked",
      "status": "open",
      ...
    }
  ],
  "pagination": {...}
}
```

**If donations array is empty `[]`**, the database has no donations.

---

## Solutions Based on Debug Results

### Solution A: Database is Empty

**Run seed script again:**

```powershell
cd "c:\Users\Krithik Ananth\Desktop\projects\ResQ-AI\server"
npm run seed-demo
```

**Expected output:**
```
✅ Created 3 donors
✅ Created 5 NGOs
✅ Created 3 volunteers
✅ Created 15 donations
🎉 Demo Data Seeded Successfully!
```

Then **restart both servers**:
- Backend: Ctrl+C → `npm run dev`
- Frontend: Ctrl+C → `npm run dev`

---

### Solution B: Backend Not Running Updated Code

**Restart backend server:**

```powershell
cd "c:\Users\Krithik Ananth\Desktop\projects\ResQ-AI\server"
# Press Ctrl+C to stop
npm run dev
```

**Look for startup messages** - should NOT show any errors about:
- `Cannot find module`
- `SyntaxError`
- `Import errors`

---

### Solution C: Frontend Cache Issue

**Clear browser cache:**

1. Press `Ctrl + Shift + Delete`
2. Select:
   - ✅ Cookies and site data
   - ✅ Cached images and files
3. Time range: **Last hour**
4. Click "Clear data"
5. Close browser completely
6. Reopen and go to http://localhost:3000

---

### Solution D: MongoDB Connection Issue

**Check backend terminal for:**

```
✅ Connected to MongoDB
✅ Database: resqai
```

**If you see connection errors:**

```powershell
# The seed script uses local MongoDB
# Make sure MongoDB is running locally OR
# Update server/.env to use correct MongoDB URI
```

---

## Quick Test Commands

### Test 1: Check if MongoDB has data

```powershell
# Install MongoDB Compass or use mongosh CLI
mongosh "mongodb://localhost:27017/resqai"

# Then run:
db.donations.find({}).count()
# Should return: 15

db.donations.find({status: "open"}).count()
# Should return: 11 or more
```

### Test 2: Check backend is serving donations

```powershell
# Open in browser (while logged in as volunteer)
http://localhost:5001/api/donations

# OR use PowerShell:
Invoke-WebRequest -Uri "http://localhost:5001/api/donations" -Method GET -Headers @{"Authorization"="Bearer YOUR_TOKEN"}
```

---

## Expected Correct Behavior

**When everything is working:**

1. **Backend logs:**
   ```
   🔍 Donations query filter: {"$or":[{"status":"open"},{"status":"matched","volunteerId":"..."}...]} Role: volunteer
   ✅ Found 11 donations for role: volunteer
   ```

2. **Frontend console:**
   ```
   Loading donations API call...
   Donations API response: {donations: Array(11), pagination: {...}}
   🔄 Loading pickup requests for volunteer...
   Total donations received: 11
   ✅ Available for pickup: 11
   ```

3. **Browser UI:**
   - "Available Pickups: **11**" (not 0)
   - List of donations below showing food items

---

## If Still Not Working After All Steps

**Run this complete reset:**

```powershell
# Stop both servers (Ctrl+C in both terminals)

# Terminal 1 - Reset backend
cd "c:\Users\Krithik Ananth\Desktop\projects\ResQ-AI\server"
npm run seed-demo
npm run dev

# Terminal 2 - Reset frontend  
cd "c:\Users\Krithik Ananth\Desktop\projects\ResQ-AI\client"
# Delete node_modules/.vite cache
Remove-Item -Recurse -Force node_modules/.vite
npm run dev

# Terminal 3 - Clear browser
# Close all browser tabs
# Clear browser cache completely
# Reopen http://localhost:3000
```

---

## Need More Help?

**Provide these details:**

1. **Backend terminal output** (copy last 20 lines)
2. **Frontend console log** (F12 → Console tab, copy all messages)
3. **Result of:** `npm run seed-demo` (did it succeed?)
4. **MongoDB connection** (local or Atlas?)

---

**Status Check:**
- [ ] Backend logs show "Found X donations" where X > 0
- [ ] Frontend console shows "Total donations received: X" where X > 0  
- [ ] Seed script ran successfully (15 donations created)
- [ ] Both servers restarted after code changes
- [ ] Browser cache cleared
