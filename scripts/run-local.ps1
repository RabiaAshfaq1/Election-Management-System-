# VoteFlow — local run helper (PowerShell)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "VoteFlow local setup" -ForegroundColor Cyan
Write-Host "Project: $root`n"

if (-not (Test-Path ".env.local")) {
  Write-Host "WARNING: .env.local missing. Copy .env.example to .env.local and fill Supabase keys." -ForegroundColor Yellow
  if (Test-Path ".env.example") {
    Copy-Item ".env.example" ".env.local"
    Write-Host "Created .env.local from .env.example — edit it before continuing.`n" -ForegroundColor Yellow
  }
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..." -ForegroundColor Green
  npm install
} else {
  Write-Host "node_modules found — skipping npm install" -ForegroundColor Gray
}

Write-Host "`nRunning lint..." -ForegroundColor Green
npm run lint

Write-Host "`nRunning production build (checks TypeScript + Next.js)..." -ForegroundColor Green
npm run build

Write-Host "`nBuild OK. Starting dev server at http://localhost:3000" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop.`n" -ForegroundColor Gray
npm run dev
