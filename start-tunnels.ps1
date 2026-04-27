
# ============================================================
# ARVR Store - Start Both Cloudflare Tunnels
# Run this from the project root:
#   .\start-tunnels.ps1
# ============================================================

$root = $PSScriptRoot

Write-Host ""
Write-Host "=== ARVR Store Tunnel Launcher ===" -ForegroundColor Cyan
Write-Host ""

# --- 1. Start the Express backend (server) ---
Write-Host "[1/4] Starting Express backend on port 5000..." -ForegroundColor Yellow
$serverJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\server'; npm start" -PassThru

Start-Sleep -Seconds 3   # give Node a moment to boot

# --- 2. Start the Vite frontend (client) ---
Write-Host "[2/4] Starting Vite dev server on port 5173..." -ForegroundColor Yellow
$clientJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\client'; npm run dev" -PassThru

Start-Sleep -Seconds 4   # give Vite a moment to boot

# --- 3. Start Cloudflare tunnel for the backend API ---
Write-Host "[3/4] Opening Cloudflare tunnel for backend (port 5000)..." -ForegroundColor Green
$apiTunnel = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel --url http://localhost:5000" -PassThru

Start-Sleep -Seconds 3

# --- 4. Start Cloudflare tunnel for the frontend UI ---
Write-Host "[4/4] Opening Cloudflare tunnel for frontend (port 5173)..." -ForegroundColor Green
$uiTunnel = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cloudflared tunnel --url http://localhost:5173" -PassThru

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " All 4 windows launched!" -ForegroundColor Green
Write-Host ""
Write-Host " Look for lines like these in the tunnel windows:" -ForegroundColor White
Write-Host "   API  tunnel → https://xxxx.trycloudflare.com  (backend)" -ForegroundColor Magenta
Write-Host "   UI   tunnel → https://yyyy.trycloudflare.com  (frontend)" -ForegroundColor Magenta
Write-Host ""
Write-Host " NEXT STEP:" -ForegroundColor Yellow
Write-Host "   Copy the BACKEND tunnel URL and put it in:" -ForegroundColor White
Write-Host "   client\vite.config.js  →  proxy target" -ForegroundColor White
Write-Host "   Then restart the Vite dev server." -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
