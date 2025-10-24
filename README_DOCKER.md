# 🐳 Docker - Início Rápido

## ⚡ TL;DR - Começar Agora

```bash
# 1. Configure
cp .env.example .env

# 2. Inicie
docker-compose up

# Ou com Make
make dev
```

**Pronto! Acesse:**

- Frontend: <http://localhost:5173>
- Backend: <http://localhost:3000>
- PgAdmin: <http://localhost:5050>

## 📋 Pré-requisitos

- ✅ Docker Desktop instalado
- ✅ Docker Compose instalado
- ⭐ Make (opcional, mas recomendado)

## 🎯 Comandos Essenciais

### Com Make (Fácil)

```bash
make dev          # Iniciar desenvolvimento
make down         # Parar tudo
make logs         # Ver logs
make clean        # Limpar tudo
make help         # Ver todos comandos
```

### Sem Make (Direto)

```bash
docker-compose up                    # Iniciar
docker-compose down                  # Parar
docker-compose logs -f              # Logs
docker-compose ps                   # Status
```

## 🏗️ Serviços Incluídos

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| Frontend | 5173 | React App |
| Backend  | 3000 | API Node.js |
| PostgreSQL | 5432 | Banco de dados |
| Redis    | 6379 | Cache |
| PgAdmin  | 5050 | Admin DB (dev) |
| Nginx    |  80  | Proxy (prod) |

## 📚 Documentação

- 📖 [**Guia Docker Completo**](DOCKER_GUIDE.md) ⭐ LEIA PRIMEIRO
- 🚀 [Quick Start](QUICK_START.md)
- 🏛️ [Arquitetura](ARCHITECTURE.md)
- 🔄 [Migração](MIGRATION_GUIDE.md)
- ✅ [Setup Completo](SETUP_COMPLETE.md)

## 🛠️ Desenvolvimento

### Estrutura Multi-Serviço

```yaml
services:
  postgres    # Banco de dados
  redis       # Cache
  backend     # API
  frontend    # React App
  nginx       # Reverse Proxy (prod)
  pgadmin     # DB Admin (dev)
```

### Hot Reload Automático

- ✅ Frontend: Vite HMR
- ✅ Backend: tsx watch
- ✅ Volumes configurados

### Variáveis de Ambiente

Edite `.env` para customizar:

```env
FRONTEND_PORT=5173
BACKEND_PORT=3000
DB_NAME=s3e_db
JWT_SECRET=seu-secret
```

## 🚀 Produção

```bash
# Build produção
make build
make prod

# Ou direto
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 💾 Banco de Dados

### Backup

```bash
make backup
```

### Restore

```bash
make restore BACKUP_FILE=./backups/backup.sql
```

### Acessar

```bash
# CLI
docker-compose exec postgres psql -U s3e_user -d s3e_db

# GUI - PgAdmin
http://localhost:5050
```

## 🔧 Troubleshooting

### Porta em uso

```bash
# Mudar no .env
FRONTEND_PORT=5174
```

### Container não inicia

```bash
docker-compose logs backend
docker-compose up --build
```

### Limpar e recomeçar

```bash
make clean
make dev-build
```

## 📊 Monitoramento

```bash
make logs              # Todos logs
make logs-backend      # Backend
make logs-frontend     # Frontend
make stats            # Recursos
```

## ⚙️ Arquivos Docker

```text
.
├── docker-compose.yml          # Config principal
├── docker-compose.prod.yml     # Produção
├── Makefile                    # Comandos úteis
├── .env.example               # Template vars
│
├── backend/
│   ├── Dockerfile             # Multi-stage
│   └── .dockerignore
│
├── frontend/
│   ├── Dockerfile             # Multi-stage
│   ├── .dockerignore
│   └── nginx/nginx.conf       # SPA config
│
└── nginx/
    ├── nginx.conf             # Config principal
    └── conf.d/default.conf    # Reverse proxy
```

## 🎯 Próximos Passos

1. ✅ Executar `docker-compose up`
2. ⏳ Migrar componentes: `.\migrate.ps1`
3. ⏳ Conectar frontend com backend
4. ⏳ Implementar autenticação
5. ⏳ Deploy

---

**📖 Leia [DOCKER_GUIDE.md](DOCKER_GUIDE.md) para documentação completa!**
