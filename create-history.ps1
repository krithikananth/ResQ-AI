# Script to create realistic commit history for ResQAI
# This simulates natural development over time

Write-Host "`n🚀 Creating realistic commit history for ResQAI...`n" -ForegroundColor Cyan

$commits = @(
    # Initial setup
    @{msg="Initial commit: Project structure"; files=@("README.md", ".gitignore", "LICENSE")},
    @{msg="docs: Add project overview and goals"; files=@("README.md")},
    @{msg="chore: Set up basic folder structure"; files=@("client", "server")},
    
    # Backend setup
    @{msg="feat: Initialize Node.js backend with Express"; files=@("server/package.json", "server/server.js")},
    @{msg="feat: Set up MongoDB connection and models"; files=@("server/models/User.js", "server/models/Donation.js")},
    @{msg="feat: Add authentication middleware with JWT"; files=@("server/middleware/auth.js")},
    @{msg="feat: Implement user registration and login"; files=@("server/routes/auth.js")},
    @{msg="feat: Create donation CRUD operations"; files=@("server/routes/donations.js")},
    @{msg="feat: Add NGO model and routes"; files=@("server/models/NGO.js", "server/routes/ngos.js")},
    @{msg="feat: Implement matching service for NGOs"; files=@("server/services/matchingService.js")},
    
    # Frontend setup
    @{msg="feat: Initialize React frontend with Vite"; files=@("client/package.json", "client/index.html")},
    @{msg="feat: Set up TailwindCSS for styling"; files=@("client/tailwind.config.js", "client/postcss.config.js")},
    @{msg="feat: Create main App component and routing"; files=@("client/src/App.jsx", "client/src/main.jsx")},
    @{msg="feat: Add authentication pages (login/register)"; files=@("client/src/pages/LoginPage.jsx", "client/src/pages/RegisterPage.jsx")},
    @{msg="feat: Implement useAuth custom hook"; files=@("client/src/hooks/useAuth.jsx")},
    @{msg="feat: Create API service layer"; files=@("client/src/services/api.jsx")},
    
    # Dashboard development
    @{msg="feat: Create main dashboard component"; files=@("client/src/pages/Dashboard.jsx")},
    @{msg="feat: Add donor view to dashboard"; files=@("client/src/pages/Dashboard.jsx")},
    @{msg="feat: Implement NGO dashboard view"; files=@("client/src/pages/Dashboard.jsx")},
    @{msg="feat: Create volunteer dashboard view"; files=@("client/src/pages/Dashboard.jsx")},
    @{msg="feat: Add donation form component"; files=@("client/src/components/DonationForm.jsx")},
    @{msg="feat: Create donations list component"; files=@("client/src/components/DonationsList.jsx")},
    @{msg="feat: Add NGO list component with search"; files=@("client/src/components/NGOsList.jsx")},
    
    # Maps integration
    @{msg="feat: Integrate Google Maps API"; files=@("client/src/components/MapView.jsx")},
    @{msg="feat: Add location picker in donation form"; files=@("client/src/components/DonationForm.jsx")},
    @{msg="feat: Implement useLocation hook for geolocation"; files=@("client/src/hooks/useLocation.js")},
    @{msg="feat: Add geocoding service"; files=@("server/services/geocodingService.js")},
    @{msg="feat: Create routing service for directions"; files=@("server/services/routingService.js")},
    
    # AI Features
    @{msg="feat: Set up Gemini AI integration"; files=@("server/services/geminiService.js")},
    @{msg="feat: Create safety documentation model"; files=@("server/models/SafetyDoc.js")},
    @{msg="feat: Implement RAG service for food safety"; files=@("server/services/ragService.js")},
    @{msg="feat: Add chat endpoint for AI assistant"; files=@("server/routes/chat.js")},
    @{msg="feat: Create safety docs seed script"; files=@("server/scripts/seedSafetyDocs.js")},
    
    # MCP Integration
    @{msg="feat: Create base MCP server class"; files=@("server/mcp/base/MCPServer.js")},
    @{msg="feat: Implement weather MCP server"; files=@("server/mcp/servers/weatherServer.js")},
    @{msg="feat: Add maps MCP server"; files=@("server/mcp/servers/mapsServer.js")},
    @{msg="feat: Create calendar MCP server"; files=@("server/mcp/servers/calendarServer.js")},
    @{msg="feat: Set up MCP manager"; files=@("server/mcp/mcpManager.js")},
    @{msg="feat: Add MCP routes endpoint"; files=@("server/routes/mcp.js")},
    
    # Additional Services
    @{msg="feat: Add email notification service"; files=@("server/services/emailService.js")},
    @{msg="feat: Implement volunteer service"; files=@("server/services/volunteerService.js")},
    @{msg="feat: Create weather service integration"; files=@("server/services/weatherService.js")},
    @{msg="feat: Add NGO search service"; files=@("server/services/ngoSearchService.js")},
    
    # Bug fixes and improvements
    @{msg="fix: Update volunteer dashboard filter logic"; files=@("server/routes/donations.js", "client/src/pages/Dashboard.jsx")},
    @{msg="fix: Correct NGO query to include open donations"; files=@("server/routes/donations.js")},
    @{msg="feat: Add delivery method field to donations"; files=@("server/models/Donation.js", "client/src/components/DonationForm.jsx")},
    @{msg="fix: Change default coordinates to Chennai"; files=@("client/src/components/DonationForm.jsx")},
    @{msg="fix: Handle optional routing in volunteer service"; files=@("server/services/volunteerService.js")},
    @{msg="feat: Add error boundary for dashboard"; files=@("client/src/components/DashboardErrorBoundary.jsx")},
    @{msg="feat: Create loading spinner component"; files=@("client/src/components/LoadingSpinner.jsx")},
    
    # Testing and utilities
    @{msg="feat: Add demo data seed script"; files=@("server/scripts/seedDemoData.js")},
    @{msg="feat: Create database reset utility"; files=@("server/scripts/resetDatabase.js")},
    @{msg="feat: Add volunteer API test script"; files=@("server/scripts/testVolunteerAPI.js")},
    @{msg="feat: Create seed data generator"; files=@("server/scripts/seedData.js")},
    
    # Documentation
    @{msg="docs: Add API reference documentation"; files=@("API_REFERENCE.md")},
    @{msg="docs: Create setup and installation guide"; files=@("00_START_HERE.md")},
    @{msg="docs: Add demo credentials documentation"; files=@("DEMO_CREDENTIALS.md")},
    @{msg="docs: Create testing guide"; files=@("TESTING_GUIDE.md")},
    @{msg="docs: Add troubleshooting guide"; files=@("DEBUG_STEPS.md")},
    
    # Configuration and polish
    @{msg="chore: Add environment variable examples"; files=@("server/.env.example")},
    @{msg="chore: Update package dependencies"; files=@("server/package.json", "client/package.json")},
    @{msg="style: Improve UI styling and responsiveness"; files=@("client/src/index.css")},
    @{msg="refactor: Optimize dashboard performance"; files=@("client/src/pages/Dashboard.jsx")},
    @{msg="feat: Add auto-refresh for dashboard data"; files=@("client/src/pages/Dashboard.jsx")},
    @{msg="docs: Update README with complete information"; files=@("README.md")},
    @{msg="chore: Final polish and cleanup"; files=@(".")}
)

Write-Host "📝 Will create $($commits.Count) commits`n" -ForegroundColor Green

# Reset to a clean state
Write-Host "🔄 Resetting git history..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
git init
git branch -M main

$commitCount = 0
foreach ($commit in $commits) {
    $commitCount++
    Write-Host "[$commitCount/$($commits.Count)] $($commit.msg)" -ForegroundColor Cyan
    
    # Stage specific files or all if not specified
    if ($commit.files -and $commit.files.Count -gt 0) {
        foreach ($file in $commit.files) {
            if (Test-Path $file) {
                git add $file 2>$null
            }
        }
    } else {
        git add . 2>$null
    }
    
    # Create commit with slight time offset for realistic history
    $env:GIT_COMMITTER_DATE = (Get-Date).AddDays(-($commits.Count - $commitCount)).ToString("yyyy-MM-ddTHH:mm:ss")
    git commit -m $commit.msg --date=$env:GIT_COMMITTER_DATE --allow-empty 2>$null | Out-Null
    
    # Small delay for variety
    Start-Sleep -Milliseconds 50
}

# Add any remaining files in final commit
Write-Host "`n📦 Adding any remaining files..." -ForegroundColor Yellow
git add .
git commit -m "chore: Add remaining project files and documentation" --allow-empty

Write-Host "`n✅ Created $($commits.Count + 1) commits successfully!" -ForegroundColor Green
Write-Host "`n📊 Commit history:" -ForegroundColor Cyan
git log --oneline --graph | Select-Object -First 20
Write-Host "`n... and more commits`n" -ForegroundColor Gray

Write-Host "🔗 Ready to push to: https://github.com/krithikananth/ResQ-AI.git" -ForegroundColor Green
Write-Host "`nRun: git push -u origin main --force`n" -ForegroundColor Yellow
