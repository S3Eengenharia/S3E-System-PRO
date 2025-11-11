import { Request, Response } from 'express';
import { FuncionariosService } from '../services/funcionarios.service';

export const FuncionariosController = {
    // GET /api/funcionarios
    async listar(req: Request, res: Response) {
        try {
            const funcionarios = await FuncionariosService.listarFuncionarios();
            return res.json({ success: true, data: funcionarios });
        } catch (error: any) {
            console.error('❌ Erro ao listar funcionários:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao listar funcionários',
                error: error.message 
            });
        }
    },

    // GET /api/funcionarios/:id
    async buscar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const funcionario = await FuncionariosService.buscarFuncionario(id);
            
            if (!funcionario) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Funcionário não encontrado' 
                });
            }

            return res.json({ success: true, data: funcionario });
        } catch (error: any) {
            console.error('❌ Erro ao buscar funcionário:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar funcionário',
                error: error.message 
            });
        }
    },

    // POST /api/funcionarios
    async criar(req: Request, res: Response) {
        try {
            const funcionario = await FuncionariosService.criarFuncionario(req.body);
            return res.status(201).json({ success: true, data: funcionario });
        } catch (error: any) {
            console.error('❌ Erro ao criar funcionário:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao criar funcionário',
                error: error.message 
            });
        }
    },

    // PUT /api/funcionarios/:id
    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const funcionario = await FuncionariosService.atualizarFuncionario(id, req.body);
            return res.json({ success: true, data: funcionario });
        } catch (error: any) {
            console.error('❌ Erro ao atualizar funcionário:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar funcionário',
                error: error.message 
            });
        }
    },

    // DELETE /api/funcionarios/:id
    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await FuncionariosService.deletarFuncionario(id);
            return res.json({ success: true, message: 'Funcionário deletado com sucesso' });
        } catch (error: any) {
            console.error('❌ Erro ao deletar funcionário:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao deletar funcionário',
                error: error.message 
            });
        }
    },

    // GET /api/funcionarios/metricas
    async obterMetricas(req: Request, res: Response) {
        try {
            const metricas = await FuncionariosService.obterMetricasRH();
            return res.json({ success: true, data: metricas });
        } catch (error: any) {
            console.error('❌ Erro ao obter métricas de RH:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao obter métricas',
                error: error.message 
            });
        }
    }
};

