# 🚀 Inicialização Rápida - S3E System

## Pré-requisitos
- Node.js 18+ instalado
- NPM ou Yarn
- Git

---

## ⚡ Start Rápido (3 comandos)

### 1. Instalar Dependências (se ainda não instalou)
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Iniciar Backend
```bash
cd backend
npm run dev
```
**Rodando em:** http://localhost:3000  
**Deixe este terminal aberto!**

### 3. Iniciar Frontend (novo terminal)
```bash
cd frontend
npm run dev
```
**Rodando em:** http://localhost:5173  
**Abra no navegador!**

---

## 🎯 Primeira Execução

### Criar Primeiro Usuário (Opcional - para testar API)

**Método 1: Usar Prisma Studio** (Recomendado)
```bash
cd backend
npx prisma studio
```
Acesse: http://localhost:5555
- Clique em "User"
- Clique em "Add record"
- Preencha os campos
- **IMPORTANTE:** A senha deve ser um hash bcrypt (use site: https://bcrypt-generator.com)

**Método 2: Usar API**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@s3e.com",
    "password": "senha123",
    "name": "Administrador S3E",
    "role": "admin"
  }'
```

---

## 🧪 Testar Funcionalidades Novas

### 1. Módulo Financeiro
1. Abra a aplicação: http://localhost:5173
2. Clique em **"Financeiro"** no menu lateral
3. Navegue pelas abas:
   - Vendas
   - Contas a Receber
   - Contas a Pagar
   - Faturamento
   - Status Cobranças

### 2. Importação de XML (Compras)
1. Clique em **"Compras"** no menu
2. Clique em **"Registrar Nova Compra"**
3. No card azul, clique em **"Importar XML"**
4. Selecione um arquivo XML de NF-e
5. ✨ Veja a mágica acontecer!
6. Complete e salve

### 3. Emissão de NF-e
1. Clique em **"Emissão NF-e"** no menu
2. Siga o wizard:
   - Selecione um projeto
   - Preencha dados fiscais
   - Revise e confirme

### 4. Visualizar Banco de Dados
```bash
cd backend
npx prisma studio
```
- Veja todos os dados em interface visual
- Edite registros
- Valide relacionamentos

---

## 🛠️ Comandos Úteis

### Backend
```bash
cd backend

# Desenvolvimento
npm run dev              # Iniciar com hot-reload

# Build e produção
npm run build            # Compilar TypeScript
npm start                # Iniciar em produção (após build)

# Prisma
npx prisma studio        # Interface visual do banco
npx prisma migrate dev   # Criar nova migração
npx prisma generate      # Gerar Prisma Client
npx prisma db push       # Sincronizar schema (sem migração)
```

### Frontend
```bash
cd frontend

npm run dev              # Desenvolvimento
npm run build            # Build para produção
npm run preview          # Preview do build
```

### Docker (Sistema Completo)
```bash
# Na raiz do projeto
docker-compose up        # Iniciar tudo
docker-compose down      # Parar tudo
```

---

## 📁 Estrutura do Projeto

```
S3E-System-PRO/
│
├── backend/                    # API Node.js + Prisma
│   ├── prisma/
│   │   ├── schema.prisma      # ✨ NOVO - Schema do banco
│   │   ├── migrations/        # ✨ NOVO - Histórico de migrações
│   │   └── dev.db             # ✨ NOVO - Banco SQLite
│   ├── src/
│   │   ├── controllers/       # ✨ NOVO - Lógica de negócio
│   │   ├── routes/            # ✨ NOVO - Rotas da API
│   │   ├── middlewares/       # ✨ ATUALIZADO - Auth JWT
│   │   └── app.ts             # ✨ ATUALIZADO - Server principal
│   └── package.json           # ✨ ATUALIZADO
│
├── frontend/                   # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── Financeiro.tsx # ✨ NOVO
│   │   │   ├── EmissaoNFe.tsx # ✨ NOVO
│   │   │   ├── Compras.tsx    # ✨ ATUALIZADO (XML)
│   │   │   └── ...
│   │   ├── utils/             # ✨ NOVO
│   │   │   ├── xmlParser.ts   # Parse de XML
│   │   │   └── pdfGenerator.ts # Gerar PDF
│   │   ├── App.tsx            # ✨ ATUALIZADO
│   │   └── constants/         # ✨ ATUALIZADO (novos ícones)
│   └── package.json           # ✨ ATUALIZADO
│
├── VALIDACAO_SISTEMA.md                    # ✨ NOVO
├── GUIA_NOVAS_FUNCIONALIDADES.md           # ✨ NOVO
├── IMPLEMENTACAO_BACKEND_FINANCEIRO.md     # ✨ NOVO
├── RESUMO_EXECUTIVO_IMPLEMENTACAO.md       # ✨ NOVO
└── INICIALIZACAO_RAPIDA.md                 # ✨ NOVO (este arquivo)
```

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar se porta 3000 está livre
netstat -ano | findstr :3000

# Verificar node_modules
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend não inicia
```bash
# Limpar cache
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Erro no Prisma
```bash
cd backend
npx prisma generate     # Regenerar cliente
npx prisma migrate dev  # Aplicar migrações
```

### Erro de CORS
Verifique `backend/src/app.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:5173', // Deve corresponder ao frontend
  credentials: true
}));
```

---

## 📖 Documentação Completa

### Para Entender o Sistema:
1. **VALIDACAO_SISTEMA.md** - Visão geral do alinhamento
2. **GUIA_NOVAS_FUNCIONALIDADES.md** - Como usar cada feature
3. **IMPLEMENTACAO_BACKEND_FINANCEIRO.md** - Detalhes técnicos

### Para Desenvolvedores:
- **Schema Prisma:** `backend/prisma/schema.prisma`
- **Controllers:** `backend/src/controllers/*.ts`
- **Rotas:** `backend/src/routes/*.ts`

---

## ⚠️ Importante Antes de Produção

### 1. Variáveis de Ambiente
Criar `backend/.env.production`:
```env
DATABASE_URL="postgresql://user:pass@host:5432/s3e_prod"
JWT_SECRET="chave-super-secreta-minimo-32-caracteres"
NODE_ENV="production"
CORS_ORIGIN="https://seu-dominio.com"
PORT=3000
```

### 2. Migrar para PostgreSQL
Alterar em `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Executar: `npx prisma migrate dev`

### 3. Build para Produção
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
# Deploy pasta 'dist' para servidor web
```

---

## 💡 Dicas de Uso

### 1. Durante Desenvolvimento
- Mantenha **Prisma Studio aberto** para visualizar dados
- Use **DevTools do navegador** (F12) para debug
- Verifique **logs do backend** no terminal
- Use **Postman** ou **Insomnia** para testar API

### 2. XML de Teste
Se não tiver um XML real de NF-e para testar:
- Baixe exemplos em: https://www.nfe.fazenda.gov.br
- Ou use XMLs de teste da pasta de exemplos (se houver)

### 3. Performance
- Banco SQLite é rápido para desenvolvimento
- Para produção com muitos dados, use PostgreSQL
- Considere índices nas colunas mais consultadas

---

## 📞 Suporte e Recursos

### Links Úteis:
- **Prisma Docs:** https://www.prisma.io/docs
- **Express Docs:** https://expressjs.com
- **React Docs:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org

### Comunidade:
- **Prisma Discord:** https://pris.ly/discord
- **React Brasil:** https://react.dev.br

---

## ✅ Checklist Pré-Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Banco PostgreSQL configurado
- [ ] JWT_SECRET forte e seguro
- [ ] Build do backend sem erros
- [ ] Build do frontend sem erros
- [ ] CORS configurado para domínio de produção
- [ ] Backup do banco configurado
- [ ] SSL/HTTPS configurado
- [ ] Logs configurados
- [ ] Monitoramento configurado

---

**Desenvolvido por S3E Engenharia** ⚡  
**Versão:** 1.0.0  
**Data:** Outubro 2025

