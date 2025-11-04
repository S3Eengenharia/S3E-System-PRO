#!/bin/bash

# Script de teste para upload de CSV - Comparação de Preços
# Execute este script para testar o endpoint de upload

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Teste de Upload CSV - Comparação de Preços${NC}\n"

# Configurações
API_URL="http://localhost:3000/api/comparacao-precos/upload-csv"
TOKEN="SEU_TOKEN_AQUI" # Substitua pelo seu token JWT

# Arquivo CSV de teste (vírgula)
CSV_FILE="docs/exemplo_csv_comparacao_precos.csv"
CSV_FILE_PTVIRGULA="docs/exemplo_csv_comparacao_precos_ptvirgula.csv"

# Teste 1: CSV com vírgula
echo -e "${YELLOW}📋 Teste 1: CSV com delimitador VÍRGULA${NC}"
if [ -f "$CSV_FILE" ]; then
  echo "Arquivo encontrado: $CSV_FILE"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Authorization: Bearer $TOKEN" \
    -F "csvFile=@$CSV_FILE" \
    -F "fornecedor=Fornecedor Teste A")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Sucesso! HTTP $HTTP_CODE${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  else
    echo -e "${RED}❌ Erro! HTTP $HTTP_CODE${NC}"
    echo "$BODY"
  fi
else
  echo -e "${RED}❌ Arquivo não encontrado: $CSV_FILE${NC}"
fi

echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Teste 2: CSV com ponto e vírgula
echo -e "${YELLOW}📋 Teste 2: CSV com delimitador PONTO E VÍRGULA${NC}"
if [ -f "$CSV_FILE_PTVIRGULA" ]; then
  echo "Arquivo encontrado: $CSV_FILE_PTVIRGULA"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
    -H "Authorization: Bearer $TOKEN" \
    -F "csvFile=@$CSV_FILE_PTVIRGULA" \
    -F "fornecedor=Fornecedor Teste B")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Sucesso! HTTP $HTTP_CODE${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
  else
    echo -e "${RED}❌ Erro! HTTP $HTTP_CODE${NC}"
    echo "$BODY"
  fi
else
  echo -e "${RED}❌ Arquivo não encontrado: $CSV_FILE_PTVIRGULA${NC}"
fi

echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Testes concluídos!${NC}"
echo -e "\n${YELLOW}💡 Dica: Não esqueça de substituir SEU_TOKEN_AQUI pelo token JWT válido${NC}"

