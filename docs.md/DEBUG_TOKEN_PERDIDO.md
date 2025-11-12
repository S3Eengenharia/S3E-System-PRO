# 🔍 DEBUG - TOKEN SENDO PERDIDO

## 🎯 COMO DESCOBRIR ONDE O TOKEN ESTÁ SENDO LIMPO

Com as novas correções, agora temos **stack traces** completos quando o token é removido.

---

## 🔧 CORREÇÕES APLICADAS

### **1. Stack Trace no clearToken():**
```typescript
clearToken() {
  console.warn('🧹 [AxiosApi] clearToken() chamado - REMOVENDO TOKEN');
  console.trace('Stack trace de quem chamou clearToken:');  // ✅ Mostra quem chamou!
  localStorage.removeItem('token');
}
```

### **2. Stack Trace no logout():**
```typescript
logout() {
  console.log('🚪 [AuthContext] Fazendo logout...');
  console.trace('Stack trace de quem chamou logout:');  // ✅ Mostra quem chamou!
  localStorage.removeItem('token');
}
```

### **3. Erro 500 de Resumo Financeiro Corrigido:**
```typescript
// ❌ ANTES:
_sum: { valorTotal: true }  // Campo não existe

// ✅ DEPOIS:
_sum: { precoVenda: true }  // Campo correto!
```

---

## 🧪 COMO DEBUGAR

### **Passo 1: Limpe Tudo**
```javascript
// Console (F12):
localStorage.clear()
// F5
```

### **Passo 2: Faça Login**
- Email: admin@s3e.com.br
- Senha: 123456

### **Passo 3: Verifique Token Salvo**
```javascript
localStorage.getItem('token')
// Deve mostrar: "eyJhbGciOiJIUzI1NiIs..."
```

### **Passo 4: Navegue para Clientes**
```
Dashboard → Clientes (clique no menu)
```

### **Passo 5: IMEDIATAMENTE observe o console**

**Se o token foi limpo, você verá:**
```
🧹 [AxiosApi] clearToken() chamado - REMOVENDO TOKEN
Stack trace de quem chamou clearToken:
  clearToken @ axiosApi.ts:89
  (anônimo) @ axiosApi.ts:63
  ... toda a pilha de chamadas
```

**OU:**
```
🚪 [AuthContext] Fazendo logout...
Stack trace de quem chamou logout:
  logout @ AuthContext.tsx:157
  ... toda a pilha de chamadas
```

---

## 🔍 VERIFICAÇÕES ADICIONAIS

### **1. Verificar se Token Existe Antes de Navegar:**
```javascript
// ANTES de clicar em "Clientes":
localStorage.getItem('token')
// Deve mostrar token

// DEPOIS de clicar em "Clientes":
localStorage.getItem('token')
// Deve AINDA mostrar token (não null!)
```

### **2. Monitorar Mudanças no localStorage:**
```javascript
// Cole isso no console ANTES de navegar:
const originalRemoveItem = localStorage.removeItem;
localStorage.removeItem = function(key) {
  if (key === 'token') {
    console.error('🚨 ALERTA: Alguém está tentando remover o token!');
    console.trace('Stack trace:');
  }
  return originalRemoveItem.apply(this, arguments);
};

// Agora navegue e veja quem está removendo
```

---

## 🎯 POSSÍVEIS CAUSAS

### **1. Erro 401 Limpando Token:**
Se backend retornar 401, o interceptor limpa automaticamente:
```typescript
if (status === 401) {
  this.clearToken();  // ← Aqui!
  window.location.href = '/login';
}
```

**Solução:** Backend não deve retornar 401 se token é válido.

### **2. checkAuth Limpando em Erro:**
Se houver erro ao verificar auth:
```typescript
if (response.status === 401) {
  localStorage.removeItem('token');  // ← Aqui!
}
```

**Solução:** Já corrigido para só limpar em 401 real.

### **3. Logout Sendo Chamado Acidentalmente:**
Algum botão ou evento disparando logout.

**Solução:** Stack trace mostrará exatamente onde.

---

## 📊 TESTE FINAL

### **Com as correções:**

1. **Faça login**
2. **Navegue para Clientes**
3. **Observe o console**

**Deve mostrar:**
```
✅ 🔐 [AxiosApi] Token enviado para: /api/clientes
✅ 👥 Carregando lista de clientes...
✅ ✅ 2 clientes carregados
```

**NÃO deve mostrar:**
```
❌ 🧹 clearToken() chamado
❌ 🚪 Fazendo logout
❌ ⚠️ Token não encontrado
❌ GET /api/clientes 401
```

---

## 🔧 SE CONTINUAR PERDENDO TOKEN

**Execute este script no console:**
```javascript
// Monitorar TODAS as operações no localStorage
['setItem', 'removeItem', 'clear'].forEach(method => {
  const original = localStorage[method];
  localStorage[method] = function(...args) {
    console.log(`📝 localStorage.${method}(${JSON.stringify(args)})`);
    if (method === 'removeItem' && args[0] === 'token') {
      console.error('🚨 TOKEN SENDO REMOVIDO!');
      console.trace();
    }
    if (method === 'clear') {
      console.error('🚨 localStorage.clear() CHAMADO!');
      console.trace();
    }
    return original.apply(this, args);
  };
});

console.log('✅ Monitor do localStorage ativado!');

// Agora navegue e veja EXATAMENTE quem está mexendo no token
```

---

## 🎉 RESULTADO ESPERADO

Após as correções:
- ✅ Erro 500 de resumo financeiro RESOLVIDO
- ✅ Stack trace quando token é removido
- ✅ Fácil identificar culpado
- ✅ Backend recebe token corretamente

**Teste agora e me mostre o stack trace se o token ainda for limpo!** 🚀

