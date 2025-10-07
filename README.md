# S3E System PRO

Sistema profissional de gestão para empresas de engenharia elétrica.

## 📁 Estrutura do Projeto

```
S3E-System-PRO/
├── frontend/          # Aplicação React + TypeScript
│   ├── public/        # Arquivos estáticos
│   └── src/           # Código fonte do frontend
│       ├── components/ # Componentes React
│       ├── types/      # Definições TypeScript
│       ├── data/       # Dados mockados
│       ├── constants/  # Constantes e ícones
│       ├── utils/      # Funções utilitárias
│       └── assets/     # Recursos estáticos
│
├── backend/           # API Node.js (Em desenvolvimento)
│   └── src/           # Código fonte do backend
│       ├── controllers/ # Controladores
│       ├── models/      # Modelos de dados
│       ├── routes/      # Rotas da API
│       ├── services/    # Lógica de negócio
│       ├── middlewares/ # Middlewares
│       ├── config/      # Configurações
│       ├── utils/       # Utilitários
│       └── types/       # Tipos TypeScript
│
└── docs/              # Documentação (Em desenvolvimento)
```

## 🚀 Começando

### 🐳 Com Docker (Recomendado)

```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Iniciar todos os serviços
docker-compose up

# Ou com Make
make dev
```

**Acessar:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PgAdmin: http://localhost:5050

📖 [Guia completo do Docker](DOCKER_GUIDE.md)

### 💻 Sem Docker

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

#### Backend

```bash
cd backend
npm install
npm run dev
```

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização

### Backend (Planejado)
- **Node.js** - Runtime
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **PostgreSQL** - Banco de dados

## 📝 Módulos

- **Dashboard** - Visão geral do sistema
- **Orçamentos** - Gestão de orçamentos
- **Catálogo** - Produtos e kits
- **Serviços** - Cadastro de serviços
- **Movimentações** - Controle de estoque
- **Histórico** - Logs do sistema
- **Compras** - Pedidos de compra
- **Materiais** - Gestão de materiais
- **Projetos** - Gestão de projetos
- **Obras** - Controle de obras
- **Clientes** - CRM de clientes
- **Fornecedores** - Cadastro de fornecedores

## 👥 Contribuindo

Este é um projeto privado. Para contribuir, entre em contato com a equipe.

## 📄 Licença

Propriedade da S3E Engenharia Elétrica.