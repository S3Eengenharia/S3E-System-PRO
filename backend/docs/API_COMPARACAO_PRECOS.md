# 📊 API de Comparação de Preços

## Visão Geral

A API de Comparação de Preços permite o upload de arquivos CSV contendo orçamentos de fornecedores e compara automaticamente com os preços históricos dos materiais no sistema.

## 🎯 Funcionalidades

- ✅ Upload de arquivos CSV com detecção automática de delimitador (vírgula ou ponto e vírgula)
- ✅ Comparação automática com histórico de preços
- ✅ Identificação de preços menores, maiores ou iguais
- ✅ Cálculo de economia ou custo extra potencial
- ✅ Atualização em lote dos preços dos materiais

---

## 📝 Endpoints

### 1. **POST** `/api/comparacao-precos/upload-csv`

Upload e processamento de arquivo CSV para comparação de preços.

**Autenticação**: ✅ Requerida

**Content-Type**: `multipart/form-data`

**Parâmetros do FormData**:
- `csvFile` (File): Arquivo CSV (obrigatório)
- `fornecedor` (String): Nome do fornecedor (obrigatório)

**Formato do CSV**:

O arquivo CSV deve conter as seguintes colunas (case-insensitive):
- `codigo`: Código do material
- `nome`: Nome/descrição do material
- `unidade`: Unidade de medida (MT, UN, KG, etc)
- `quantidade`: Quantidade cotada
- `preco_unitario`: Preço unitário do material

**Delimitadores Suportados**:
- `,` (vírgula) - CSV Padrão
- `;` (ponto e vírgula) - SSV (comum no Brasil/Europa)

O sistema detecta automaticamente qual delimitador está sendo usado.

**Separador Decimal**:
- Tanto `.` (ponto) quanto `,` (vírgula) são aceitos para números decimais
- Exemplos válidos: `2.50`, `2,50`

**Exemplo de CSV (vírgula)**:
```csv
codigo,nome,unidade,quantidade,preco_unitario
MAT001,Cabo Flexível 2.5mm,MT,100,2.50
MAT002,Disjuntor 20A,UN,10,15.00
MAT003,Tomada 2P+T,UN,50,8.75
```

**Exemplo de CSV (ponto e vírgula)**:
```csv
codigo;nome;unidade;quantidade;preco_unitario
MAT001;Cabo Flexível 2.5mm;MT;100;2,50
MAT002;Disjuntor 20A;UN;10;15,00
MAT003;Tomada 2P+T;UN;50;8,75
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "codigo": "MAT001",
        "nome": "Cabo Flexível 2.5mm",
        "unidade": "MT",
        "quantidade": 100,
        "preco_unitario": 2.50,
        "preco_atual": 2.80,
        "diferenca_percentual": -10.71,
        "status": "Lower"
      }
    ],
    "summary": {
      "total_items": 5,
      "lower_prices": 2,
      "higher_prices": 1,
      "equal_prices": 1,
      "no_history": 1,
      "total_savings": 150.00,
      "total_extra_cost": 50.00
    }
  },
  "message": "CSV processado com sucesso"
}
```

**Status Possíveis**:
- `Lower`: Preço do fornecedor é menor que o histórico (💚 ECONOMIA)
- `Higher`: Preço do fornecedor é maior que o histórico (🔴 CUSTO EXTRA)
- `Equal`: Preço do fornecedor é igual ao histórico
- `NoHistory`: Material não tem histórico de preços no sistema

**Erros Possíveis**:
- `400`: Nenhum arquivo enviado ou estrutura inválida
- `500`: Erro no processamento do CSV

---

### 2. **POST** `/api/comparacao-precos/validate-csv`

Valida a estrutura do arquivo CSV antes do processamento completo.

**Autenticação**: ✅ Requerida

**Content-Type**: `multipart/form-data`

**Parâmetros**:
- `csvFile` (File): Arquivo CSV a ser validado

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Estrutura do CSV é válida",
  "data": {
    "total_rows": 5,
    "columns": ["codigo", "nome", "unidade", "quantidade", "preco_unitario"]
  }
}
```

**Resposta de Erro (400)**:
```json
{
  "success": false,
  "message": "Colunas obrigatórias não encontradas: codigo, preco_unitario",
  "data": {
    "required": ["codigo", "nome", "unidade", "quantidade", "preco_unitario"],
    "found": ["nome", "unidade", "quantidade"],
    "missing": ["codigo", "preco_unitario"]
  }
}
```

---

### 3. **GET** `/api/comparacao-precos/historico/:codigo`

Busca o histórico de preços de um material específico.

**Autenticação**: ✅ Requerida

**Parâmetros de URL**:
- `codigo` (String): Código do material

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": [
    {
      "data": "2024-01-15T10:30:00Z",
      "preco_unitario": 2.80,
      "quantidade": 50,
      "fornecedor": "Fornecedor XYZ"
    },
    {
      "data": "2024-02-10T14:20:00Z",
      "preco_unitario": 2.70,
      "quantidade": 100,
      "fornecedor": "Fornecedor ABC"
    }
  ],
  "message": "Histórico buscado com sucesso"
}
```

---

### 4. **POST** `/api/comparacao-precos/atualizar-precos`

Atualiza os preços dos materiais no sistema baseado na comparação.

**Autenticação**: ✅ Requerida

**Content-Type**: `application/json`

**Body**:
```json
{
  "items": [
    {
      "codigo": "MAT001",
      "nome": "Cabo Flexível 2.5mm",
      "unidade": "MT",
      "quantidade": 100,
      "preco_unitario": 2.50,
      "preco_atual": 2.80,
      "status": "Lower"
    }
  ]
}
```

**Comportamento**:
- Apenas atualiza materiais com `status: "Lower"` (preços menores)
- Ignora materiais sem histórico ou com preços maiores
- Retorna quantidade de sucessos e erros

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "updated": 2,
    "errors": 0
  },
  "message": "Preços atualizados: 2 sucessos, 0 erros"
}
```

---

## 🔧 Configurações Técnicas

### Limites
- **Tamanho máximo do arquivo**: 5 MB
- **Tipos aceitos**: `.csv`, `text/csv`

### Encoding
- UTF-8 (recomendado)
- Compatível com arquivos do Excel/LibreOffice

### Performance
- Processamento assíncrono
- Logs detalhados para debug
- Validação em tempo real

---

## 🧪 Testando a API

### Exemplo com cURL (vírgula):
```bash
curl -X POST http://localhost:3000/api/comparacao-precos/upload-csv \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "csvFile=@orcamento_fornecedor.csv" \
  -F "fornecedor=Fornecedor XYZ"
```

### Exemplo com cURL (ponto e vírgula):
```bash
curl -X POST http://localhost:3000/api/comparacao-precos/upload-csv \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "csvFile=@orcamento_fornecedor_ptvirgula.csv" \
  -F "fornecedor=Fornecedor ABC"
```

### Exemplo com JavaScript (fetch):
```javascript
const formData = new FormData();
formData.append('csvFile', file);
formData.append('fornecedor', 'Fornecedor XYZ');

const response = await fetch('http://localhost:3000/api/comparacao-precos/upload-csv', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});

const result = await response.json();
```

---

## ⚠️ Notas Importantes

1. **Busca de Materiais**: O sistema busca materiais por código exato OU nome similar (case-insensitive)
2. **Histórico**: Apenas movimentações de ENTRADA são consideradas no histórico
3. **Atualização**: Apenas preços menores são atualizados automaticamente
4. **Encoding**: Sempre use UTF-8 para evitar problemas com caracteres especiais
5. **Delimitador**: O sistema detecta automaticamente, mas seja consistente no arquivo

---

## 🐛 Troubleshooting

### Erro: "Nenhum arquivo CSV foi enviado"
- Verifique se o campo do FormData está nomeado como `csvFile`
- Confirme que o arquivo está sendo anexado corretamente

### Erro: "Colunas obrigatórias não encontradas"
- Verifique os nomes das colunas (devem ser exatamente: codigo, nome, unidade, quantidade, preco_unitario)
- Certifique-se de que o CSV tem cabeçalho

### Erro: "CSV vazio ou sem dados válidos"
- Verifique se o arquivo tem pelo menos uma linha de dados além do cabeçalho
- Confirme que o encoding do arquivo é UTF-8

### Preços não são comparados
- Verifique se os códigos dos materiais correspondem aos cadastrados no sistema
- Confirme se os materiais têm histórico de movimentações de ENTRADA

---

## 📚 Arquivos de Exemplo

Veja os arquivos de exemplo na pasta `backend/docs/`:
- `exemplo_csv_comparacao_precos.csv` (delimitador: vírgula)
- `exemplo_csv_comparacao_precos_ptvirgula.csv` (delimitador: ponto e vírgula)

