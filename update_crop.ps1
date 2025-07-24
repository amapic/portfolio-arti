# Script PowerShell pour remplacer width/height par size dans images.json

$jsonPath = "api\images.json"
$content = Get-Content $jsonPath -Raw -Encoding UTF8

# Pattern pour matcher les objets crop avec width et height
$pattern = '"crop":\s*\{\s*"x":\s*(\d+),\s*"y":\s*(\d+),\s*"width":\s*\d+,\s*"height":\s*\d+\s*\}'
$replacement = '"crop": { "x": $1, "y": $2, "size": 100 }'

$newContent = $content -replace $pattern, $replacement

$newContent | Set-Content $jsonPath -Encoding UTF8
Write-Host "Remplacement terminé"
