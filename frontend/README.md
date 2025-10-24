# Frontend - S3E System PRO

Interface React do sistema de gestão S3E.

## 🏗️ Estrutura

```
src/
├── components/     # Componentes React
│   ├── Sidebar.tsx
│   ├── Dashboard.tsx
│   ├── Orcamentos.tsx
│   ├── Catalogo.tsx
│   └── ... (outros módulos)
│
├── types/          # Tipos TypeScript
│   └── index.ts    # Definições centralizadas
│
├── data/           # Dados mockados
│   └── mockData.ts
│
├── constants/      # Constantes
│   └── index.tsx   # Ícones e links de navegação
│
├── utils/          # Funções utilitárias
│
├── assets/         # Imagens, fontes, etc
│
├── App.tsx         # Componente raiz
└── index.tsx       # Entry point
```

## 🚀 Rodando o Projeto

```bash
# Instalar dependências
npm install

# Modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 📦 Dependências Principais

- `react` & `react-dom` - UI
- `typescript` - Tipagem
- `vite` - Build tool
- `tailwindcss` - Estilização

## 🎨 Design System

### Cores (TailwindCSS)
- **brand-blue**: Azul primário (#2563eb)
- **brand-gray**: Tons de cinza
- **brand-red**: Vermelho para alertas

### Componentes Reutilizáveis
- StatCard - Cards de estatísticas
- Sidebar - Menu lateral
- SettingsModal - Modal de configurações

## 📝 Convenções de Código

- Componentes em PascalCase
- Arquivos de tipos em camelCase
- Usar tipos TypeScript sempre que possível
- Comentários em português
- Código em inglês

## 🔄 Fluxo de Dados

O projeto usa React State para gerenciamento de estado local. No futuro, poderá ser integrado com:
- Context API
- Zustand
- Redux Toolkit

## 🛣️ Rotas

O sistema usa navegação baseada em estado (`activeView`). Principais views:
- Dashboard
- Orçamentos
- Catálogo
- Serviços
- Movimentações
- Histórico
- Compras
- Materiais
- Projetos
- Obras
- Clientes
- Fornecedores
