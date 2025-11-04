import React, { useState, useEffect } from 'react';
import { obrasService, type TarefaObra, type RegistroAtividade } from '../services/obrasService';

// Icons
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const ClipboardDocumentListIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
);

interface ModalRegistroAtividadeProps {
    tarefaId: string;
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
}

const ModalRegistroAtividade: React.FC<ModalRegistroAtividadeProps> = ({ tarefaId, isOpen, onClose, onSave }) => {
    const [tarefa, setTarefa] = useState<TarefaObra | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        descricaoAtividade: '',
        horasTrabalhadas: 0,
        observacoes: ''
    });

    useEffect(() => {
        if (isOpen && tarefaId) {
            loadTarefa();
        }
    }, [isOpen, tarefaId]);

    const loadTarefa = async () => {
        try {
            setLoading(true);
            const response = await obrasService.getTarefa(tarefaId);
            
            if (response.success && response.data) {
                setTarefa(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar tarefa:', error);
            alert('❌ Erro ao carregar detalhes da tarefa');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.descricaoAtividade.trim()) {
            alert('⚠️ Descrição da atividade é obrigatória');
            return;
        }

        if (formData.horasTrabalhadas <= 0) {
            alert('⚠️ Horas trabalhadas devem ser maiores que zero');
            return;
        }

        try {
            setSaving(true);
            const response = await obrasService.addRegistroAtividade(tarefaId, formData);
            
            if (response.success) {
                alert('✅ Registro salvo com sucesso!');
                setFormData({ descricaoAtividade: '', horasTrabalhadas: 0, observacoes: '' });
                await loadTarefa();
                if (onSave) onSave();
            } else {
                alert(`❌ ${response.error || 'Erro ao salvar registro'}`);
            }
        } catch (error) {
            console.error('Erro ao salvar registro:', error);
            alert('❌ Erro ao salvar registro de atividade');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="relative p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center shadow-lg">
                            <ClipboardDocumentListIcon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900">Registro de Atividades</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {loading ? 'Carregando...' : tarefa?.descricao}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Detalhes da Tarefa */}
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 mb-1">Progresso</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full"
                                                    style={{ width: `${tarefa?.progresso || 0}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{tarefa?.progresso || 0}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-600 mb-1">Registros</p>
                                        <p className="text-2xl font-bold text-orange-600">
                                            {tarefa?.registrosAtividade?.length || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Formulário de Novo Registro */}
                            <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <PlusIcon className="w-5 h-5 text-blue-600" />
                                    Novo Registro de Atividade
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            O que foi feito? *
                                        </label>
                                        <textarea
                                            value={formData.descricaoAtividade}
                                            onChange={(e) => setFormData({...formData, descricaoAtividade: e.target.value})}
                                            required
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                                            placeholder="Descreva as atividades realizadas..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Horas Trabalhadas *
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.horasTrabalhadas}
                                                onChange={(e) => setFormData({...formData, horasTrabalhadas: parseFloat(e.target.value)})}
                                                required
                                                min="0.5"
                                                step="0.5"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                                                placeholder="8.0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Observações
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.observacoes}
                                                onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                                                placeholder="Opcional"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-gray-200">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl hover:from-orange-700 hover:to-orange-600 transition-all shadow-lg font-semibold disabled:opacity-50"
                                        >
                                            {saving ? 'Salvando...' : 'Salvar Registro'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Lista de Registros Anteriores */}
                            <div>
                                <h3 className="font-bold text-gray-900 mb-4">Histórico de Atividades</h3>
                                
                                {!tarefa?.registrosAtividade || tarefa.registrosAtividade.length === 0 ? (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                                        <p className="text-gray-500">Nenhum registro de atividade ainda</p>
                                        <p className="text-xs text-gray-400 mt-1">Adicione o primeiro registro acima</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {tarefa.registrosAtividade.map((registro: RegistroAtividade) => (
                                            <div key={registro.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900">{registro.descricaoAtividade}</p>
                                                        {registro.observacoes && (
                                                            <p className="text-sm text-gray-600 mt-1">{registro.observacoes}</p>
                                                        )}
                                                    </div>
                                                    <span className="ml-4 px-3 py-1 bg-orange-100 text-orange-800 text-xs font-bold rounded-lg">
                                                        {registro.horasTrabalhadas}h
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(registro.dataRegistro).toLocaleString('pt-BR')}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalRegistroAtividade;

