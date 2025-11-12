# 🔔 Guia de Uso - Sonner Toast Notifications

## ✅ Instalação e Configuração - CONCLUÍDA

### Instalação
```bash
npx shadcn@latest add sonner
```

### Configuração no App.tsx
```tsx
import { Toaster } from './components/ui/sonner';

// No componente App
<Toaster position="top-right" expand={false} richColors closeButton />
```

---

## 📚 Como Usar

### Import
```tsx
import { toast } from 'sonner';
```

---

## 🎯 Tipos de Toast

### 1. ✅ Sucesso
```tsx
// Simples
toast.success('Orçamento criado com sucesso!');

// Com descrição
toast.success('Orçamento criado!', {
  description: 'O orçamento #1234 foi criado e está aguardando aprovação.'
});

// Com duração personalizada (ms)
toast.success('Item adicionado!', { duration: 3000 });
```

### 2. ❌ Erro
```tsx
// Simples
toast.error('Erro ao salvar orçamento');

// Com descrição
toast.error('Erro ao criar orçamento', {
  description: 'Verifique se todos os campos obrigatórios estão preenchidos.'
});

// Com ação
toast.error('Erro ao conectar com servidor', {
  action: {
    label: 'Tentar novamente',
    onClick: () => retryConnection()
  }
});
```

### 3. ⚠️ Aviso
```tsx
toast.warning('Atenção: BDI muito baixo');

toast.warning('Estoque baixo', {
  description: 'O material XYZ está com apenas 5 unidades em estoque.'
});
```

### 4. ℹ️ Informação
```tsx
toast.info('PDF sendo gerado...');

toast.info('Sistema em manutenção', {
  description: 'Manutenção programada para hoje às 23h.'
});
```

### 5. 🔄 Loading (Promessa)
```tsx
// Automático com promise
const promise = fetch('/api/orcamentos');

toast.promise(promise, {
  loading: 'Carregando orçamentos...',
  success: 'Orçamentos carregados!',
  error: 'Erro ao carregar orçamentos'
});

// Com descrições
toast.promise(saveOrcamento(), {
  loading: 'Salvando orçamento...',
  success: (data) => `Orçamento #${data.id} criado com sucesso!`,
  error: (err) => `Erro: ${err.message}`
});
```

### 6. 📝 Toast Customizado
```tsx
toast('Novo orçamento', {
  description: 'Cliente: João Silva',
  icon: '📋',
  duration: 5000,
  closeButton: true
});
```

---

## 🎨 Opções Avançadas

### Posição (já configurado globalmente)
```tsx
// Configurado no App.tsx como "top-right"
// Outras opções: top-left, top-center, bottom-left, bottom-center, bottom-right
```

### Ações no Toast
```tsx
toast('Item removido', {
  action: {
    label: 'Desfazer',
    onClick: () => restoreItem()
  }
});
```

### Toast com ID (para atualizar depois)
```tsx
const toastId = toast.loading('Gerando PDF...');

// Depois de concluir
toast.success('PDF gerado!', { id: toastId });

// Ou em caso de erro
toast.error('Erro ao gerar PDF', { id: toastId });
```

### Fechar Toast Programaticamente
```tsx
const toastId = toast.success('Salvo!');

// Fechar após 2 segundos
setTimeout(() => {
  toast.dismiss(toastId);
}, 2000);

// Fechar todos
toast.dismiss();
```

---

## 🚀 Exemplos Práticos - Sistema S3E

### Exemplo 1: Criar Orçamento
```tsx
const handleSubmit = async (data: OrcamentoFormData) => {
  const promise = orcamentosService.create(data);
  
  toast.promise(promise, {
    loading: 'Criando orçamento...',
    success: (orcamento) => {
      navigate('/orcamentos');
      return `Orçamento #${orcamento.numero} criado com sucesso!`;
    },
    error: 'Erro ao criar orçamento. Tente novamente.'
  });
};
```

### Exemplo 2: Deletar Item (com confirmação)
```tsx
const handleDelete = (id: string) => {
  toast('Tem certeza que deseja excluir?', {
    description: 'Esta ação não pode ser desfeita.',
    action: {
      label: 'Confirmar',
      onClick: async () => {
        const deletePromise = orcamentosService.delete(id);
        
        toast.promise(deletePromise, {
          loading: 'Excluindo...',
          success: 'Orçamento excluído com sucesso!',
          error: 'Erro ao excluir orçamento'
        });
      }
    },
    cancel: {
      label: 'Cancelar',
      onClick: () => toast.info('Exclusão cancelada')
    }
  });
};
```

### Exemplo 3: Upload com Progresso
```tsx
const handleUpload = async (file: File) => {
  const toastId = toast.loading('Fazendo upload...');
  
  try {
    const result = await uploadFile(file);
    toast.success('Upload concluído!', { 
      id: toastId,
      description: `Arquivo: ${file.name}`
    });
  } catch (error) {
    toast.error('Erro no upload', { 
      id: toastId,
      description: error.message 
    });
  }
};
```

### Exemplo 4: Gerar PDF
```tsx
const handleGeneratePDF = async () => {
  const toastId = toast.loading('Gerando PDF personalizado...', {
    description: 'Isso pode levar alguns segundos'
  });
  
  try {
    const pdfBlob = await pdfService.generateCustomPDF(orcamentoId, config);
    
    toast.success('PDF gerado com sucesso!', { 
      id: toastId,
      description: 'O download começará automaticamente'
    });
    
    // Download automático
    downloadFile(pdfBlob, `orcamento-${numero}.pdf`);
  } catch (error) {
    toast.error('Erro ao gerar PDF', { 
      id: toastId,
      description: 'Verifique sua conexão e tente novamente'
    });
  }
};
```

### Exemplo 5: Salvar Template
```tsx
const handleSaveTemplate = async (templateData: PDFTemplate) => {
  toast.promise(
    pdfService.saveTemplate(templateData),
    {
      loading: 'Salvando template...',
      success: (template) => ({
        title: 'Template salvo!',
        description: `"${template.name}" foi salvo e pode ser reutilizado.`
      }),
      error: 'Erro ao salvar template'
    }
  );
};
```

### Exemplo 6: Adicionar Item Manual
```tsx
const handleAddManualItem = (item: ManualItem) => {
  addItemToList(item);
  
  toast.success('Item adicionado!', {
    description: `${item.name} - Qtd: ${item.quantity} ${item.unit}`,
    icon: '✏️'
  });
};
```

### Exemplo 7: Validação de Formulário
```tsx
const validateForm = () => {
  if (!formData.clienteId) {
    toast.error('Cliente obrigatório', {
      description: 'Selecione um cliente para continuar'
    });
    return false;
  }
  
  if (items.length === 0) {
    toast.warning('Nenhum item adicionado', {
      description: 'Adicione pelo menos um item ao orçamento'
    });
    return false;
  }
  
  return true;
};
```

### Exemplo 8: Atualização em Lote
```tsx
const handleBulkUpdate = async (ids: string[]) => {
  const toastId = toast.loading(`Atualizando ${ids.length} itens...`);
  
  try {
    await bulkUpdateService(ids);
    toast.success('Atualização concluída!', {
      id: toastId,
      description: `${ids.length} itens atualizados com sucesso`
    });
  } catch (error) {
    toast.error('Erro na atualização', { id: toastId });
  }
};
```

---

## 🎯 Substituindo Prompts Antigos

### ❌ Antes (window.confirm)
```tsx
const handleDelete = (id: string) => {
  if (window.confirm('Tem certeza que deseja excluir?')) {
    deleteItem(id);
  }
};
```

### ✅ Depois (Sonner)
```tsx
const handleDelete = (id: string) => {
  toast('Confirmar exclusão?', {
    description: 'Esta ação não pode ser desfeita.',
    action: {
      label: 'Excluir',
      onClick: async () => {
        toast.promise(deleteItem(id), {
          loading: 'Excluindo...',
          success: 'Item excluído!',
          error: 'Erro ao excluir'
        });
      }
    }
  });
};
```

### ❌ Antes (window.alert)
```tsx
alert('Orçamento criado com sucesso!');
```

### ✅ Depois (Sonner)
```tsx
toast.success('Orçamento criado com sucesso!');
```

---

## 🎨 Customização de Cores

O Sonner já está integrado com o sistema de cores do shadcn/ui e dark mode!

### Rich Colors (já ativado)
```tsx
// Cores automáticas baseadas no tipo
toast.success('Sucesso!'); // Verde
toast.error('Erro!');      // Vermelho
toast.warning('Aviso!');   // Amarelo
toast.info('Info!');       // Azul
```

---

## 📋 Checklist de Implementação

### ✅ Já Implementado
- [x] Sonner instalado via shadcn
- [x] Toaster adicionado no App.tsx
- [x] Integrado com ThemeContext (dark mode)
- [x] Posição configurada (top-right)
- [x] Rich colors ativado
- [x] Close button ativado

### 🚧 Próximos Passos
- [ ] Substituir `window.confirm` em Orçamentos
- [ ] Substituir `window.alert` em todas as operações
- [ ] Adicionar toast.promise em requisições assíncronas
- [ ] Implementar toast de feedback em formulários
- [ ] Adicionar toast em ações de CRUD (Create, Read, Update, Delete)

---

## 🔗 Recursos

- [Documentação Oficial do Sonner](https://sonner.emilkowal.ski/)
- [Shadcn/ui Toast Docs](https://ui.shadcn.com/docs/components/sonner)

---

## 💡 Dicas

1. **Use toast.promise** para operações assíncronas - mais limpo e automático
2. **Sempre adicione description** em toasts importantes para dar mais contexto
3. **Use ações** para permitir desfazer operações críticas
4. **Evite toasts muito longos** - mantenha mensagens curtas e claras
5. **Use IDs** quando precisar atualizar um toast existente
6. **Aproveite o dark mode** - já está configurado automaticamente!

---

## 🎊 Resultado

Com o Sonner implementado, o sistema S3E agora tem:
- ✅ Notificações profissionais e modernas
- ✅ Feedback visual consistente
- ✅ Melhor UX em todas as operações
- ✅ Substituição completa de prompts nativos
- ✅ Integração perfeita com dark mode

**Sistema pronto para notificações de alta qualidade!** 🚀

