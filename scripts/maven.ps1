param([string[]]$MavenArgs = @('test'))
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$localJdk = Get-ChildItem -LiteralPath (Join-Path $projectRoot '.tools\jdk21') -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if ($localJdk) { $env:JAVA_HOME = $localJdk.FullName }
if (-not $env:JAVA_HOME -or -not (Test-Path -LiteralPath (Join-Path $env:JAVA_HOME 'bin\java.exe'))) {
    throw 'Set JAVA_HOME to a Java 21 JDK or install one under ArchArena/.tools/jdk21.'
}
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
$mavenCommand = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if ($mavenCommand) { $mavenPath = $mavenCommand.Source }
else {
    $cachedMaven = Get-ChildItem -LiteralPath (Join-Path $env:USERPROFILE '.m2\wrapper\dists') -Recurse -Filter mvn.cmd -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | Select-Object -First 1
    if (-not $cachedMaven) { throw 'Install Maven 3.9+ and add mvn.cmd to PATH. No global tools are changed by this script.' }
    $mavenPath = $cachedMaven.FullName
}
$pomPath = Join-Path $projectRoot 'backend\pom.xml'
$cachePath = Join-Path $projectRoot '.tools\maven-cache'
& $mavenPath '-f' $pomPath "-Dmaven.repo.local=$cachePath" @MavenArgs
exit $LASTEXITCODE
