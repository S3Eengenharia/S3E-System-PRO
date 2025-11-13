import { Request, Response } from 'express';
import { RelatoriosService } from '../services/relatorios.service';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
     * Gera relatório em formato Excel com gráficos e logo
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
        
        // Adicionar logo (se existir)
        try {
            const logoPath = path.join(__dirname, '../../uploads/logos/logo-nome-azul.png');
            if (fs.existsSync(logoPath)) {
                const logoBuffer = fs.readFileSync(logoPath);
                const imageId = workbook.addImage({
                    buffer: logoBuffer,
                    extension: 'png',
                });
                
                // Adicionar logo nas linhas 1-4, colunas A-B
                sheetResumo.addImage(imageId, {
                    tl: { col: 0, row: 0 },
                    ext: { width: 200, height: 80 }
                });
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível adicionar o logo:', error);
        }
        
        // Cabeçalho (após logo)
        sheetResumo.mergeCells('C1:F1');
        sheetResumo.getCell('C1').value = 'RELATÓRIO FINANCEIRO';
        sheetResumo.getCell('C1').font = { bold: true, size: 18, color: { argb: 'FF1E40AF' } };
        sheetResumo.getCell('C1').alignment = { horizontal: 'center', vertical: 'middle' };
        
        sheetResumo.mergeCells('C2:F2');
        sheetResumo.getCell('C2').value = 'S3E ENGENHARIA ELÉTRICA';
        sheetResumo.getCell('C2').font = { bold: true, size: 14 };
        sheetResumo.getCell('C2').alignment = { horizontal: 'center', vertical: 'middle' };
        
        sheetResumo.mergeCells('C3:F3');
        sheetResumo.getCell('C3').value = `Período: ${dataInicio.toLocaleDateString('pt-BR')} até ${dataFim.toLocaleDateString('pt-BR')}`;
        sheetResumo.getCell('C3').font = { size: 11 };
        sheetResumo.getCell('C3').alignment = { horizontal: 'center', vertical: 'middle' };
        
        sheetResumo.mergeCells('C4:F4');
        sheetResumo.getCell('C4').value = `Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
        sheetResumo.getCell('C4').font = { size: 9, color: { argb: 'FF666666' } };
        sheetResumo.getCell('C4').alignment = { horizontal: 'center', vertical: 'middle' };
        
        // Espaço
        sheetResumo.addRow([]);
        sheetResumo.addRow([]);
        
        // Métricas Principais (linha 7)
        sheetResumo.mergeCells('A7:F7');
        sheetResumo.getCell('A7').value = '📊 MÉTRICAS PRINCIPAIS';
        sheetResumo.getCell('A7').font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        sheetResumo.getCell('A7').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
        sheetResumo.getCell('A7').alignment = { horizontal: 'center', vertical: 'middle' };
        sheetResumo.getRow(7).height = 25;
        
        // Dados das métricas
        const metricas = [
            { label: '💰 Total a Receber', valor: dados.totalReceber || 0, cor: 'FFD4EDDA' },
            { label: '💸 Total a Pagar', valor: dados.totalPagar || 0, cor: 'FFF8D7DA' },
            { label: '📈 Saldo Previsto', valor: dados.saldoPrevisto || 0, cor: 'FFD1ECF1' },
            { label: '✅ Total Faturado', valor: dados.totalFaturado || 0, cor: 'FFE2E3F1' },
            { label: '✔️ Total Pago', valor: dados.totalPago || 0, cor: 'FFFEF3C7' },
            { label: '💎 Lucro Líquido', valor: dados.lucroLiquido || 0, cor: 'FFE5E7EB' }
        ];
        
        let currentRow = 8;
        metricas.forEach(metrica => {
            sheetResumo.getCell(`A${currentRow}`).value = metrica.label;
            sheetResumo.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
            sheetResumo.getCell(`A${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: metrica.cor } };
            
            sheetResumo.getCell(`B${currentRow}`).value = metrica.valor;
            sheetResumo.getCell(`B${currentRow}`).numFmt = 'R$ #,##0.00';
            sheetResumo.getCell(`B${currentRow}`).font = { bold: true, size: 12 };
            sheetResumo.getCell(`B${currentRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: metrica.cor } };
            sheetResumo.getCell(`B${currentRow}`).alignment = { horizontal: 'right' };
            
            currentRow++;
        });
        
        // Formatação de colunas
        sheetResumo.getColumn(1).width = 30;
        sheetResumo.getColumn(2).width = 25;
        
        // Criar gráfico de barras (valores simulados via dados)
        if (dados.graficosMensais && dados.graficosMensais.length > 0) {
            const sheetGraficos = workbook.addWorksheet('Gráficos');
            
            // Cabeçalhos
            sheetGraficos.addRow(['Mês', 'Receita', 'Despesa', 'Lucro']);
            sheetGraficos.getRow(1).font = { bold: true };
            sheetGraficos.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
            
            // Dados
            dados.graficosMensais.forEach((item: any) => {
                sheetGraficos.addRow([
                    item.mes || '',
                    item.receita || 0,
                    item.despesa || 0,
                    item.lucro || 0
                ]);
            });
            
            // Formatação
            sheetGraficos.getColumn(2).numFmt = 'R$ #,##0.00';
            sheetGraficos.getColumn(3).numFmt = 'R$ #,##0.00';
            sheetGraficos.getColumn(4).numFmt = 'R$ #,##0.00';
            sheetGraficos.columns.forEach(col => col.width = 20);
        }

        // Detalhes de Transações (se solicitado)
        if (incluirDetalhes && dados.contasReceber && dados.contasReceber.length > 0) {
            const sheetReceber = workbook.addWorksheet('Contas a Receber');
            
            sheetReceber.addRow(['ID', 'Descrição', 'Valor', 'Data Vencimento', 'Status']);
            sheetReceber.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sheetReceber.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } };
            sheetReceber.getRow(1).height = 25;
            
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
            sheetReceber.columns.forEach(col => col.width = 25);
        }

        if (incluirDetalhes && dados.contasPagar && dados.contasPagar.length > 0) {
            const sheetPagar = workbook.addWorksheet('Contas a Pagar');
            
            sheetPagar.addRow(['ID', 'Descrição', 'Valor', 'Data Vencimento', 'Status']);
            sheetPagar.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sheetPagar.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } };
            sheetPagar.getRow(1).height = 25;
            
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
            sheetPagar.columns.forEach(col => col.width = 25);
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

