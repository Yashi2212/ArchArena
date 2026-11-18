param([switch]$Stop)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Split-Path -Parent $PSScriptRoot)).Path
$stateDirectory = Join-Path $projectRoot '.local'
$stateFile = Join-Path $stateDirectory 'processes.json'
New-Item -ItemType Directory -Force -Path $stateDirectory | Out-Null
if ($Stop) {
    if (Test-Path -LiteralPath $stateFile) {
        $owned = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
        foreach ($entry in $owned) {
            $process = Get-CimInstance Win32_Process -Filter "ProcessId=$($entry.pid)" -ErrorAction SilentlyContinue
            if ($process -and $process.CommandLine -and $process.CommandLine.Contains($projectRoot)) { Stop-Process -Id $entry.pid }
        }
        Remove-Item -LiteralPath $stateFile
    }
    Write-Output 'Stopped the recorded ArchArena processes. Local data was preserved.'
    exit 0
}
if (Test-Path -LiteralPath $stateFile) { throw 'A session is already recorded. Run ./scripts/dev.ps1 -Stop before restarting.' }
$jar = Join-Path $projectRoot 'backend\target\archarena-0.1.0.jar'
if (-not (Test-Path -LiteralPath $jar)) { throw 'Build first: ./scripts/maven.ps1 -MavenArgs @("package")' }
$jdk = Get-ChildItem -LiteralPath (Join-Path $projectRoot '.tools\jdk21') -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
$java = if ($jdk) { Join-Path $jdk.FullName 'bin\java.exe' } elseif ($env:JAVA_HOME) { Join-Path $env:JAVA_HOME 'bin\java.exe' } else { (Get-Command java.exe).Source }
$node = (Get-Command node.exe).Source
$vite = Join-Path $projectRoot 'frontend\node_modules\vite\bin\vite.js'
if (-not (Test-Path -LiteralPath $vite)) { throw 'Install frontend dependencies with npm ci --legacy-peer-deps inside frontend.' }
$started = @()
try {
    $api = Start-Process -FilePath $java -ArgumentList @('-Xmx256m','-jar',('"' + $jar + '"')) -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $stateDirectory 'api.log') -RedirectStandardError (Join-Path $stateDirectory 'api-error.log') -PassThru
    $started += @{ name='api'; pid=$api.Id }
    $worker = Start-Process -FilePath $java -ArgumentList @('-Xmx128m','-jar',('"' + $jar + '"'),'--archarena.worker.enabled=true','--spring.main.web-application-type=none') -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $stateDirectory 'worker.log') -RedirectStandardError (Join-Path $stateDirectory 'worker-error.log') -PassThru
    $started += @{ name='worker'; pid=$worker.Id }
    $frontend = Start-Process -FilePath $node -ArgumentList @(('"' + $vite + '"'),'--host','127.0.0.1','--port','5173','--strictPort') -WorkingDirectory (Join-Path $projectRoot 'frontend') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $stateDirectory 'frontend.log') -RedirectStandardError (Join-Path $stateDirectory 'frontend-error.log') -PassThru
    $started += @{ name='frontend'; pid=$frontend.Id }
    $started | ConvertTo-Json | Set-Content -LiteralPath $stateFile -Encoding utf8
    Write-Output 'Starting ArchArena at http://127.0.0.1:5173 . Check .local logs and /actuator/health for readiness.'
} catch {
    foreach ($entry in $started) { Stop-Process -Id $entry.pid -ErrorAction SilentlyContinue }
    throw
}
