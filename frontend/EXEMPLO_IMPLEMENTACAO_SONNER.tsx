// 🔔 EXEMPLO PRÁTICO: Como Implementar Sonner em Componentes
// Este arquivo demonstra as melhores práticas de uso do Sonner no sistema S3E

import React, { useState } from 'react';
import { toast } from 'sonner';
import { orcamentosService } from './services/orcamentosService';
import { pdfCustomizationService } from './services/pdfCustomizationService';

// ═══════════════════════════════════════════════════════════════
// EXEMPLO 1: CRUD de Orçamentos com Toast
// ═══════════════════════════════════════════════════════════════

export const OrcamentosCRUDExample = () => {
  const [orcamentos, setOrcamentos] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ CREATE - Criar novo orçamento
  const handleCreate = async (formData) => {
    const promise = orcamentosService.create(formData);
    
    // Toast automático com loading → success/error
    toast.promise(promise, {
      loading: 'Criando orçamento...',
      success: (data) => {
        setOrcamentos([...orcamentos, data]);
        return `Orçamento #${data.numero} criado com sucesso!`;
      },
      error: (err) => `Erro ao criar: ${err.message}`
    });
  };

  // 📖 READ - Carregar orçamentos
  const handleLoad = async () => {
    setLoading(true);
    
    try {
      const data = await orcamentosService.getAll();
      setOrcamentos(data);
      
      toast.success('Orçamentos carregados!', {
        description: `${data.length} orçamento(s) encontrado(s)`
      });
    } catch (error) {
      toast.error('Erro ao carregar orçamentos', {
        description: 'Verifique sua conexão e tente novamente'
      });
    } finally {
      setLoading(false);
    }
  };

  // ✏️ UPDATE - Atualizar orçamento
  const handleUpdate = async (id, updates) => {
    const promise = orcamentosService.update(id, updates);
    
    toast.promise(promise, {
      loading: 'Atualizando...',
      success: () => {
        // Atualizar estado local
        setOrcamentos(orcamentos.map(o => 
          o.id === id ? { ...o, ...updates } : o
        ));
        return 'Orçamento atualizado!';
      },
      error: 'Erro ao atualizar orçamento'
    });
  };

  // 🗑️ DELETE - Excluir com confirmação (NOVO PADRÃO)
  const handleDelete = (id) => {
    // Toast de confirmação com ação
    toast('Confirmar exclusão?', {
      description: 'Esta ação não pode ser desfeita.',
      duration: 10000, // 10 segundos para decidir
      action: {
        label: 'Excluir',
        onClick: async () => {
          const deletePromise = orcamentosService.delete(id);
          
          toast.promise(deletePromise, {
            loading: 'Excluindo...',
            success: () => {
              setOrcamentos(orcamentos.filter(o => o.id !== id));
              return 'Orçamento excluído!';
            },
            error: 'Erro ao excluir'
          });
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {} // Apenas fecha o toast
      }
    });
  };

  return (
    <div>
      {/* Seus componentes aqui */}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// EXEMPLO 2: Formulário com Validação
// ═══════════════════════════════════════════════════════════════

export const FormularioOrcamentoExample = () => {
  const [formData, setFormData] = useState({
    clienteId: '',
    items: [],
    // ... outros campos
  });

  // Validação com feedback via toast
  const validateForm = () => {
    // Cliente obrigatório
    if (!formData.clienteId) {
      toast.error('Cliente obrigatório', {
        description: 'Selecione um cliente para continuar',
        icon: '👤'
      });
      return false;
    }

    // Pelo menos um item
    if (formData.items.length === 0) {
      toast.warning('Adicione itens ao orçamento', {
        description: 'Um orçamento precisa ter pelo menos 1 item',
        icon: '📦'
      });
      return false;
    }

    // Validação de valores
    const total = calcularTotal(formData.items);
    if (total <= 0) {
      toast.error('Valor total inválido', {
        description: 'O valor total deve ser maior que zero'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar antes de enviar
    if (!validateForm()) return;

    // Enviar com feedback
    const promise = orcamentosService.create(formData);
    
    toast.promise(promise, {
      loading: 'Salvando orçamento...',
      success: (data) => {
        // Resetar form
        setFormData({ clienteId: '', items: [] });
        return `Orçamento #${data.numero} criado!`;
      },
      error: (err) => ({
        title: 'Erro ao salvar',
        description: err.message || 'Tente novamente mais tarde'
      })
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Seus campos aqui */}
    </form>
  );
};

// ═══════════════════════════════════════════════════════════════
// EXEMPLO 3: Adicionar Item (Estoque ou Manual)
// ═══════════════════════════════════════════════════════════════

export const AdicionarItemExample = () => {
  const [items, setItems] = useState([]);

  // Adicionar item do estoque
  const handleAddFromStock = (material) => {
    const newItem = {
      id: Date.now(),
      materialId: material.id,
      name: material.name,
      quantity: 1,
      price: material.price
    };
    
    setItems([...items, newItem]);
    
    toast.success('Item adicionado do estoque!', {
      description: `${material.name} - ${material.quantity} disponível`,
      icon: '📦'
    });
  };

  // Adicionar item manual
  const handleAddManual = (manualItem) => {
    const newItem = {
      id: Date.now(),
      ...manualItem,
      isManual: true
    };
    
    setItems([...items, newItem]);
    
    toast.success('Item manual adicionado!', {
      description: `${manualItem.name} - Qtd: ${manualItem.quantity}`,
      icon: '✏️'
    });
  };

  // Remover item
  const handleRemoveItem = (id) => {
    const item = items.find(i => i.id === id);
    
    setItems(items.filter(i => i.id !== id));
    
    toast.info('Item removido', {
      description: item.name,
      action: {
        label: 'Desfazer',
        onClick: () => {
          setItems([...items, item]);
          toast.success('Item restaurado!');
        }
      }
    });
  };

  return <div>{/* Seus componentes */}</div>;
};

// ═══════════════════════════════════════════════════════════════
// EXEMPLO 4: Gerar PDF Personalizado
// ═══════════════════════════════════════════════════════════════

export const GerarPDFExample = () => {
  const [orcamento, setOrcamento] = useState(null);
  const [pdfConfig, setPdfConfig] = useState({});

  const handleGeneratePDF = async () => {
    // Toast com ID para atualizar depois
    const toastId = toast.loading('Gerando PDF personalizado...', {
      description: 'Isso pode levar alguns segundos',
      icon: '📄'
    });

    try {
      // Gerar PDF
      const pdfBlob = await pdfCustomizationService.generateCustomPDF(
        orcamento.id,
        pdfConfig
      );

      // Atualizar para sucesso
      toast.success('PDF gerado com sucesso!', {
        id: toastId,
        description: 'O download começará automaticamente',
        icon: '✅'
      });

      // Download automático
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orcamento-${orcamento.numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

    } catch (error) {
      // Atualizar para erro
      toast.error('Erro ao gerar PDF', {
        id: toastId,
        description: error.message || 'Tente novamente',
        action: {
          label: 'Tentar novamente',
          onClick: () => handleGeneratePDF()
        }
      });
    }
  };

  return <button onClick={handleGeneratePDF}>Gerar PDF</button>;
};

// ═══════════════════════════════════════════════════════════════
// EXEMPLO 5: Salvar Template de PDF
// ═══════════════════════════════════════════════════════════════

export const SalvarTemplateExample = () => {
  const [templateData, setTemplateData] = useState({});

  const handleSaveTemplate = async () => {
    // Validação
    if (!templateData.name) {
      toast.error('Nome obrigatório', {
        description: 'Digite um nome para o template'
      });
      return;
    }

    // Salvar com promise
    const promise = pdfCustomizationService.saveTemplate(templateData);

    toast.promise(promise, {
      loading: 'Salvando template...',
      success: (template) => {
        return {
          title: 'Template salvo!',
          description: `"${template.name}" está disponível para reutilização`,
          icon: '💾'
        };
      },
      error: 'Erro ao salvar template'
    });
  };

  // Carregar template salvo
  const handleLoadTemplate = async (templateId) => {
    try {
      const template = await pdfCustomizationService.getTemplate(templateId);
      setTemplateData(template.settings);
      
      toast.success('Template carregado!', {
        description: template.name,
        icon: '📂'
      });
    } catch (error) {
      toast.error('Erro ao carregar template');
    }
  };

  return <div>{/* Seus componentes */}</div>;
};

// ═══════════════════════════════════════════════════════════════
// EXEMPLO 6: Upload de Arquivo
// ═══════════════════════════════════════════════════════════════

export const UploadArquivoExample = () => {
  const handleUpload = async (file) => {
    // Validar tamanho
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande', {
        description: `Tamanho máximo: 5MB. Seu arquivo: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      });
      return;
    }

    // Validar tipo
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido', {
        description: 'Use PNG, JPG ou SVG'
      });
      return;
    }

    // Upload com progresso
    const toastId = toast.loading('Fazendo upload...', {
      description: file.name
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await pdfCustomizationService.uploadWatermark(formData);

      toast.success('Upload concluído!', {
        id: toastId,
        description: `${file.name} foi enviado com sucesso`
      });

      return result;
    } catch (error) {
      toast.error('Erro no upload', {
        id: toastId,
        description: 'Verifique o arquivo e tente novamente',
        action: {
          label: 'Tentar novamente',
          onClick: () => handleUpload(file)
        }
      });
    }
  };

  return <div>{/* Seus componentes */}</div>;
};

// ═══════════════════════════════════════════════════════════════
// EXEMPLO 7: Operações em Lote
// ═══════════════════════════════════════════════════════════════

export const OperacoesLoteExample = () => {
  const [selectedIds, setSelectedIds] = useState([]);

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Nenhum item selecionado', {
        description: 'Selecione pelo menos um orçamento'
      });
      return;
    }

    const toastId = toast.loading(
      `Aprovando ${selectedIds.length} orçamento(s)...`
    );

    try {
      await Promise.all(
        selectedIds.map(id => orcamentosService.approve(id))
      );

      toast.success('Aprovação concluída!', {
        id: toastId,
        description: `${selectedIds.length} orçamento(s) aprovado(s)`
      });

      setSelectedIds([]);
    } catch (error) {
      toast.error('Erro na aprovação em lote', {
        id: toastId
      });
    }
  };

  const handleBulkDelete = () => {
    toast('Excluir múltiplos orçamentos?', {
      description: `${selectedIds.length} orçamento(s) serão excluídos permanentemente.`,
      action: {
        label: 'Confirmar',
        onClick: async () => {
          const promise = Promise.all(
            selectedIds.map(id => orcamentosService.delete(id))
          );

          toast.promise(promise, {
            loading: 'Excluindo...',
            success: () => {
              setSelectedIds([]);
              return `${selectedIds.length} orçamento(s) excluído(s)`;
            },
            error: 'Erro ao excluir'
          });
        }
      }
    });
  };

  return <div>{/* Seus componentes */}</div>;
};

// ═══════════════════════════════════════════════════════════════
// EXEMPLO 8: Integração com API (Try-Catch com Toast)
// ═══════════════════════════════════════════════════════════════

export const APIIntegrationExample = () => {
  // Padrão 1: Try-Catch explícito
  const method1_TryCatch = async () => {
    try {
      const response = await fetch('/api/orcamentos');
      const data = await response.json();
      
      toast.success('Dados carregados!');
      return data;
    } catch (error) {
      toast.error('Erro ao carregar dados', {
        description: error.message
      });
    }
  };

  // Padrão 2: Toast.promise (RECOMENDADO)
  const method2_Promise = async () => {
    const promise = fetch('/api/orcamentos').then(r => r.json());
    
    return toast.promise(promise, {
      loading: 'Carregando...',
      success: 'Dados carregados!',
      error: (err) => `Erro: ${err.message}`
    });
  };

  // Padrão 3: Com ID para atualizar
  const method3_WithId = async () => {
    const toastId = toast.loading('Processando...');
    
    try {
      const data = await processData();
      toast.success('Processamento concluído!', { id: toastId });
      return data;
    } catch (error) {
      toast.error('Erro no processamento', { id: toastId });
      throw error;
    }
  };

  return <div>{/* Seus componentes */}</div>;
};

// ═══════════════════════════════════════════════════════════════
// 📝 RESUMO DAS MELHORES PRÁTICAS
// ═══════════════════════════════════════════════════════════════

/*

✅ FAÇA:
1. Use toast.promise para operações assíncronas
2. Adicione description para contexto adicional
3. Use ações (action) para operações reversíveis
4. Valide dados ANTES de mostrar loading
5. Use IDs para atualizar toasts existentes
6. Forneça feedback claro e específico
7. Use ícones relevantes quando apropriado

❌ NÃO FAÇA:
1. Não use window.alert() ou window.confirm()
2. Não mostre toasts em sequência rápida
3. Não use textos genéricos como "Erro"
4. Não esqueça de dar contexto ao usuário
5. Não abuse de toasts - use quando necessário

🎯 QUANDO USAR:
- ✅ Sucesso em operações CRUD
- ✅ Erros de validação
- ✅ Confirmações de exclusão
- ✅ Feedback de upload/download
- ✅ Progresso de operações longas
- ✅ Avisos importantes
- ✅ Informações úteis

🚫 QUANDO NÃO USAR:
- Erros de validação inline (use mensagens no form)
- Informações que precisam ser permanentes
- Dados tabulares ou listas
- Conteúdo que precisa scroll

*/

// ═══════════════════════════════════════════════════════════════
// FIM DOS EXEMPLOS
// ═══════════════════════════════════════════════════════════════

export default {
  OrcamentosCRUDExample,
  FormularioOrcamentoExample,
  AdicionarItemExample,
  GerarPDFExample,
  SalvarTemplateExample,
  UploadArquivoExample,
  OperacoesLoteExample,
  APIIntegrationExample
};

