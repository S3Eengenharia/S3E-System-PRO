import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/projetos/:projetoId/tasks
 * Lista todas as tasks de um projeto
 */
export const getTasksByProjeto = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projetoId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projetoId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, data: tasks });
  } catch (error: any) {
    console.error('Erro ao buscar tasks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar tasks', 
      error: error.message 
    });
  }
};

/**
 * POST /api/projetos/:projetoId/tasks
 * Cria uma nova task para um projeto
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projetoId } = req.params;
    const { titulo, descricao, status, prioridade, prazo, responsavel } = req.body;

    if (!titulo) {
      res.status(400).json({ 
        success: false, 
        message: 'Título é obrigatório' 
      });
      return;
    }

    // Verificar se o projeto existe
    const projeto = await prisma.projeto.findUnique({
      where: { id: projetoId }
    });

    if (!projeto) {
      res.status(404).json({ 
        success: false, 
        message: 'Projeto não encontrado' 
      });
      return;
    }

    const task = await prisma.task.create({
      data: {
        projetoId,
        titulo,
        descricao: descricao || null,
        status: status || 'ToDo',
        prioridade: prioridade || 'Media',
        prazo: prazo ? new Date(prazo) : null,
        responsavel: responsavel || null
      }
    });

    res.status(201).json({ success: true, data: task });
  } catch (error: any) {
    console.error('Erro ao criar task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao criar task', 
      error: error.message 
    });
  }
};

/**
 * PUT /api/projetos/:projetoId/tasks/:taskId
 * Atualiza uma task
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projetoId, taskId } = req.params;
    const { titulo, descricao, status, prioridade, prazo, responsavel } = req.body;

    // Verificar se a task existe e pertence ao projeto
    const taskExistente = await prisma.task.findFirst({
      where: { 
        id: taskId,
        projetoId 
      }
    });

    if (!taskExistente) {
      res.status(404).json({ 
        success: false, 
        message: 'Task não encontrada' 
      });
      return;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(titulo && { titulo }),
        ...(descricao !== undefined && { descricao }),
        ...(status && { status }),
        ...(prioridade && { prioridade }),
        ...(prazo !== undefined && { prazo: prazo ? new Date(prazo) : null }),
        ...(responsavel !== undefined && { responsavel })
      }
    });

    res.status(200).json({ success: true, data: task });
  } catch (error: any) {
    console.error('Erro ao atualizar task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao atualizar task', 
      error: error.message 
    });
  }
};

/**
 * DELETE /api/projetos/:projetoId/tasks/:taskId
 * Exclui uma task
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projetoId, taskId } = req.params;

    // Verificar se a task existe e pertence ao projeto
    const taskExistente = await prisma.task.findFirst({
      where: { 
        id: taskId,
        projetoId 
      }
    });

    if (!taskExistente) {
      res.status(404).json({ 
        success: false, 
        message: 'Task não encontrada' 
      });
      return;
    }

    await prisma.task.delete({
      where: { id: taskId }
    });

    res.status(200).json({ 
      success: true, 
      message: 'Task excluída com sucesso' 
    });
  } catch (error: any) {
    console.error('Erro ao excluir task:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao excluir task', 
      error: error.message 
    });
  }
};

