# 🔄 Guia de Migração para Design System

## Como migrar componentes existentes para o novo Design System

### 📝 Passo a Passo

#### 1. **Badges de Status**

**ANTES:**
```tsx
<span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  Ativo
</span>
```

**DEPOIS:**
```tsx
<span className="badge-status-active">
  Ativo
</span>
```

#### 2. **Cards**

**ANTES:**
```tsx
<div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
  Conteúdo
</div>
```

**DEPOIS:**
```tsx
<div className="card-primary">
  Conteúdo
</div>
```

#### 3. **Botões em Modais**

**ANTES:**
```tsx
<button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg">
  Cancelar
</button>
<button className="px-6 py-2 bg-blue-600 text-white rounded-lg">
  Salvar
</button>
```

**DEPOIS:**
```tsx
<button className="btn-secondary">Cancelar</button>
<button className="btn-primary">Salvar</button>
```

#### 4. **Botões de Ação em Cards**

**ANTES:**
```tsx
<button className="px-3 py-1.5 text-xs bg-blue-100 text-blue-800 rounded-lg">
  <PencilIcon className="w-4 h-4" />
  Editar
</button>
```

**DEPOIS:**
```tsx
<button className="btn-action-edit">
  <PencilIcon className="w-4 h-4" />
  Editar
</button>
```

#### 5. **Estrutura de Modal**

**ANTES:**
```tsx
<div className="bg-white rounded-xl shadow-2xl">
  <div className="p-6 border-b border-gray-200">
    <h2 className="text-xl font-bold">Título</h2>
  </div>
  <div className="p-6">
    Conteúdo
  </div>
  <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
    <button>Cancelar</button>
    <button>Salvar</button>
  </div>
</div>
```

**DEPOIS:**
```tsx
<div className="modal-content">
  <div className="modal-header">
    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">Título</h2>
  </div>
  <div className="modal-body">
    Conteúdo
  </div>
  <div className="modal-footer">
    <button className="btn-secondary">Cancelar</button>
    <button className="btn-primary">Salvar</button>
  </div>
</div>
```

#### 6. **Inputs e Selects**

**ANTES:**
```tsx
<input 
  type="text"
  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2"
/>
```

**DEPOIS:**
```tsx
<input 
  type="text"
  className="input-field"
/>
```

---

## 🔍 Buscar e Substituir (Padrões Comuns)

Use seu editor para fazer replace global:

### Botões Brancos/Cinzas
```
Buscar: className=".*bg-white.*border.*text-gray-700.*rounded-lg
Substituir: className="btn-secondary
```

### Badges Verde (Ativo)
```
Buscar: className=".*bg-green-100.*text-green-800
Substituir: className="badge-status-active
```

### Badges Vermelho (Inativo/Erro)
```
Buscar: className=".*bg-red-100.*text-red-800
Substituir: className="badge-status-inactive
```

### Badges Amarelo (Pendente)
```
Buscar: className=".*bg-yellow-100.*text-yellow-800
Substituir: className="badge-status-pending
```

---

## 📦 Componentes Prioritários para Migrar

1. ✅ **Clientes** - CONCLUÍDO
2. ⏳ **Fornecedores** - Pendente
3. ⏳ **Compras** - Pendente  
4. ⏳ **Obras** - Pendente
5. ⏳ **Vendas** - Pendente
6. ⏳ **Modais de criação** - Pendente
7. ⏳ **Configurações** - Pendente

---

## 🎨 Classes Disponíveis - Referência Rápida

### Botões
- `btn-primary` - Ação principal (roxo)
- `btn-secondary` - Ação secundária (cinza com borda)
- `btn-success` - Sucesso (verde)
- `btn-danger` - Perigo (vermelho)
- `btn-warning` - Aviso (laranja)
- `btn-info` - Informação (azul)
- `btn-action-edit` - Editar em card (azul claro)
- `btn-action-delete` - Excluir em card (vermelho claro)
- `btn-action-deactivate` - Desativar em card (laranja claro)

### Forms
- `input-field` - Input de texto
- `select-field` - Select/dropdown
- `textarea-field` - Textarea

### Cards
- `card-primary` - Card principal
- `card-secondary` - Card secundário

### Badges
- `badge-status-active` - Status ativo (verde)
- `badge-status-inactive` - Status inativo (vermelho)
- `badge-status-pending` - Status pendente (amarelo)
- `badge-type` - Tipo/categoria (roxo)

### Modal
- `modal-content` - Container do modal
- `modal-header` - Cabeçalho
- `modal-body` - Corpo
- `modal-footer` - Rodapé com botões

---

## ⚠️ Importante

- **SEMPRE** teste em modo claro E escuro após migrar
- Use `text-gray-900 dark:text-dark-text` para textos principais
- Use `text-gray-600 dark:text-dark-text-secondary` para textos secundários
- Use `bg-white dark:bg-dark-card` para fundos de cards
- Use `border-gray-200 dark:border-dark-border` para bordas

---

## 🚀 Exemplo Completo de Componente Migrado

Ver: `frontend/src/components/Clientes.tsx`

