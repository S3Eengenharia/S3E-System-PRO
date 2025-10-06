
import React, { useState } from 'react';
import { type User, UserRole } from '../types';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Icons
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        <path d="m15 5 4 4" />
    </svg>
);
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);


// Mock User Data
const initialUsersData: User[] = [
    { id: 'USR-001', name: 'Usuário Admin', email: 'admin@s3e.com.br', role: UserRole.Admin },
    { id: 'USR-002', name: 'João Engenheiro', email: 'joao.eng@s3e.com.br', role: UserRole.Engenheiro },
    { id: 'USR-003', name: 'Maria Técnica', email: 'maria.tec@s3e.com.br', role: UserRole.Tecnico },
    { id: 'USR-004', name: 'Carlos Desenhista', email: 'carlos.des@s3e.com.br', role: UserRole.DesenhistaIndustrial },
    { id: 'USR-005', name: 'Ana Desenvolvedora', email: 'ana.dev@s3e.com.br', role: UserRole.Desenvolvedor },
];

const getRoleClass = (role: UserRole) => {
    switch (role) {
        case UserRole.Admin: return 'bg-red-100 text-red-800';
        case UserRole.Engenheiro: return 'bg-blue-100 text-blue-800';
        case UserRole.Tecnico: return 'bg-yellow-100 text-yellow-800';
        case UserRole.DesenhistaIndustrial: return 'bg-purple-100 text-purple-800';
        case UserRole.Desenvolvedor: return 'bg-gray-800 text-white';
        default: return 'bg-gray-100 text-gray-800';
    }
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    // Current user state
    const [name, setName] = useState('Usuário');
    const [email, setEmail] = useState('admin@s3e.com.br');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // User management state
    const [activeTab, setActiveTab] = useState<'account' | 'users'>('account');
    const [users, setUsers] = useState<User[]>(initialUsersData);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [userForm, setUserForm] = useState({ name: '', email: '', role: UserRole.Tecnico, password: '' });

    if (!isOpen) {
        return null;
    }

    const handleMyAccountSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword && newPassword !== confirmPassword) {
            alert('A nova senha e a confirmação não correspondem.');
            return;
        }
        alert('Configurações da sua conta salvas com sucesso!');
        onClose();
    };

    // User Management Handlers
    const handleOpenUserModal = (user: User | null = null) => {
        if (user) {
            setUserToEdit(user);
            setUserForm({ name: user.name, email: user.email, role: user.role, password: '' });
        } else {
            setUserToEdit(null);
            setUserForm({ name: '', email: '', role: UserRole.Tecnico, password: '' });
        }
        setIsUserModalOpen(true);
    };

    const handleCloseUserModal = () => {
        setIsUserModalOpen(false);
        setUserToEdit(null);
    };

    const handleUserFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userToEdit) {
            setUsers(users.map(u => u.id === userToEdit.id ? { ...userToEdit, ...userForm } : u));
        } else {
            const newUser: User = { id: `USR-${Date.now()}`, ...userForm };
            setUsers([...users, newUser]);
        }
        handleCloseUserModal();
    };
    
    const handleOpenDeleteUserModal = (user: User) => {
        setUserToDelete(user);
    };

    const handleConfirmDeleteUser = () => {
        if (userToDelete) {
            setUsers(users.filter(u => u.id !== userToDelete.id));
            setUserToDelete(null);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-brand-gray-800">Configurações</h2>
                    <button type="button" onClick={onClose} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="border-b border-brand-gray-200">
                    <nav className="flex px-6 -mb-px space-x-6">
                        <button onClick={() => setActiveTab('account')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'account' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-gray-500 hover:text-brand-gray-700'}`}>Minha Conta</button>
                        <button onClick={() => setActiveTab('users')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'users' ? 'border-brand-blue text-brand-blue' : 'border-transparent text-brand-gray-500 hover:text-brand-gray-700'}`}>Gerenciar Usuários</button>
                    </nav>
                </div>

                {activeTab === 'account' && (
                    <form onSubmit={handleMyAccountSubmit}>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Nome</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Login / Email</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue" />
                            </div>
                            <div className="pt-4 border-t border-brand-gray-200">
                                <h3 className="text-md font-semibold text-brand-gray-800 mb-2">Alterar Senha</h3>
                                <div className="space-y-4">
                                     <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">Senha Atual</label>
                                        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">Nova Senha</label>
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" placeholder="••••••••" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-brand-gray-700 mb-1">Confirmar Nova Senha</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">
                                Cancelar
                            </button>
                            <button type="submit" className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90">
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'users' && (
                    <>
                        <div className="p-6 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-brand-gray-800">Todos os Usuários</h3>
                                <button onClick={() => handleOpenUserModal()} className="flex items-center gap-2 px-3 py-1.5 bg-brand-blue text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90">
                                    <PlusIcon className="w-4 h-4" />
                                    Adicionar Usuário
                                </button>
                            </div>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-brand-gray-200">
                                    <thead className="bg-brand-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Nome</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Função</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-brand-gray-500 uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-brand-gray-200">
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-brand-gray-900">{user.name}</div>
                                                    <div className="text-sm text-brand-gray-500">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end items-center gap-4">
                                                        <button onClick={() => handleOpenUserModal(user)} className="text-brand-gray-400 hover:text-brand-blue" title="Editar"><PencilIcon className="w-5 h-5"/></button>
                                                        <button onClick={() => handleOpenDeleteUserModal(user)} className="text-brand-gray-400 hover:text-brand-red" title="Excluir"><TrashIcon className="w-5 h-5"/></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">
                                Fechar
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Add/Edit User Modal */}
            {isUserModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
                    <form onSubmit={handleUserFormSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b">
                            <h3 className="text-lg font-bold">{userToEdit ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Nome</label>
                                    <input type="text" value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Função</label>
                                    <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as UserRole})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white">
                                        {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Email</label>
                                <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Senha</label>
                                <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" placeholder={userToEdit ? 'Deixe em branco para não alterar' : '••••••••'} required={!userToEdit} />
                            </div>
                        </div>
                        <div className="p-4 bg-brand-gray-50 border-t flex justify-end gap-3">
                            <button type="button" onClick={handleCloseUserModal} className="px-4 py-2 bg-white border border-brand-gray-300 rounded-lg font-semibold">Cancelar</button>
                            <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-lg font-semibold">{userToEdit ? 'Salvar Alterações' : 'Criar Usuário'}</button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Delete User Confirmation */}
            {userToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
                     <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
                            <p className="text-sm mt-2 text-brand-gray-600">Tem certeza que deseja excluir o usuário <strong>{userToDelete.name}</strong>?</p>
                        </div>
                        <div className="p-4 bg-brand-gray-50 border-t flex justify-end gap-3">
                            <button onClick={() => setUserToDelete(null)} className="px-4 py-2 bg-white border rounded-lg font-semibold">Cancelar</button>
                            <button onClick={handleConfirmDeleteUser} className="px-4 py-2 bg-brand-red text-white rounded-lg font-semibold">Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsModal;
