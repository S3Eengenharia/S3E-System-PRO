# Backend - S3E System PRO

API REST do sistema de gestão S3E.

## 🏗️ Estrutura (Planejada)

```
src/
├── controllers/    # Lógica dos endpoints
│   ├── auth.controller.ts
│   ├── budget.controller.ts
│   ├── catalog.controller.ts
│   └── ...
│
├── models/         # Modelos de dados (ORM)
│   ├── User.ts
│   ├── Budget.ts
│   ├── Product.ts
│   └── ...
│
├── routes/         # Definição de rotas
│   ├── auth.routes.ts
│   ├── budget.routes.ts
│   └── ...
│
├── services/       # Lógica de negócio
│   ├── auth.service.ts
│   ├── budget.service.ts
│   └── ...
│
├── middlewares/    # Middlewares
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validation.middleware.ts
│
├── config/         # Configurações
│   ├── database.ts
│   ├── env.ts
│   └── ...
│
├── utils/          # Utilitários
│   ├── logger.ts
│   ├── validators.ts
│   └── ...
│
├── types/          # Tipos TypeScript
│   └── index.ts
│
└── app.ts          # Aplicação Express
```

## 🚀 Tecnologias (Planejadas)

- **Node.js** - Runtime
- **Express** - Framework web
- **TypeScript** - Tipagem
- **PostgreSQL** - Banco de dados principal
- **Prisma** - ORM
- **JWT** - Autenticação
- **Zod** - Validação de dados
- **Winston** - Logging

## 📝 APIs (Em Desenvolvimento)

### Autenticação
- POST `/api/auth/login`
- POST `/api/auth/register`
- POST `/api/auth/refresh`
- POST `/api/auth/logout`

### Orçamentos
- GET `/api/budgets`
- POST `/api/budgets`
- GET `/api/budgets/:id`
- PUT `/api/budgets/:id`
- DELETE `/api/budgets/:id`

### Catálogo
- GET `/api/catalog/products`
- POST `/api/catalog/products`
- GET `/api/catalog/kits`
- POST `/api/catalog/kits`

### Clientes
- GET `/api/clients`
- POST `/api/clients`
- GET `/api/clients/:id`
- PUT `/api/clients/:id`

### Projetos
- GET `/api/projects`
- POST `/api/projects`
- GET `/api/projects/:id`
- PUT `/api/projects/:id`

## 🔐 Segurança

- Autenticação JWT
- Rate limiting
- Validação de input
- SQL injection prevention
- XSS protection
- CORS configurado

## 📊 Banco de Dados

### Modelos Principais
- Users
- Clients
- Budgets
- Products
- Kits
- Projects
- Materials
- Suppliers
- PurchaseOrders

## 🛠️ Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build
npm run build

# Executar testes
npm test

# Executar linter
npm run lint
```

## 🌍 Variáveis de Ambiente

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/s3e_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
CORS_ORIGIN=http://localhost:5173
```

## 📝 Padrões de Código

- Arquitetura em camadas (Controller -> Service -> Model)
- Dependency Injection quando necessário
- Tratamento de erros centralizado
- Logging estruturado
- Validação de dados em todas as entradas
- Testes unitários e de integração
