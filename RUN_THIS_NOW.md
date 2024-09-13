# ⚡ QUICK START - Run These Commands Now

## 🎯 Goal
Fix volunteer dashboard showing 0 pickups

---

## ✅ Run These Commands (Copy-Paste)

### 1️⃣ Test if database has data
```powershell
cd "c:\Users\Krithik Ananth\Desktop\projects\ResQ-AI"
.\test-volunteer.ps1
```

---

### 2️⃣ If test shows "0 donations", reseed database:
```powershell
cd server
npm run seed-demo
```

---

### 3️⃣ Restart backend (stop with Ctrl+C first)
```powershell
cd server
npm run dev
```

**Keep this terminal open!** Watch for logs when you login.

---

### 4️⃣ Restart frontend in NEW terminal
```powershell
cd "c:\Users\Krithik Ananth\Desktop\projects\ResQ-AI\client"
npm run dev
```

---

### 5️⃣ Clear browser cache
1. Open browser
2. Press `Ctrl + Shift + Delete`
3. Select "Cached images and files"
4. Click "Clear data"

---

### 6️⃣ Test volunteer login
1. Go to http://localhost:5173
2. Login with:
   - Email: `volunteer@test.com`
   - Password: `test123`
3. Click "Volunteer" tab
4. Press `F12` → Console tab
5. Look for: **"✅ Available for pickup: 15"**

---

## 🎉 Success = You see donation cards on screen!

## ❌ Still broken? 
Check **DEBUG_STEPS.md** or **VOLUNTEER_DASHBOARD_FIX.md** for detailed troubleshooting.

---

## 📋 What Changed?

✅ Volunteers now see ALL open donations (not just assigned ones)
✅ Added delivery method field to donations
✅ Fixed default location from Delhi to Chennai
✅ Added detailed logging for debugging
✅ Enhanced error handling

All changes are already applied to the code - you just need to restart!
