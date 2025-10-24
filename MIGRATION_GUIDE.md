# Guia de Migração - Arquitetura Sênior

Este documento descreve a nova estrutura do projeto e os passos para completar a migração.

## ✅ Concluído

### Estrutura de Pastas Criada

- ✅ `frontend/` - Aplicação React
  - ✅ `src/components/` - Componentes (Catalogo.tsx movido)
  - ✅ `src/types/` - Tipos TypeScript
  - ✅ `src/data/` - Dados mockados
  - ✅ `src/constants/` - Constantes
  - ✅ `src/utils/` - Utilitários
  - ✅ `src/assets/` - Assets
  - ✅ `public/` - Arquivos públicos

- ✅ `backend/` - API Node.js
  - ✅ `src/controllers/`
  - ✅ `src/models/`
  - ✅ `src/routes/`
  - ✅ `src/services/`
  - ✅ `src/middlewares/`
  - ✅ `src/config/`
  - ✅ `src/utils/`
  - ✅ `src/types/`

### Arquivos Criados/Movidos

- ✅ `frontend/src/App.tsx`
- ✅ `frontend/src/index.tsx`
- ✅ `frontend/src/types/index.ts`
- ✅ `frontend/src/constants/index.tsx`
- ✅ `frontend/src/data/mockData.ts`
- ✅ `frontend/src/components/Catalogo.tsx`
- ✅ `frontend/index.html`
- ✅ `frontend/package.json`
- ✅ `frontend/vite.config.ts`
- ✅ `frontend/tsconfig.json`
- ✅ `backend/package.json`
- ✅ `backend/tsconfig.json`
- ✅ `backend/src/app.ts`
- ✅ `backend/.env.example`
- ✅ `backend/.gitignore`

### Documentação

- ✅ `README.md` (raiz)
- ✅ `frontend/README.md`
- ✅ `backend/README.md`

## 📋 Pendente - Ações Manuais Necessárias

### 1. Mover Componentes Restantes

Copie TODOS os arquivos `.tsx` da pasta `components/` (raiz) para `frontend/src/components/`:

```powershell
# No PowerShell (Windows)
Copy-Item -Path ".\components\*.tsx" -Destination ".\frontend\src\components\" -Force
```

Ou manualmente copie cada arquivo:

- `Sidebar.tsx`
- `Dashboard.tsx`
- `Orcamentos.tsx`
- `Movimentacoes.tsx`
- `Historico.tsx`
- `Compras.tsx`
- `Materiais.tsx`
- `Fornecedores.tsx`
- `Clientes.tsx`
- `Projetos.tsx`
- `Obras.tsx`
- `Servicos.tsx`
- `SettingsModal.tsx`
- `CriticalAlerts.tsx`
- `OngoingProjects.tsx`
- `QuickActions.tsx`
- `RecentMovements.tsx`
- `StatCard.tsx`

### 2. Atualizar Imports nos Componentes

Após mover os componentes, atualize os imports em TODOS eles:

DE:

```typescript

import { ... } from '../types';
import { ... } from '../data/mockData';
import { ... } from '../constants';
```

PARA:

```typescript

import { ... } from '../types';
import { ... } from '../data/mockData';
import { ... } from '../constants';
```

(Os paths relativos já estão corretos)

### 3. Limpar Arquivos Antigos (APÓS CONFIRMAR QUE TUDO FUNCIONA)

```powershell
# ATENÇÃO: Só execute após ter certeza que tudo foi copiado!
Remove-Item -Path ".\components\" -Recurse -Force
Remove-Item -Path ".\data\" -Recurse -Force
Remove-Item ".\App.tsx", ".\index.tsx", ".\types.ts", ".\constants.tsx", ".\index.html", ".\vite.config.ts", ".\tsconfig.json"
```

### 4. Instalar Dependências

```bash
# Frontend
cd frontend
npm install

# Backend (quando necessário)
cd ../backend
npm install
```

### 5. Executar o Projeto

```bash
# Frontend
cd frontend
npm run dev
# Acesse: http://localhost:5173

# Backend (quando implementado)
cd backend
npm run dev
# Acesse: http://localhost:3000
```

## 🗂️ Nova Estrutura de Imports

### Frontend

```typescript
// Componentes
import Dashboard from './components/Dashboard';

// Tipos
import { Project, Client } from './types';

// Dados
import { projectsData, clientsData } from './data/mockData';

// Constantes
import { navLinks } from './constants';
```

## 📦 Scripts Disponíveis

### Front

```bash
npm run dev      # Desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview da build
```

### Backend

```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Compilar TypeScript
npm start        # Executar versão compilada
```

## 🔧 Configuração do Backend

1. Copie `.env.example` para `.env` no backend:

```bash
cd backend
cp .env.example .env
```

2. Edite o `.env` com suas credenciais reais

3. Configure o banco de dados PostgreSQL

## ✨ Próximos Passos

1. ✅ Completar migração de componentes
2. ⏳ Configurar banco de dados
3. ⏳ Implementar API endpoints
4. ⏳ Conectar frontend com backend
5. ⏳ Implementar autenticação
6. ⏳ Deploy

## 🐛 Troubleshooting

### Erro: Cannot find module

- Verifique se todos os arquivos foram movidos corretamente
- Verifique os imports relativos
- Rode `npm install` novamente

### Erro: ENOENT index.html

- Certifique-se que `index.html` está em `frontend/index.html`
- Verifique o `vite.config.ts`

### Imports não funcionam

- Verifique os `paths` no `tsconfig.json`
- Reinicie o servidor de desenvolvimento

## 📞 Suporte

Para dúvidas sobre a migração, consulte a documentação nos READMEs de cada pasta.
