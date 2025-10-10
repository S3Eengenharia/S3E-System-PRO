# 🔥 Hot Module Replacement (HMR) - Guia de Desenvolvimento

## O que é HMR?

**Hot Module Replacement (HMR)** é uma tecnologia que permite atualizar módulos em tempo real durante o desenvolvimento, **sem recarregar a página inteira** e **preservando o estado da aplicação**.

## Tecnologias Utilizadas

### 1. **Vite HMR** ⚡
- **Rápido**: Atualização instantânea (< 100ms)
- **Inteligente**: Atualiza apenas o que mudou
- **Eficiente**: Não recarrega a página inteira

### 2. **React Fast Refresh** ⚛️
- Preserva o estado dos componentes React
- Atualiza apenas os componentes alterados
- Mantém o estado do formulário, scroll, etc.

## Como Funciona no Seu Projeto

```
┌─────────────────────────────────────────────────────┐
│ 1. Você edita um arquivo no VSCode                 │
│    (ex: Catalogo.tsx)                               │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ 2. Docker detecta a mudança (via volume mount)     │
│    Volume: ./frontend:/app                          │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ 3. Vite File Watcher (polling) detecta              │
│    - usePolling: true (necessário para Docker)      │
│    - interval: 100ms                                │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ 4. Vite compila apenas o módulo alterado           │
│    - Fast compilation                               │
│    - ESM modules                                    │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ 5. HMR envia update via WebSocket                  │
│    - ws://localhost:5173                            │
│    - Payload: módulo atualizado                     │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│ 6. Browser aplica o update                         │
│    - Sem page reload                                │
│    - Preserva estado                                │
│    - Atualiza UI instantaneamente                   │
└─────────────────────────────────────────────────────┘
```

## Configuração Atual

### `vite.config.ts`

```typescript
server: {
  port: 5173,
  host: '0.0.0.0',
  hmr: {
    clientPort: 5173,  // Porta para WebSocket HMR
  },
  watch: {
    usePolling: true,  // ESSENCIAL para Docker/Windows
    interval: 100,     // Verifica mudanças a cada 100ms
  },
}
```

### `docker-compose.yml`

```yaml
frontend:
  ports:
    - "5173:5173"
  volumes:
    - ./frontend:/app        # Sincroniza código
    - /app/node_modules      # Preserva node_modules
  command: npm run dev -- --host
```

## Configurações Importantes

### 1. **File Watching (usePolling)**

**Por que `usePolling: true`?**
- Docker no Windows não suporta nativamente eventos de arquivo do filesystem
- Polling verifica mudanças periodicamente
- Essencial para HMR funcionar em containers

```typescript
watch: {
  usePolling: true,  // Polling mode
  interval: 100,     // Check every 100ms
}
```

### 2. **HMR Client Port**

```typescript
hmr: {
  clientPort: 5173,  // Deve ser a mesma porta exposta no Docker
}
```

### 3. **Host Configuration**

```typescript
host: '0.0.0.0',  // Permite acesso de fora do container
```

## Como Usar

### Iniciar o ambiente de desenvolvimento:

```bash
# Com Docker (recomendado)
docker-compose up frontend

# Ou direto (sem Docker)
cd frontend
npm run dev
```

### Acessar a aplicação:

```
http://localhost:5173
```

### Fazer alterações:

1. Edite qualquer arquivo em `frontend/src/`
2. Salve o arquivo (Ctrl+S)
3. Veja a atualização instantânea no browser! ⚡

## Indicadores de HMR Funcionando

✅ **Console do Browser:**
```
[vite] connected.
[vite] hot updated: /src/components/Catalogo.tsx
```

✅ **Terminal do Vite:**
```
5:34:21 PM [vite] hmr update /src/components/Catalogo.tsx
```

✅ **Comportamento:**
- Atualização instantânea (< 1 segundo)
- Sem reload completo da página
- Estado preservado

## Troubleshooting

### ❌ HMR não está funcionando?

#### 1. **Verificar se o polling está habilitado**
```typescript
// vite.config.ts
watch: {
  usePolling: true,  // Deve estar true
}
```

#### 2. **Verificar volumes do Docker**
```bash
# Verificar se os volumes estão montados
docker inspect s3e-frontend | grep -A 10 Mounts
```

#### 3. **Verificar WebSocket no browser**
- Abra DevTools → Network → WS
- Deve ter conexão com `ws://localhost:5173`

#### 4. **Aumentar o intervalo de polling** (se muito lento)
```typescript
watch: {
  usePolling: true,
  interval: 300,  // Aumentar para 300ms
}
```

#### 5. **Limpar cache e reiniciar**
```bash
# Parar containers
docker-compose down

# Limpar cache do Vite
rm -rf frontend/node_modules/.vite

# Reiniciar
docker-compose up frontend
```

## Alternativas e Comparações

### Vite HMR vs Outras Tecnologias

| Tecnologia | Velocidade | Funciona em Docker | Preserva Estado |
|------------|------------|-------------------|-----------------|
| **Vite HMR** | ⚡⚡⚡ Muito Rápida | ✅ Sim (com polling) | ✅ Sim |
| Webpack HMR | 🐌 Moderada | ✅ Sim | ✅ Sim |
| Live Reload | ⚡ Rápida | ✅ Sim | ❌ Não (reload full) |
| Nodemon | 🐌 Lenta | ✅ Sim | ❌ Não |

### Por que Vite?

1. **Velocidade**: 10-100x mais rápido que Webpack
2. **ESM Nativo**: Usa ES modules do browser
3. **No Bundle em Dev**: Não precisa bundlar em desenvolvimento
4. **React Fast Refresh**: Integrado nativamente

## Performance Tuning

### Otimizar intervalo de polling:

```typescript
// Mais rápido, mais CPU
watch: {
  usePolling: true,
  interval: 50,  // 50ms - muito responsivo
}

// Balanceado (padrão)
watch: {
  usePolling: true,
  interval: 100,  // 100ms - boa performance
}

// Mais lento, menos CPU
watch: {
  usePolling: true,
  interval: 500,  // 500ms - economia de recursos
}
```

## Recursos Adicionais

- [Vite HMR API](https://vitejs.dev/guide/api-hmr.html)
- [React Fast Refresh](https://www.npmjs.com/package/react-refresh)
- [Docker File Watching](https://docs.docker.com/desktop/troubleshoot/topics/#file-sharing)

## Dicas Pro 💡

1. **Use dois monitores**: Código em um, browser em outro
2. **Console sempre aberto**: Veja os logs de HMR
3. **Auto-save no VSCode**: Configure para salvar automaticamente
4. **React DevTools**: Instale a extensão para debugging

---

**Status Atual**: ✅ HMR configurado e otimizado para ambiente Docker no Windows!

