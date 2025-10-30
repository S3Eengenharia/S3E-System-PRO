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
}

const TeamManagerModal: React.FC<TeamManagerModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<TeamManagementMode>('view');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<TeamUser, 'id'>>({ nome: '', email: '', funcao: '' });
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      void loadUsers();
    }
  }, [isOpen]);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);
      const res = await pessoaService.getAllPessoas();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data.map(p => ({ id: p.id!, nome: p.nome, email: p.email || '', funcao: p.funcao })));
      } else {
        setUsers([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar pessoas');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return users.filter(u => u.nome.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.funcao.toLowerCase().includes(s));
  }, [users, search]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'add') {
      await pessoaService.createPessoa({ nome: form.nome, email: form.email, funcao: form.funcao as any });
      await loadUsers();
    } else if (mode === 'edit' && editingId) {
      await pessoaService.updatePessoa(editingId, { nome: form.nome, email: form.email, funcao: form.funcao as any });
      await loadUsers();
    }
    setMode('view');
    setEditingId(null);
    setForm({ nome: '', email: '', funcao: '' });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">Gerenciar Equipe</h3>
            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">{mode.toUpperCase()}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">✕</button>
        </div>

        {mode === 'view' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, email ou função"
                className="w-full max-w-sm px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => { setMode('add'); setForm({ nome: '', email: '', funcao: '' }); }}
                className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                + Adicionar
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase">Função</th>
                    <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading && (
                    <tr><td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">Carregando...</td></tr>
                  )}
                  {!loading && filtered.map(u => (
                    <tr key={u.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{u.nome}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{u.email}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{u.funcao}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => { setEditingId(u.id); setForm({ nome: u.nome, email: u.email, funcao: u.funcao }); setMode('edit'); }}
                          className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg mr-2"
                        >Editar</button>
                        <button
                          onClick={async () => { await pessoaService.deletePessoa(u.id); await loadUsers(); }}
                          className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg"
                        >Excluir</button>
                      </td>
                    </tr>
                  ))}
                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-gray-500">Nenhum usuário encontrado</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {error && <div className="p-3 text-sm text-red-700 bg-red-50 border-t border-red-200">{error}</div>}
            </div>
          </div>
        )}

        {(mode === 'add' || mode === 'edit') && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Função</label>
                <input
                  value={form.funcao}
                  onChange={(e) => setForm({ ...form, funcao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ex: Engenheiro Elétrico, Técnico, Gerente"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => { setMode('view'); setEditingId(null); }} className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold">Cancelar</button>
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold">Salvar</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TeamManagerModal;


