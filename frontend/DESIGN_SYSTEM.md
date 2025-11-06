# 🎨 Design System S3E Engenharia

## Guia de Uso - Dark Mode Consistente

Este documento define o **padrão de cores, componentes e classes CSS** para manter a consistência visual em **modo claro e escuro** em todo o sistema.

---

## 📦 Cores do Sistema

### Cores Principais (Dark Mode)
```css
--dark-bg: #0F172A        /* Fundo principal */
--dark-card: #1E293B      /* Cards e containers */
--dark-border: #334155    /* Bordas */
--dark-text: #F8FAFC      /* Texto principal */
--dark-text-secondary: #CBD5E1  /* Texto secundário */
```

### Cores de Ação
```css
Primário (Indigo): #6366F1
Sucesso (Green): #22C55E
Perigo (Red): #EF4444
Aviso (Orange): #F97316
Info (Blue): #3B82F6
```

---

## 🔘 Botões

### Classes Disponíveis

#### Botão Primário
```html
<button className="btn-primary">
  Ação Principal
</button>
```
**Uso**: Ações principais (Salvar, Criar, Confirmar)

#### Botão Secundário
```html
<button className="btn-secondary">
  Cancelar
</button>
```
**Uso**: Ações secundárias (Cancelar, Voltar)

#### Botões de Ação
```html
<button className="btn-success">Aprovar</button>
<button className="btn-danger">Excluir</button>
<button className="btn-warning">Alerta</button>
<button className="btn-info">Informação</button>
```

#### Botões de Card (pequenos)
```html
<button className="btn-action-edit">
  <PencilIcon className="w-4 h-4" />
  Editar
</button>

<button className="btn-action-delete">
  <TrashIcon className="w-4 h-4" />
  Excluir
</button>

<button className="btn-action-deactivate">
  <BanIcon className="w-4 h-4" />
  Desativar
</button>
```

---

## 📝 Inputs e Forms

### Input de Texto
```html
<input 
  type="text" 
  className="input-field"
  placeholder="Digite aqui..."
/>
```

### Select
```html
<select className="select-field">
  <option>Opção 1</option>
  <option>Opção 2</option>
</select>
```

### Textarea
```html
<textarea 
  className="textarea-field"
  rows={4}
  placeholder="Descrição..."
/>
```

---

## 🃏 Cards

### Card Principal
```html
<div className="card-primary">
  <h3>Título do Card</h3>
  <p>Conteúdo...</p>
</div>
```

### Card Secundário
```html
<div className="card-secondary">
  <p>Info adicional</p>
</div>
```

---

## 🏷️ Badges de Status

### Badge Ativo
```html
<span className="badge-status-active">
  <CheckIcon className="w-4 h-4" />
  Ativo
</span>
```

### Badge Inativo
```html
<span className="badge-status-inactive">
  <XIcon className="w-4 h-4" />
  Inativo
</span>
```

### Badge Pendente
```html
<span className="badge-status-pending">
  <ClockIcon className="w-4 h-4" />
  Pendente
</span>
```

### Badge de Tipo
```html
<span className="badge-type">
  <BuildingIcon className="w-4 h-4" />
  Pessoa Jurídica
</span>
```

---

## 🪟 Modais

### Estrutura Padrão
```html
<div className="modal-content">
  {/* Header */}
  <div className="modal-header">
    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text">
      Título do Modal
    </h2>
    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
      Descrição
    </p>
  </div>

  {/* Body */}
  <div className="modal-body">
    <div className="space-y-4">
      {/* Conteúdo do modal */}
    </div>
  </div>

  {/* Footer */}
  <div className="modal-footer">
    <button className="btn-secondary">Cancelar</button>
    <button className="btn-primary">Salvar</button>
  </div>
</div>
```

---

## ⚠️ NÃO FAZER

### ❌ Evite classes que quebram o dark mode:

```html
<!-- NÃO USE -->
<button className="bg-white text-gray-700">❌</button>
<input className="bg-white border-gray-300">❌</input>
<div className="bg-gray-50">❌</div>

<!-- USE -->
<button className="btn-secondary">✅</button>
<input className="input-field">✅</input>
<div className="card-primary">✅</div>
```

---

## 📐 Padrões de Espaçamento

```css
Padding interno: p-4, p-6
Gap entre elementos: gap-3, gap-4
Margin: mt-4, mb-6
Rounded: rounded-lg (8px), rounded-xl (12px), rounded-2xl (16px)
```

---

## 🎯 Checklist para Novos Componentes

- [ ] Usa `card-primary` ou `card-secondary` para containers
- [ ] Inputs usam `input-field`, `select-field` ou `textarea-field`
- [ ] Botões usam classes `btn-*` apropriadas
- [ ] Badges usam classes `badge-*`
- [ ] Modais usam estrutura `modal-*`
- [ ] Cores de texto: `text-gray-900 dark:text-dark-text`
- [ ] Fundos: `bg-white dark:bg-dark-card`
- [ ] Bordas: `border-gray-200 dark:border-dark-border`
- [ ] Testado em modo claro E escuro

---

## 🚀 Aplicando em Componentes Existentes

### Exemplo de Migração

**Antes:**
```tsx
<button className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg">
  Cancelar
</button>
```

**Depois:**
```tsx
<button className="btn-secondary">
  Cancelar
</button>
```

---

## 📞 Suporte

Para dúvidas sobre o Design System, consulte:
- Este documento (`DESIGN_SYSTEM.md`)
- Arquivo de estilos: `frontend/src/index.css`
- Configuração Tailwind: `frontend/tailwind.config.js`

**Última atualização**: 06/11/2025

