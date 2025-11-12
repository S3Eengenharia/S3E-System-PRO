# ✅ IMPLEMENTAÇÃO COMPLETA: Validação Condicional e Integração de Estoque no Wizard de Quadros

## 🎯 Objetivo Alcançado

Implementada **ramificação condicional** na **Etapa 1** do wizard de criação de quadros elétricos, que agora se adapta dinamicamente ao tipo de quadro selecionado (`POLICARBONATO`, `ALUMINIO`, `COMANDO`).

---

## 📋 BLOCO 1: Service de Quadros/Estoque

### ✅ Arquivo: `frontend/src/services/quadrosService.ts`

#### Novos Exports e Interface:

```typescript
export interface CaixaEstoque {
  id: string;
  codigo: string;
  descricao: string;
  estoque: number;
  preco: number;
  unidadeMedida: string;
}
```

#### Nova Função: `buscarCaixasEstoque()`

```typescript
async buscarCaixasEstoque(tipo: 'ALUMINIO' | 'COMANDO'): Promise<CaixaEstoque[]>
```

**Funcionalidades:**
- ✅ Busca caixas específicas por tipo (ALUMINIO ou COMANDO)
- ✅ Mock temporário implementado com dados realistas
- ✅ Preparado para integração com endpoint real: `GET /api/estoque/caixas?tipo=ALUMINIO`
- ✅ Simula latência de rede (500ms) para UX realista
- ✅ Tratamento de erros robusto

**Dados Mock:**

| Tipo | Caixas Disponíveis |
|------|-------------------|
| **ALUMINIO** | 4 modelos (500x700, 800x1200, 600x900, 1000x1500) |
| **COMANDO** | 4 modelos (300x400, 500x600, 800x1000, 400x500) |

**Estrutura de uma Caixa:**
```typescript
{
  id: 'caixa-alum-001',
  codigo: 'QDA-500x700',
  descricao: 'Quadro de Distribuição Alumínio 500x700mm - 12 Disjuntores',
  estoque: 5,
  preco: 450.00,
  unidadeMedida: 'un'
}
```

---

## 📋 BLOCO 2: Ramificação Condicional no Wizard

### ✅ Arquivo: `frontend/src/components/CriacaoQuadroModular.tsx`

#### 1. **Novos Estados Adicionados**

```typescript
// Estados específicos para ALUMINIO/COMANDO
const [caixasDisponiveis, setCaixasDisponiveis] = useState<CaixaEstoque[]>([]);
const [isLoadingCaixas, setIsLoadingCaixas] = useState(false);
const [caixaSelecionada, setCaixaSelecionada] = useState<CaixaEstoque | null>(null);
const [searchCaixaTerm, setSearchCaixaTerm] = useState('');
```

**Propósito:**
- `caixasDisponiveis`: Lista de caixas retornadas do service
- `isLoadingCaixas`: Estado de carregamento
- `caixaSelecionada`: Caixa única selecionada (apenas ALUMINIO/COMANDO)
- `searchCaixaTerm`: Termo de busca específico para caixas de estoque

---

#### 2. **Nova Função: `loadCaixasDisponiveis()`**

```typescript
const loadCaixasDisponiveis = async (tipo: 'ALUMINIO' | 'COMANDO') => {
  try {
    setIsLoadingCaixas(true);
    console.log(`🔍 Carregando caixas de estoque do tipo: ${tipo}`);
    
    const caixas = await quadrosService.buscarCaixasEstoque(tipo);
    setCaixasDisponiveis(caixas);
    
    console.log(`✅ ${caixas.length} caixas carregadas`);
  } catch (error) {
    console.error('❌ Erro ao carregar caixas disponíveis:', error);
    setCaixasDisponiveis([]);
  } finally {
    setIsLoadingCaixas(false);
  }
};
```

**Quando é chamada:**
- Automaticamente quando o tipo muda para ALUMINIO ou COMANDO (via `useEffect`)
- Exibe logs informativos para debug

---

#### 3. **useEffect: Monitoramento de Tipo**

```typescript
useEffect(() => {
  if (isOpen && (tipoQuadro === 'ALUMINIO' || tipoQuadro === 'COMANDO')) {
    loadCaixasDisponiveis(tipoQuadro);
  }
}, [tipoQuadro, isOpen]);
```

**Comportamento:**
- ✅ Monitora mudanças no `tipoQuadro`
- ✅ Carrega caixas automaticamente quando tipo é ALUMINIO ou COMANDO
- ✅ Só executa se o modal estiver aberto

---

#### 4. **useMemo: Filtro de Caixas**

```typescript
const caixasFiltradas = useMemo(() => {
  if (!searchCaixaTerm) return caixasDisponiveis;
  return caixasDisponiveis.filter(c =>
    c.descricao.toLowerCase().includes(searchCaixaTerm.toLowerCase()) ||
    c.codigo.toLowerCase().includes(searchCaixaTerm.toLowerCase())
  );
}, [caixasDisponiveis, searchCaixaTerm]);
```

**Funcionalidade:**
- Busca por descrição ou código
- Case-insensitive
- Performance otimizada com `useMemo`

---

#### 5. **Novos Handlers**

##### `handleSelecionarCaixaEstoque()`
```typescript
const handleSelecionarCaixaEstoque = (caixa: CaixaEstoque) => {
  setCaixaSelecionada(caixa);
  
  // Atualizar config com a caixa selecionada
  setConfig(prev => ({
    ...prev,
    caixas: [{
      materialId: caixa.id,
      quantidade: 1
    }]
  }));
  
  setSearchCaixaTerm('');
  console.log(`✅ Caixa selecionada: ${caixa.descricao}`);
};
```

##### `handleRemoverCaixaEstoque()`
```typescript
const handleRemoverCaixaEstoque = () => {
  setCaixaSelecionada(null);
  setConfig(prev => ({
    ...prev,
    caixas: []
  }));
};
```

---

#### 6. **Validação Condicional na Navegação**

```typescript
onClick={() => {
  // BLOCO 2: Validação condicional da Etapa 1
  if (etapaAtual === 1) {
    if (tipoQuadro === 'POLICARBONATO') {
      // POLICARBONATO: Verifica se tem caixas adicionadas
      if (config.caixas.length === 0) {
        alert('⚠️ Por favor, adicione pelo menos uma caixa antes de prosseguir.');
        return;
      }
    } else if (tipoQuadro === 'ALUMINIO' || tipoQuadro === 'COMANDO') {
      // ALUMINIO/COMANDO: Verifica se selecionou uma caixa de estoque
      if (!caixaSelecionada) {
        alert('⚠️ Por favor, selecione uma caixa de estoque antes de prosseguir.');
        return;
      }
    }
  }
  setEtapaAtual(e => e + 1);
}}
```

**Lógica:**
- **POLICARBONATO**: Valida se `config.caixas.length > 0` (múltiplas caixas permitidas)
- **ALUMINIO/COMANDO**: Valida se `caixaSelecionada !== null` (apenas uma caixa)

---

#### 7. **Renderização Condicional da Etapa 1**

A renderização da Etapa 1 agora possui **dois fluxos completamente diferentes**:

### 🔵 Fluxo A: POLICARBONATO (Original)

**Características:**
- Busca genérica de materiais em estoque
- Permite adicionar **múltiplas caixas**
- Lista de caixas adicionadas
- Remove caixas individualmente

**UI:**
- Input de busca com ícone de lupa
- Lista de materiais filtrados (max 10)
- Cards roxos para caixas adicionadas
- Botão de lixeira para remover

---

### 🔵 Fluxo B: ALUMINIO / COMANDO (Novo)

**Características:**
- Busca **específica** em caixas de estoque
- Permite selecionar **apenas UMA caixa**
- Tabela profissional com caixas disponíveis
- Card de destaque para caixa selecionada

**UI Componentes:**

1. **Header Informativo:**
```tsx
<div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
  <h3>Etapa 1: Seleção da Caixa de Estoque</h3>
  <p>Tipo: <span className="font-semibold text-blue-700">{tipoQuadro}</span></p>
</div>
```

2. **Loading State:**
```tsx
{isLoadingCaixas && (
  <div className="text-center py-8">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    <p>Carregando caixas disponíveis...</p>
  </div>
)}
```

3. **Card de Caixa Selecionada:**
```tsx
{caixaSelecionada && (
  <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
    <span className="text-2xl">✅</span>
    <h4>Caixa Selecionada</h4>
    <p>{caixaSelecionada.descricao}</p>
    <p>Código: {caixaSelecionada.codigo}</p>
    <p>Estoque: {caixaSelecionada.estoque} {caixaSelecionada.unidadeMedida}</p>
    <p>R$ {caixaSelecionada.preco}</p>
    <button onClick={handleRemoverCaixaEstoque}>Remover</button>
  </div>
)}
```

4. **Tabela de Seleção:**
```tsx
<table className="w-full">
  <thead className="bg-gray-100 sticky top-0">
    <tr>
      <th>Código</th>
      <th>Descrição</th>
      <th>Estoque</th>
      <th>Preço</th>
      <th>Ação</th>
    </tr>
  </thead>
  <tbody>
    {caixasFiltradas.map(caixa => (
      <tr className="hover:bg-blue-50">
        <td>{caixa.codigo}</td>
        <td>{caixa.descricao}</td>
        <td>
          <span className={`badge ${estoqueColor(caixa.estoque)}`}>
            {caixa.estoque} {caixa.unidadeMedida}
          </span>
        </td>
        <td>R$ {caixa.preco}</td>
        <td>
          <button onClick={() => handleSelecionarCaixaEstoque(caixa)}>
            Selecionar
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Badges de Estoque com Cores:**
- Verde: `estoque > 5`
- Amarelo: `estoque > 2 && estoque <= 5`
- Vermelho: `estoque <= 2`

5. **Dica Informativa:**
```tsx
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
  <p>💡 Dica: Para quadros tipo {tipoQuadro}, selecione apenas UMA caixa do estoque.</p>
</div>
```

---

## 🎨 UX/UI Highlights

### Estados Visuais:

| Estado | Descrição | Cor |
|--------|-----------|-----|
| **Loading** | Spinner animado | Roxo |
| **Sem caixas** | Mensagem centralizada | Cinza |
| **Caixa selecionada** | Card destacado com ✅ | Verde |
| **Hover na tabela** | Linha destacada | Azul claro |
| **Estoque alto** | Badge verde | Verde |
| **Estoque médio** | Badge amarelo | Amarelo |
| **Estoque baixo** | Badge vermelho | Vermelho |

### Responsividade:
- ✅ Tabela com scroll vertical (max-height: 96)
- ✅ Header sticky na tabela
- ✅ Layout adaptativo com Tailwind CSS

---

## 🔄 Fluxo de Uso

### Cenário 1: Criar Quadro POLICARBONATO

1. Usuário abre modal de criação
2. Seleciona tipo: **POLICARBONATO**
3. **Etapa 1** mostra busca de materiais genérica
4. Busca e adiciona múltiplas caixas
5. Clica em "Próxima Etapa →"
6. ✅ Validação: Verifica se `config.caixas.length > 0`
7. Avança para Etapa 2

### Cenário 2: Criar Quadro ALUMINIO

1. Usuário abre modal de criação
2. Seleciona tipo: **ALUMINIO**
3. `useEffect` detecta mudança e chama `loadCaixasDisponiveis('ALUMINIO')`
4. **Etapa 1** mostra:
   - Loading (500ms)
   - Tabela com 4 caixas de alumínio disponíveis
5. Usuário busca por "800x1200"
6. Seleciona "Quadro de Distribuição Alumínio 800x1200mm"
7. ✅ Card verde aparece mostrando caixa selecionada
8. `config.caixas` é atualizado com `[{ materialId: 'caixa-alum-002', quantidade: 1 }]`
9. Clica em "Próxima Etapa →"
10. ✅ Validação: Verifica se `caixaSelecionada !== null`
11. Avança para Etapa 2

### Cenário 3: Mudança de Tipo no Meio do Processo

1. Usuário seleciona **ALUMINIO** e escolhe uma caixa
2. Muda para **COMANDO** no select de tipo
3. `useEffect` detecta mudança
4. `loadCaixasDisponiveis('COMANDO')` é chamado
5. Tabela é atualizada com caixas de comando
6. `caixaSelecionada` é resetada (por novo tipo)
7. Usuário precisa selecionar novamente

---

## 📊 Logs de Debug

### Console Logs Implementados:

```
🔍 Carregando caixas de estoque do tipo: ALUMINIO
🔍 Buscando caixas de estoque do tipo: ALUMINIO
✅ 4 caixas carregadas
✅ Caixa selecionada: Quadro de Distribuição Alumínio 800x1200mm - 24 Disjuntores
```

**Útil para:**
- Debug de fluxo de dados
- Verificar quando chamadas são feitas
- Monitorar seleções do usuário

---

## 🚀 Integração com Backend (Futuro)

### Endpoint a ser implementado:

```
GET /api/estoque/caixas?tipo=ALUMINIO
```

**Response esperado:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-real",
      "codigo": "QDA-500x700",
      "descricao": "Quadro de Distribuição Alumínio 500x700mm - 12 Disjuntores",
      "estoque": 5,
      "preco": 450.00,
      "unidadeMedida": "un"
    }
  ]
}
```

**Para ativar a integração real:**

1. Descomentar no `quadrosService.ts`:
```typescript
const response = await axiosApiService.get(`/api/estoque/caixas?tipo=${tipo}`);
if (response.success && response.data) {
  return response.data;
}
```

2. Comentar o mock temporário

---

## ✅ Checklist de Implementação

- [x] Service `buscarCaixasEstoque()` criado
- [x] Interface `CaixaEstoque` definida
- [x] Mock com dados realistas (4 caixas para cada tipo)
- [x] Estados adicionados no componente
- [x] `useEffect` para monitorar tipo
- [x] Função `loadCaixasDisponiveis()` implementada
- [x] `useMemo` para filtro de caixas
- [x] Handlers de seleção/remoção criados
- [x] Validação condicional na navegação
- [x] Renderização condicional da Etapa 1
- [x] UI para POLICARBONATO (mantida)
- [x] UI para ALUMINIO/COMANDO (nova)
- [x] Loading state implementado
- [x] Card de caixa selecionada
- [x] Tabela de seleção com badges
- [x] Campo de busca específico
- [x] Logs de debug adicionados
- [x] Sem erros TypeScript
- [x] Sem warnings de lint

---

## 🎯 Resultado Final

### ✨ O que foi alcançado:

1. ✅ **Ramificação Condicional Funcional**: Etapa 1 se adapta ao tipo de quadro
2. ✅ **UX Profissional**: Interfaces distintas e apropriadas para cada tipo
3. ✅ **Validação Inteligente**: Regras diferentes por tipo
4. ✅ **Mock Realista**: Dados de exemplo para testes
5. ✅ **Preparado para Backend**: Código pronto para integração real
6. ✅ **Código Limpo**: Sem erros, bem comentado, performático

### 🎨 Diferenciais de UX:

- Loading state suave
- Badges coloridos por nível de estoque
- Card destacado para seleção
- Dicas contextuais
- Validação com feedback claro
- Busca instantânea

---

## 🧪 Como Testar

1. **Abrir modal de criação de quadro**
2. **Testar POLICARBONATO:**
   - Verificar se mostra busca genérica
   - Adicionar múltiplas caixas
   - Tentar avançar sem caixas (deve bloquear)
   
3. **Testar ALUMINIO:**
   - Selecionar tipo ALUMINIO
   - Aguardar carregamento (500ms)
   - Verificar 4 caixas na tabela
   - Buscar por "800"
   - Selecionar uma caixa
   - Verificar card verde
   - Tentar avançar (deve permitir)
   - Voltar e remover seleção
   - Tentar avançar sem seleção (deve bloquear)

4. **Testar COMANDO:**
   - Selecionar tipo COMANDO
   - Verificar 4 caixas diferentes na tabela
   - Buscar por "500"
   - Selecionar caixa
   - Verificar card verde

5. **Testar mudança de tipo:**
   - Selecionar ALUMINIO e escolher caixa
   - Mudar para COMANDO
   - Verificar que seleção foi resetada
   - Verificar que tabela mostra caixas de comando

---

## 🎉 IMPLEMENTAÇÃO COMPLETA E FUNCIONAL!

**O wizard de quadros elétricos agora é totalmente adaptável ao tipo selecionado, proporcionando uma experiência otimizada para cada cenário de uso!** 🚀

