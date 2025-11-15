import React, { useEffect, useMemo, useState } from 'react';
import { pessoaService, type PessoaDTO } from '../services/PessoaService';

export type TeamManagementMode = 'view' | 'add' | 'edit';

export interface TeamUser {
  id: string;
  nome: string;
  email: string;
  funcao: string;
}

interface TeamManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuarios: TeamUser[];
  onAddUsuario?: (usuario: TeamUser) => void;
  onUpdateUsuario?: (usuario: TeamUser) => void;
  onDeleteUsuario?: (usuarioId: string) => void;
}

const TeamManagerModal: React.FC<TeamManagerModalProps> = ({ 
  isOpen, 
  onClose, 
  usuarios = [],
  onAddUsuario,
  onUpdateUsuario,
  onDeleteUsuario
}) => {
  const [mode, setMode] = useState<TeamManagementMode>('view');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<TeamUser, 'id'>>({ nome: '', email: '', funcao: '' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Não precisa mais carregar users - usa os usuarios recebidos via props

  const filtered = useMemo(() => {
    if (!Array.isArray(usuarios)) {
      console.warn('TeamManagerModal: usuarios não é um array', usuarios);
      return [];
    }
    const s = search.toLowerCase();
    return usuarios.filter(u => 
      u && u.nome && u.email && u.funcao &&
      (u.nome.toLowerCase().includes(s) || 
       u.email.toLowerCase().includes(s) || 
       u.funcao.toLowerCase().includes(s))
    );
  }, [usuarios, search]);

  if (!isOpen) return null;

  // Debug log
  useEffect(() => {
    if (isOpen) {
      console.log('TeamManagerModal aberto. Usuários:', usuarios?.length || 0);
    }
  }, [isOpen, usuarios]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'add') {
        const newUsuario: TeamUser = {
          id: Date.now().toString(), // ID temporário
          nome: form.nome,
          email: form.email,
          funcao: form.funcao
        };
        onAddUsuario?.(newUsuario);
      } else if (mode === 'edit' && editingId) {
        const updatedUsuario: TeamUser = {
          id: editingId,
          nome: form.nome,
          email: form.email,
          funcao: form.funcao
        };
        onUpdateUsuario?.(updatedUsuario);
      }
      setMode('view');
      setEditingId(null);
      setForm({ nome: '', email: '', funcao: '' });
    } catch (err: any) {
      console.error('Erro ao salvar usuário:', err);
      setError(err.message || 'Erro ao salvar usuário');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-dark-border flex items-center justify-between" style={{ backgroundColor: '#0a1a2f' }}>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white">Gerenciar Equipe</h3>
            <span className="text-xs px-2 py-1 rounded bg-white/20 text-white">{mode.toUpperCase()}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-white">✕</button>
        </div>

        {mode === 'view' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou função"
                className="w-full max-w-sm px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
              />
              <button
                onClick={() => { setMode('add'); setForm({ nome: '', email: '', funcao: '' }); }}
                className="ml-3 px-4 py-2 text-white rounded-lg font-semibold"
                style={{ backgroundColor: '#0a1a2f' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d2847'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a1a2f'}
              >
                + Adicionar
              </button>
            </div>

            <div className="bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-dark-text uppercase">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-dark-text uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 dark:text-dark-text uppercase">Função</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 dark:text-dark-text uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                  {loading && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-dark-text-secondary">Carregando...</td></tr>
                  )}
                  {!loading && filtered.map(u => (
                    <tr key={u.id}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-dark-text">{u.nome}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary">{u.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-dark-text-secondary">{u.funcao}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => { setEditingId(u.id); setForm({ nome: u.nome, email: u.email, funcao: u.funcao }); setMode('edit'); }}
                          className="px-3 py-1.5 text-sm text-white rounded-lg mr-2"
                          style={{ backgroundColor: '#0a1a2f' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d2847'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a1a2f'}
                        >Editar</button>
                        <button
                          onClick={() => onDeleteUsuario?.(u.id)}
                          className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg"
                        >Excluir</button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center">
                        <div className="text-gray-500 dark:text-dark-text-secondary">
                          <p className="mb-2">Nenhum usuário técnico encontrado</p>
                          <p className="text-xs">
                            Certifique-se de que existem usuários com as funções: Engenheiro, Técnico, Orçamentista, Compras ou Gerente
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {error && <div className="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">{error}</div>}
            </div>
          </div>
        )}

        {(mode === 'add' || mode === 'edit') && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1">Nome</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-1">Função</label>
                <input
                  value={form.funcao}
                  onChange={(e) => setForm({ ...form, funcao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text"
                  placeholder="Ex: Engenheiro Elétrico, Técnico, Gerente"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-dark-border">
              <button type="button" onClick={() => { setMode('view'); setEditingId(null); }} className="px-6 py-3 text-gray-700 dark:text-dark-text bg-gray-100 dark:bg-dark-card rounded-xl hover:bg-gray-200 dark:hover:bg-dark-border font-semibold">Cancelar</button>
              <button 
                type="submit" 
                className="px-6 py-3 text-white rounded-xl font-semibold"
                style={{ backgroundColor: '#0a1a2f' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0d2847'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0a1a2f'}
              >Salvar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TeamManagerModal;


