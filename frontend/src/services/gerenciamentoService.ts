import { axiosApiService } from './axiosApi';

// ========== FUNCIONÁRIOS ==========
export const funcionariosService = {
    async listar() {
        return await axiosApiService.get('/api/funcionarios');
    },
    
    async buscar(id: string) {
        return await axiosApiService.get(`/api/funcionarios/${id}`);
    },
    
    async criar(data: {
        nome: string;
        cargo: string;
        salario: number;
        dataAdmissao: string;
        cpf: string;
        telefone?: string;
        email?: string;
        status?: string;
    }) {
        return await axiosApiService.post('/api/funcionarios', data);
    },
    
    async atualizar(id: string, data: Partial<{
        nome: string;
        cargo: string;
        salario: number;
        dataAdmissao: string;
        cpf: string;
        telefone?: string;
        email?: string;
        status?: string;
    }>) {
        return await axiosApiService.put(`/api/funcionarios/${id}`, data);
    },
    
    async deletar(id: string) {
        return await axiosApiService.delete(`/api/funcionarios/${id}`);
    },
    
    async obterMetricas() {
        return await axiosApiService.get('/api/funcionarios/metricas');
    }
};

// ========== VALES ==========
export const valesService = {
    async listar(funcionarioId?: string) {
        const url = funcionarioId ? `/api/vales?funcionarioId=${funcionarioId}` : '/api/vales';
        return await axiosApiService.get(url);
    },
    
    async buscar(id: string) {
        return await axiosApiService.get(`/api/vales/${id}`);
    },
    
    async criar(data: {
        funcionarioId: string;
        tipo: string;
        valor: number;
        data: string;
        descricao?: string;
    }) {
        return await axiosApiService.post('/api/vales', data);
    },
    
    async atualizar(id: string, data: Partial<{
        tipo: string;
        valor: number;
        data: string;
        descricao?: string;
    }>) {
        return await axiosApiService.put(`/api/vales/${id}`, data);
    },
    
    async deletar(id: string) {
        return await axiosApiService.delete(`/api/vales/${id}`);
    }
};

// ========== VEÍCULOS ==========
export const veiculosService = {
    async listar() {
        return await axiosApiService.get('/api/veiculos');
    },
    
    async buscar(id: string) {
        return await axiosApiService.get(`/api/veiculos/${id}`);
    },
    
    async criar(data: {
        modelo: string;
        placa: string;
        tipo: string;
        ano: number;
        status?: string;
        kmAtual?: number;
    }) {
        return await axiosApiService.post('/api/veiculos', data);
    },
    
    async atualizar(id: string, data: Partial<{
        modelo: string;
        placa: string;
        tipo: string;
        ano: number;
        status?: string;
        kmAtual?: number;
    }>) {
        return await axiosApiService.put(`/api/veiculos/${id}`, data);
    },
    
    async deletar(id: string) {
        return await axiosApiService.delete(`/api/veiculos/${id}`);
    },
    
    async obterMetricas() {
        return await axiosApiService.get('/api/veiculos/metricas');
    }
};

// ========== GASTOS DE VEÍCULOS ==========
export const gastosVeiculoService = {
    async listar(veiculoId?: string) {
        const url = veiculoId ? `/api/gastos-veiculo?veiculoId=${veiculoId}` : '/api/gastos-veiculo';
        return await axiosApiService.get(url);
    },
    
    async buscar(id: string) {
        return await axiosApiService.get(`/api/gastos-veiculo/${id}`);
    },
    
    async criar(data: {
        veiculoId: string;
        tipo: string;
        descricao?: string;
        valor: number;
        data: string;
        km?: number;
        obraId?: string;
        responsavel?: string;
    }) {
        return await axiosApiService.post('/api/gastos-veiculo', data);
    },
    
    async atualizar(id: string, data: Partial<{
        tipo: string;
        descricao?: string;
        valor: number;
        data: string;
        km?: number;
        obraId?: string;
        responsavel?: string;
    }>) {
        return await axiosApiService.put(`/api/gastos-veiculo/${id}`, data);
    },
    
    async deletar(id: string) {
        return await axiosApiService.delete(`/api/gastos-veiculo/${id}`);
    }
};

// ========== PLANOS ESTRATÉGICOS ==========
export const planosService = {
    async listar(status?: string) {
        const url = status ? `/api/planos?status=${status}` : '/api/planos';
        return await axiosApiService.get(url);
    },
    
    async buscar(id: string) {
        return await axiosApiService.get(`/api/planos/${id}`);
    },
    
    async criar(data: {
        titulo: string;
        descricao: string;
        prazo: string;
        responsavel: string;
        prioridade?: string;
        status?: string;
        categoria?: string;
    }) {
        return await axiosApiService.post('/api/planos', data);
    },
    
    async atualizar(id: string, data: Partial<{
        titulo: string;
        descricao: string;
        prazo: string;
        responsavel: string;
        prioridade?: string;
        status?: string;
        categoria?: string;
    }>) {
        return await axiosApiService.put(`/api/planos/${id}`, data);
    },
    
    async toggleStatus(id: string) {
        return await axiosApiService.patch(`/api/planos/${id}/toggle`);
    },
    
    async deletar(id: string) {
        return await axiosApiService.delete(`/api/planos/${id}`);
    },
    
    async obterMetricas() {
        return await axiosApiService.get('/api/planos/metricas');
    }
};

// ========== DESPESAS FIXAS ==========
export const despesasFixasService = {
    async listar(ativa?: boolean) {
        const url = ativa !== undefined ? `/api/despesas-fixas?ativa=${ativa}` : '/api/despesas-fixas';
        return await axiosApiService.get(url);
    },
    
    async buscar(id: string) {
        return await axiosApiService.get(`/api/despesas-fixas/${id}`);
    },
    
    async criar(data: {
        descricao: string;
        categoria: string;
        valor: number;
        diaVencimento: number;
        fornecedor?: string;
        observacoes?: string;
    }) {
        return await axiosApiService.post('/api/despesas-fixas', data);
    },
    
    async atualizar(id: string, data: Partial<{
        descricao: string;
        categoria: string;
        valor: number;
        diaVencimento: number;
        ativa: boolean;
        fornecedor?: string;
        observacoes?: string;
    }>) {
        return await axiosApiService.put(`/api/despesas-fixas/${id}`, data);
    },
    
    async deletar(id: string) {
        return await axiosApiService.delete(`/api/despesas-fixas/${id}`);
    },
    
    async registrarPagamento(id: string, data: {
        mesReferencia: string;
        valorPago: number;
        dataPagamento: string;
        observacoes?: string;
    }) {
        return await axiosApiService.post(`/api/despesas-fixas/${id}/pagamento`, data);
    },
    
    async obterMetricas() {
        return await axiosApiService.get('/api/despesas-fixas/metricas');
    }
};

