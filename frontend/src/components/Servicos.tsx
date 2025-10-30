import React, { useState, useMemo, useRef, useEffect } from 'react';
import { type Service, ServiceType } from '../types';
import { servicosService, type Servico } from '../services/servicosService';

// Icons
const Bars3Icon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>;
const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const MagnifyingGlassIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.124-2.038-2.124H9.038c-1.128 0-2.038.944-2.038 2.124v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const EllipsisVerticalIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" /></svg>;

const getTypeClass = (type: ServiceType) => {
    switch (type) {
        case ServiceType.Consultoria: return 'bg-blue-100 text-blue-800';
        case ServiceType.Instalacao: return 'bg-green-100 text-green-800';
        case ServiceType.Manutencao: return 'bg-yellow-100 text-yellow-800';
        case ServiceType.LaudoTecnico: return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

interface ServicosProps {
    toggleSidebar: () => void;
}

// FIX: Correctly define ServiceFormState to avoid 'price' property becoming 'never'
// by omitting 'price' from the base type before intersecting with the new 'price' type.
type ServiceFormState = Omit<Service, 'id' | 'price'> & { price: string };

const Servicos: React.FC<ServicosProps> = ({ toggleSidebar }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<ServiceType | 'Todos'>('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const [formState, setFormState] = useState<ServiceFormState>({
        name: '', internalCode: '', description: '', type: ServiceType.Instalacao, price: ''
    });

    // Carregar serviços do backend
    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            const response = await servicosService.listar();
            
            if (response.success && response.data) {
                // Converter serviços da API para o formato do componente
                const servicosArray = Array.isArray(response.data) ? response.data : [];
                const servicesFormatados: Service[] = servicosArray.map((serv: Servico) => ({
                    id: serv.id,
                    name: serv.nome,
                    internalCode: serv.codigo,
                    description: serv.descricao || '',
                    type: serv.tipo as ServiceType,
                    price: serv.preco
                }));
                
                setServices(servicesFormatados);
            } else {
                console.warn('Nenhum serviço encontrado ou erro na resposta:', response);
                setServices([]);
            }
        } catch (error) {
            console.error('Erro ao carregar serviços:', error);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openDropdownId && dropdownRefs.current[openDropdownId] && !dropdownRefs.current[openDropdownId]?.contains(event.target as Node)) {
                setOpenDropdownId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdownId]);

    const filteredServices = useMemo(() => {
        return services
            .filter(s => typeFilter === 'Todos' || s.type === typeFilter)
            .filter(s =>
                s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.internalCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [services, searchTerm, typeFilter]);

    const resetForm = () => {
        setFormState({ name: '', internalCode: '', description: '', type: ServiceType.Instalacao, price: '' });
    };

    const handleOpenModal = (service: Service | null = null) => {
        if (service) {
            setServiceToEdit(service);
            setFormState({ ...service, price: String(service.price) });
        } else {
            setServiceToEdit(null);
            resetForm();
        }
        setIsModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setServiceToEdit(null);
        resetForm();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceValue = parseFloat(formState.price);
        if (isNaN(priceValue) || priceValue < 0) {
            alert("O preço deve ser um número válido.");
            return;
        }

        const dataToSave = { ...formState, price: priceValue };

        if (serviceToEdit) {
            const updatedService: Service = { ...serviceToEdit, ...dataToSave };
            setServices(prev => prev.map(s => s.id === serviceToEdit.id ? updatedService : s));
        } else {
            const newService: Service = {
                id: `SERV-${String(services.length + 5).padStart(3, '0')}`,
                ...dataToSave
            };
            setServices(prev => [newService, ...prev]);
        }
        handleCloseModal();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const priceValue = parseFloat(formState.price);
        if (isNaN(priceValue) || priceValue < 0) {
            alert("O preço deve ser um número válido.");
            return;
        }

        try {
            if (serviceToEdit) {
                // Atualizar serviço existente
                const servicoData = {
                    nome: formState.name,
                    codigo: formState.internalCode,
                    descricao: formState.description,
                    tipo: formState.type,
                    preco: priceValue,
                    unidade: 'un'
                };
                
                const response = await servicosService.atualizar(serviceToEdit.id, servicoData);
                
                if (response.success) {
                    alert('✅ Serviço atualizado com sucesso!');
                    handleCloseModal();
                    await loadServices();
                } else {
                    alert(`❌ Erro ao atualizar serviço: ${response.error || 'Erro desconhecido'}`);
                }
            } else {
                // Criar novo serviço
                const servicoData = {
                    nome: formState.name,
                    codigo: formState.internalCode,
                    descricao: formState.description,
                    tipo: formState.type,
                    preco: priceValue,
                    unidade: 'un'
                };
                
                const response = await servicosService.criar(servicoData);
                
                if (response.success) {
                    alert('✅ Serviço criado com sucesso!');
                    handleCloseModal();
                    await loadServices();
                } else {
                    alert(`❌ Erro ao criar serviço: ${response.error || 'Erro desconhecido'}`);
                }
            }
        } catch (error) {
            console.error('Erro ao salvar serviço:', error);
            alert('❌ Erro ao salvar serviço. Verifique o console para mais detalhes.');
        }
    };

    const handleOpenDeleteModal = (service: Service) => { setServiceToDelete(service); setOpenDropdownId(null); };
    const handleCloseDeleteModal = () => setServiceToDelete(null);
    const handleConfirmDelete = async () => {
        if (!serviceToDelete) return;
        
        try {
            const response = await servicosService.desativar(serviceToDelete.id);
            
            if (response.success) {
                alert('✅ Serviço removido com sucesso!');
                handleCloseDeleteModal();
                await loadServices();
            } else {
                alert(`❌ Erro ao remover serviço: ${response.error || 'Erro desconhecido'}`);
            }
        } catch (error) {
            console.error('Erro ao remover serviço:', error);
            alert('❌ Erro ao remover serviço. Verifique o console para mais detalhes.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-4 sm:p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-blue mx-auto mb-4"></div>
                    <p className="text-brand-gray-600">Carregando serviços...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div className="flex items-center">
                    <button onClick={toggleSidebar} className="lg:hidden mr-4 p-1 text-brand-gray-500 rounded-md hover:bg-brand-gray-100" aria-label="Open sidebar">
                        <Bars3Icon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-brand-gray-800">Serviços</h1>
                        <p className="text-sm sm:text-base text-brand-gray-500">Gestão de serviços oferecidos</p>
                    </div>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center justify-center bg-brand-blue text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-brand-blue/90 transition-colors">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Criar Novo Serviço
                </button>
            </header>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-brand-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue"
                        />
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-gray-400" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-brand-gray-600">Tipo de Serviço:</span>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as ServiceType | 'Todos')}
                            className="border border-brand-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-blue focus:border-brand-blue"
                        >
                            <option value="Todos">Todos</option>
                            {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-brand-gray-200">
                        <thead className="bg-brand-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Serviço</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-brand-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-brand-gray-500 uppercase">Preço</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-brand-gray-500 uppercase">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-brand-gray-200">
                            {filteredServices.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-brand-gray-500">
                                        Nenhum serviço encontrado
                                    </td>
                                </tr>
                            ) : (
                                filteredServices.map((service) => (
                                    <tr key={service.id} className="hover:bg-brand-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-semibold text-brand-gray-800">{service.name}</div>
                                            <div className="text-xs text-brand-gray-500">Cód: {service.internalCode}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeClass(service.type)}`}>
                                                {service.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-brand-gray-800">
                                            R$ {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="relative inline-block text-left">
                                                <button onClick={() => setOpenDropdownId(service.id === openDropdownId ? null : service.id)} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100">
                                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                                </button>
                                                {openDropdownId === service.id && (
                                                    <div ref={el => { dropdownRefs.current[service.id] = el; }} className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenModal(service); }} className="flex items-center gap-2 px-4 py-2 text-sm text-brand-gray-700 hover:bg-brand-gray-100">
                                                            <PencilIcon className="w-4 h-4" /> Editar
                                                        </a>
                                                        <a href="#" onClick={(e) => { e.preventDefault(); handleOpenDeleteModal(service); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                                                            <TrashIcon className="w-4 h-4" /> Excluir
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-full flex flex-col">
                        <div className="p-6 border-b border-brand-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-brand-gray-800">{serviceToEdit ? 'Editar Serviço' : 'Criar Novo Serviço'}</h2>
                            <button type="button" onClick={handleCloseModal} className="p-1 rounded-full text-brand-gray-400 hover:bg-brand-gray-100"><XMarkIcon className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Nome do Serviço</label>
                                    <input type="text" name="name" value={formState.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Código Interno</label>
                                    <input type="text" name="internalCode" value={formState.internalCode} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Tipo de Serviço</label>
                                    <select name="type" value={formState.type} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg bg-white" required>
                                        {Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-brand-gray-700 mb-1">Preço (R$)</label>
                                    <input type="number" name="price" value={formState.price} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required step="0.01" min="0" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-gray-700 mb-1">Descrição</label>
                                <textarea name="description" value={formState.description} onChange={handleInputChange} rows={4} className="w-full px-3 py-2 border border-brand-gray-300 rounded-lg" required />
                            </div>
                        </div>
                        <div className="p-6 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Cancelar</button>
                            <button type="submit" className="px-6 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-brand-blue/90">{serviceToEdit ? 'Salvar Alterações' : 'Salvar Serviço'}</button>
                        </div>
                    </form>
                </div>
            )}
            
            {serviceToDelete && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-brand-gray-800">Confirmar Exclusão</h2>
                            <p className="text-sm text-brand-gray-600 mt-2">
                                Você tem certeza que deseja excluir o serviço <strong className="text-brand-gray-800">{serviceToDelete.name}</strong>?
                            </p>
                        </div>
                        <div className="p-4 bg-brand-gray-50 border-t border-brand-gray-200 flex justify-end gap-3">
                            <button type="button" onClick={handleCloseDeleteModal} className="px-4 py-2 bg-white border border-brand-gray-300 text-brand-gray-700 font-semibold rounded-lg hover:bg-brand-gray-50">Cancelar</button>
                            <button type="button" onClick={handleConfirmDelete} className="px-4 py-2 bg-brand-red text-white font-semibold rounded-lg shadow-sm hover:bg-brand-red/90">Confirmar Exclusão</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Servicos;
