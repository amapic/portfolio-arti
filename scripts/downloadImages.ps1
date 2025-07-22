# Script PowerShell pour télécharger 25 images Picsum
Write-Host "🚀 Début du téléchargement des images Picsum..." -ForegroundColor Green

# Créer le dossier images s'il n'existe pas
$imagesDir = Join-Path $PSScriptRoot "..\public\images"
if (!(Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
    Write-Host "📁 Dossier créé: $imagesDir" -ForegroundColor Yellow
}

# Configuration des images
$imageConfigs = @(
    @{ width = 400; height = 400; count = 10; type = "carrées" },
    @{ width = 600; height = 400; count = 8; type = "rectangulaires horizontales" },
    @{ width = 400; height = 600; count = 7; type = "rectangulaires verticales" }
)

$imageIndex = 1
$totalImages = 0

foreach ($config in $imageConfigs) {
    Write-Host "`n📸 Téléchargement des images $($config.type) ($($config.width)x$($config.height))..." -ForegroundColor Cyan
    
    for ($i = 1; $i -le $config.count; $i++) {
        $randomId = Get-Random -Minimum 1 -Maximum 1000
        $url = "https://picsum.photos/$($config.width)/$($config.height)?random=$randomId"
        $filename = "image-$imageIndex-$($config.width)x$($config.height).jpg"
        $filePath = Join-Path $imagesDir $filename
        
        try {
            Invoke-WebRequest -Uri $url -OutFile $filePath -UseBasicParsing
            Write-Host "✅ Téléchargé: $filename" -ForegroundColor Green
            $totalImages++
        }
        catch {
            Write-Host "❌ Erreur pour $filename : $($_.Exception.Message)" -ForegroundColor Red
        }
        
        $imageIndex++
        Start-Sleep -Milliseconds 500  # Petite pause pour éviter de surcharger le serveur
    }
}

Write-Host "`n🎉 Téléchargement terminé !" -ForegroundColor Green
Write-Host "📊 Total: $totalImages images téléchargées" -ForegroundColor Yellow
Write-Host "📁 Dossier: $imagesDir" -ForegroundColor Yellow

# Lister les images téléchargées
Write-Host "`n📋 Images téléchargées:" -ForegroundColor Cyan
Get-ChildItem $imagesDir -Filter "*.jpg" | ForEach-Object {
    $size = [math]::Round($_.Length / 1KB, 2)
    Write-Host "   $($_.Name) ($size KB)" -ForegroundColor White
}

Write-Host "`n✨ Script terminé avec succès !" -ForegroundColor Green
