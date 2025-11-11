import { Request, Response } from 'express';
import { PlanosService } from '../services/planos.service';

export const PlanosController = {
    // GET /api/planos
    async listar(req: Request, res: Response) {
        try {
            const { status } = req.query;
            const planos = await PlanosService.listarPlanos(status as string);
            return res.json({ success: true, data: planos });
        } catch (error: any) {
            console.error('❌ Erro ao listar planos:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao listar planos',
                error: error.message 
            });
        }
    },

    // GET /api/planos/:id
    async buscar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const plano = await PlanosService.buscarPlano(id);
            
            if (!plano) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Plano não encontrado' 
                });
            }

            return res.json({ success: true, data: plano });
        } catch (error: any) {
            console.error('❌ Erro ao buscar plano:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar plano',
                error: error.message 
            });
        }
    },

    // POST /api/planos
    async criar(req: Request, res: Response) {
        try {
            const plano = await PlanosService.criarPlano(req.body);
            return res.status(201).json({ success: true, data: plano });
        } catch (error: any) {
            console.error('❌ Erro ao criar plano:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao criar plano',
                error: error.message 
            });
        }
    },

    // PUT /api/planos/:id
    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const plano = await PlanosService.atualizarPlano(id, req.body);
            return res.json({ success: true, data: plano });
        } catch (error: any) {
            console.error('❌ Erro ao atualizar plano:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar plano',
                error: error.message 
            });
        }
    },

    // PATCH /api/planos/:id/toggle
    async toggleStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const plano = await PlanosService.toggleStatus(id);
            return res.json({ success: true, data: plano });
        } catch (error: any) {
            console.error('❌ Erro ao alternar status do plano:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao alternar status',
                error: error.message 
            });
        }
    },

    // DELETE /api/planos/:id
    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await PlanosService.deletarPlano(id);
            return res.json({ success: true, message: 'Plano deletado com sucesso' });
        } catch (error: any) {
            console.error('❌ Erro ao deletar plano:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao deletar plano',
                error: error.message 
            });
        }
    },

    // GET /api/planos/metricas
    async obterMetricas(req: Request, res: Response) {
        try {
            const metricas = await PlanosService.obterMetricas();
            return res.json({ success: true, data: metricas });
        } catch (error: any) {
            console.error('❌ Erro ao obter métricas de planos:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao obter métricas',
                error: error.message 
            });
        }
    }
};

