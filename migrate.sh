#!/bin/bash
# Script de Migração Automática - S3E System PRO
# Execute este script para completar a migração da estrutura do projeto

# Cores
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================"
echo -e "  S3E System PRO - Migração Automática  "
echo -e "========================================${NC}"
echo ""

# Diretório do projeto
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"

# Função para copiar arquivos com segurança
copy_safe() {
    local source="$1"
    local dest="$2"
    
    if [ -f "$source" ]; then
        cp -f "$source" "$dest"
        echo -e "${GREEN}✓ Copiado: $source${NC}"
        return 0
    else
        echo -e "${YELLOW}✗ Não encontrado: $source${NC}"
        return 1
    fi
}

echo -e "${YELLOW}1. Copiando componentes para frontend/src/components...${NC}"
echo ""

# Lista de componentes
components=(
    "Sidebar.tsx"
    "Dashboard.tsx"
    "Orcamentos.tsx"
    "Movimentacoes.tsx"
    "Historico.tsx"
    "Compras.tsx"
    "Materiais.tsx"
    "Fornecedores.tsx"
    "Clientes.tsx"
    "Projetos.tsx"
    "Obras.tsx"
    "Servicos.tsx"
    "SettingsModal.tsx"
    "CriticalAlerts.tsx"
    "OngoingProjects.tsx"
    "QuickActions.tsx"
    "RecentMovements.tsx"
    "StatCard.tsx"
)

copied_count=0
total_count=${#components[@]}

for file in "${components[@]}"; do
    source="$PROJECT_ROOT/components/$file"
    dest="$PROJECT_ROOT/frontend/src/components/$file"
    
    if copy_safe "$source" "$dest"; then
        ((copied_count++))
    fi
done

echo ""
echo -e "${CYAN}Componentes copiados: $copied_count de $total_count${NC}"
echo ""

# Criar estrutura de pastas vazias se necessário
echo -e "${YELLOW}2. Verificando estrutura de pastas...${NC}"
echo ""

folders=(
    "frontend/src/utils"
    "frontend/src/assets"
    "frontend/public"
    "backend/src/controllers"
    "backend/src/models"
    "backend/src/routes"
    "backend/src/services"
    "backend/src/middlewares"
    "backend/src/config"
    "backend/src/utils"
    "backend/src/types"
)

for folder in "${folders[@]}"; do
    full_path="$PROJECT_ROOT/$folder"
    if [ ! -d "$full_path" ]; then
        mkdir -p "$full_path"
        echo -e "${GREEN}✓ Criado: $folder${NC}"
    fi
done

echo ""
echo -e "${CYAN}========================================"
echo -e "${GREEN}  Migração Concluída!                   ${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""
echo -e "${YELLOW}Próximos passos:${NC}"
echo -e "${WHITE}1. cd frontend${NC}"
echo -e "${WHITE}2. npm install${NC}"
echo -e "${WHITE}3. npm run dev${NC}"
echo ""
echo -e "${YELLOW}Para o backend (quando necessário):${NC}"
echo -e "${WHITE}1. cd backend${NC}"
echo -e "${WHITE}2. npm install${NC}"
echo -e "${WHITE}3. npm run dev${NC}"
echo ""
echo -e "${CYAN}Leia MIGRATION_GUIDE.md para mais detalhes!${NC}"
echo ""

