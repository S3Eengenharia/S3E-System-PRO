import { Router } from 'express';
import { alocacoesController } from '../controllers/alocacoesController';

const router = Router();

// Criar alocação
router.post('/', (req, res) => alocacoesController.criar(req, res));

// Buscar alocações por período
router.get('/periodo', (req, res) => alocacoesController.buscarPorPeriodo(req, res));

// Buscar alocações de uma obra
router.get('/obra/:obraId', (req, res) => alocacoesController.buscarPorObra(req, res));

// Buscar alocações de uma equipe
router.get('/equipe/:equipeId', (req, res) => alocacoesController.buscarPorEquipe(req, res));

// Verificar conflitos
router.get('/verificar-conflitos', (req, res) => alocacoesController.verificarConflitos(req, res));

// Obter disponibilidade
router.get('/disponibilidade', (req, res) => alocacoesController.obterDisponibilidade(req, res));

// Atualizar alocação
router.put('/:id', (req, res) => alocacoesController.atualizar(req, res));

// Excluir alocação
router.delete('/:id', (req, res) => alocacoesController.excluir(req, res));

export default router;

