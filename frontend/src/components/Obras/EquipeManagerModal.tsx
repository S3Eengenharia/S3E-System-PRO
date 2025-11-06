import React, { useState, useEffect } from 'react';
import { axiosApiService } from '../../services/axiosApi';

interface Membro {
  id: string;
  nome: string;
  funcao: string;
  especialidade: string;
  disponivel: boolean;
}

interface Equipe {
  id: string;
  nome: string;
  membros: Membro[];
  status: 'disponivel' | 'ocupada' | 'manutencao';
  proximaDisponibilidade?: string;
  totalProjetos: number;
  projetosConcluidos: number;
}

interface EquipeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEquipeEdit?: (equipe: Equipe) => void;
}

const EquipeManagerModal: React.FC<EquipeManagerModalProps> = ({ 
  isOpen, 
  onClose, 
  onEquipeEdit 
}) => {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEquipe, setSelectedEquipe] = useState<Equipe | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Carregar dados das equipes
  const loadEquipes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Carregando equipes para o modal...');
      const response = await axiosApiService.get<Equipe[]>('/api/obras/equipes');
      
      if (response.success && response.data) {
        console.log('✅ Equipes carregadas para o modal:', response.data.length);
        setEquipes(response.data);
      } else {
        const errorMsg = response.error || 'Erro ao carregar equipes';
        console.error('❌ Erro ao carregar equipes no modal:', errorMsg);
        setError(errorMsg);
        setEquipes([]); // Fallback para array vazio
      }
    } catch (error) {
      console.error('❌ Erro ao carregar equipes no modal:', error);
      setError('Erro de conexão ao carregar equipes');
      setEquipes([]); // Fallback para array vazio
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEquipes();
    }
  }, [isOpen]);

  const handleEditEquipe = (equipe: Equipe) => {
    setSelectedEquipe(equipe);
    setShowEditModal(true);
    if (onEquipeEdit) {
      onEquipeEdit(equipe);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-800';
      case 'ocupada': return 'bg-yellow-100 text-yellow-800';
      case 'manutencao': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'disponivel': return 'Disponível';
      case 'ocupada': return 'Ocupada';
      case 'manutencao': return 'Manutenção';
      default: return 'Desconhecido';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" onClick={onClose}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Gerenciamento de Equipes
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gerencie as equipes operacionais e visualize estatísticas
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                    <p className="mt-2 text-gray-600">Carregando equipes...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Erro ao carregar dados</h3>
                      <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Estatísticas Gerais */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-900">Total de Equipes</p>
                          <p className="text-2xl font-semibold text-blue-600">{equipes.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-900">Disponíveis</p>
                          <p className="text-2xl font-semibold text-green-600">
                            {equipes.filter(e => e.status === 'disponivel').length}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-yellow-900">Em Atividade</p>
                          <p className="text-2xl font-semibold text-yellow-600">
                            {equipes.filter(e => e.status === 'ocupada').length}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Equipes */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-medium text-gray-900">Equipes Operacionais</h4>
                    {equipes.map((equipe) => (
                      <div key={equipe.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h5 className="text-lg font-medium text-gray-900">{equipe.nome}</h5>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(equipe.status)}`}>
                                {getStatusText(equipe.status)}
                              </span>
                            </div>
                            
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Membros</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {equipe.membros.length} membros
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Projetos</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {equipe.projetosConcluidos}/{equipe.totalProjetos} concluídos
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Próxima Disponibilidade</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(equipe.proximaDisponibilidade)}
                                </p>
                              </div>
                            </div>

                            {/* Lista de Membros */}
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-2">Membros da Equipe:</p>
                              <div className="flex flex-wrap gap-2">
                                {equipe.membros.map((membro) => (
                                  <div key={membro.id} className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                                    <div className={`w-2 h-2 rounded-full ${membro.disponivel ? 'bg-green-400' : 'bg-red-400'}`}></div>
                                    <span className="text-sm font-medium text-gray-900">{membro.nome}</span>
                                    <span className="text-xs text-gray-500">({membro.funcao})</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="ml-4">
                            <button
                              onClick={() => handleEditEquipe(equipe)}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar Membros
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={onClose}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-blue text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EquipeManagerModal;
