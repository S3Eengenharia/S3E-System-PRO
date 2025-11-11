import { Request, Response } from 'express';
import { GastosVeiculoService } from '../services/gastosVeiculo.service';

export const GastosVeiculoController = {
    // GET /api/gastos-veiculo
    async listar(req: Request, res: Response) {
        try {
            const { veiculoId } = req.query;
            const gastos = await GastosVeiculoService.listarGastos(veiculoId as string);
            return res.json({ success: true, data: gastos });
        } catch (error: any) {
            console.error('❌ Erro ao listar gastos de veículo:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao listar gastos',
                error: error.message 
            });
        }
    },

    // GET /api/gastos-veiculo/:id
    async buscar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const gasto = await GastosVeiculoService.buscarGasto(id);
            
            if (!gasto) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Gasto não encontrado' 
                });
            }

            return res.json({ success: true, data: gasto });
        } catch (error: any) {
            console.error('❌ Erro ao buscar gasto:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar gasto',
                error: error.message 
            });
        }
    },

    // POST /api/gastos-veiculo
    async criar(req: Request, res: Response) {
        try {
            const gasto = await GastosVeiculoService.criarGasto(req.body);
            return res.status(201).json({ success: true, data: gasto });
        } catch (error: any) {
            console.error('❌ Erro ao criar gasto:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao criar gasto',
                error: error.message 
            });
        }
    },

    // PUT /api/gastos-veiculo/:id
    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const gasto = await GastosVeiculoService.atualizarGasto(id, req.body);
            return res.json({ success: true, data: gasto });
        } catch (error: any) {
            console.error('❌ Erro ao atualizar gasto:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar gasto',
                error: error.message 
            });
        }
    },

    // DELETE /api/gastos-veiculo/:id
    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await GastosVeiculoService.deletarGasto(id);
            return res.json({ success: true, message: 'Gasto deletado com sucesso' });
        } catch (error: any) {
            console.error('❌ Erro ao deletar gasto:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao deletar gasto',
                error: error.message 
            });
        }
    }
};

