import { Request, Response } from 'express';
import { RelatoriosService } from '../services/relatorios.service';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export class RelatoriosController {
    /**
     * Retorna dados financeiros mensais para gráficos
     */
    static async getDadosFinanceiros(req: Request, res: Response) {
        try {
            const dados = await RelatoriosService.getDadosFinanceirosMensais();

            res.json({
                success: true,
                data: dados
            });

        } catch (error) {
            console.error('Erro ao buscar dados financeiros:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Retorna resumo financeiro geral
     */
    static async getResumoFinanceiro(req: Request, res: Response) {
        try {
            const resumo = await RelatoriosService.getResumoFinanceiro();

            res.json({
                success: true,
                data: resumo
            });

        } catch (error) {
            console.error('Erro ao buscar resumo financeiro:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Retorna estatísticas de vendas por mês
     */
    static async getEstatisticasVendas(req: Request, res: Response) {
        try {
            const { meses = 12 } = req.query;
            const dados = await RelatoriosService.getEstatisticasVendas(parseInt(meses as string));

            res.json({
                success: true,
                data: dados
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas de vendas:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Retorna top clientes por valor de vendas
     */
    static async getTopClientes(req: Request, res: Response) {
        try {
            const { limite = 10 } = req.query;
            const dados = await RelatoriosService.getTopClientes(parseInt(limite as string));

            res.json({
                success: true,
                data: dados
            });

        } catch (error) {
            console.error('Erro ao buscar top clientes:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Retorna dashboard completo com todos os dados
     */
    static async getDashboardCompleto(req: Request, res: Response) {
        try {
            const dashboard = await RelatoriosService.getDashboardCompleto();

            res.json({
                success: true,
                data: dashboard
            });

        } catch (error) {
            console.error('Erro ao buscar dashboard completo:', error);
            res.status(500).json({
                error: 'Erro interno do servidor',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Retorna dados do relatório financeiro (JSON)
     * GET /api/relatorios/financeiro/dados
     */
    static async getDadosRelatorioFinanceiro(req: Request, res: Response) {
        try {
            const { tipo = 'completo', dataInicio, dataFim } = req.query;

            if (!dataInicio || !dataFim) {
                return res.status(400).json({
                    success: false,
                    error: 'Período (dataInicio e dataFim) é obrigatório'
                });
            }

            const inicio = new Date(dataInicio as string);
            const fim = new Date(dataFim as string);

            if (inicio > fim) {
                return res.status(400).json({
                    success: false,
                    error: 'Data de início não pode ser maior que data de fim'
                });
            }

            const dados = await RelatoriosService.getDadosRelatorioFinanceiro(inicio, fim, tipo as string);

            res.json({
                success: true,
                data: dados
            });

        } catch (error) {
            console.error('Erro ao buscar dados do relatório:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao buscar dados do relatório',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Exporta relatório financeiro em PDF ou Excel
     * GET /api/relatorios/financeiro/exportar
     */
    static async exportarRelatorioFinanceiro(req: Request, res: Response) {
        try {
            const { 
                tipo = 'completo', 
                formato = 'pdf', 
                dataInicio, 
                dataFim,
                incluirGraficos = 'true',
                incluirDetalhes = 'true'
            } = req.query;

            if (!dataInicio || !dataFim) {
                return res.status(400).json({
                    success: false,
                    error: 'Período (dataInicio e dataFim) é obrigatório'
                });
            }

            const inicio = new Date(dataInicio as string);
            const fim = new Date(dataFim as string);

            if (inicio > fim) {
                return res.status(400).json({
                    success: false,
                    error: 'Data de início não pode ser maior que data de fim'
                });
            }

            // Buscar dados do período
            const dadosRelatorio = await RelatoriosService.getDadosRelatorioFinanceiro(
                inicio,
                fim,
                tipo as string
            );

            if (formato === 'excel') {
                await RelatoriosController.gerarRelatorioExcel(
                    res,
                    dadosRelatorio,
                    inicio,
                    fim,
                    incluirDetalhes === 'true'
                );
            } else {
                await RelatoriosController.gerarRelatorioPDF(
                    res,
                    dadosRelatorio,
                    inicio,
                    fim,
                    incluirGraficos === 'true',
                    incluirDetalhes === 'true'
                );
            }

        } catch (error) {
            console.error('Erro ao exportar relatório financeiro:', error);
            res.status(500).json({
                success: false,
                error: 'Erro ao gerar relatório',
                message: error instanceof Error ? error.message : 'Erro desconhecido'
            });
        }
    }

    /**
     * Gera relatório em formato Excel
     */
    private static async gerarRelatorioExcel(
        res: Response,
        dados: any,
        dataInicio: Date,
        dataFim: Date,
        incluirDetalhes: boolean
    ) {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'S3E Engenharia';
        workbook.created = new Date();

        // Aba: Resumo
        const sheetResumo = workbook.addWorksheet('Resumo Financeiro');
        
        // Cabeçalho
        sheetResumo.addRow(['RELATÓRIO FINANCEIRO - S3E ENGENHARIA']);
        sheetResumo.addRow([`Período: ${dataInicio.toLocaleDateString('pt-BR')} até ${dataFim.toLocaleDateString('pt-BR')}`]);
        sheetResumo.addRow([]);
        
        // Estilos
        sheetResumo.getRow(1).font = { bold: true, size: 16 };
        sheetResumo.getRow(2).font = { size: 12 };
        
        // Métricas Principais
        sheetResumo.addRow(['MÉTRICAS PRINCIPAIS', '']);
        sheetResumo.addRow(['Total a Receber', dados.totalReceber]);
        sheetResumo.addRow(['Total a Pagar', dados.totalPagar]);
        sheetResumo.addRow(['Saldo Previsto', dados.saldoPrevisto]);
        sheetResumo.addRow(['Total Faturado', dados.totalFaturado]);
        sheetResumo.addRow([]);
        
        // Formatação de valores
        sheetResumo.getColumn(2).numFmt = 'R$ #,##0.00';
        sheetResumo.getColumn(1).width = 30;
        sheetResumo.getColumn(2).width = 20;
        
        // Aplicar cores
        sheetResumo.getRow(5).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
        sheetResumo.getRow(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8D7DA' } };
        sheetResumo.getRow(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD1ECF1' } };
        sheetResumo.getRow(8).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E3F1' } };

        // Detalhes de Transações (se solicitado)
        if (incluirDetalhes && dados.contasReceber && dados.contasReceber.length > 0) {
            const sheetReceber = workbook.addWorksheet('Contas a Receber');
            
            sheetReceber.addRow(['ID', 'Descrição', 'Valor', 'Data Vencimento', 'Status']);
            sheetReceber.getRow(1).font = { bold: true };
            sheetReceber.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
            
            dados.contasReceber.forEach((conta: any) => {
                sheetReceber.addRow([
                    conta.id?.slice(0, 8) || '',
                    conta.descricao || '',
                    conta.valor || 0,
                    conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '',
                    conta.status || ''
                ]);
            });
            
            sheetReceber.getColumn(3).numFmt = 'R$ #,##0.00';
            sheetReceber.columns.forEach(col => col.width = 20);
        }

        if (incluirDetalhes && dados.contasPagar && dados.contasPagar.length > 0) {
            const sheetPagar = workbook.addWorksheet('Contas a Pagar');
            
            sheetPagar.addRow(['ID', 'Descrição', 'Valor', 'Data Vencimento', 'Status']);
            sheetPagar.getRow(1).font = { bold: true };
            sheetPagar.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF44336' } };
            
            dados.contasPagar.forEach((conta: any) => {
                sheetPagar.addRow([
                    conta.id?.slice(0, 8) || '',
                    conta.descricao || '',
                    conta.valor || 0,
                    conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : '',
                    conta.status || ''
                ]);
            });
            
            sheetPagar.getColumn(3).numFmt = 'R$ #,##0.00';
            sheetPagar.columns.forEach(col => col.width = 20);
        }

        // Enviar arquivo
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-financeiro-${new Date().toISOString().split('T')[0]}.xlsx`);
        
        await workbook.xlsx.write(res);
        res.end();
    }

    /**
     * Gera relatório em formato PDF
     */
    private static async gerarRelatorioPDF(
        res: Response,
        dados: any,
        dataInicio: Date,
        dataFim: Date,
        incluirGraficos: boolean,
        incluirDetalhes: boolean
    ) {
        console.log('📄 Gerando PDF com dados:', {
            totalReceber: dados.totalReceber,
            totalPagar: dados.totalPagar,
            contasReceber: dados.contasReceber?.length || 0,
            contasPagar: dados.contasPagar?.length || 0
        });

        const doc = new PDFDocument({ 
            margin: 50, 
            size: 'A4',
            bufferPages: true
        });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`);
        
        doc.pipe(res);

        let yPos = 50; // Declarar fora para estar disponível em toda a função

        try {
            // Cabeçalho
            doc.fontSize(20)
               .fillColor('#000000')
               .text('S3E ENGENHARIA ELETRICA', 50, yPos, { 
                   align: 'center', 
                   width: 495 
               });
            
            yPos = 80;
            doc.fontSize(16)
               .fillColor('#000000')
               .text('Relatorio Financeiro', 50, yPos, { 
                   align: 'center', 
                   width: 495 
               });
            
            yPos = 110;
            doc.fontSize(10)
               .fillColor('#666666')
               .text(
                   `Periodo: ${dataInicio.toLocaleDateString('pt-BR')} ate ${dataFim.toLocaleDateString('pt-BR')}`,
                   50, 
                   yPos, 
                   { align: 'center', width: 495 }
               );

            // Linha divisória
            yPos = 140;
            doc.moveTo(50, yPos)
               .lineTo(545, yPos)
               .strokeColor('#CCCCCC')
               .lineWidth(1)
               .stroke();

            // Métricas Principais
            yPos = 160;
            doc.fontSize(14)
               .fillColor('#000000')
               .text('METRICAS PRINCIPAIS', 50, yPos);
            yPos += 30;

            const metrics = [
                { label: 'Total a Receber:', value: dados.totalReceber || 0 },
                { label: 'Total a Pagar:', value: dados.totalPagar || 0 },
                { label: 'Saldo Previsto:', value: dados.saldoPrevisto || 0 },
                { label: 'Total Faturado:', value: dados.totalFaturado || 0 },
                { label: 'Total Pago:', value: dados.totalPago || 0 },
                { label: 'Lucro Liquido:', value: dados.lucroLiquido || 0 }
            ];

            metrics.forEach((metric) => {
                doc.fontSize(11)
                   .fillColor('#000000')
                   .text(metric.label, 70, yPos);
                
                doc.fontSize(12)
                   .fillColor('#000000')
                   .text(
                       `R$ ${metric.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                       350, 
                       yPos,
                       { width: 195, align: 'right' }
                   );
                yPos += 25;
            });

            // Rodapé da primeira página
            doc.fontSize(8)
               .fillColor('#999999')
               .text(
                   `Gerado em ${new Date().toLocaleDateString('pt-BR')} | S3E Engenharia`,
                   50, 770, { align: 'center', width: 495 }
               );

            console.log('✅ PDF básico gerado, processando detalhes...');
        } catch (error) {
            console.error('❌ Erro ao gerar cabeçalho do PDF:', error);
            throw error;
        }

        // Detalhes (se solicitado)
        if (incluirDetalhes) {
            try {
                // Contas a Receber
                if (dados.contasReceber && dados.contasReceber.length > 0) {
                    doc.addPage();
                    doc.fontSize(14)
                       .fillColor('#000000')
                       .text('CONTAS A RECEBER', 50, 50);
                    yPos = 80;

                    dados.contasReceber.slice(0, 25).forEach((conta: any, index: number) => {
                        if (yPos > 700) {
                            doc.addPage();
                            doc.fontSize(14)
                               .fillColor('#000000')
                               .text('CONTAS A RECEBER (continuacao)', 50, 50);
                            yPos = 80;
                        }
                        
                        doc.fontSize(10)
                           .fillColor('#000000')
                           .text(
                               `${index + 1}. ${conta.descricao || 'Sem descricao'}`, 
                               70, yPos
                           );
                        yPos += 15;
                        
                        doc.fontSize(8)
                           .fillColor('#666666')
                           .text(
                               `Vencimento: ${conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : 'N/A'} | Status: ${conta.status}`,
                               70, yPos
                           );
                        
                        doc.fontSize(10)
                           .fillColor('#10B981')
                           .text(
                               `R$ ${(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                               450, yPos - 15
                           );
                        
                        yPos += 25;
                    });

                    console.log(`✅ ${dados.contasReceber.length} contas a receber adicionadas ao PDF`);
                }

                // Contas a Pagar
                if (dados.contasPagar && dados.contasPagar.length > 0) {
                    doc.addPage();
                    doc.fontSize(14)
                       .fillColor('#000000')
                       .text('CONTAS A PAGAR', 50, 50);
                    yPos = 80;

                    dados.contasPagar.slice(0, 25).forEach((conta: any, index: number) => {
                        if (yPos > 700) {
                            doc.addPage();
                            doc.fontSize(14)
                               .fillColor('#000000')
                               .text('CONTAS A PAGAR (continuacao)', 50, 50);
                            yPos = 80;
                        }
                        
                        doc.fontSize(10)
                           .fillColor('#000000')
                           .text(
                               `${index + 1}. ${conta.descricao || 'Sem descricao'}`, 
                               70, yPos
                           );
                        yPos += 15;
                        
                        doc.fontSize(8)
                           .fillColor('#666666')
                           .text(
                               `Vencimento: ${conta.dataVencimento ? new Date(conta.dataVencimento).toLocaleDateString('pt-BR') : 'N/A'} | Status: ${conta.status}`,
                               70, yPos
                           );
                        
                        doc.fontSize(10)
                           .fillColor('#EF4444')
                           .text(
                               `R$ ${(conta.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                               450, yPos - 15
                           );
                        
                        yPos += 25;
                    });

                    console.log(`✅ ${dados.contasPagar.length} contas a pagar adicionadas ao PDF`);
                }
            } catch (error) {
                console.error('❌ Erro ao adicionar detalhes ao PDF:', error);
            }
        }

        console.log('✅ PDF finalizado, enviando...');
        doc.end();
    }
}

