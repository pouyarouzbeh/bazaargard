param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8506,
    [string]$DatasetDir,
    [switch]$Reload
)

$ErrorActionPreference = 'Stop'
if ($DatasetDir) {
    $DatasetDir = (Resolve-Path -LiteralPath $DatasetDir).Path
}
Push-Location $PSScriptRoot
try {
    $taskPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
    if (-not (Test-Path -LiteralPath $taskPython)) {
        throw 'Install dependencies first; see docs/LOCAL_WINDOWS.fa.md.'
    }
    if (-not (Test-Path -LiteralPath '.env')) {
        throw 'Local .env is missing; see docs/LOCAL_WINDOWS.fa.md.'
    }
    New-Item -ItemType Directory -Path 'data' -Force | Out-Null
    $taskCatalog = Join-Path $PSScriptRoot 'data\catalog.db'
    if ($DatasetDir) {
        if (Test-Path -LiteralPath $taskCatalog) {
            throw 'data/catalog.db already exists. Existing catalogues are never overwritten.'
        }
        foreach ($taskCsv in @('products.csv', 'shops.csv', 'offers.csv')) {
            if (-not (Test-Path -LiteralPath (Join-Path $DatasetDir $taskCsv) -PathType Leaf)) {
                throw "Missing dataset file: $taskCsv"
            }
        }
        $taskImport = Join-Path $PSScriptRoot ('data\catalog.import-' + [guid]::NewGuid().ToString('N') + '.db')
        try {
            & $taskPython -X utf8 backend/catalog.py $DatasetDir $taskImport
            if ($LASTEXITCODE -ne 0) { throw 'Catalogue import failed.' }
            Move-Item -LiteralPath $taskImport -Destination $taskCatalog
        }
        finally {
            if (Test-Path -LiteralPath $taskImport) { Remove-Item -LiteralPath $taskImport }
        }
    }
    if (-not (Test-Path -LiteralPath $taskCatalog -PathType Leaf)) {
        throw 'Dataset required: put catalog.db in data, or run .\run-local.ps1 -DatasetDir "C:\path\to\csvs".'
    }
    if (-not (Test-Path -LiteralPath 'frontend\dist\index.html')) {
        throw 'Frontend build missing. Run: npm --prefix frontend run build'
    }
    $taskServerArgs = @('-X', 'utf8', '-m', 'uvicorn', 'server:app', '--app-dir', 'backend', '--host', '127.0.0.1', '--port', "$Port", '--env-file', '.env')
    if ($Reload) { $taskServerArgs += '--reload'; $taskServerArgs += '--reload-dir'; $taskServerArgs += 'backend' }
    Write-Host "Bazargard: http://127.0.0.1:$Port (Ctrl+C to stop)"
    & $taskPython @taskServerArgs
    if ($LASTEXITCODE -ne 0) { throw "Server exited with code $LASTEXITCODE." }
}
finally {
    Pop-Location
}
