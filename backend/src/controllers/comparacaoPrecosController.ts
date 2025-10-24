import { Request, Response } from 'express';
import multer from 'multer';
import { parse } from 'csv-parse/sync';
import comparacaoPrecosService from '../services/comparacaoPrecos.service';

// Configuração do multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos'));
    }
  }
});

export class ComparacaoPrecosController {
  /**
   * Upload e processamento de arquivo CSV
   */
  async uploadCSV(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo CSV foi enviado'
        });
      }

      // Converter buffer para string
      const csvContent = req.file.buffer.toString('utf-8');
      
      // Processar CSV
      const result = await comparacaoPrecosService.processarCSV(csvContent);

      res.json({
        success: true,
        data: result,
        message: 'CSV processado com sucesso'
      });

    } catch (error) {
      console.error('Erro no upload CSV:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Buscar histórico de preços de um material
   */
  async buscarHistoricoPrecos(req: Request, res: Response) {
    try {
      const { codigo } = req.params;

      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Código do material é obrigatório'
        });
      }

      const historico = await comparacaoPrecosService.buscarHistoricoPrecos(codigo);

      res.json({
        success: true,
        data: historico,
        message: 'Histórico buscado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Atualizar preços baseado na comparação
   */
  async atualizarPrecos(req: Request, res: Response) {
    try {
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Lista de itens é obrigatória'
        });
      }

      const result = await comparacaoPrecosService.atualizarPrecos(items);

      res.json({
        success: true,
        data: result,
        message: `Preços atualizados: ${result.updated} sucessos, ${result.errors} erros`
      });

    } catch (error) {
      console.error('Erro ao atualizar preços:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  /**
   * Middleware para upload de arquivo
   */
  get uploadMiddleware() {
    return upload.single('csvFile');
  }

  /**
   * Validar estrutura do CSV antes do processamento
   */
  async validarCSV(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum arquivo CSV foi enviado'
        });
      }

      const csvContent = req.file.buffer.toString('utf-8');
      
      // Parse apenas para validar estrutura
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      if (!records.length) {
        return res.status(400).json({
          success: false,
          message: 'CSV vazio ou sem dados válidos'
        });
      }

      const requiredColumns = ['codigo', 'nome', 'unidade', 'quantidade', 'preco_unitario'];
      const csvColumns = Object.keys(records[0]);
      const missingColumns = requiredColumns.filter(col => !csvColumns.includes(col));

      if (missingColumns.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}`,
          data: {
            required: requiredColumns,
            found: csvColumns,
            missing: missingColumns
          }
        });
      }

      res.json({
        success: true,
        message: 'Estrutura do CSV é válida',
        data: {
          total_rows: records.length,
          columns: csvColumns
        }
      });

    } catch (error) {
      console.error('Erro na validação CSV:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }
}

export default new ComparacaoPrecosController();
