# Script de Migração Automática - S3E System PRO
# Execute este script para completar a migração da estrutura do projeto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  S3E System PRO - Migração Automática  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = $PSScriptRoot

# Função para copiar arquivos com segurança
function Copy-SafeItem {
    param($Source, $Destination)
    if (Test-Path $Source) {
        Copy-Item $Source -Destination $Destination -Force
        Write-Host "✓ Copiado: $Source" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ Não encontrado: $Source" -ForegroundColor Yellow
        return $false
    }
}

Write-Host "1. Copiando componentes para frontend/src/components..." -ForegroundColor Yellow
Write-Host ""

$componentFiles = @(
    "Sidebar.tsx", "Dashboard.tsx", "Orcamentos.tsx", "Movimentacoes.tsx",
    "Historico.tsx", "Compras.tsx", "Materiais.tsx", "Fornecedores.tsx",
    "Clientes.tsx", "Projetos.tsx", "Obras.tsx", "Servicos.tsx",
    "SettingsModal.tsx", "CriticalAlerts.tsx", "OngoingProjects.tsx",
    "QuickActions.tsx", "RecentMovements.tsx", "StatCard.tsx"
)

$copiedCount = 0
foreach ($file in $componentFiles) {
    $source = Join-Path $projectRoot "components\$file"
    $dest = Join-Path $projectRoot "frontend\src\components\$file"
    if (Copy-SafeItem $source $dest) {
        $copiedCount++
    }
}

Write-Host ""
Write-Host "Componentes copiados: $copiedCount de $($componentFiles.Count)" -ForegroundColor Cyan
Write-Host ""

# Criar estrutura de pastas vazias se necessário
Write-Host "2. Verificando estrutura de pastas..." -ForegroundColor Yellow
Write-Host ""

$folders = @(
    "frontend\src\utils",
    "frontend\src\assets", 
    "frontend\public",
    "backend\src\controllers",
    "backend\src\models",
    "backend\src\routes",
    "backend\src\services",
    "backend\src\middlewares",
    "backend\src\config",
    "backend\src\utils",
    "backend\src\types"
)

foreach ($folder in $folders) {
    $fullPath = Join-Path $projectRoot $folder
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "✓ Criado: $folder" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Migração Concluída!                   " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. cd frontend" -ForegroundColor White
Write-Host "2. npm install" -ForegroundColor White
Write-Host "3. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Para o backend (quando necessário):" -ForegroundColor Yellow
Write-Host "1. cd backend" -ForegroundColor White
Write-Host "2. npm install" -ForegroundColor White
Write-Host "3. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Leia MIGRATION_GUIDE.md para mais detalhes!" -ForegroundColor Cyan
Write-Host ""
