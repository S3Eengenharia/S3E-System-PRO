import { PrismaClient, ProjetoStatus } from '@prisma/client';

const prisma = new PrismaClient();

export class ProjetosService {
  /**
   * Cria Projeto a partir de um Orçamento, aprova o orçamento
   * e inicializa 9 etapas administrativas padrão com prazo de 24h
   */
  async criarProjetoAPartirDoOrcamento(orcamentoId: string) {
    // Verifica orçamento
    const orcamento = await prisma.orcamento.findUnique({ where: { id: orcamentoId } });
    if (!orcamento) {
      throw new Error('Orçamento não encontrado');
    }

    // Aprovar orçamento se necessário
    if (orcamento.status !== 'Aprovado') {
      await prisma.orcamento.update({ where: { id: orcamentoId }, data: { status: 'Aprovado', aprovedAt: new Date() } });
    }

    // Evitar duplicidade
    const existente = await prisma.projeto.findUnique({ where: { orcamentoId } });
    if (existente) {
      return existente;
    }

    // Criar projeto com status PROPOSTA
    const projeto = await prisma.projeto.create({
      data: {
        orcamentoId,
        clienteId: orcamento.clienteId,
        titulo: orcamento.titulo,
        descricao: orcamento.descricao ?? undefined,
        valorTotal: orcamento.precoVenda,
        status: ProjetoStatus.PROPOSTA
      }
    });

    // Inicializar 9 etapas admin padrão com 24h
    const TIPOS_ETAPAS = [
      'ABERTURA_SR',
      'EMITIR_ART',
      'CONCLUIR_PROJETO_TECNICO',
      'PROTOCOLAR_PROJETO',
      'APROVACAO_PROJETO',
      'RELACAO_MATERIAIS',
      'ORGANIZAR_REVISAR',
      'GERAR_ACERVO_TECNICO',
      'REALIZAR_VISTORIA'
    ];

    const agora = new Date();
    const in24h = new Date(agora.getTime() + 24 * 60 * 60 * 1000);

    await prisma.$transaction(
      TIPOS_ETAPAS.map((tipo, idx) =>
        prisma.etapaAdmin.create({
          data: {
            projetoId: projeto.id,
            tipo,
            ordem: idx + 1,
            concluida: false,
            dataInicio: agora,
            dataPrevista: in24h,
            // manter compatibilidade com campos solicitados
            nome: tipo,
            dataExpiracao: in24h,
            realizada: false
          }
        })
      )
    );

    return projeto;
  }

  /** Atualiza status do projeto; ao mudar para EXECUCAO, cria Obra/Alocação e gera alerta lógico */
  async atualizarStatus(projetoId: string, novoStatus: ProjetoStatus) {
    const projeto = await prisma.projeto.findUnique({ 
      where: { id: projetoId },
      include: {
        orcamento: {
          include: {
            items: {
              include: {
                material: true
              }
            }
          }
        }
      }
    });
    
    if (!projeto) throw new Error('Projeto não encontrado');

    const updateData: any = { status: novoStatus };
    if (novoStatus === 'CONCLUIDO') {
      updateData.dataFim = new Date();
    }

    // 🔍 SE MUDAR PARA APROVADO, VERIFICAR ESTOQUE E DAR BAIXA
    if (novoStatus === 'APROVADO' && projeto.status !== 'APROVADO') {
      console.log('🔍 Validando aprovação do projeto - Verificando estoque...');
      
      if (!projeto.orcamento) {
        throw new Error('Projeto sem orçamento vinculado');
      }

      const itemsFrios: any[] = [];
      const itemsReservados: any[] = [];

      // Verificar estoque de todos os items
      for (const item of projeto.orcamento.items) {
        if (item.tipo === 'MATERIAL' && item.materialId) {
          const material = await prisma.material.findUnique({
            where: { id: item.materialId }
          });

          if (!material) {
          itemsFrios.push({
            nome: (item as any).nome || 'Material não identificado',
            quantidade: item.quantidade,
            motivo: 'Material não encontrado no catálogo'
          });
          } else if (material.estoque < item.quantidade) {
            itemsFrios.push({
              materialId: material.id,
              nome: material.nome,
              sku: material.sku,
              quantidadeNecessaria: item.quantidade,
              quantidadeDisponivel: material.estoque,
              quantidadeFaltante: item.quantidade - material.estoque
            });
          } else {
            itemsReservados.push({
              materialId: material.id,
              nome: material.nome,
              quantidade: item.quantidade,
              estoqueAtual: material.estoque
            });
          }
        }
      }

      // ❌ BLOQUEAR APROVAÇÃO SE TIVER ITEMS FRIOS
      if (itemsFrios.length > 0) {
        console.log(`❄️ BLOQUEADO: ${itemsFrios.length} item(ns) sem estoque`);
        const listaItems = itemsFrios.map(i => 
          `• ${i.nome}${i.sku ? ` (${i.sku})` : ''} - Faltam: ${i.quantidadeFaltante || i.quantidadeNecessaria} unidades`
        ).join('\n');
        
        throw new Error(
          `⚠️ APROVAÇÃO BLOQUEADA!\n\n` +
          `${itemsFrios.length} item(ns) sem estoque suficiente:\n${listaItems}\n\n` +
          `📦 Realize a compra dos materiais antes de aprovar o projeto.`
        );
      }

      // ✅ DAR BAIXA NO ESTOQUE (Reservar materiais)
      console.log(`✅ Todos os ${itemsReservados.length} items disponíveis. Dando baixa no estoque...`);
      
      for (const item of itemsReservados) {
        await prisma.material.update({
          where: { id: item.materialId },
          data: {
            estoque: {
              decrement: item.quantidade
            }
          }
        });

        // Registrar movimentação de estoque
        await prisma.movimentacaoEstoque.create({
          data: {
            materialId: item.materialId,
            tipo: 'SAIDA',
            quantidade: item.quantidade,
            motivo: `Reserva para projeto: ${projeto.titulo}`,
            referencia: projeto.id
          }
        });

        console.log(`✅ Baixa realizada: ${item.nome} - ${item.quantidade} unidades`);
      }

      console.log(`✅ Estoque atualizado! ${itemsReservados.length} materiais reservados.`);
    }

    const atualizado = await prisma.projeto.update({ where: { id: projetoId }, data: updateData });

    // Regra "Gerar Obra"
    if (novoStatus === 'EXECUCAO') {
      // Garantir existência de registro de Obra/Alocação placeholder (sem equipe atribuída ainda)
      const jaTemAlocacao = await prisma.alocacaoObra.findFirst({ where: { projetoId } });
      if (!jaTemAlocacao) {
        const hoje = new Date();
        const fimPrevisto = new Date(hoje.getTime() + 20 * 24 * 60 * 60 * 1000);
        await prisma.alocacaoObra.create({
          data: {
            projetoId,
            equipeId: (await prisma.equipe.findFirst({ select: { id: true } }))?.id || (await this.criarEquipePlaceholder()),
            dataInicio: hoje,
            dataFimPrevisto: fimPrevisto,
            status: 'Planejada'
          }
        });
      }

      // "Gerar Alerta" de necessidade de alocação: persistimos como campo observacional em Etapa/Projeto
      await prisma.projeto.update({
        where: { id: projetoId },
        data: { descricao: `${atualizado.descricao ?? ''}\n[ALERTA] necessidade_alocacao: atribuir equipe ao projeto.` }
      });
    }

    return atualizado;
  }

  private async criarEquipePlaceholder() {
    const equipe = await prisma.equipe.create({
      data: {
        nome: `Equipe Placeholder ${Math.floor(Math.random() * 1000)}`,
        tipo: 'DISTINTA',
        membros: []
      },
      select: { id: true }
    });
    return equipe.id;
  }

  /** Lista projetos com filtros e, opcionalmente, formato kanban */
  async listarProjetos(filtros: any, modo: 'lista' | 'kanban' = 'lista') {
    const where: any = {};
    if (filtros.status) where.status = filtros.status;
    if (filtros.clienteId) where.clienteId = filtros.clienteId;
    if (filtros.responsavelId) where.tasks = { some: { responsavel: filtros.responsavelId } };

    const projetos = await prisma.projeto.findMany({
      where,
      include: {
        cliente: { select: { id: true, nome: true } },
        orcamento: { select: { id: true, precoVenda: true, status: true } },
        etapasAdmin: true,
        alocacoes: true,
        tasks: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (modo === 'kanban') {
      const grupos: Record<string, any[]> = {
        PROPOSTA: [],
        APROVADO: [],
        EXECUCAO: [],
        CONCLUIDO: []
      };
      for (const p of projetos) {
        const key = (p.status as unknown as ProjetoStatus) || 'PROPOSTA';
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(p);
      }
      return grupos;
    }

    return projetos;
  }

  /** Concluir/adiar etapa admin com validação */
  async gerenciarEtapaAdmin(projetoId: string, etapaId: string, acao: 'concluir' | 'adiar', justificativa?: string) {
    const etapa = await prisma.etapaAdmin.findUnique({ where: { id: etapaId } });
    if (!etapa || etapa.projetoId !== projetoId) throw new Error('Etapa não encontrada para o projeto');

    if (acao === 'concluir') {
      await prisma.etapaAdmin.update({
        where: { id: etapaId },
        data: { concluida: true, realizada: true, dataConclusao: new Date() }
      });
    } else {
      if (!justificativa || justificativa.trim().length < 5) {
        throw new Error('Justificativa obrigatória para adiar');
      }
      const nova = new Date();
      nova.setHours(nova.getHours() + 24);
      await prisma.etapaAdmin.update({
        where: { id: etapaId },
        data: { dataPrevista: nova, dataExpiracao: nova, motivoExtensao: justificativa, justificativa }
      });
    }

    // Verificar se todas concluídas
    const etapas = await prisma.etapaAdmin.findMany({ where: { projetoId } });
    const todasConcluidas = etapas.every(e => e.concluida);
    if (todasConcluidas) {
      // Notificar sistema: aqui registramos nota na descrição do projeto
      await prisma.projeto.update({
        where: { id: projetoId },
        data: { descricao: `${(await prisma.projeto.findUnique({ where: { id: projetoId }, select: { descricao: true } }))?.descricao ?? ''}\n[INFO] Etapas administrativas concluídas. Pronto para próxima fase.` }
      });
    }

    return { success: true };
  }
}

export const projetosService = new ProjetosService();


