# 🐳 Guia Completo: Build e Push para Docker Hub / TrueNAS Scale

Este guia irá te ajudar a:
1. ✅ Construir as imagens Docker da aplicação
2. ✅ Publicar as imagens no Docker Hub
3. ✅ Baixar e executar no TrueNAS Scale

---

## 📋 Pré-requisitos

- Docker instalado (Docker Desktop ou Docker Engine)
- Conta no Docker Hub ([hub.docker.com](https://hub.docker.com))
- Docker Hub credenciais configuradas localmente

---

## 🔧 Passo 1: Configurar Docker Hub

### 1.1 Criar conta no Docker Hub

Se ainda não tem, crie uma conta gratuita em: https://hub.docker.com/signup

### 1.2 Login no Docker Hub

```bash
docker login
```

Digite seu usuário e senha do Docker Hub quando solicitado.

---

## 🏗️ Passo 2: Construir as Imagens Docker

### 2.1 Build da Imagem Backend (Produção)

```bash
# Navegar para o diretório raiz do projeto
cd C:\Users\lenovo\OneDrive\Área de Trabalho\S3E-System-PRO

# Build da imagem backend
docker build -t seu-usuario-dockerhub/s3e-backend:latest \
  --target production \
  -f backend/Dockerfile \
  ./backend
```

**Substitua `seu-usuario-dockerhub` pelo seu username do Docker Hub**

### 2.2 Build da Imagem Frontend (Produção)

```bash
# Build da imagem frontend
docker build -t seu-usuario-dockerhub/s3e-frontend:latest \
  --target production \
  --build-arg VITE_API_URL=http://localhost:3001 \
  -f frontend/Dockerfile \
  ./frontend
```

### 2.3 Build usando Docker Compose (Alternativa)

```bash
# Build de todas as imagens
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
```

---

## 📤 Passo 3: Publicar no Docker Hub

### 3.1 Push da Imagem Backend

```bash
docker push seu-usuario-dockerhub/s3e-backend:latest
```

### 3.2 Push da Imagem Frontend

```bash
docker push seu-usuario-dockerhub/s3e-frontend:latest
```

### 3.3 Push de Todas as Imagens (se usar compose)

```bash
# Taggar as imagens antes do push
docker tag s3e-system-pro_backend:latest seu-usuario-dockerhub/s3e-backend:latest
docker tag s3e-system-pro_frontend:latest seu-usuario-dockerhub/s3e-frontend:latest

# Push
docker push seu-usuario-dockerhub/s3e-backend:latest
docker push seu-usuario-dockerhub/s3e-frontend:latest
```

---

## 📝 Passo 4: Tagging e Versionamento

Para criar versões específicas das imagens:

```bash
# Backend - Versão 1.0.0
docker tag seu-usuario-dockerhub/s3e-backend:latest seu-usuario-dockerhub/s3e-backend:1.0.0
docker push seu-usuario-dockerhub/s3e-backend:1.0.0

# Frontend - Versão 1.0.0
docker tag seu-usuario-dockerhub/s3e-frontend:latest seu-usuario-dockerhub/s3e-frontend:1.0.0
docker push seu-usuario-dockerhub/s3e-frontend:1.0.0
```

---

## 🚀 Passo 5: Deploy no TrueNAS Scale

### 5.1 Preparar o Ambiente no TrueNAS Scale

1. **Criar Dataset para Persistent Storage:**
   - Acesse Storage > Pools
   - Crie um dataset chamado `s3e-app`
   - Dentro dele, crie sub-datasets:
     - `s3e-postgres-data`
     - `s3e-redis-data`
     - `s3e-backend-uploads`
     - `s3e-backend-logs`

### 5.2 Criar Aplicação Backend no TrueNAS Scale

1. **Acesse:** Apps > Available Applications > Custom App

2. **Configurações Básicas:**
   - **Nome:** s3e-backend
   - **Versão:** 1.0.0
   - **Descrição:** S3E System PRO - Backend API

3. **Container Image:**
   ```
   seu-usuario-dockerhub/s3e-backend:latest
   ```

4. **Portas:**
   - **Container Port:** 3001
   - **Node Port:** Escolha uma porta disponível (ex: 30001)
   - **Protocol:** TCP

5. **Variáveis de Ambiente:**
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=postgresql://s3e_user:s3e_password@postgres:5432/s3e_db?schema=public
   JWT_SECRET=seu-jwt-secret-super-seguro-aqui
   JWT_EXPIRES_IN=1d
   CORS_ORIGIN=http://seu-dominio-ou-ip-frontend
   PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
   PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
   ```

6. **Volumes (Persistent Storage):**
   - **Host Path:** `/mnt/pool/s3e-app/s3e-backend-uploads`
   - **Mount Path:** `/app/uploads`
   - **Read Only:** Não

7. **Health Check:**
   - **Type:** HTTP
   - **Path:** `/health`
   - **Port:** 3001

### 5.3 Criar Aplicação Frontend no TrueNAS Scale

1. **Acesse:** Apps > Available Applications > Custom App

2. **Configurações Básicas:**
   - **Nome:** s3e-frontend
   - **Versão:** 1.0.0
   - **Descrição:** S3E System PRO - Frontend React

3. **Container Image:**
   ```
   seu-usuario-dockerhub/s3e-frontend:latest
   ```

4. **Portas:**
   - **Container Port:** 80
   - **Node Port:** Escolha uma porta disponível (ex: 30080)
   - **Protocol:** TCP

5. **Variáveis de Ambiente:**
   ```env
   NODE_ENV=production
   ```

6. **Health Check:**
   - **Type:** HTTP
   - **Path:** `/`
   - **Port:** 80

### 5.4 Criar PostgreSQL no TrueNAS Scale

1. **Acesse:** Apps > Available Applications > PostgreSQL

2. **Configurações:**
   - **Nome:** s3e-postgres
   - **Versão PostgreSQL:** 16
   - **Database:** s3e_db
   - **Usuário:** s3e_user
   - **Senha:** s3e_password (ou uma senha forte)
   - **Persistent Storage:** `/mnt/pool/s3e-app/s3e-postgres-data`

### 5.5 Criar Redis no TrueNAS Scale (Opcional)

1. **Acesse:** Apps > Available Applications > Redis

2. **Configurações:**
   - **Nome:** s3e-redis
   - **Persistent Storage:** `/mnt/pool/s3e-app/s3e-redis-data`

---

## 📋 Passo 6: Docker Compose para TrueNAS Scale

Se preferir usar Docker Compose no TrueNAS Scale, crie um arquivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: s3e-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: s3e_user
      POSTGRES_PASSWORD: s3e_password
      POSTGRES_DB: s3e_db
    volumes:
      - /mnt/pool/s3e-app/s3e-postgres-data:/var/lib/postgresql/data
    networks:
      - s3e-network

  backend:
    image: seu-usuario-dockerhub/s3e-backend:latest
    container_name: s3e-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3001
      DATABASE_URL: postgresql://s3e_user:s3e_password@postgres:5432/s3e_db?schema=public
      JWT_SECRET: seu-jwt-secret-super-seguro
      JWT_EXPIRES_IN: 1d
      CORS_ORIGIN: http://seu-ip-frontend:30080
    ports:
      - "30001:3001"
    volumes:
      - /mnt/pool/s3e-app/s3e-backend-uploads:/app/uploads
      - /mnt/pool/s3e-app/s3e-backend-logs:/app/logs
    depends_on:
      - postgres
    networks:
      - s3e-network

  frontend:
    image: seu-usuario-dockerhub/s3e-frontend:latest
    container_name: s3e-frontend
    restart: unless-stopped
    ports:
      - "30080:80"
    depends_on:
      - backend
    networks:
      - s3e-network

networks:
  s3e-network:
    driver: bridge
```

---

## 🔄 Passo 7: Scripts Automatizados

### 7.1 Script de Build e Push (Windows)

Crie um arquivo `build-and-push.bat`:

```batch
@echo off
set DOCKER_USER=seu-usuario-dockerhub
set VERSION=latest

echo 🔨 Building Backend...
docker build -t %DOCKER_USER%/s3e-backend:%VERSION% --target production -f backend/Dockerfile ./backend

echo 🔨 Building Frontend...
docker build -t %DOCKER_USER%/s3e-frontend:%VERSION% --target production --build-arg VITE_API_URL=http://localhost:3001 -f frontend/Dockerfile ./frontend

echo 📤 Pushing Backend...
docker push %DOCKER_USER%/s3e-backend:%VERSION%

echo 📤 Pushing Frontend...
docker push %DOCKER_USER%/s3e-frontend:%VERSION%

echo ✅ Done!
```

### 7.2 Script de Build e Push (Linux/Mac)

Crie um arquivo `build-and-push.sh`:

```bash
#!/bin/bash
DOCKER_USER="seu-usuario-dockerhub"
VERSION="latest"

echo "🔨 Building Backend..."
docker build -t ${DOCKER_USER}/s3e-backend:${VERSION} --target production -f backend/Dockerfile ./backend

echo "🔨 Building Frontend..."
docker build -t ${DOCKER_USER}/s3e-frontend:${VERSION} --target production --build-arg VITE_API_URL=http://localhost:3001 -f frontend/Dockerfile ./frontend

echo "📤 Pushing Backend..."
docker push ${DOCKER_USER}/s3e-backend:${VERSION}

echo "📤 Pushing Frontend..."
docker push ${DOCKER_USER}/s3e-frontend:${VERSION}

echo "✅ Done!"
```

**Tornar executável:**
```bash
chmod +x build-and-push.sh
```

---

## 🔍 Passo 8: Verificar as Imagens

### 8.1 Listar Imagens Locais

```bash
docker images | grep s3e
```

### 8.2 Testar Localmente

```bash
# Testar backend
docker run -p 3001:3001 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=test-secret \
  seu-usuario-dockerhub/s3e-backend:latest

# Testar frontend
docker run -p 80:80 \
  seu-usuario-dockerhub/s3e-frontend:latest
```

---

## 🛠️ Troubleshooting

### Problema: Build falha no Prisma

**Solução:** Garantir que o `prisma generate` está sendo executado no Dockerfile.

### Problema: Imagens muito grandes

**Solução:** As imagens já usam multi-stage build para reduzir tamanho. Se necessário, use `.dockerignore`.

### Problema: Uploads não persistem

**Solução:** Garantir que o volume `/app/uploads` está mapeado corretamente no TrueNAS Scale.

### Problema: Conexão com banco falha

**Solução:** Verificar:
- Se o PostgreSQL está rodando
- Se a URL de conexão está correta
- Se as credenciais estão corretas
- Se a rede Docker está configurada corretamente

---

## 📚 Comandos Úteis

```bash
# Ver logs do container
docker logs s3e-backend
docker logs s3e-frontend

# Entrar no container
docker exec -it s3e-backend sh

# Remover imagens antigas
docker image prune -a

# Ver uso de espaço
docker system df
```

---

## ✅ Checklist Final

- [ ] Conta Docker Hub criada
- [ ] Login realizado (`docker login`)
- [ ] Backend buildado e testado
- [ ] Frontend buildado e testado
- [ ] Imagens publicadas no Docker Hub
- [ ] PostgreSQL configurado no TrueNAS Scale
- [ ] Backend deployado no TrueNAS Scale
- [ ] Frontend deployado no TrueNAS Scale
- [ ] Variáveis de ambiente configuradas
- [ ] Volumes persistentes configurados
- [ ] Aplicação testada e funcionando

---

**🎉 Pronto! Sua aplicação está pronta para ser deployada no TrueNAS Scale!**

