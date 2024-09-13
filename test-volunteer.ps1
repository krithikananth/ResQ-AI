# Quick test script for volunteer dashboard issue
# Run: .\test-volunteer.ps1

Write-Host "`n🔍 ResQAI Volunteer Dashboard Debug Script`n" -ForegroundColor Cyan

# Step 1: Test database connection
Write-Host "Step 1: Testing database..." -ForegroundColor Yellow
cd server
node scripts/testVolunteerAPI.js

Write-Host "`n" -ForegroundColor Gray
Write-Host "============================================" -ForegroundColor Gray
Write-Host "  NEXT STEPS" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Gray
Write-Host ""
Write-Host "If you saw 'Total donations found: 0':" -ForegroundColor Yellow
Write-Host "  1. Run: cd server" -ForegroundColor White
Write-Host "  2. Run: npm run seed-demo" -ForegroundColor White
Write-Host "  3. Run this test again" -ForegroundColor White
Write-Host ""
Write-Host "If you saw 'Total donations found: 15' (or more):" -ForegroundColor Green
Write-Host "  1. Restart backend: cd server && npm run dev" -ForegroundColor White
Write-Host "  2. Restart frontend: cd client && npm run dev" -ForegroundColor White
Write-Host "  3. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "  4. Login as volunteer@test.com / test123" -ForegroundColor White
Write-Host "  5. Open browser console (F12) and check logs" -ForegroundColor White
Write-Host ""
Write-Host "Full debugging guide: See DEBUG_STEPS.md" -ForegroundColor Cyan
Write-Host ""
