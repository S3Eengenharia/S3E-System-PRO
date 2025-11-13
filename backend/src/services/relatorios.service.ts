import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface DadosFinanceirosMensais {
    mes: string;
    receita: number;
    despesa: number;
    lucro: number;
}

interface ResumoFinanceiro {
    totalReceitas: number;
    totalDespesas: number;
    lucroTotal: number;
    contasReceberPendentes: number;
    contasPagarPendentes: number;
    contasEmAtraso: number;
}

export class RelatoriosService {
    /**
     * Retorna dados financeiros agregados dos últimos 12 meses
     * Considera apenas contas PAGAS para receitas e despesas
     */
    static async getDadosFinanceirosMensais(): Promise<DadosFinanceirosMensais[]> {
        // Calcular data de início (12 meses atrás)
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - 12);
        dataInicio.setDate(1);
        dataInicio.setHours(0, 0, 0, 0);

        // Buscar apenas contas a receber PAGAS dos últimos 12 meses
        const contasReceber = await prisma.contaReceber.findMany({
            where: {
                dataPagamento: {
                    gte: dataInicio
                },
                status: 'Pago'
            },
            select: {
                dataPagamento: true,
                valorParcela: true,
                status: true
            }
        });

        // Buscar apenas contas a pagar PAGAS dos últimos 12 meses
        const contasPagar = await prisma.contaPagar.findMany({
            where: {
                dataPagamento: {
                    gte: dataInicio
                },
                status: 'Pago'
            },
            select: {
                dataPagamento: true,
                valorParcela: true,
                status: true
            }
        });

        // Criar mapa para agregar por mês
        const mesesMap = new Map<string, { receita: number; despesa: number }>();

        // Gerar últimos 12 meses
        const meses: string[] = [];
        for (let i = 11; i >= 0; i--) {
            const data = new Date();
            data.setMonth(data.getMonth() - i);
            const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
            meses.push(mesAno);
            mesesMap.set(mesAno, { receita: 0, despesa: 0 });
        }

        // Agregar contas a receber (receitas) - usar data de pagamento
        contasReceber.forEach(conta => {
            if (conta.dataPagamento) {
                const data = new Date(conta.dataPagamento);
                const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
                
                if (mesesMap.has(mesAno)) {
                    const atual = mesesMap.get(mesAno)!;
                    atual.receita += conta.valorParcela;
                    mesesMap.set(mesAno, atual);
                }
            }
        });

        // Agregar contas a pagar (despesas) - usar data de pagamento
        contasPagar.forEach(conta => {
            if (conta.dataPagamento) {
                const data = new Date(conta.dataPagamento);
                const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
                
                if (mesesMap.has(mesAno)) {
                    const atual = mesesMap.get(mesAno)!;
                    atual.despesa += conta.valorParcela;
                    mesesMap.set(mesAno, atual);
                }
            }
        });

        // Formatar resultado
        const resultado: DadosFinanceirosMensais[] = meses.map(mesAno => {
            const dados = mesesMap.get(mesAno)!;
            const [mes, ano] = mesAno.split('/');
            const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            
            return {
                mes: `${mesesNomes[parseInt(mes) - 1]}/${ano}`,
                receita: Number(dados.receita.toFixed(2)),
                despesa: Number(dados.despesa.toFixed(2)),
                lucro: Number((dados.receita - dados.despesa).toFixed(2))
            };
        });

        return resultado;
    }

    /**
     * Retorna resumo financeiro geral
     */
    static async getResumoFinanceiro(): Promise<ResumoFinanceiro> {
        const hoje = new Date();

        // Buscar todas as contas a receber
        const contasReceber = await prisma.contaReceber.findMany({
            select: {
                valorParcela: true,
                status: true,
                dataVencimento: true
            }
        });

        // Buscar todas as contas a pagar
        const contasPagar = await prisma.contaPagar.findMany({
            select: {
                valorParcela: true,
                status: true,
                dataVencimento: true
            }
        });

        // Calcular totais de receitas
        const totalReceitas = contasReceber
            .filter(c => c.status === 'Pago')
            .reduce((sum, c) => sum + c.valorParcela, 0);

        // Calcular totais de despesas
        const totalDespesas = contasPagar
            .filter(c => c.status === 'Pago')
            .reduce((sum, c) => sum + c.valorParcela, 0);

        // Contas a receber pendentes
        const contasReceberPendentes = contasReceber
            .filter(c => c.status === 'Pendente')
            .reduce((sum, c) => sum + c.valorParcela, 0);

        // Contas a pagar pendentes
        const contasPagarPendentes = contasPagar
            .filter(c => c.status === 'Pendente')
            .reduce((sum, c) => sum + c.valorParcela, 0);

        // Contas em atraso (receitas e despesas)
        const contasReceberAtrasadas = contasReceber.filter(c => {
            const vencimento = new Date(c.dataVencimento);
            return vencimento < hoje && c.status === 'Pendente';
        });

        const contasPagarAtrasadas = contasPagar.filter(c => {
            const vencimento = new Date(c.dataVencimento);
            return vencimento < hoje && c.status === 'Pendente';
        });

        const valorReceberAtrasado = contasReceberAtrasadas.reduce((sum, c) => sum + c.valorParcela, 0);
        const valorPagarAtrasado = contasPagarAtrasadas.reduce((sum, c) => sum + c.valorParcela, 0);

        return {
            totalReceitas: Number(totalReceitas.toFixed(2)),
            totalDespesas: Number(totalDespesas.toFixed(2)),
            lucroTotal: Number((totalReceitas - totalDespesas).toFixed(2)),
            contasReceberPendentes: Number(contasReceberPendentes.toFixed(2)),
            contasPagarPendentes: Number(contasPagarPendentes.toFixed(2)),
            contasEmAtraso: Number((valorReceberAtrasado + valorPagarAtrasado).toFixed(2))
        };
    }

    /**
     * Retorna estatísticas de vendas por mês
     */
    static async getEstatisticasVendas(meses: number = 12) {
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - meses);
        dataInicio.setDate(1);
        dataInicio.setHours(0, 0, 0, 0);

        const vendas = await prisma.venda.findMany({
            where: {
                dataVenda: {
                    gte: dataInicio
                },
                status: {
                    not: 'Cancelada'
                }
            },
            select: {
                dataVenda: true,
                valorTotal: true,
                status: true
            }
        });

        // Agregar por mês
        const vendasPorMes = new Map<string, { quantidade: number; valor: number }>();

        // Gerar meses
        const mesesArray: string[] = [];
        for (let i = meses - 1; i >= 0; i--) {
            const data = new Date();
            data.setMonth(data.getMonth() - i);
            const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
            mesesArray.push(mesAno);
            vendasPorMes.set(mesAno, { quantidade: 0, valor: 0 });
        }

        // Agregar vendas
        vendas.forEach(venda => {
            const data = new Date(venda.dataVenda);
            const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
            
            if (vendasPorMes.has(mesAno)) {
                const atual = vendasPorMes.get(mesAno)!;
                atual.quantidade += 1;
                atual.valor += venda.valorTotal;
                vendasPorMes.set(mesAno, atual);
            }
        });

        // Formatar resultado
        const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        return mesesArray.map(mesAno => {
            const dados = vendasPorMes.get(mesAno)!;
            const [mes, ano] = mesAno.split('/');
            
            return {
                mes: `${mesesNomes[parseInt(mes) - 1]}/${ano}`,
                quantidade: dados.quantidade,
                valor: Number(dados.valor.toFixed(2))
            };
        });
    }

    /**
     * Retorna top clientes por valor de vendas
     */
    static async getTopClientes(limite: number = 10) {
        const vendas = await prisma.venda.findMany({
            where: {
                status: {
                    not: 'Cancelada'
                }
            },
            select: {
                valorTotal: true,
                cliente: {
                    select: {
                        id: true,
                        nome: true
                    }
                }
            }
        });

        // Agregar por cliente
        const clientesMap = new Map<string, { nome: string; valor: number; quantidade: number }>();

        vendas.forEach(venda => {
            const clienteId = venda.cliente.id;
            const clienteNome = venda.cliente.nome;

            if (clientesMap.has(clienteId)) {
                const atual = clientesMap.get(clienteId)!;
                atual.valor += venda.valorTotal;
                atual.quantidade += 1;
            } else {
                clientesMap.set(clienteId, {
                    nome: clienteNome,
                    valor: venda.valorTotal,
                    quantidade: 1
                });
            }
        });

        // Converter para array e ordenar
        const topClientes = Array.from(clientesMap.entries())
            .map(([id, dados]) => ({
                clienteId: id,
                clienteNome: dados.nome,
                valorTotal: Number(dados.valor.toFixed(2)),
                quantidadeCompras: dados.quantidade
            }))
            .sort((a, b) => b.valorTotal - a.valorTotal)
            .slice(0, limite);

        return topClientes;
    }

    /**
     * Retorna dados para relatório financeiro personalizado
     */
    static async getDadosRelatorioFinanceiro(dataInicio: Date, dataFim: Date, tipo: string) {
        // Buscar contas a receber do período
        const contasReceber = await prisma.contaReceber.findMany({
            where: {
                dataVencimento: {
                    gte: dataInicio,
                    lte: dataFim
                }
            },
            select: {
                id: true,
                descricao: true,
                valorParcela: true,
                dataVencimento: true,
                dataPagamento: true,
                status: true
            },
            orderBy: { dataVencimento: 'asc' }
        });

        // Buscar contas a pagar do período
        const contasPagar = await prisma.contaPagar.findMany({
            where: {
                dataVencimento: {
                    gte: dataInicio,
                    lte: dataFim
                }
            },
            select: {
                id: true,
                descricao: true,
                valorParcela: true,
                dataVencimento: true,
                dataPagamento: true,
                status: true
            },
            orderBy: { dataVencimento: 'asc' }
        });

        // Calcular totais
        const totalReceber = contasReceber
            .filter(c => c.status !== 'Pago')
            .reduce((sum, c) => sum + (c.valorParcela || 0), 0);

        const totalPagar = contasPagar
            .filter(c => c.status !== 'Pago')
            .reduce((sum, c) => sum + (c.valorParcela || 0), 0);

        const totalFaturado = contasReceber
            .filter(c => c.status === 'Pago')
            .reduce((sum, c) => sum + (c.valorParcela || 0), 0);

        const totalPago = contasPagar
            .filter(c => c.status === 'Pago')
            .reduce((sum, c) => sum + (c.valorParcela || 0), 0);

        const saldoPrevisto = totalReceber - totalPagar;
        const lucroLiquido = totalFaturado - totalPago;

        // Filtrar por tipo de relatório
        let contasReceberFiltradas = contasReceber;
        let contasPagarFiltradas = contasPagar;

        if (tipo === 'receber') {
            contasPagarFiltradas = [];
        } else if (tipo === 'pagar') {
            contasReceberFiltradas = [];
        }

        // Gerar dados para gráficos mensais
        const mesesMap = new Map<string, { receita: number; despesa: number }>();
        
        // Determinar meses no período
        const meses: string[] = [];
        const mesInicio = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), 1);
        const mesFim = new Date(dataFim.getFullYear(), dataFim.getMonth(), 1);
        
        const mesAtual = new Date(mesInicio);
        while (mesAtual <= mesFim) {
            const mesAno = `${String(mesAtual.getMonth() + 1).padStart(2, '0')}/${mesAtual.getFullYear()}`;
            meses.push(mesAno);
            mesesMap.set(mesAno, { receita: 0, despesa: 0 });
            mesAtual.setMonth(mesAtual.getMonth() + 1);
        }

        // Agregar receitas pagas por mês
        contasReceber.filter(c => c.status === 'Pago' && c.dataPagamento).forEach(conta => {
            const data = new Date(conta.dataPagamento!);
            const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
            if (mesesMap.has(mesAno)) {
                const atual = mesesMap.get(mesAno)!;
                atual.receita += conta.valorParcela || 0;
            }
        });

        // Agregar despesas pagas por mês
        contasPagar.filter(c => c.status === 'Pago' && c.dataPagamento).forEach(conta => {
            const data = new Date(conta.dataPagamento!);
            const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
            if (mesesMap.has(mesAno)) {
                const atual = mesesMap.get(mesAno)!;
                atual.despesa += conta.valorParcela || 0;
            }
        });

        // Converter para array para gráficos
        const graficosMensais = meses.map(mes => {
            const dados = mesesMap.get(mes)!;
            return {
                mes,
                receita: dados.receita,
                despesa: dados.despesa,
                lucro: dados.receita - dados.despesa
            };
        });

        return {
            totalReceber,
            totalPagar,
            saldoPrevisto,
            totalFaturado,
            totalPago,
            lucroLiquido,
            contasReceber: contasReceberFiltradas.map(c => ({
                id: c.id,
                descricao: c.descricao,
                valor: c.valorParcela,
                dataVencimento: c.dataVencimento,
                dataPagamento: c.dataPagamento,
                status: c.status
            })),
            contasPagar: contasPagarFiltradas.map(c => ({
                id: c.id,
                descricao: c.descricao,
                valor: c.valorParcela,
                dataVencimento: c.dataVencimento,
                dataPagamento: c.dataPagamento,
                status: c.status
            })),
            graficosMensais,
            periodo: {
                inicio: dataInicio,
                fim: dataFim
            }
        };
    }

    /**
     * Retorna dashboard completo
     */
    static async getDashboardCompleto() {
        const [
            dadosFinanceirosMensais,
            resumoFinanceiro,
            estatisticasVendas,
            topClientes
        ] = await Promise.all([
            this.getDadosFinanceirosMensais(),
            this.getResumoFinanceiro(),
            this.getEstatisticasVendas(12),
            this.getTopClientes(5)
        ]);

        return {
            financeiro: {
                mensais: dadosFinanceirosMensais,
                resumo: resumoFinanceiro
            },
            vendas: estatisticasVendas,
            topClientes
        };
    }
}

