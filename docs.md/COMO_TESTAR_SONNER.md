# 🧪 Como Testar o Sonner - Guia Rápido

## ✅ Método 1: Página de Demonstração (RECOMENDADO)

Criamos um componente de demonstração completo que você pode adicionar temporariamente ao sistema para testar todas as funcionalidades.

### Passo 1: Adicionar a Rota

Abra o arquivo `src/App.tsx` e adicione:

```tsx
// No topo, adicione o import
import SonnerDemo from './components/SonnerDemo';

// Dentro do renderActiveView(), adicione:
case 'Teste Sonner':
  return <SonnerDemo />;
```

### Passo 2: Adicionar no Menu (Opcional)

Se quiser adicionar no menu lateral, edite `src/components/Sidebar.tsx` e adicione:

```tsx
{
  name: 'Teste Sonner',
  icon: Bell, // Importe: import { Bell } from 'lucide-react';
  onClick: () => handleNavigate('Teste Sonner')
}
```

### Passo 3: Acessar

1. Abra o sistema: http://localhost:5173
2. Faça login
3. Navegue para "Teste Sonner" (se adicionou no menu)
4. Ou chame `handleNavigate('Teste Sonner')` em algum lugar

---

## ✅ Método 2: Teste Direto no Console do Navegador

### Passo 1: Abrir Console

1. Acesse o sistema: http://localhost:5173
2. Faça login
3. Pressione `F12` para abrir DevTools
4. Vá na aba **Console**

### Passo 2: Testar Comandos

Cole e execute no console:

```javascript
// Importar o toast
import('sonner').then(({ toast }) => {
  // Sucesso
  toast.success('Teste de sucesso!', {
    description: 'Isso é uma notificação de sucesso'
  });
});
```

Ou simplesmente (se o toast já estiver disponível globalmente):

```javascript
// Sucesso
toast.success('Orçamento criado!');

// Erro
toast.error('Erro ao salvar');

// Aviso
toast.warning('Atenção!');

// Info
toast.info('Informação');

// Com descrição
toast.success('Salvo!', {
  description: 'Orçamento #1234 criado com sucesso'
});

// Com ação
toast('Item removido', {
  action: {
    label: 'Desfazer',
    onClick: () => toast.success('Restaurado!')
  }
});

// Com promise
toast.promise(
  new Promise(resolve => setTimeout(resolve, 2000)),
  {
    loading: 'Carregando...',
    success: 'Sucesso!',
    error: 'Erro!'
  }
);
```

---

## ✅ Método 3: Adicionar Botão Temporário em Qualquer Componente

### Exemplo: Dashboard

Abra `src/components/DashboardModerno.tsx` e adicione:

```tsx
// No topo
import { toast } from 'sonner';

// Dentro do JSX, adicione um botão temporário:
<button
  onClick={() => {
    toast.success('Sonner está funcionando!', {
      description: 'As notificações estão configuradas corretamente'
    });
  }}
  className="fixed bottom-4 right-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
>
  🔔 Testar Sonner
</button>
```

---

## ✅ Método 4: Testar nos Componentes Existentes

### Orçamentos

Abra `src/components/Orcamentos.tsx` e substitua:

```tsx
// ❌ ANTES
alert('Orçamento criado com sucesso!');

// ✅ DEPOIS
import { toast } from 'sonner';

toast.success('Orçamento criado com sucesso!', {
  description: `Orçamento #${numero} foi criado`
});
```

### PDF Customization

Abra `src/components/PDFCustomization/PDFCustomizationModal.tsx` e substitua:

```tsx
// ❌ ANTES
console.log('PDF gerado');

// ✅ DEPOIS
import { toast } from 'sonner';

toast.success('PDF gerado com sucesso!', {
  description: 'O download começará automaticamente'
});
```

---

## 🎯 Cenários de Teste

### 1. Teste de Sucesso
```tsx
toast.success('Operação concluída!');
```

**Verificar:**
- ✅ Aparece no canto superior direito
- ✅ Cor verde
- ✅ Ícone de check (✅)
- ✅ Desaparece após ~4 segundos
- ✅ Pode ser fechado manualmente (X)

### 2. Teste de Erro
```tsx
toast.error('Erro ao processar');
```

**Verificar:**
- ✅ Aparece no canto superior direito
- ✅ Cor vermelha
- ✅ Ícone de erro (❌)
- ✅ Mais tempo na tela (~5 segundos)

### 3. Teste com Promise
```tsx
const promise = new Promise(resolve => {
  setTimeout(() => resolve({ id: 123 }), 2000);
});

toast.promise(promise, {
  loading: 'Criando orçamento...',
  success: (data) => `Orçamento #${data.id} criado!`,
  error: 'Erro ao criar'
});
```

**Verificar:**
- ✅ Mostra loading primeiro (com spinner)
- ✅ Após 2 segundos, muda para sucesso
- ✅ Transição suave

### 4. Teste de Confirmação
```tsx
toast('Confirmar exclusão?', {
  action: {
    label: 'Confirmar',
    onClick: () => toast.success('Excluído!')
  },
  cancel: {
    label: 'Cancelar',
    onClick: () => toast.info('Cancelado')
  }
});
```

**Verificar:**
- ✅ Mostra dois botões (Confirmar e Cancelar)
- ✅ Clicar em Confirmar → mostra sucesso
- ✅ Clicar em Cancelar → mostra info
- ✅ Permanece na tela mais tempo

### 5. Teste Dark Mode
```tsx
// Alterne para dark mode no sistema
toast.success('Teste dark mode!');
```

**Verificar:**
- ✅ Background escuro
- ✅ Texto claro
- ✅ Bordas adequadas
- ✅ Legível e bonito

---

## 🐛 Troubleshooting

### Problema: "toast is not defined"

**Solução:** Adicione o import:
```tsx
import { toast } from 'sonner';
```

### Problema: Toast não aparece

**Solução:** Verifique se o `<Toaster />` está no `App.tsx`:
```tsx
// Deve estar dentro do ThemeProvider e AuthProvider
<Toaster position="top-right" expand={false} richColors closeButton />
```

### Problema: Toast aparece mas sem estilo

**Solução:** Verifique se os estilos do Tailwind estão carregando corretamente.

### Problema: Dark mode não funciona

**Solução:** Verifique se o `<Toaster />` está dentro do `<ThemeProvider>`.

---

## ✨ Exemplos de Uso Real

### Criar Orçamento
```tsx
const handleSubmit = async (data) => {
  toast.promise(
    orcamentosService.create(data),
    {
      loading: 'Criando orçamento...',
      success: (result) => `Orçamento #${result.numero} criado!`,
      error: 'Erro ao criar orçamento'
    }
  );
};
```

### Validação de Formulário
```tsx
if (!formData.clienteId) {
  toast.error('Cliente obrigatório', {
    description: 'Selecione um cliente para continuar'
  });
  return;
}
```

### Adicionar Item
```tsx
const handleAddItem = (item) => {
  addToList(item);
  toast.success('Item adicionado!', {
    description: `${item.name} - Qtd: ${item.quantity}`,
    icon: '📦'
  });
};
```

### Gerar PDF
```tsx
const handleGeneratePDF = async () => {
  const toastId = toast.loading('Gerando PDF...');
  
  try {
    const pdf = await generatePDF();
    toast.success('PDF gerado!', { id: toastId });
    downloadFile(pdf);
  } catch (error) {
    toast.error('Erro ao gerar PDF', { id: toastId });
  }
};
```

---

## 📊 Checklist de Testes

### Funcionalidades Básicas
- [ ] toast.success() - Aparece em verde com check
- [ ] toast.error() - Aparece em vermelho com X
- [ ] toast.warning() - Aparece em amarelo com ⚠️
- [ ] toast.info() - Aparece em azul com ℹ️
- [ ] toast.loading() - Aparece com spinner

### Funcionalidades Avançadas
- [ ] toast.promise() - Loading → Success/Error
- [ ] Toast com description
- [ ] Toast com action (botão)
- [ ] Toast com ID (atualização)
- [ ] Toast customizado (ícone, duração)
- [ ] toast.dismiss() - Fechar todos

### Integração
- [ ] Dark mode funcionando
- [ ] Light mode funcionando
- [ ] Posição correta (top-right)
- [ ] Animações suaves
- [ ] Responsivo (mobile/desktop)
- [ ] Close button (X) funcionando

### UX
- [ ] Não bloqueia interface
- [ ] Desaparece automaticamente
- [ ] Múltiplos toasts empilham corretamente
- [ ] Legível e claro
- [ ] Ícones corretos

---

## 🎉 Resultado Esperado

Após os testes, você deve ver:

✅ Notificações aparecendo no canto superior direito  
✅ Cores corretas por tipo (verde, vermelho, amarelo, azul)  
✅ Ícones adequados  
✅ Animações suaves  
✅ Funcionando em dark e light mode  
✅ Botão X para fechar  
✅ Desaparecimento automático  

---

## 📚 Próximos Passos

Após testar e confirmar que está funcionando:

1. ✅ Remova o componente `SonnerDemo.tsx` (é apenas para testes)
2. ✅ Comece a substituir `window.confirm` e `alert()` por toasts
3. ✅ Adicione toasts em operações CRUD
4. ✅ Implemente validações com feedback toast
5. ✅ Use em uploads/downloads

---

**Boa sorte com os testes!** 🚀

Se tiver alguma dúvida, consulte:
- `GUIA_SONNER_TOAST.md` - Guia completo
- `EXEMPLO_IMPLEMENTACAO_SONNER.tsx` - Exemplos práticos
- `SONNER_IMPLEMENTADO.md` - Documentação da implementação

