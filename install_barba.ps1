# Script PowerShell pour installer les dépendances Barba.js et GSAP

Write-Host "🚀 Installation des dépendances pour Barba.js..." -ForegroundColor Green

# Vérifier si npm est disponible
try {
    npm --version | Out-Null
    Write-Host "✅ npm trouvé" -ForegroundColor Green
} catch {
    Write-Host "❌ npm n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Installer @barba/core et gsap
Write-Host "📦 Installation de @barba/core et gsap..." -ForegroundColor Yellow

try {
    npm install @barba/core gsap
    Write-Host "✅ @barba/core et gsap installés avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'installation des packages" -ForegroundColor Red
    exit 1
}

# Vérifier l'installation
Write-Host "🔍 Vérification de l'installation..." -ForegroundColor Yellow

$packageJson = Get-Content "package.json" | ConvertFrom-Json
$dependencies = $packageJson.dependencies

if ($dependencies.'@barba/core' -and $dependencies.gsap) {
    Write-Host "✅ Tous les packages sont installés et présents dans package.json" -ForegroundColor Green
    Write-Host "   - @barba/core: $($dependencies.'@barba/core')" -ForegroundColor Cyan
    Write-Host "   - gsap: $($dependencies.gsap)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Certains packages ne sont pas présents dans package.json" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Installation terminée !" -ForegroundColor Green
Write-Host "Barba.js est maintenant configuré pour vos transitions admin." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "1. Lancez votre serveur de développement : npm run dev" -ForegroundColor White
Write-Host "2. Naviguez vers /admin pour tester les transitions" -ForegroundColor White
Write-Host "3. Les transitions Barba.js sont actives sur toutes les pages admin" -ForegroundColor White
