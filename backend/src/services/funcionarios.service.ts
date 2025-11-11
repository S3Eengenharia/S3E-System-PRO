import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const FuncionariosService = {
    // Listar todos os funcionários
    async listarFuncionarios() {
        return await prisma.funcionario.findMany({
            include: {
                vales: {
                    orderBy: { data: 'desc' }
                }
            },
            orderBy: { nome: 'asc' }
        });
    },

    // Buscar funcionário por ID
    async buscarFuncionario(id: string) {
        return await prisma.funcionario.findUnique({
            where: { id },
            include: {
                vales: {
                    orderBy: { data: 'desc' }
                }
            }
        });
    },

    // Criar funcionário
    async criarFuncionario(data: {
        nome: string;
        cargo: string;
        salario: number;
        dataAdmissao: string;
        cpf: string;
        telefone?: string;
        email?: string;
        status?: string;
    }) {
        return await prisma.funcionario.create({
            data: {
                ...data,
                dataAdmissao: new Date(data.dataAdmissao)
            }
        });
    },

    // Atualizar funcionário
    async atualizarFuncionario(id: string, data: {
        nome?: string;
        cargo?: string;
        salario?: number;
        dataAdmissao?: string;
        cpf?: string;
        telefone?: string;
        email?: string;
        status?: string;
    }) {
        const updateData: any = { ...data };
        if (data.dataAdmissao) {
            updateData.dataAdmissao = new Date(data.dataAdmissao);
        }

        return await prisma.funcionario.update({
            where: { id },
            data: updateData
        });
    },

    // Deletar funcionário
    async deletarFuncionario(id: string) {
        return await prisma.funcionario.delete({
            where: { id }
        });
    },

    // Obter métricas de RH
    async obterMetricasRH() {
        const funcionarios = await prisma.funcionario.findMany({
            where: { status: 'Ativo' },
            include: {
                vales: {
                    where: {
                        data: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                        }
                    }
                }
            }
        });

        const totalFuncionarios = funcionarios.length;
        const folhaPagamento = funcionarios.reduce((sum, f) => sum + Number(f.salario), 0);
        const valesMes = funcionarios.reduce((sum, f) => 
            sum + f.vales.reduce((valeSum, v) => valeSum + Number(v.valor), 0), 0
        );
        const custoTotal = folhaPagamento + valesMes;

        return {
            totalFuncionarios,
            folhaPagamento,
            valesMes,
            custoTotal
        };
    }
};

