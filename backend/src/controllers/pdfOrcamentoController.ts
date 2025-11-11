import { Request, Response } from 'express';
import { PDFOrcamentoService } from '../services/pdfOrcamento.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configurar multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido. Apenas imagens são permitidas.'));
        }
    }
});

export class PDFOrcamentoController {
    // Exportar middleware de upload para uso nas rotas
    static uploadMiddleware = upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'folhaTimbrada', maxCount: 1 }
    ]);

    /**
     * POST /api/orcamentos/:id/pdf/preview-personalizado
     * Gera preview do PDF personalizado com uploads
     */
    static async gerarPreviewPersonalizado(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { opacidade = '0.05' } = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            console.log('📄 Gerando preview personalizado para orçamento:', id);

            let logoUrl: string | undefined;
            let folhaTimbradaUrl: string | undefined;

            // Converter imagens para data URLs
            if (files?.logo?.[0]) {
                const logoBuffer = files.logo[0].buffer;
                const logoBase64 = logoBuffer.toString('base64');
                logoUrl = `data:${files.logo[0].mimetype};base64,${logoBase64}`;
            }

            if (files?.folhaTimbrada?.[0]) {
                const folhaBuffer = files.folhaTimbrada[0].buffer;
                const folhaBase64 = folhaBuffer.toString('base64');
                folhaTimbradaUrl = `data:${files.folhaTimbrada[0].mimetype};base64,${folhaBase64}`;
            }

            const marcaDaguaConfig = {
                tipo: 'template' as const,
                opacidade: parseFloat(opacidade),
                logoUrl,
                folhaTimbradaUrl
            };

            const html = await PDFOrcamentoService.gerarHTMLOrcamento(id, marcaDaguaConfig);

            res.json({
                success: true,
                data: { html }
            });

        } catch (error: any) {
            console.error('❌ Erro ao gerar preview personalizado:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao gerar preview personalizado',
                error: error.message
            });
        }
    }

    /**
     * POST /api/orcamentos/:id/pdf/download-personalizado
     * Gera e baixa PDF personalizado com uploads
     */
    static async gerarPDFPersonalizado(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { opacidade = '0.05' } = req.body;
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            console.log('📄 Gerando PDF personalizado para orçamento:', id);

            let logoUrl: string | undefined;
            let folhaTimbradaUrl: string | undefined;

            // Converter imagens para data URLs
            if (files?.logo?.[0]) {
                const logoBuffer = files.logo[0].buffer;
                const logoBase64 = logoBuffer.toString('base64');
                logoUrl = `data:${files.logo[0].mimetype};base64,${logoBase64}`;
            }

            if (files?.folhaTimbrada?.[0]) {
                const folhaBuffer = files.folhaTimbrada[0].buffer;
                const folhaBase64 = folhaBuffer.toString('base64');
                folhaTimbradaUrl = `data:${files.folhaTimbrada[0].mimetype};base64,${folhaBase64}`;
            }

            const marcaDaguaConfig = {
                tipo: 'template' as const,
                opacidade: parseFloat(opacidade),
                logoUrl,
                folhaTimbradaUrl
            };

            const pdfBuffer = await PDFOrcamentoService.gerarPDF(id, marcaDaguaConfig);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Orcamento-Personalizado-${id.substring(0, 8)}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            res.send(pdfBuffer);

            console.log('✅ PDF personalizado gerado e enviado com sucesso');

        } catch (error: any) {
            console.error('❌ Erro ao gerar PDF personalizado:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao gerar PDF personalizado',
                error: error.message
            });
        }
    }

    /**
     * GET /api/orcamentos/:id/pdf/download
     * Gera e retorna o PDF binário para download
     */
    static async gerarPDFDownload(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { opacidade } = req.query;

            const marcaDaguaConfig = {
                tipo: 'template' as const,
                opacidade: opacidade ? parseFloat(opacidade as string) : 0.05
            };

            console.log('📄 Gerando PDF com Puppeteer para orçamento:', id);

            const pdfBuffer = await PDFOrcamentoService.gerarPDF(id, marcaDaguaConfig);

            // Configurar headers para download
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Orcamento-${id.substring(0, 8)}.pdf"`);
            res.setHeader('Content-Length', pdfBuffer.length);

            res.send(pdfBuffer);

            console.log('✅ PDF gerado e enviado com sucesso');

        } catch (error: any) {
            console.error('❌ Erro ao gerar PDF:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao gerar PDF do orçamento',
                error: error.message
            });
        }
    }

    /**
     * GET /api/orcamentos/:id/pdf/html
     * Retorna HTML pronto para impressão/PDF
     */
    static async gerarHTML(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { opacidade, tipo } = req.query;

            const marcaDaguaConfig = {
                tipo: (tipo as any) || 'template',
                opacidade: opacidade ? parseFloat(opacidade as string) : 0.05
            };

            const html = await PDFOrcamentoService.gerarHTMLOrcamento(id, marcaDaguaConfig);

            // Retornar HTML para o navegador renderizar
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.send(html);

        } catch (error: any) {
            console.error('❌ Erro ao gerar HTML do orçamento:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao gerar PDF do orçamento',
                error: error.message
            });
        }
    }

    /**
     * GET /api/orcamentos/:id/pdf/preview
     * Retorna JSON com o HTML para preview no modal
     */
    static async gerarPreview(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { opacidade } = req.query;

            const marcaDaguaConfig = {
                tipo: 'template' as const,
                opacidade: opacidade ? parseFloat(opacidade as string) : 0.08
            };

            const html = await PDFOrcamentoService.gerarHTMLOrcamento(id, marcaDaguaConfig);

            res.json({
                success: true,
                data: { html }
            });

        } catch (error: any) {
            console.error('❌ Erro ao gerar preview:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao gerar preview',
                error: error.message
            });
        }
    }
}

