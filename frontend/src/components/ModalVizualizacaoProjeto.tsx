import React, { useEffect, useMemo, useState } from 'react';
import { axiosApiService } from '../services/axiosApi';
import { ENDPOINTS } from '../config/api';
import { etapasAdminService, type EtapaAdmin, type ListaEtapasResponse } from '../services/etapasAdminService';

type ProjetoStatus = 'PROPOSTA' | 'APROVADO' | 'EXECUCAO' | 'CONCLUIDO';

interface ClienteRef { id: string; nome: string }
interface OrcamentoItemRef { id: string; material?: { nome: string; sku: string } | null; kit?: { nome: string } | null; quantidade?: number; subtotal?: number }
interface OrcamentoRef { id: string; status: string; precoVenda?: number; items?: OrcamentoItemRef[] }

export interface ProjetoDetalhe {
  id: string;
  titulo: string;
  descricao?: string | null;
  cliente: ClienteRef;
  orcamento?: OrcamentoRef;
  status: ProjetoStatus;
  valorTotal?: number;
  createdAt?: string;
}

type Aba = 'Visão Geral' | 'Materiais' | 'EtapasAdmin' | 'Kanban' | 'Qualidade';

interface ModalVizualizacaoProjetoProps {
  projeto: ProjetoDetalhe;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: Aba;
  onRefresh?: () => void; // chamado após alterações (ex: mudança de status)
}

const TABS: Aba[] = ['Visão Geral', 'Materiais', 'EtapasAdmin', 'Kanban', 'Qualidade'];

const ModalVizualizacaoProjeto: React.FC<ModalVizualizacaoProjetoProps> = ({ projeto, isOpen, onClose, initialTab = 'Visão Geral', onRefresh }) => {
  const [activeTab, setActiveTab] = useState<Aba>(initialTab);
  const [loadingAcao, setLoadingAcao] = useState(false);

  // Etapas Admin
  const [etapasResp, setEtapasResp] = useState<ListaEtapasResponse | null>(null);
  const [loadingEtapas, setLoadingEtapas] = useState(false);
  const [erroEtapas, setErroEtapas] = useState<string | null>(null);

  // Modal adiar
  const [adiarAberto, setAdiarAberto] = useState<{ etapa: EtapaAdmin | null; novaData: string; justificativa: string }>({ etapa: null, novaData: '', justificativa: '' });

  useEffect(() => {
    if (isOpen && activeTab === 'EtapasAdmin') {
      carregarEtapas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, activeTab, projeto?.id]);

  async function carregarEtapas() {
    try {
      setLoadingEtapas(true);
      setErroEtapas(null);
      const res = await etapasAdminService.listar(projeto.id);
      if (res.success) {
        setEtapasResp(res.data);
      } else {
        setErroEtapas('Falha ao carregar etapas');
      }
    } catch (e) {
      setErroEtapas('Erro ao carregar etapas');
    } finally {
      setLoadingEtapas(false);
    }
  }

  const podeGerarObra = useMemo(() => projeto.status === 'APROVADO', [projeto.status]);

  async function handleGerarObra() {
    try {
      setLoadingAcao(true);
      await axiosApiService.put(`${ENDPOINTS.PROJETOS}/${projeto.id}/status`, { status: 'EXECUCAO' });
      if (onRefresh) onRefresh();
      setActiveTab('EtapasAdmin');
      await carregarEtapas();
    } finally {
      setLoadingAcao(false);
    }
  }

  async function handleConcluirEtapa(etapa: EtapaAdmin) {
    await etapasAdminService.concluir(projeto.id, etapa.id);
    await carregarEtapas();
  }

  async function handleAdiarEnviar() {
    if (!adiarAberto.etapa) return;
    await etapasAdminService.estenderPrazo(
      projeto.id,
      adiarAberto.etapa.id,
      adiarAberto.novaData,
      adiarAberto.justificativa
    );
    setAdiarAberto({ etapa: null, novaData: '', justificativa: '' });
    await carregarEtapas();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-brand-gray-900">{projeto.titulo}</h2>
            <p className="text-sm text-brand-gray-600">Cliente: {projeto.cliente?.nome}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md text-brand-gray-500 hover:bg-brand-gray-100">✕</button>
        </div>

        {/* Abas */}
        <div className="px-6 pt-4">
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1 w-full overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'Visão Geral' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-brand-gray-600">
                  <div><strong>Status:</strong> {projeto.status}</div>
                  {projeto.valorTotal != null && (
                    <div><strong>Valor Total:</strong> R$ {projeto.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  )}
                </div>
                {podeGerarObra && (
                  <button
                    onClick={handleGerarObra}
                    disabled={loadingAcao}
                    className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg hover:bg-brand-blue/90 disabled:opacity-50"
                  >
                    {loadingAcao ? 'Gerando...' : 'Gerar Obra'}
                  </button>
                )}
              </div>

              {projeto.descricao && (
                <div className="bg-white border border-brand-gray-200 rounded-lg p-4">
                  <div className="text-sm text-brand-gray-700 whitespace-pre-line">{projeto.descricao}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Materiais' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-gray-900">Materiais do Projeto (BOM)</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Buscar materiais para alocar (simulação)"
                    className="px-3 py-2 border border-brand-gray-300 rounded-md"
                  />
                  <button className="px-3 py-2 bg-white border-2 border-brand-blue text-brand-blue font-semibold rounded-lg">
                    Localizar
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full border border-brand-gray-200 bg-white rounded-lg overflow-hidden">
                  <thead className="bg-brand-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-sm text-brand-gray-600">Item</th>
                      <th className="text-left px-4 py-2 text-sm text-brand-gray-600">SKU</th>
                      <th className="text-left px-4 py-2 text-sm text-brand-gray-600">Quantidade</th>
                      <th className="text-left px-4 py-2 text-sm text-brand-gray-600">Subtotal</th>
                      <th className="text-left px-4 py-2 text-sm text-brand-gray-600">Alocação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projeto.orcamento?.items?.map((i) => (
                      <tr key={i.id} className="border-t">
                        <td className="px-4 py-2 text-sm">{i.material?.nome || i.kit?.nome || '-'}</td>
                        <td className="px-4 py-2 text-sm">{i.material?.sku || '-'}</td>
                        <td className="px-4 py-2 text-sm">{i.quantidade ?? '-'}</td>
                        <td className="px-4 py-2 text-sm">{i.subtotal != null ? `R$ ${i.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}</td>
                        <td className="px-4 py-2 text-sm">
                          <select className="px-2 py-1 border border-brand-gray-300 rounded-md">
                            <option>Não alocado</option>
                            <option>Reservar do estoque</option>
                            <option>Solicitar compra</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'EtapasAdmin' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-gray-900">Etapas Administrativas</h3>
                <button onClick={carregarEtapas} className="px-3 py-2 bg-white border-2 border-brand-blue text-brand-blue font-semibold rounded-lg">Atualizar</button>
              </div>

              {loadingEtapas && <div className="text-sm text-brand-gray-600">Carregando...</div>}
              {erroEtapas && <div className="text-sm text-red-700">{erroEtapas}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {etapasResp?.etapas.map((etapa) => {
                  const atrasada = etapa.atrasada;
                  const realizada = etapa.concluida; // compatível com backend
                  return (
                    <div key={etapa.id} className={`rounded-lg border p-4 ${atrasada && !realizada ? 'border-red-300 bg-red-50' : 'border-brand-gray-200 bg-white'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-brand-gray-900">{etapa.nome || etapa.tipo}</div>
                        <span className={`text-xs px-2 py-1 rounded-full ${realizada ? 'bg-green-100 text-green-700' : atrasada ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {realizada ? 'Concluída' : atrasada ? 'Atrasada' : 'Pendente'}
                        </span>
                      </div>
                      <div className="text-xs text-brand-gray-600 mb-3">
                        Prazo: {new Date(etapa.dataPrevista).toLocaleString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          disabled={realizada}
                          onClick={() => handleConcluirEtapa(etapa)}
                          className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded disabled:opacity-50"
                        >
                          Realizada
                        </button>
                        <button
                          disabled={realizada}
                          onClick={() => setAdiarAberto({ etapa, novaData: '', justificativa: '' })}
                          className="px-3 py-1.5 bg-white border-2 border-brand-blue text-brand-blue text-sm font-semibold rounded disabled:opacity-50"
                        >
                          Adiar Prazo
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Kanban' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-brand-gray-900">Etapas (Kanban)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['A Fazer', 'Em Andamento', 'Concluído'].map(col => (
                  <div key={col} className="bg-white border border-brand-gray-200 rounded-lg p-3">
                    <div className="font-semibold text-brand-gray-900 mb-2">{col}</div>
                    <div className="text-sm text-brand-gray-500">(Placeholder) Nenhuma tarefa cadastrada</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Qualidade' && (
            <div className="text-sm text-brand-gray-600">Módulo de Qualidade (placeholder)</div>
          )}
        </div>

        {/* Modal Adiar */}
        {adiarAberto.etapa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-brand-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-brand-gray-900">Adiar Prazo</h3>
                <button onClick={() => setAdiarAberto({ etapa: null, novaData: '', justificativa: '' })} className="p-2 rounded-md text-brand-gray-500 hover:bg-brand-gray-100">✕</button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-brand-gray-700 mb-1">Nova Data</label>
                  <input
                    type="datetime-local"
                    value={adiarAberto.novaData}
                    onChange={(e) => setAdiarAberto(prev => ({ ...prev, novaData: e.target.value }))}
                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-brand-gray-700 mb-1">Justificativa</label>
                  <textarea
                    rows={3}
                    value={adiarAberto.justificativa}
                    onChange={(e) => setAdiarAberto(prev => ({ ...prev, justificativa: e.target.value }))}
                    className="w-full px-3 py-2 border border-brand-gray-300 rounded-md"
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => setAdiarAberto({ etapa: null, novaData: '', justificativa: '' })} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg">Cancelar</button>
                  <button onClick={handleAdiarEnviar} className="px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg">Enviar</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ModalVizualizacaoProjeto;


