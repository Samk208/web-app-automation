
# Deploy Wonlink HWP Worker (Local/Production Mode)

$ErrorActionPreference = "Stop"

# 1. Check Env Vars
if (-not (Test-Path ".env.local")) {
    Write-Error "❌ .env.local not found. Please create it first."
}

Write-Host "🚀 Deploying Worker..."
$item = Get-Content ".env.local" | Select-String "NEXT_PUBLIC_SUPABASE_URL"
Write-Host "   Env: $item"

# 2. Kill existing (simple check, might need PID file in real prod)
# Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like "*worker-loop*"} | Stop-Process

# 3. Start Background Job
$logFile = "worker-output.log"
Write-Host "   Starting worker loop in background. Logs: $logFile"

# Powershell 'Start-Job' or 'Start-Process'
# We use Start-Process to keep it independent of this shell session
Start-Process -FilePath "node" -ArgumentList "scripts/wonlink-hwp-worker-loop.js" -RedirectStandardOutput $logFile -RedirectStandardError $logFile -WindowStyle Hidden

Write-Host "✅ Worker Deployed! Check $logFile for activity."
