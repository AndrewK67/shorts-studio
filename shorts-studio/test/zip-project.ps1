# Shorts Studio - Create Clean Zip for Claude
# This script creates a zip file excluding build artifacts and large folders

Write-Host "🎬 Preparing Shorts Studio for upload to Claude..." -ForegroundColor Cyan

# Get the project directory
$ProjectDir = Get-Location
$ProjectName = Split-Path $ProjectDir -Leaf
$ZipName = "shorts-studio-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
$ZipPath = Join-Path $ProjectDir $ZipName

Write-Host "📁 Project: $ProjectName" -ForegroundColor Yellow
Write-Host "📦 Creating: $ZipName" -ForegroundColor Yellow

# Folders and patterns to exclude
$ExcludePaths = @(
    '.git',
    'node_modules',
    '.next',
    'dist',
    'build',
    '.vercel',
    'coverage',
    '.turbo',
    '__pycache__',
    'venv',
    'env',
    'tmp',
    'temp'
)

$ExcludeFiles = @(
    '*.log',
    '.DS_Store',
    '*.pyc',
    '.env.local',
    '.env.*.local'
)

# Get all items recursively, excluding specified paths
$FilesToZip = Get-ChildItem -Path $ProjectDir -Recurse -File | Where-Object {
    $file = $_
    $shouldInclude = $true
    
    # Check if file is in any excluded path
    foreach ($exclude in $ExcludePaths) {
        if ($file.FullName -like "*\$exclude\*" -or $file.FullName -like "*/$exclude/*") {
            $shouldInclude = $false
            break
        }
    }
    
    # Check if file matches any excluded pattern
    if ($shouldInclude) {
        foreach ($pattern in $ExcludeFiles) {
            if ($file.Name -like $pattern) {
                $shouldInclude = $false
                break
            }
        }
    }
    
    $shouldInclude
}

Write-Host "📝 Found $($FilesToZip.Count) files to include..." -ForegroundColor Gray

# Create temporary directory for clean structure
$TempDir = Join-Path $env:TEMP "shorts-studio-temp"
if (Test-Path $TempDir) {
    Remove-Item $TempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $TempDir | Out-Null

# Copy files maintaining structure
foreach ($file in $FilesToZip) {
    $relativePath = $file.FullName.Substring($ProjectDir.Path.Length + 1)
    $destPath = Join-Path $TempDir $relativePath
    $destDir = Split-Path $destPath -Parent
    
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    Copy-Item $file.FullName -Destination $destPath
}

# Create zip file
Compress-Archive -Path "$TempDir\*" -DestinationPath $ZipPath -Force

# Clean up temp directory
Remove-Item $TempDir -Recurse -Force

if (Test-Path $ZipPath) {
    $SizeMB = [math]::Round((Get-Item $ZipPath).Length / 1MB, 2)
    Write-Host "✅ Success! Created $ZipName ($SizeMB MB)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Now drag this file into your Claude chat:" -ForegroundColor Cyan
    Write-Host "   $ZipPath" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Tip: You can also right-click and 'Show in Explorer'" -ForegroundColor Gray
} else {
    Write-Host "❌ Error creating zip file" -ForegroundColor Red
    exit 1
}
