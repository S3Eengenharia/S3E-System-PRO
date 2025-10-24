import PDFDocument from 'pdfkit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface OrcamentoPDFData {
  id: string;
  numero: string;
  cliente: {
    nome: string;
    email: string;
    telefone?: string;
    endereco?: string;
  };
  projeto: {
    nome: string;
    descricao: string;
    tipo: string;
  };
  materiais: {
    nome: string;
    quantidade: number;
    precoUnitario: number;
    precoTotal: number;
    unidade: string;
  }[];
  servicos: {
    nome: string;
    quantidade: number;
    precoUnitario: number;
    precoTotal: number;
  }[];
  totais: {
    subtotal: number;
    bdi: number;
    bdiPercentual: number;
    total: number;
  };
  validade: string;
  observacoes?: string;
}

export class PDFService {
  /**
   * Gerar PDF de orçamento
   */
  async gerarOrcamentoPDF(orcamentoId: string): Promise<Buffer> {
    try {
      // Buscar dados do orçamento
      const orcamento = await this.buscarDadosOrcamento(orcamentoId);
      
      if (!orcamento) {
        throw new Error('Orçamento não encontrado');
      }

      // Criar documento PDF
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Buffer para armazenar o PDF
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      
      // Gerar conteúdo do PDF
      await this.gerarConteudoOrcamento(doc, orcamento);
      
      // Finalizar documento
      doc.end();

      // Retornar buffer completo
      return new Promise((resolve, reject) => {
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
        doc.on('error', reject);
      });

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Erro ao gerar PDF do orçamento');
    }
  }

  /**
   * Buscar dados completos do orçamento
   */
  async buscarDadosOrcamento(orcamentoId: string): Promise<OrcamentoPDFData | null> {
    try {
      const orcamento = await prisma.orcamento.findUnique({
        where: { id: orcamentoId },
        include: {
          cliente: true,
          materiais: {
            include: {
              material: true
            }
          },
          servicos: true
        }
      });

      if (!orcamento) {
        return null;
      }

      // Calcular totais
      const subtotal = orcamento.materiais.reduce((sum, m) => sum + (m.precoUnitario * m.quantidade), 0) +
                      orcamento.servicos.reduce((sum, s) => sum + (s.precoUnitario * s.quantidade), 0);
      
      const bdiPercentual = orcamento.bdi || 20; // Default 20%
      const bdi = (subtotal * bdiPercentual) / 100;
      const total = subtotal + bdi;

      return {
        id: orcamento.id,
        numero: orcamento.numero || `ORC-${orcamento.id.substring(0, 8).toUpperCase()}`,
        cliente: {
          nome: orcamento.cliente.nome,
          email: orcamento.cliente.email,
          telefone: orcamento.cliente.telefone || undefined,
          endereco: orcamento.cliente.endereco || undefined
        },
        projeto: {
          nome: orcamento.nomeProjeto || 'Projeto Elétrico',
          descricao: orcamento.descricao || '',
          tipo: orcamento.tipoProjeto || 'Completo'
        },
        materiais: orcamento.materiais.map(m => ({
          nome: m.material.nome,
          quantidade: m.quantidade,
          precoUnitario: m.precoUnitario,
          precoTotal: m.precoUnitario * m.quantidade,
          unidade: m.material.unidade || 'Un'
        })),
        servicos: orcamento.servicos.map(s => ({
          nome: s.nome,
          quantidade: s.quantidade,
          precoUnitario: s.precoUnitario,
          precoTotal: s.precoUnitario * s.quantidade
        })),
        totais: {
          subtotal,
          bdi,
          bdiPercentual,
          total
        },
        validade: orcamento.validade ? new Date(orcamento.validade).toLocaleDateString('pt-BR') : '30 dias',
        observacoes: orcamento.observacoes || undefined
      };

    } catch (error) {
      console.error('Erro ao buscar dados do orçamento:', error);
      return null;
    }
  }

  /**
   * Gerar conteúdo do PDF
   */
  private async gerarConteudoOrcamento(doc: PDFDocument, data: OrcamentoPDFData): Promise<void> {
    // Header
    this.adicionarHeader(doc);
    
    // Informações do orçamento
    this.adicionarInfoOrcamento(doc, data);
    
    // Dados do cliente
    this.adicionarDadosCliente(doc, data);
    
    // Descrição do projeto
    this.adicionarDescricaoProjeto(doc, data);
    
    // Tabela de materiais
    this.adicionarTabelaMateriais(doc, data);
    
    // Tabela de serviços
    this.adicionarTabelaServicos(doc, data);
    
    // Totais
    this.adicionarTotais(doc, data);
    
    // Observações
    this.adicionarObservacoes(doc, data);
    
    // Footer
    this.adicionarFooter(doc);
  }

  /**
   * Adicionar header do documento
   */
  private adicionarHeader(doc: PDFDocument): void {
    // Logo (placeholder)
    doc.rect(50, 50, 80, 30)
       .fill('#1e40af');
    
    doc.fillColor('#1e40af')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('S3E', 140, 60);
    
    doc.fontSize(14)
       .text('Sistemas Elétricos Especializados', 140, 85);
    
    // Linha separadora
    doc.moveTo(50, 100)
       .lineTo(550, 100)
       .stroke('#e5e7eb');
  }

  /**
   * Adicionar informações do orçamento
   */
  private adicionarInfoOrcamento(doc: PDFDocument, data: OrcamentoPDFData): void {
    doc.moveDown(2);
    
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('ORÇAMENTO', 50, doc.y);
    
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#374151')
       .text(`Número: ${data.numero}`, 400, doc.y - 25);
    
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 400, doc.y);
    doc.text(`Validade: ${data.validade}`, 400, doc.y);
    
    doc.moveDown(1);
  }

  /**
   * Adicionar dados do cliente
   */
  private adicionarDadosCliente(doc: PDFDocument, data: OrcamentoPDFData): void {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('DADOS DO CLIENTE', 50, doc.y);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#374151');
    
    doc.text(`Nome: ${data.cliente.nome}`, 50, doc.y);
    
    if (data.cliente.email) {
      doc.text(`Email: ${data.cliente.email}`, 50, doc.y);
    }
    
    if (data.cliente.telefone) {
      doc.text(`Telefone: ${data.cliente.telefone}`, 300, doc.y - 22);
    }
    
    if (data.cliente.endereco) {
      doc.text(`Endereço: ${data.cliente.endereco}`, 50, doc.y);
    }
    
    doc.moveDown(1);
  }

  /**
   * Adicionar descrição do projeto
   */
  private adicionarDescricaoProjeto(doc: PDFDocument, data: OrcamentoPDFData): void {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('PROJETO', 50, doc.y);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#374151');
    
    doc.text(`Nome: ${data.projeto.nome}`, 50, doc.y);
    doc.text(`Tipo: ${data.projeto.tipo}`, 50, doc.y);
    
    if (data.projeto.descricao) {
      doc.text('Descrição:', 50, doc.y);
      doc.text(data.projeto.descricao, 70, doc.y, { 
        width: 480, 
        align: 'left' 
      });
    }
    
    doc.moveDown(1);
  }

  /**
   * Adicionar tabela de materiais
   */
  private adicionarTabelaMateriais(doc: PDFDocument, data: OrcamentoPDFData): void {
    if (data.materiais.length === 0) return;

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('MATERIAIS', 50, doc.y);
    
    doc.moveDown(0.5);
    
    // Cabeçalho da tabela
    const startY = doc.y;
    doc.rect(50, startY, 500, 20)
       .fill('#f3f4f6');
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#374151')
       .text('Material', 55, startY + 6)
       .text('Qtd', 350, startY + 6)
       .text('Unit.', 390, startY + 6)
       .text('Total', 450, startY + 6);
    
    // Linhas dos materiais
    let currentY = startY + 20;
    data.materiais.forEach((material, index) => {
      if (currentY > 700) { // Nova página se necessário
        doc.addPage();
        currentY = 50;
      }
      
      doc.rect(50, currentY, 500, 20)
         .stroke('#e5e7eb');
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#374151')
         .text(material.nome, 55, currentY + 6, { width: 290 })
         .text(`${material.quantidade} ${material.unidade}`, 350, currentY + 6)
         .text(`R$ ${material.precoUnitario.toFixed(2)}`, 390, currentY + 6)
         .text(`R$ ${material.precoTotal.toFixed(2)}`, 450, currentY + 6);
      
      currentY += 20;
    });
    
    doc.y = currentY + 10;
  }

  /**
   * Adicionar tabela de serviços
   */
  private adicionarTabelaServicos(doc: PDFDocument, data: OrcamentoPDFData): void {
    if (data.servicos.length === 0) return;

    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('SERVIÇOS', 50, doc.y);
    
    doc.moveDown(0.5);
    
    // Cabeçalho da tabela
    const startY = doc.y;
    doc.rect(50, startY, 500, 20)
       .fill('#f3f4f6');
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#374151')
       .text('Serviço', 55, startY + 6)
       .text('Qtd', 350, startY + 6)
       .text('Unit.', 390, startY + 6)
       .text('Total', 450, startY + 6);
    
    // Linhas dos serviços
    let currentY = startY + 20;
    data.servicos.forEach((servico, index) => {
      if (currentY > 700) { // Nova página se necessário
        doc.addPage();
        currentY = 50;
      }
      
      doc.rect(50, currentY, 500, 20)
         .stroke('#e5e7eb');
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#374151')
         .text(servico.nome, 55, currentY + 6, { width: 290 })
         .text(servico.quantidade.toString(), 350, currentY + 6)
         .text(`R$ ${servico.precoUnitario.toFixed(2)}`, 390, currentY + 6)
         .text(`R$ ${servico.precoTotal.toFixed(2)}`, 450, currentY + 6);
      
      currentY += 20;
    });
    
    doc.y = currentY + 10;
  }

  /**
   * Adicionar totais
   */
  private adicionarTotais(doc: PDFDocument, data: OrcamentoPDFData): void {
    const startY = doc.y;
    
    doc.rect(350, startY, 200, 80)
       .stroke('#1e40af');
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#374151')
       .text('Subtotal:', 360, startY + 10)
       .text(`R$ ${data.totais.subtotal.toFixed(2)}`, 500, startY + 10)
       .text(`BDI (${data.totais.bdiPercentual}%):`, 360, startY + 30)
       .text(`R$ ${data.totais.bdi.toFixed(2)}`, 500, startY + 30);
    
    doc.moveTo(360, startY + 45)
       .lineTo(540, startY + 45)
       .stroke('#1e40af');
    
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('TOTAL:', 360, startY + 55)
       .text(`R$ ${data.totais.total.toFixed(2)}`, 500, startY + 55);
    
    doc.y = startY + 90;
  }

  /**
   * Adicionar observações
   */
  private adicionarObservacoes(doc: PDFDocument, data: OrcamentoPDFData): void {
    if (!data.observacoes) return;

    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1e40af')
       .text('OBSERVAÇÕES', 50, doc.y);
    
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#374151')
       .text(data.observacoes, 50, doc.y, { 
         width: 500, 
         align: 'left' 
       });
  }

  /**
   * Adicionar footer
   */
  private adicionarFooter(doc: PDFDocument): void {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;
    
    doc.moveTo(50, footerY)
       .lineTo(550, footerY)
       .stroke('#e5e7eb');
    
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text('S3E - Sistemas Elétricos Especializados', 50, footerY + 10)
       .text('CNPJ: XX.XXX.XXX/0001-XX | Telefone: (11) 99999-9999', 50, footerY + 25)
       .text('Email: contato@s3e.com.br | Site: www.s3e.com.br', 50, footerY + 40);
  }
}

export default new PDFService();
