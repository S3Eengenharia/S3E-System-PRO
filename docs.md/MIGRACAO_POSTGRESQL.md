# 🚀 Migração SQLite → PostgreSQL - Concluída!

## ✅ O que foi feito:

### 1. **Instalações Realizadas**
- ✅ `pg` (^8.16.3) - Driver PostgreSQL
- ✅ `dotenv-cli` (^10.0.0) - Gerenciador de múltiplos arquivos .env

### 2. **Arquivos Modificados**

#### `backend/prisma/schema.prisma`
```prisma
datasource db {
  provider = "postgresql"  // ← Alterado de "sqlite"
  url      = env("DATABASE_URL")
}
```

#### `backend/package.json`
Scripts atualizados e adicionados:
```json
"dev": "dotenv -e .env.development -- tsx watch src/app.ts",        // ← Modificado
"start": "dotenv -e .env.production -- node dist/app.js",           // ← Modificado
"prisma:migrate:dev": "dotenv -e .env.development -- npx prisma migrate dev",
"prisma:deploy:prod": "dotenv -e .env.production -- npx prisma migrate deploy",
"prisma:studio:dev": "dotenv -e .env.development -- npx prisma studio",
"prisma:generate": "npx prisma generate"
```

#### `backend/.gitignore`
Adicionadas linhas para proteger arquivos sensíveis:
```
.env.development
.env.production
```

### 3. **Arquivos Criados**

#### `backend/.env.development` (SEU AMBIENTE LOCAL)
```env
DATABASE_URL="postgresql://meuuser:minhasenha@localhost:5432/s3e_portfolio_dev"
PORT=3001
NODE_ENV=development
JWT_SECRET=seu_secret_dev_aqui_12345
```

#### `backend/.env.production` (SERVIDOR S3E)
```env
DATABASE_URL="postgresql://s3e_prod:senha_secreta_s3e@IP_DO_SERVIDOR_S3E:5432/s3e_producao"
PORT=3001
NODE_ENV=production
JWT_SECRET=seu_secret_producao_super_seguro_aqui
```

---

## 📋 PRÓXIMOS PASSOS - IMPORTANTE!

### **PASSO 1: Configurar o PostgreSQL Local**

Antes de aplicar a migração, você precisa ter o PostgreSQL instalado e configurado:

1. **Instalar PostgreSQL** (se ainda não tiver):
   - Windows: https://www.postgresql.org/download/windows/
   - Ou via Docker: `docker run --name postgres-s3e -e POSTGRES_PASSWORD=minhasenha -p 5432:5432 -d postgres`

2. **Criar o banco de dados de desenvolvimento**:
```bash
# Conectar ao PostgreSQL (via psql ou pgAdmin)
psql -U postgres

# Criar o usuário (se necessário)
CREATE USER meuuser WITH PASSWORD 'minhasenha';

# Criar o banco de dados
CREATE DATABASE s3e_portfolio_dev OWNER meuuser;

# Dar permissões
GRANT ALL PRIVILEGES ON DATABASE s3e_portfolio_dev TO meuuser;
```

### **PASSO 2: Atualizar Credenciais no .env.development**

Edite o arquivo `backend/.env.development` com suas credenciais **REAIS** do PostgreSQL:

```env
# SUBSTITUIR pelos dados reais do seu PostgreSQL local!
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/s3e_portfolio_dev"
```

**Formato da URL:**
```
postgresql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
```

Exemplos:
- `postgresql://postgres:123456@localhost:5432/s3e_dev`
- `postgresql://admin:admin@localhost:5432/s3e_portfolio`

### **PASSO 3: Aplicar a Primeira Migração**

⚠️ **ATENÇÃO**: Este comando irá deletar o histórico de migrações do SQLite e criar novas migrações para PostgreSQL.

```bash
cd backend

# Opção 1: Resetar completamente e criar nova migração inicial
rm -rf prisma/migrations/
npm run prisma:migrate:dev -- --name init_postgresql

# Opção 2: Se quiser manter o histórico, apenas aplicar
npm run prisma:migrate:dev
```

### **PASSO 4: Verificar se funcionou**

```bash
# Abrir o Prisma Studio para visualizar o banco
npm run prisma:studio:dev
```

Isso abrirá uma interface web em `http://localhost:5555` onde você pode ver as tabelas criadas.

---

## 🔧 Comandos Disponíveis

### **Ambiente de Desenvolvimento (Portfólio)**
```bash
# Criar/Aplicar migrações
npm run prisma:migrate:dev

# Criar migração com nome específico
npm run prisma:migrate:dev -- --name nome_da_migracao

# Abrir Prisma Studio
npm run prisma:studio:dev

# Gerar cliente Prisma
npm run prisma:generate
```

### **Ambiente de Produção (S3E)**
```bash
# Aplicar migrações em produção (NÃO cria novas migrações)
npm run prisma:deploy:prod
```

---

## ⚠️ IMPORTANTE - Dados do SQLite

Seus dados antigos do SQLite estão em `backend/prisma/dev.db`. 

**Opções para migrar os dados:**

### **Opção 1: Exportar/Importar Manualmente**
1. Usar Prisma Studio no SQLite antigo
2. Exportar os dados manualmente
3. Importar no PostgreSQL novo

### **Opção 2: Script de Migração** (Recomendado para muitos dados)
Criar um script TypeScript para migrar os dados:

```typescript
// migrate-data.ts
import { PrismaClient as SqlitePrisma } from './old-client'
import { PrismaClient as PostgresPrisma } from '@prisma/client'

async function migrate() {
  const sqlite = new SqlitePrisma()
  const postgres = new PostgresPrisma()
  
  // Migrar usuários
  const users = await sqlite.user.findMany()
  for (const user of users) {
    await postgres.user.create({ data: user })
  }
  
  // Repetir para outras tabelas...
}

migrate()
```

### **Opção 3: Começar do Zero**
Se for ambiente de desenvolvimento sem dados importantes, pode começar do zero.

---

## 🚀 Comando para Iniciar a Migração AGORA

```bash
cd backend
npm run prisma:migrate:dev -- --name init_postgresql
```

Este comando irá:
1. ✅ Ler o `.env.development`
2. ✅ Conectar ao PostgreSQL local
3. ✅ Criar todas as tabelas do schema
4. ✅ Gerar o Prisma Client
5. ✅ Aplicar a migração

---

## 📞 Suporte

Se encontrar algum erro:

1. **Verificar conexão PostgreSQL**: `psql -U meuuser -d s3e_portfolio_dev`
2. **Verificar logs**: O Prisma mostrará detalhes do erro
3. **Verificar .env.development**: Credenciais corretas?

---

## ✨ Sucesso!

Após aplicar a migração, seu sistema estará rodando em PostgreSQL! 🎉

### **Comandos para Desenvolvimento:**

```bash
# Rodar servidor em modo desenvolvimento (carrega .env.development)
npm run dev

# Acessar o banco de dados visualmente
npm run prisma:studio:dev
```

### **Comandos para Produção:**

```bash
# Build do projeto
npm run build

# Rodar em produção (carrega .env.production)
npm run start
```

**Nota:** Os scripts `dev` e `start` agora carregam automaticamente os arquivos de ambiente corretos!

