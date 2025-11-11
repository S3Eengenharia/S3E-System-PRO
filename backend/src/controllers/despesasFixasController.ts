import { Request, Response } from 'express';
import { DespesasFixasService } from '../services/despesasFixas.service';

export const DespesasFixasController = {
    // GET /api/despesas-fixas
    async listar(req: Request, res: Response) {
        try {
            const { ativa } = req.query;
            const despesas = await DespesasFixasService.listarDespesas(
                ativa === 'true' ? true : ativa === 'false' ? false : undefined
            );
            return res.json({ success: true, data: despesas });
        } catch (error: any) {
            console.error('❌ Erro ao listar despesas fixas:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao listar despesas fixas',
                error: error.message 
            });
        }
    },

    // GET /api/despesas-fixas/:id
    async buscar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const despesa = await DespesasFixasService.buscarDespesa(id);
            
            if (!despesa) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Despesa fixa não encontrada' 
                });
            }

            return res.json({ success: true, data: despesa });
        } catch (error: any) {
            console.error('❌ Erro ao buscar despesa fixa:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar despesa fixa',
                error: error.message 
            });
        }
    },

    // POST /api/despesas-fixas
    async criar(req: Request, res: Response) {
        try {
            const despesa = await DespesasFixasService.criarDespesa(req.body);
            return res.status(201).json({ success: true, data: despesa });
        } catch (error: any) {
            console.error('❌ Erro ao criar despesa fixa:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao criar despesa fixa',
                error: error.message 
            });
        }
    },

    // PUT /api/despesas-fixas/:id
    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const despesa = await DespesasFixasService.atualizarDespesa(id, req.body);
            return res.json({ success: true, data: despesa });
        } catch (error: any) {
            console.error('❌ Erro ao atualizar despesa fixa:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar despesa fixa',
                error: error.message 
            });
        }
    },

    // DELETE /api/despesas-fixas/:id
    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await DespesasFixasService.deletarDespesa(id);
            return res.json({ success: true, message: 'Despesa fixa deletada com sucesso' });
        } catch (error: any) {
            console.error('❌ Erro ao deletar despesa fixa:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao deletar despesa fixa',
                error: error.message 
            });
        }
    },

    // POST /api/despesas-fixas/:id/pagamento
    async registrarPagamento(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const pagamento = await DespesasFixasService.registrarPagamento({
                despesaFixaId: id,
                ...req.body
            });
            return res.status(201).json({ success: true, data: pagamento });
        } catch (error: any) {
            console.error('❌ Erro ao registrar pagamento:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao registrar pagamento',
                error: error.message 
            });
        }
    },

    // GET /api/despesas-fixas/metricas
    async obterMetricas(req: Request, res: Response) {
        try {
            const metricas = await DespesasFixasService.obterMetricas();
            return res.json({ success: true, data: metricas });
        } catch (error: any) {
            console.error('❌ Erro ao obter métricas de despesas fixas:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao obter métricas',
                error: error.message 
            });
        }
    }
};

