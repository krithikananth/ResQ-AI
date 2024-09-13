# Test Accounts for ResQ-AI

## How to Test:

1. Visit http://localhost:3001
2. Register or login with these test accounts:

### Donor Account
- **Email:** donor@test.com
- **Password:** password123
- **Role:** Donor (Restaurant/Food Provider)

### NGO Account  
- **Email:** ngo@test.com
- **Password:** password123
- **Role:** NGO/Shelter
- **Organization:** Chennai Food Bank
- **Registration Number:** CHN001
- **Capacity:** 100

### Volunteer Account
- **Email:** volunteer@test.com  
- **Password:** password123
- **Role:** Volunteer (Delivery Helper)

## Test Flow:

1. **Register as Donor** → Create a food donation
2. **Register as NGO** → View available donations and request pickup
3. **Register as Volunteer** → See pickup assignments and accept them
4. **Check data sync** → Verify donations appear in all relevant views

## Issues Fixed:
- ✅ Volunteer view now uses real donation data (not just mock data)
- ✅ Database reset and clean start
- 🔧 Testing NGO white screen issue
- 🔧 Testing donation display with proper field mapping