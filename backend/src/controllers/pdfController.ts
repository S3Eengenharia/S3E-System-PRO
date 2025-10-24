import { Request, Response } from 'express';
import pdfService from '../services/pdf.service';

export class PDFController {
  /**
   * Gerar PDF de orçamento
   */
  async gerarOrcamentoPDF(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do orçamento é obrigatório'
        });
      }

      // Gerar PDF
      const pdfBuffer = await pdfService.gerarOrcamentoPDF(id);

      // Configurar headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=orcamento-${id}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Enviar PDF
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Gerar PDF de orçamento e retornar como stream
   */
  async gerarOrcamentoPDFStream(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do orçamento é obrigatório'
        });
      }

      // Gerar PDF
      const pdfBuffer = await pdfService.gerarOrcamentoPDF(id);

      // Configurar headers para visualização inline
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=orcamento-${id}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);

      // Enviar PDF
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Gerar PDF de orçamento e retornar URL para download
   */
  async gerarOrcamentoPDFURL(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do orçamento é obrigatório'
        });
      }

      // Gerar PDF
      const pdfBuffer = await pdfService.gerarOrcamentoPDF(id);

      // Em produção, salvar o arquivo e retornar URL
      // Por enquanto, retornar o buffer em base64
      const base64PDF = pdfBuffer.toString('base64');
      const dataURL = `data:application/pdf;base64,${base64PDF}`;

      res.json({
        success: true,
        data: {
          url: dataURL,
          filename: `orcamento-${id}.pdf`,
          size: pdfBuffer.length
        },
        message: 'PDF gerado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Verificar se orçamento existe antes de gerar PDF
   */
  async verificarOrcamento(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID do orçamento é obrigatório'
        });
      }

      // Verificar se orçamento existe (implementar no serviço)
      const orcamento = await pdfService.buscarDadosOrcamento(id);

      if (!orcamento) {
        return res.status(404).json({
          success: false,
          message: 'Orçamento não encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          id: orcamento.id,
          numero: orcamento.numero,
          cliente: orcamento.cliente.nome,
          projeto: orcamento.projeto.nome,
          total: orcamento.totais.total
        },
        message: 'Orçamento encontrado'
      });

    } catch (error) {
      console.error('Erro ao verificar orçamento:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
}

export default new PDFController();
