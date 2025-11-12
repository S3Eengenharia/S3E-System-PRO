import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Obter __dirname equivalente em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/tarefas-obra');
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `tarefa-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

export const uploadTarefaImages = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB por arquivo
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpg, png, gif, webp)'));
    }
  }
}).array('imagens', 10); // Máximo 10 imagens por vez

/**
 * GET /api/obras/tarefas
 * Lista tarefas do eletricista logado
 */
export const getTarefasEletricista = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role?.toLowerCase();
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      return;
    }
    
    // Se for desenvolvedor, mostrar TODAS as tarefas
    let tarefas;
    if (userRole === 'desenvolvedor') {
      tarefas = await prisma.tarefaObra.findMany({
        include: {
          obra: {
            include: {
              projeto: {
                include: {
                  cliente: true
                }
              },
              cliente: true
            }
          },
          registrosAtividade: {
            orderBy: { dataRegistro: 'desc' },
            take: 1
          }
        },
        orderBy: { dataPrevista: 'asc' }
      });
    } else {
      // Eletricista: apenas tarefas atribuídas a ele
      tarefas = await prisma.tarefaObra.findMany({
        where: {
          atribuidoA: userId
        },
        include: {
          obra: {
            include: {
              projeto: {
                include: {
                  cliente: true
                }
              },
              cliente: true
            }
          },
          registrosAtividade: {
            orderBy: { dataRegistro: 'desc' },
            take: 1
          }
        },
        orderBy: { dataPrevista: 'asc' }
      });
    }
    
    // Formatar resposta para o frontend
    const tarefasFormatadas = tarefas.map(tarefa => {
      const cliente = tarefa.obra.projeto?.cliente || tarefa.obra.cliente;
      
      return {
        ...tarefa,
        obra: {
          id: tarefa.obra.id,
          nomeObra: tarefa.obra.nomeObra,
          endereco: tarefa.obra.endereco || '',
          clienteNome: cliente?.nome || 'Cliente não informado'
        }
      };
    });
    
    console.log(`✅ Tarefas carregadas para ${userRole}: ${tarefasFormatadas.length}`);
    
    res.json({ 
      success: true, 
      data: tarefasFormatadas,
      count: tarefasFormatadas.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar tarefas da obra' 
    });
  }
};

/**
 * POST /api/obras/tarefas/resumo
 * Salva resumo do dia com fotos
 */
export const salvarResumoTarefa = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const { tarefaId, descricaoAtividade, horasTrabalhadas, observacoes, concluida } = req.body;
    const files = req.files as Express.Multer.File[];
    
    if (!userId) {
      res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      return;
    }
    
    if (!tarefaId || !descricaoAtividade) {
      res.status(400).json({ 
        success: false, 
        error: 'TarefaId e descricaoAtividade são obrigatórios' 
      });
      return;
    }
    
    // Verificar se a tarefa existe e pertence ao usuário
    const tarefa = await prisma.tarefaObra.findUnique({
      where: { id: tarefaId }
    });
    
    if (!tarefa) {
      res.status(404).json({ success: false, error: 'Tarefa não encontrada' });
      return;
    }
    
    const userRole = (req as any).user?.role?.toLowerCase();
    
    // Apenas eletricista atribuído ou desenvolvedor podem registrar
    if (userRole !== 'desenvolvedor' && tarefa.atribuidoA !== userId) {
      res.status(403).json({ 
        success: false, 
        error: '🚫 Você não tem permissão para registrar atividades nesta tarefa' 
      });
      return;
    }
    
    // Processar URLs das imagens
    const imagensUrls = files ? files.map(file => `/uploads/tarefas-obra/${file.filename}`) : [];
    
    // Validar horas trabalhadas
    const horas = parseFloat(horasTrabalhadas) || 8;
    if (horas <= 0 || horas > 24) {
      res.status(400).json({ 
        success: false, 
        error: 'Horas trabalhadas deve ser entre 0.5 e 24' 
      });
      return;
    }
    
    // Criar registro de atividade
    const registro = await prisma.registroAtividade.create({
      data: {
        tarefaId: tarefaId,
        descricaoAtividade: descricaoAtividade,
        horasTrabalhadas: horas,
        observacoes: observacoes || null,
        imagens: imagensUrls,
        dataRegistro: new Date()
      }
    });
    
    // Atualizar progresso da tarefa se marcada como concluída
    if (concluida === 'true' || concluida === true) {
      await prisma.tarefaObra.update({
        where: { id: tarefaId },
        data: { 
          progresso: 100,
          dataConclusaoReal: new Date()
        }
      });
    }
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'REGISTRO_TAREFA',
        entity: 'TarefaObra',
        entityId: tarefaId,
        description: `Eletricista registrou atividades do dia na tarefa`,
        metadata: {
          imagens: imagensUrls.length,
          concluida: concluida === 'true'
        }
      }
    });
    
    console.log(`✅ Resumo salvo para tarefa ${tarefaId} - ${imagensUrls.length} imagens`);
    
    res.json({ 
      success: true, 
      data: registro,
      message: '✅ Resumo do dia salvo com sucesso!',
      imagensCount: imagensUrls.length
    });
  } catch (error) {
    console.error('❌ Erro ao salvar resumo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao salvar resumo da tarefa' 
    });
  }
};

/**
 * GET /api/obras/tarefas/:id
 * Busca uma tarefa específica com todos os registros
 */
export const getTarefaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    const userRole = (req as any).user?.role?.toLowerCase();
    
    const tarefa = await prisma.tarefaObra.findUnique({
      where: { id },
      include: {
        obra: {
          include: {
            projeto: {
              include: {
                cliente: true
              }
            },
            cliente: true
          }
        },
        registrosAtividade: {
          orderBy: { dataRegistro: 'desc' }
        }
      }
    });
    
    if (!tarefa) {
      res.status(404).json({ success: false, error: 'Tarefa não encontrada' });
      return;
    }
    
    // Verificar permissão (eletricista só vê suas próprias tarefas)
    if (userRole === 'eletricista' && tarefa.atribuidoA !== userId) {
      res.status(403).json({ 
        success: false, 
        error: '🚫 Você não tem permissão para visualizar esta tarefa' 
      });
      return;
    }
    
    res.json({ success: true, data: tarefa });
  } catch (error) {
    console.error('❌ Erro ao buscar tarefa:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar tarefa' 
    });
  }
};

/**
 * POST /api/obras/tarefas
 * Criar nova tarefa (apenas gerente/engenheiro/admin/desenvolvedor)
 */
export const criarTarefa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { obraId, descricao, atribuidoA, dataPrevista, observacoes } = req.body;
    const userId = (req as any).user?.userId;
    
    if (!obraId || !descricao) {
      res.status(400).json({ 
        success: false, 
        error: 'ObraId e descricao são obrigatórios' 
      });
      return;
    }
    
    // Verificar se a obra existe
    const obra = await prisma.obra.findUnique({
      where: { id: obraId }
    });
    
    if (!obra) {
      res.status(404).json({ success: false, error: 'Obra não encontrada' });
      return;
    }
    
    // Verificar se o usuário atribuído é eletricista (se fornecido)
    let eletricista = null;
    if (atribuidoA) {
      eletricista = await prisma.user.findUnique({
        where: { id: atribuidoA }
      });
      
      if (!eletricista || eletricista.role.toLowerCase() !== 'eletricista') {
        res.status(400).json({ 
          success: false, 
          error: 'Tarefas só podem ser atribuídas a eletricistas' 
        });
        return;
      }
    }
    
    // Criar tarefa
    const tarefa = await prisma.tarefaObra.create({
      data: {
        obraId,
        descricao,
        atribuidoA: atribuidoA || null,
        dataPrevista: dataPrevista ? new Date(dataPrevista) : null,
        observacoes: observacoes || null,
        progresso: 0
      },
      include: {
        obra: true,
        registrosAtividade: true
      }
    });
    
    // Audit log
    const descricaoLog = eletricista 
      ? `Nova tarefa criada e atribuída ao eletricista ${eletricista.name}`
      : 'Nova tarefa criada sem eletricista atribuído';
    
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'CREATE',
        entity: 'TarefaObra',
        entityId: tarefa.id,
        description: descricaoLog,
        metadata: {
          obraId,
          eletricistaId: atribuidoA || null
        }
      }
    });
    
    console.log(`✅ Tarefa criada: ${tarefa.id} ${eletricista ? `- Atribuída a ${eletricista.name}` : '- Sem eletricista atribuído'}`);
    
    res.json({ 
      success: true, 
      data: tarefa,
      message: '✅ Tarefa criada com sucesso!' 
    });
  } catch (error) {
    console.error('❌ Erro ao criar tarefa:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao criar tarefa da obra' 
    });
  }
};

/**
 * PUT /api/obras/tarefas/:id
 * Atualizar tarefa (apenas gerente/engenheiro/admin/desenvolvedor)
 */
export const atualizarTarefa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { descricao, atribuidoA, dataPrevista, progresso, observacoes } = req.body;
    const userId = (req as any).user?.userId;
    
    const tarefa = await prisma.tarefaObra.findUnique({
      where: { id }
    });
    
    if (!tarefa) {
      res.status(404).json({ success: false, error: 'Tarefa não encontrada' });
      return;
    }
    
    // Preparar dados para atualização
    const dataToUpdate: any = {};
    
    if (descricao !== undefined) dataToUpdate.descricao = descricao;
    if (observacoes !== undefined) dataToUpdate.observacoes = observacoes;
    if (progresso !== undefined) dataToUpdate.progresso = parseInt(progresso);
    
    // Campos que podem ser null
    if (atribuidoA !== undefined) {
      dataToUpdate.atribuidoA = atribuidoA || null;
    }
    if (dataPrevista !== undefined) {
      dataToUpdate.dataPrevista = dataPrevista ? new Date(dataPrevista) : null;
    }
    
    // Atualizar tarefa
    const tarefaAtualizada = await prisma.tarefaObra.update({
      where: { id },
      data: dataToUpdate,
      include: {
        obra: true,
        registrosAtividade: {
          orderBy: { dataRegistro: 'desc' }
        }
      }
    });
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'UPDATE',
        entity: 'TarefaObra',
        entityId: id,
        description: `Tarefa atualizada`,
        metadata: req.body
      }
    });
    
    console.log(`✅ Tarefa atualizada: ${id}`);
    
    res.json({ 
      success: true, 
      data: tarefaAtualizada,
      message: '✅ Tarefa atualizada com sucesso!' 
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar tarefa:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao atualizar tarefa' 
    });
  }
};

/**
 * DELETE /api/obras/tarefas/:id
 * Deletar tarefa (apenas desenvolvedor/admin/gerente)
 */
export const deletarTarefa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.userId;
    
    const tarefa = await prisma.tarefaObra.findUnique({
      where: { id }
    });
    
    if (!tarefa) {
      res.status(404).json({ success: false, error: 'Tarefa não encontrada' });
      return;
    }
    
    // Deletar tarefa (cascade deleta registros de atividade)
    await prisma.tarefaObra.delete({
      where: { id }
    });
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'DELETE',
        entity: 'TarefaObra',
        entityId: id,
        description: `Tarefa excluída`,
        metadata: {
          obraId: tarefa.obraId
        }
      }
    });
    
    console.log(`✅ Tarefa deletada: ${id}`);
    
    res.json({ 
      success: true,
      message: '✅ Tarefa excluída com sucesso!' 
    });
  } catch (error) {
    console.error('❌ Erro ao deletar tarefa:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao deletar tarefa' 
    });
  }
};

/**
 * GET /api/obras/:obraId/tarefas
 * Lista todas as tarefas de uma obra específica
 */
export const getTarefasPorObra = async (req: Request, res: Response): Promise<void> => {
  try {
    const { obraId } = req.params;
    
    const tarefas = await prisma.tarefaObra.findMany({
      where: { obraId },
      include: {
        registrosAtividade: {
          orderBy: { dataRegistro: 'desc' }
        }
      },
      orderBy: { dataPrevista: 'asc' }
    });

    // Buscar informações dos eletricistas para cada tarefa
    const tarefasComNomes = await Promise.all(
      tarefas.map(async (tarefa) => {
        let atribuidoNome = null;
        
        if (tarefa.atribuidoA) {
          const usuario = await prisma.user.findUnique({
            where: { id: tarefa.atribuidoA },
            select: { name: true }
          });
          atribuidoNome = usuario?.name || null;
        }

        return {
          ...tarefa,
          atribuidoNome
        };
      })
    );
    
    console.log(`✅ Tarefas da obra ${obraId}: ${tarefasComNomes.length}`);
    
    res.json({ 
      success: true, 
      data: tarefasComNomes,
      count: tarefasComNomes.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar tarefas da obra:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar tarefas da obra' 
    });
  }
};

/**
 * GET /api/obras/tarefas/registros/:tarefaId
 * Lista todos os registros de atividade de uma tarefa
 */
export const getRegistrosAtividade = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tarefaId } = req.params;
    
    const registros = await prisma.registroAtividade.findMany({
      where: { tarefaId },
      orderBy: { dataRegistro: 'desc' }
    });
    
    res.json({ 
      success: true, 
      data: registros,
      count: registros.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar registros:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro ao buscar registros de atividade' 
    });
  }
};

