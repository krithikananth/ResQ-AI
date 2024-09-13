# 🔍 Debug Steps: Volunteer Dashboard Showing 0 Pickups

## Current Problem
Volunteer dashboard shows "0" pickups even though donations exist in the database.

## Root Cause Analysis
The issue is likely one of these:
1. **Backend not returning data** - Filter query issue
2. **Frontend not loading data** - Tab switching issue  
3. **Database empty** - Need to reseed
4. **Servers not restarted** - Changes not applied

---

## 🚀 Step-by-Step Fix

### Step 1: Stop ALL Running Servers
```powershell
# Press Ctrl+C in BOTH terminal windows to stop:
# - Frontend (client) server
# - Backend (server) server
```

### Step 2: Reseed the Database with Fresh Data
```powershell
cd server
npm run seed-demo
```

**Expected Output:**
```
✅ Connected to MongoDB
🌱 Seeding database...
✅ Created 3 users (donor, ngo, volunteer)
✅ Created 15 donations with Chennai coordinates
✅ Database seeded successfully!
```

**If you see connection errors:**
- Make sure MongoDB is running locally
- OR update `server/.env` with your MongoDB Atlas connection string

### Step 3: Restart Backend with Logging
```powershell
cd server
npm run dev
```

**Watch for these logs when you login as volunteer:**
```
🔍 Donations query filter: { '$or': [...] } Role: volunteer
✅ Found 15 donations for role: volunteer
```

**If you see "Found 0 donations"**, the backend filter is broken.

### Step 4: Restart Frontend
Open a NEW terminal window:
```powershell
cd client
npm run dev
```

### Step 5: Clear Browser Cache
1. Open your browser
2. Press `Ctrl + Shift + Delete`
3. Select "Cached images and files"
4. Click "Clear data"
5. Refresh the page (F5)

### Step 6: Test with Volunteer Account
1. Login with volunteer credentials:
   - Email: `volunteer@test.com`
   - Password: `test123`

2. Switch to **"Volunteer"** tab in the dashboard

3. Open Browser Console (Press F12 → Console tab)

4. Look for these logs:
   ```
   🔄 Loading pickup requests for volunteer...
   Total donations received: 15
   ✅ Available for pickup: 15
   ```

### Step 7: Check Backend API Directly
Open a NEW terminal and test the API:

```powershell
# First, get the auth token by logging in
$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    email = "volunteer@test.com"
    password = "test123"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Headers $headers -Body $body
$token = $loginResponse.token

# Now fetch donations with the token
$authHeaders = @{
    "Authorization" = "Bearer $token"
}
$donationsResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/donations" -Method GET -Headers $authHeaders

Write-Host "Total donations returned: $($donationsResponse.donations.Count)"
Write-Host "First donation status: $($donationsResponse.donations[0].status)"
```

**Expected Output:**
```
Total donations returned: 15
First donation status: open
```

---

## 🎯 What Each Step Tests

| Step | Tests | If It Fails |
|------|-------|-------------|
| 1-2 | Database has data | Reseed didn't work - check MongoDB connection |
| 3 | Backend filter works | Check `server/routes/donations.js` line 90-145 |
| 4-5 | Frontend loads fresh | Browser cache issue |
| 6 | Tab switching works | Check Dashboard.jsx useEffect dependencies |
| 7 | API returns data | Backend filter or auth issue |

---

## 🐛 Common Issues & Fixes

### Issue: "Cannot connect to MongoDB"
**Fix:**
```powershell
# Option 1: Use MongoDB Atlas (cloud)
# Update server/.env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resqai

# Option 2: Install MongoDB locally
# Download from: https://www.mongodb.com/try/download/community
```

### Issue: Backend logs show "Found 0 donations"
**Fix:**
The backend filter is not working. Check that `server/routes/donations.js` has:
```javascript
const queryFilter = {
  $or: [
    { status: 'open' },
    { status: 'matched', volunteerId: userId },
    { status: 'picked_up', volunteerId: userId }
  ]
};
```

### Issue: Frontend logs show "Total donations received: 0"
**Fix:**
The frontend is not receiving data from backend. Check:
1. Is backend running? (port 5000)
2. Is CORS configured? (check `server/index.js`)
3. Is auth token valid? (check browser Network tab → API calls)

### Issue: Frontend logs show "Available for pickup: 0" but donations > 0
**Fix:**
All donations have status other than 'open', 'matched', or 'picked_up'.
Reseed the database with `npm run seed-demo`.

---

## ✅ Success Criteria

You'll know it's working when you see:

1. **Backend Terminal:**
   ```
   ✅ Found 15 donations for role: volunteer
   ```

2. **Browser Console:**
   ```
   Total donations received: 15
   ✅ Available for pickup: 15
   ```

3. **Volunteer Dashboard UI:**
   - Shows list of donation cards
   - Each card has "Accept Pickup" button
   - Map shows pickup locations

---

## 📝 Still Not Working?

Run this complete diagnostic:

```powershell
# Check if backend is running
curl http://localhost:5000/api/health

# Check if MongoDB has data
cd server
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/resqai').then(() => mongoose.connection.db.collection('donations').countDocuments()).then(count => console.log('Donations in DB:', count)).then(() => process.exit())"

# Check if frontend is running
curl http://localhost:5173
```

Copy the output and share it - I'll help debug further!
