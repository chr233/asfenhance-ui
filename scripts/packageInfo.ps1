$pkgPath = "$PSScriptRoot\..\package.json"
$outPath = "$PSScriptRoot\..\src\lib\packageInfo.ts"

Write-Host $pkgPath 
Write-Host $outPath

$pkg = Get-Content $pkgPath | ConvertFrom-Json

$name = $pkg.name
$version = $pkg.version
$description = $pkg.description
$author = $pkg.author
$repository = $pkg.repository
$buildTime = $pkg.buildTime

$body = @{
    name = $name
    version = $version
    description = $description
    author = $author
} | ConvertTo-Json

$content = "export const PACKAGE_INFO = $body;"

Set-Content -Path $outPath -Value $content -Encoding UTF8
Write-Host "packageInfo.ts generated: $outPath"