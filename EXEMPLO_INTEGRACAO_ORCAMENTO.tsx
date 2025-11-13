/**
 * 📝 EXEMPLO COMPLETO DE INTEGRAÇÃO
 * 
 * Este arquivo mostra EXATAMENTE como integrar o sistema de validade de preços
 * em um componente de criação de orçamento.
 * 
 * COPIE E ADAPTE este código para seu componente real!
 */

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import PrecoValidadeFlag from './frontend/src/components/PrecoValidadeFlag';
import HistoricoPrecosModal from './frontend/src/components/HistoricoPrecosModal';
import { precosService } from './frontend/src/services/precosService';
import { axiosApiService } from './frontend/src/services/axiosApi';

// ===== TIPOS =====
interface Material {
  id: string;
  nome: string;
  sku: string;
  preco: number;
  estoque: number;
  unidadeMedida: string;
  ultimaAtualizacaoPreco?: string | null; // ← IMPORTANTE!
  categoria: string;
}

interface OrcamentoItem {
  id?: string;
  tipo: 'MATERIAL' | 'SERVICO';
  materialId?: string;
  nome: string;
  quantidade: number;
  precoUnit: number;
  subtotal: number;
}

// ===== COMPONENTE =====
const ExemploOrcamentoComValidadePreco: React.FC = () => {
  // Estados básicos do orçamento
  const [items, setItems] = useState<OrcamentoItem[]>([]);
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [materiaisFiltrados, setMateriaisFiltrados] = useState<Material[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // ✨ ESTADOS PARA HISTÓRICO - ADICIONAR ESTES
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  // Carregar materiais
  useEffect(() => {
    loadMateriais();
  }, []);

  const loadMateriais = async () => {
    try {
      const response = await axiosApiService.get('/api/materiais');
      
      if (response.success && response.data) {
        setMateriais(response.data);
        setMateriaisFiltrados(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar materiais:', error);
      toast.error('Erro ao carregar materiais');
    }
  };

  // Filtrar materiais
  useEffect(() => {
    if (searchTerm) {
      const filtered = materiais.filter(m =>
        m.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setMateriaisFiltrados(filtered);
    } else {
      setMateriaisFiltrados(materiais);
    }
  }, [searchTerm, materiais]);

  // ✨ ADICIONAR MATERIAL COM VALIDAÇÃO DE PREÇO
  const handleAddMaterial = (material: Material) => {
    // VALIDAR PREÇO ANTES DE ADICIONAR
    const podeAdicionar = precosService.validarPrecoParaOrcamento(material, true);
    
    if (!podeAdicionar) {
      toast.error('Material não adicionado. Atualize o preço primeiro!');
      return;
    }

    // Mostrar alerta se preço está em alerta (amarelo)
    const status = precosService.getStatusPreco(material.ultimaAtualizacaoPreco);
    if (status === 'alerta') {
      const dias = precosService.calcularDiasDesdeAtualizacao(material.ultimaAtualizacaoPreco);
      toast.warning(
        `⚠️ Preço próximo de expirar (${dias} dias). Considere atualizar em breve.`,
        { duration: 5000 }
      );
    }

    // Adicionar item ao orçamento
    const newItem: OrcamentoItem = {
      tipo: 'MATERIAL',
      materialId: material.id,
      nome: material.nome,
      quantidade: 1,
      precoUnit: material.preco || 0,
      subtotal: material.preco || 0
    };

    setItems(prev => [...prev, newItem]);
    toast.success(`✅ ${material.nome} adicionado ao orçamento`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Novo Orçamento</h1>

      {/* ===== BUSCA DE MATERIAIS ===== */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border rounded-xl"
        />
      </div>

      {/* ===== LISTA DE MATERIAIS DISPONÍVEIS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {materiaisFiltrados.map(material => (
          <div key={material.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all">
            {/* ✨ CABEÇALHO COM FLAG DE VALIDADE */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-gray-900">{material.nome}</h4>
                  
                  {/* ✨✨✨ FLAG DE VALIDADE - COPIE ISTO ✨✨✨ */}
                  <PrecoValidadeFlag 
                    ultimaAtualizacao={material.ultimaAtualizacaoPreco}
                    precoAtual={material.preco || 0}
                    materialNome={material.nome}
                  />
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  SKU: {material.sku} • Estoque: {material.estoque} {material.unidadeMedida}
                </p>
              </div>
            </div>

            {/* Preço */}
            <div className="mb-3">
              <p className="text-xs text-gray-500">Preço Unitário</p>
              <p className="text-2xl font-bold text-indigo-600">
                R$ {(material.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              {material.ultimaAtualizacaoPreco && (
                <p className="text-xs text-gray-500 mt-1">
                  Atualizado {precosService.formatarDataAtualizacao(material.ultimaAtualizacaoPreco)}
                </p>
              )}
            </div>

            {/* ✨ AÇÕES COM HISTÓRICO */}
            <div className="flex gap-2">
              {/* ✨✨✨ BOTÃO DE HISTÓRICO - COPIE ISTO ✨✨✨ */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMaterialId(material.id);
                  setHistoricoModalOpen(true);
                }}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Histórico
              </button>
              
              {/* Botão Adicionar */}
              <button
                onClick={() => handleAddMaterial(material)}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-600 transition-all font-semibold"
              >
                ➕ Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===== ITENS DO ORÇAMENTO ===== */}
      <div className="bg-white border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Itens do Orçamento</h2>
        
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhum item adicionado ainda
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold">{item.nome}</p>
                  <p className="text-sm text-gray-600">
                    Qtd: {item.quantidade} • R$ {item.precoUnit.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-bold text-indigo-600">
                    R$ {item.subtotal.toFixed(2)}
                  </p>
                  <button
                    onClick={() => setItems(prev => prev.filter((_, i) => i !== index))}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            
            {/* Total */}
            <div className="border-t-2 pt-4 mt-4">
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold">Total:</p>
                <p className="text-3xl font-bold text-indigo-600">
                  R$ {items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✨✨✨ MODAL DE HISTÓRICO - COPIE ISTO NO FINAL DO RETURN ✨✨✨ */}
      <HistoricoPrecosModal 
        materialId={selectedMaterialId || ''}
        isOpen={historicoModalOpen}
        onClose={() => {
          setHistoricoModalOpen(false);
          setSelectedMaterialId(null);
        }}
      />
    </div>
  );
};

export default ExemploOrcamentoComValidadePreco;

/**
 * ============================================
 * 📋 CHECKLIST DE INTEGRAÇÃO NO SEU COMPONENTE
 * ============================================
 * 
 * [ ] 1. Importar componentes:
 *        - import PrecoValidadeFlag from './PrecoValidadeFlag';
 *        - import HistoricoPrecosModal from './HistoricoPrecosModal';
 *        - import { precosService } from '../services/precosService';
 * 
 * [ ] 2. Adicionar estados:
 *        - const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
 *        - const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
 * 
 * [ ] 3. Atualizar interface Material:
 *        - Adicionar: ultimaAtualizacaoPreco?: string | null;
 * 
 * [ ] 4. Adicionar flag ao lado do nome do material:
 *        - <PrecoValidadeFlag ... />
 * 
 * [ ] 5. Adicionar botão de histórico:
 *        - <button onClick={() => { setSelectedMaterialId(...); setHistoricoModalOpen(true); }}>
 * 
 * [ ] 6. Adicionar modal no final do return:
 *        - <HistoricoPrecosModal ... />
 * 
 * [ ] 7. Adicionar validação em handleAddMaterial:
 *        - precosService.validarPrecoParaOrcamento(material, true)
 * 
 * [ ] 8. Testar:
 *        - Flag aparece colorida
 *        - HoverCard abre ao passar mouse
 *        - Modal abre ao clicar "Histórico"
 *        - Alerta aparece ao tentar adicionar material desatualizado
 * 
 * ✅ PRONTO! Sistema 100% integrado!
 */

