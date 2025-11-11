import { Request, Response } from 'express';
import { ValesService } from '../services/vales.service';

export const ValesController = {
    // GET /api/vales
    async listar(req: Request, res: Response) {
        try {
            const { funcionarioId } = req.query;
            const vales = await ValesService.listarVales(funcionarioId as string);
            return res.json({ success: true, data: vales });
        } catch (error: any) {
            console.error('❌ Erro ao listar vales:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao listar vales',
                error: error.message 
            });
        }
    },

    // GET /api/vales/:id
    async buscar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const vale = await ValesService.buscarVale(id);
            
            if (!vale) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Vale não encontrado' 
                });
            }

            return res.json({ success: true, data: vale });
        } catch (error: any) {
            console.error('❌ Erro ao buscar vale:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao buscar vale',
                error: error.message 
            });
        }
    },

    // POST /api/vales
    async criar(req: Request, res: Response) {
        try {
            const vale = await ValesService.criarVale(req.body);
            return res.status(201).json({ success: true, data: vale });
        } catch (error: any) {
            console.error('❌ Erro ao criar vale:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao criar vale',
                error: error.message 
            });
        }
    },

    // PUT /api/vales/:id
    async atualizar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const vale = await ValesService.atualizarVale(id, req.body);
            return res.json({ success: true, data: vale });
        } catch (error: any) {
            console.error('❌ Erro ao atualizar vale:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao atualizar vale',
                error: error.message 
            });
        }
    },

    // DELETE /api/vales/:id
    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await ValesService.deletarVale(id);
            return res.json({ success: true, message: 'Vale deletado com sucesso' });
        } catch (error: any) {
            console.error('❌ Erro ao deletar vale:', error);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro ao deletar vale',
                error: error.message 
            });
        }
    }
};

