import jsPDF from 'jspdf';

export interface OrcamentoPDFData {
  id: string;
  titulo: string;
  cliente: {
    nome: string;
    cpfCnpj: string;
    endereco?: string;
    telefone?: string;
  };
  data: string;
  validade: string;
  descricao?: string;
  items: Array<{
    nome: string;
    quantidade: number;
    valorUnit: number;
    valorTotal: number;
  }>;
  subtotal: number;
  bdi: number;
  valorTotal: number;
  observacoes?: string;
}

export const generateOrcamentoPDF = (data: OrcamentoPDFData) => {
  const pdf = new jsPDF();
  
  let yPosition = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Header da empresa
  pdf.setFillColor(59, 130, 246); // Brand blue
  pdf.rect(0, 0, pageWidth, 40, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('S3E ENGENHARIA', margin, 25);
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Engenharia Elétrica e Automação', margin, 32);
  
  yPosition = 50;

  // Título do orçamento
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`ORÇAMENTO ${data.id}`, margin, yPosition);
  yPosition += 10;

  // Informações do cliente
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, yPosition, contentWidth, 30, 'F');
  
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CLIENTE:', margin + 5, yPosition + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(data.cliente.nome, margin + 5, yPosition + 15);
  pdf.text(`CPF/CNPJ: ${data.cliente.cpfCnpj}`, margin + 5, yPosition + 22);
  
  yPosition += 35;

  // Datas
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Data: ${data.data}`, margin, yPosition);
  pdf.text(`Validade: ${data.validade}`, pageWidth - margin - 60, yPosition);
  yPosition += 10;

  // Descrição (se houver)
  if (data.descricao) {
    pdf.setFont('helvetica', 'bold');
    pdf.text('DESCRIÇÃO:', margin, yPosition);
    yPosition += 7;
    
    pdf.setFont('helvetica', 'normal');
    // Remover tags HTML básicas
    const descricaoLimpa = data.descricao.replace(/<[^>]*>/g, '').substring(0, 200);
    const linhas = pdf.splitTextToSize(descricaoLimpa, contentWidth);
    pdf.text(linhas, margin, yPosition);
    yPosition += (linhas.length * 5) + 5;
  }

  // Tabela de items
  yPosition += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.text('ITENS DO ORÇAMENTO', margin, yPosition);
  yPosition += 7;

  // Header da tabela
  pdf.setFillColor(220, 220, 220);
  pdf.rect(margin, yPosition, contentWidth, 8, 'F');
  
  pdf.setFontSize(9);
  pdf.text('Item', margin + 2, yPosition + 5);
  pdf.text('Qtd', margin + 100, yPosition + 5);
  pdf.text('Valor Unit.', margin + 120, yPosition + 5);
  pdf.text('Total', pageWidth - margin - 30, yPosition + 5);
  yPosition += 10;

  // Items
  pdf.setFont('helvetica', 'normal');
  data.items.forEach((item, index) => {
    if (yPosition > 270) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.text(item.nome.substring(0, 40), margin + 2, yPosition);
    pdf.text(item.quantidade.toString(), margin + 100, yPosition);
    pdf.text(`R$ ${item.valorUnit.toFixed(2)}`, margin + 120, yPosition);
    pdf.text(`R$ ${item.valorTotal.toFixed(2)}`, pageWidth - margin - 30, yPosition, { align: 'right' });
    yPosition += 6;
  });

  // Totais
  yPosition += 5;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.text(`Subtotal:`, pageWidth - margin - 60, yPosition);
  pdf.text(`R$ ${data.subtotal.toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
  yPosition += 6;

  pdf.text(`BDI (${data.bdi}%):`, pageWidth - margin - 60, yPosition);
  pdf.text(`R$ ${(data.valorTotal - data.subtotal).toFixed(2)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
  yPosition += 8;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('TOTAL:', pageWidth - margin - 60, yPosition);
  pdf.text(`R$ ${data.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, pageWidth - margin - 5, yPosition, { align: 'right' });

  // Observações
  if (data.observacoes) {
    yPosition += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('OBSERVAÇÕES:', margin, yPosition);
    yPosition += 7;
    pdf.setFont('helvetica', 'normal');
    const obsLinhas = pdf.splitTextToSize(data.observacoes, contentWidth);
    pdf.text(obsLinhas, margin, yPosition);
  }

  // Footer
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Página ${i} de ${pageCount}`,
      pageWidth / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Salvar PDF
  pdf.save(`Orcamento_${data.id}_${data.cliente.nome.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

