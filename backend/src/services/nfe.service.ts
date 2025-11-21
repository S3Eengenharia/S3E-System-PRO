import { PrismaClient } from '@prisma/client';
// import { createSign } from 'crypto';
// import * as xmlCrypto from 'xml-crypto';
// import * as soap from 'soap';

const prisma = new PrismaClient();

/**
 * Tipos e Interfaces
 */
export interface DadosNFe {
  emitente: {
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string;
    inscricaoEstadual: string;
    endereco: any;
    regimeTributario: string;
  };
  destinatario: {
    cnpj: string;
    razaoSocial: string;
    inscricaoEstadual: string;
    endereco: any;
  };
  produtos: Array<{
    codigo: string;
    descricao: string;
    ncm: string;
    cfop: string;
    unidade: string;
    quantidade: number;
    valorUnitario: number;
    valorTotal: number;
    impostos: any;
  }>;
  totais: {
    valorProdutos: number;
    valorNF: number;
    baseICMS: number;
    valorICMS: number;
    valorIPI: number;
    valorPIS: number;
    valorCOFINS: number;
  };
  naturezaOperacao: string;
  serie: string;
  numero: number;
  dataEmissao: Date;
}

/**
 * Service de NF-e
 */
export class NFeService {
  /**
   * Mock de pedido de venda para geração de NF-e
   * Em produção, buscar do banco de dados
   */
  async mockSalesOrder(pedidoId: string): Promise<DadosNFe> {
    console.log(`📦 Buscando dados do pedido: ${pedidoId}`);

    // Mock baseado no XML fornecido
    return {
      emitente: {
        cnpj: '79502563000138',
        razaoSocial: 'CCA IND. E COM. DE MATERIAIS ELETRICOS LTDA',
        nomeFantasia: 'SIBRATEC',
        inscricaoEstadual: '251387186',
        regimeTributario: 'RegimeNormal',
        endereco: {
          logradouro: 'RUA SELESTA FRONZA',
          numero: '430',
          complemento: 'SALA 01',
          bairro: 'TABOAO',
          codigoMunicipio: '4214805',
          municipio: 'Rio do Sul',
          uf: 'SC',
          cep: '89160540',
          telefone: '4735212986'
        }
      },
      destinatario: {
        cnpj: '16625927000157',
        razaoSocial: 'S3E SERVICOS DE MANUTENCAO ELETRICA LTDA',
        inscricaoEstadual: '256792518',
        endereco: {
          logradouro: 'R BLUMENAU',
          numero: '1622',
          bairro: 'BARRA DO RIO',
          codigoMunicipio: '4208203',
          municipio: 'Itajai',
          uf: 'SC',
          cep: '88305104',
          telefone: '4730838361'
        }
      },
      produtos: [
        {
          codigo: '4714',
          descricao: 'CONTATOR CC63 (CJ19-63) 220V - SIBRATEC',
          ncm: '85364900',
          cfop: '5102',
          unidade: 'PC',
          quantidade: 2,
          valorUnitario: 218.15,
          valorTotal: 436.30,
          impostos: {
            icms: { origem: '1', cst: '00', aliquota: 12, valor: 52.36 },
            ipi: { cst: '50', aliquota: 3.25, valor: 14.18 },
            pis: { cst: '01', aliquota: 1.65, valor: 6.34 },
            cofins: { cst: '01', aliquota: 7.60, valor: 29.18 }
          }
        },
        {
          codigo: '10292',
          descricao: 'DISJUNTOR DIN MONO JD156-63-1P-C20 - 20A - 6KA - SIBRATEC',
          ncm: '85362000',
          cfop: '5102',
          unidade: 'PC',
          quantidade: 12,
          valorUnitario: 4.94,
          valorTotal: 59.28,
          impostos: {
            icms: { origem: '1', cst: '00', aliquota: 12, valor: 7.11 },
            ipi: { cst: '50', aliquota: 6.50, valor: 3.85 },
            pis: { cst: '01', aliquota: 1.65, valor: 0.86 },
            cofins: { cst: '01', aliquota: 7.60, valor: 3.96 }
          }
        }
      ],
      totais: {
        valorProdutos: 4000.98,
        valorNF: 4272.22,
        baseICMS: 4000.98,
        valorICMS: 480.14,
        valorIPI: 271.24,
        valorPIS: 58.09,
        valorCOFINS: 267.58
      },
      naturezaOperacao: 'Venda de Mercadoria',
      serie: '1',
      numero: 399171,
      dataEmissao: new Date()
    };
  }

  /**
   * Gera o XML da NF-e 4.0
   */
  generateNFeXML(dados: DadosNFe): string {
    const now = new Date();
    const dhEmi = now.toISOString();
    const cNF = Math.floor(Math.random() * 99999999).toString().padStart(8, '0');
    
    // Gerar chave de acesso (simplificado - em produção, usar algoritmo correto)
    const chaveAcesso = this.gerarChaveAcesso(dados.emitente.cnpj, dados.serie, dados.numero.toString(), cNF);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${chaveAcesso}" versao="4.00">
    <ide>
      <cUF>42</cUF>
      <cNF>${cNF}</cNF>
      <natOp>${dados.naturezaOperacao}</natOp>
      <mod>55</mod>
      <serie>${dados.serie}</serie>
      <nNF>${dados.numero}</nNF>
      <dhEmi>${dhEmi}</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>${dados.emitente.endereco.codigoMunicipio}</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>5</cDV>
      <tpAmb>2</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>0</indFinal>
      <indPres>3</indPres>
      <procEmi>0</procEmi>
      <verProc>S3E-ERP-1.0</verProc>
    </ide>
    <emit>
      <CNPJ>${dados.emitente.cnpj}</CNPJ>
      <xNome>${dados.emitente.razaoSocial}</xNome>
      <xFant>${dados.emitente.nomeFantasia}</xFant>
      <enderEmit>
        <xLgr>${dados.emitente.endereco.logradouro}</xLgr>
        <nro>${dados.emitente.endereco.numero}</nro>
        <xCpl>${dados.emitente.endereco.complemento || ''}</xCpl>
        <xBairro>${dados.emitente.endereco.bairro}</xBairro>
        <cMun>${dados.emitente.endereco.codigoMunicipio}</cMun>
        <xMun>${dados.emitente.endereco.municipio}</xMun>
        <UF>${dados.emitente.endereco.uf}</UF>
        <CEP>${dados.emitente.endereco.cep.replace(/\D/g, '')}</CEP>
        <fone>${dados.emitente.endereco.telefone?.replace(/\D/g, '') || ''}</fone>
      </enderEmit>
      <IE>${dados.emitente.inscricaoEstadual}</IE>
      <CRT>3</CRT>
    </emit>
    <dest>
      <CNPJ>${dados.destinatario.cnpj}</CNPJ>
      <xNome>${dados.destinatario.razaoSocial}</xNome>
      <enderDest>
        <xLgr>${dados.destinatario.endereco.logradouro}</xLgr>
        <nro>${dados.destinatario.endereco.numero}</nro>
        <xBairro>${dados.destinatario.endereco.bairro}</xBairro>
        <cMun>${dados.destinatario.endereco.codigoMunicipio}</cMun>
        <xMun>${dados.destinatario.endereco.municipio}</xMun>
        <UF>${dados.destinatario.endereco.uf}</UF>
        <CEP>${dados.destinatario.endereco.cep.replace(/\D/g, '')}</CEP>
      </enderDest>
      <indIEDest>1</indIEDest>
      <IE>${dados.destinatario.inscricaoEstadual}</IE>
    </dest>
    ${this.gerarItensXML(dados.produtos)}
    <total>
      <ICMSTot>
        <vBC>${dados.totais.baseICMS.toFixed(2)}</vBC>
        <vICMS>${dados.totais.valorICMS.toFixed(2)}</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vProd>${dados.totais.valorProdutos.toFixed(2)}</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>${dados.totais.valorIPI.toFixed(2)}</vIPI>
        <vPIS>${dados.totais.valorPIS.toFixed(2)}</vPIS>
        <vCOFINS>${dados.totais.valorCOFINS.toFixed(2)}</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${dados.totais.valorNF.toFixed(2)}</vNF>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      <detPag>
        <tPag>15</tPag>
        <vPag>${dados.totais.valorNF.toFixed(2)}</vPag>
      </detPag>
    </pag>
  </infNFe>
</NFe>`;

    return xml;
  }

  /**
   * Gera os itens (produtos) do XML
   */
  private gerarItensXML(produtos: any[]): string {
    return produtos.map((produto, index) => `
    <det nItem="${index + 1}">
      <prod>
        <cProd>${produto.codigo}</cProd>
        <cEAN>SEM GTIN</cEAN>
        <xProd>${produto.descricao}</xProd>
        <NCM>${produto.ncm}</NCM>
        <CFOP>${produto.cfop}</CFOP>
        <uCom>${produto.unidade}</uCom>
        <qCom>${produto.quantidade.toFixed(4)}</qCom>
        <vUnCom>${produto.valorUnitario.toFixed(10)}</vUnCom>
        <vProd>${produto.valorTotal.toFixed(2)}</vProd>
        <cEANTrib>SEM GTIN</cEANTrib>
        <uTrib>${produto.unidade}</uTrib>
        <qTrib>${produto.quantidade.toFixed(4)}</qTrib>
        <vUnTrib>${produto.valorUnitario.toFixed(4)}</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <ICMS>
          <ICMS00>
            <orig>${produto.impostos.icms.origem}</orig>
            <CST>${produto.impostos.icms.cst}</CST>
            <modBC>3</modBC>
            <vBC>${produto.valorTotal.toFixed(2)}</vBC>
            <pICMS>${produto.impostos.icms.aliquota.toFixed(2)}</pICMS>
            <vICMS>${produto.impostos.icms.valor.toFixed(2)}</vICMS>
          </ICMS00>
        </ICMS>
        <IPI>
          <cEnq>999</cEnq>
          <IPITrib>
            <CST>${produto.impostos.ipi.cst}</CST>
            <vBC>${produto.valorTotal.toFixed(2)}</vBC>
            <pIPI>${produto.impostos.ipi.aliquota.toFixed(2)}</pIPI>
            <vIPI>${produto.impostos.ipi.valor.toFixed(2)}</vIPI>
          </IPITrib>
        </IPI>
        <PIS>
          <PISAliq>
            <CST>${produto.impostos.pis.cst}</CST>
            <vBC>${produto.valorTotal.toFixed(2)}</vBC>
            <pPIS>${produto.impostos.pis.aliquota.toFixed(2)}</pPIS>
            <vPIS>${produto.impostos.pis.valor.toFixed(2)}</vPIS>
          </PISAliq>
        </PIS>
        <COFINS>
          <COFINSAliq>
            <CST>${produto.impostos.cofins.cst}</CST>
            <vBC>${produto.valorTotal.toFixed(2)}</vBC>
            <pCOFINS>${produto.impostos.cofins.aliquota.toFixed(2)}</pCOFINS>
            <vCOFINS>${produto.impostos.cofins.valor.toFixed(2)}</vCOFINS>
          </COFINSAliq>
        </COFINS>
      </imposto>
    </det>`).join('');
  }

  /**
   * Gera chave de acesso da NF-e (simplificado)
   * Em produção, usar algoritmo completo com dígito verificador
   */
  private gerarChaveAcesso(cnpj: string, serie: string, numero: string, cNF: string): string {
    const uf = '42'; // SC
    const anoMes = new Date().toISOString().slice(2, 7).replace('-', '');
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    const modelo = '55';
    const serieFormatada = serie.padStart(3, '0');
    const numeroFormatado = numero.padStart(9, '0');
    const tpEmis = '1';
    const dv = '5'; // Mock - em produção, calcular corretamente

    return `${uf}${anoMes}${cnpjLimpo}${modelo}${serieFormatada}${numeroFormatado}${tpEmis}${cNF}${dv}`;
  }

  /**
   * Assina o XML da NF-e com certificado digital
   */
  async signXML(xml: string, pfxBase64: string, password: string): Promise<string> {
    try {
      console.log('🔐 Iniciando assinatura do XML...');

      // Em produção, usar biblioteca como 'node-forge' para extrair chave privada do PFX
      // Por enquanto, retornar XML mockado com assinatura
      
      // Simular assinatura (em produção, usar xml-crypto com certificado real)
      const xmlAssinado = xml.replace(
        '</infNFe>',
        `</infNFe>
  <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
    <SignedInfo>
      <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
      <Reference URI="">
        <Transforms>
          <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
          <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
        </Transforms>
        <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
        <DigestValue>MOCK_DIGEST_VALUE</DigestValue>
      </Reference>
    </SignedInfo>
    <SignatureValue>MOCK_SIGNATURE_VALUE</SignatureValue>
    <KeyInfo>
      <X509Data>
        <X509Certificate>MOCK_CERTIFICATE</X509Certificate>
      </X509Data>
    </KeyInfo>
  </Signature>`
      );

      console.log('✅ XML assinado com sucesso (MOCK)');
      return xmlAssinado;
    } catch (error) {
      console.error('❌ Erro ao assinar XML:', error);
      throw new Error('Erro ao assinar XML da NF-e');
    }
  }

  /**
   * Emite NF-e na SEFAZ via SOAP
   */
  async emitirNFe(xmlAssinado: string, pfxBase64: string, password: string, ambiente: '1' | '2'): Promise<any> {
    try {
      console.log(`📤 Enviando NF-e para SEFAZ (Ambiente: ${ambiente === '1' ? 'Produção' : 'Homologação'})`);

      // Mock da URL do webservice SEFAZ
      const wsdlUrl = ambiente === '1'
        ? 'https://nfe.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx?wsdl'
        : 'https://nfe-homologacao.svrs.rs.gov.br/ws/NfeAutorizacao/NFeAutorizacao4.asmx?wsdl';

      // MOCK: Simular resposta da SEFAZ
      // Em produção, usar soap.createClient() com mTLS
      const mockResposta = {
        status: 'sucesso',
        protocolo: `242${Date.now().toString().slice(-9)}`,
        chaveAcesso: this.extrairChaveAcesso(xmlAssinado),
        dataHoraAutorizacao: new Date().toISOString(),
        mensagem: 'Autorizado o uso da NF-e',
        codigoStatus: '100'
      };

      console.log('✅ NF-e autorizada (MOCK):', mockResposta);
      return mockResposta;
    } catch (error) {
      console.error('❌ Erro ao emitir NF-e:', error);
      throw new Error('Erro ao comunicar com SEFAZ');
    }
  }

  /**
   * Cancela uma NF-e já autorizada
   */
  async cancelarNFe(chaveAcesso: string, justificativa: string, pfxBase64: string, password: string, ambiente: '1' | '2'): Promise<any> {
    try {
      console.log(`🚫 Cancelando NF-e: ${chaveAcesso}`);

      // Validações
      if (justificativa.length < 15) {
        throw new Error('Justificativa deve ter no mínimo 15 caracteres');
      }

      // Gerar XML de cancelamento (simplificado)
      const xmlCancelamento = this.gerarXMLCancelamento(chaveAcesso, justificativa);

      // Assinar XML
      const xmlAssinado = await this.signXML(xmlCancelamento, pfxBase64, password);

      // MOCK: Simular envio para SEFAZ
      const mockResposta = {
        status: 'sucesso',
        protocolo: `135${Date.now().toString().slice(-9)}`,
        chaveAcesso,
        mensagem: 'Cancelamento de NF-e homologado',
        codigoStatus: '135'
      };

      console.log('✅ NF-e cancelada (MOCK):', mockResposta);
      return mockResposta;
    } catch (error) {
      console.error('❌ Erro ao cancelar NF-e:', error);
      throw error;
    }
  }

  /**
   * Envia Carta de Correção (CC-e)
   */
  async corrigirNFe(chaveAcesso: string, textoCorrecao: string, sequencia: number, pfxBase64: string, password: string, ambiente: '1' | '2'): Promise<any> {
    try {
      console.log(`📝 Enviando CC-e para NF-e: ${chaveAcesso}`);

      // Validações
      if (textoCorrecao.length < 15) {
        throw new Error('Texto da correção deve ter no mínimo 15 caracteres');
      }

      // Gerar XML de CC-e (simplificado)
      const xmlCCe = this.gerarXMLCCe(chaveAcesso, textoCorrecao, sequencia);

      // Assinar XML
      const xmlAssinado = await this.signXML(xmlCCe, pfxBase64, password);

      // MOCK: Simular envio para SEFAZ
      const mockResposta = {
        status: 'sucesso',
        protocolo: `110${Date.now().toString().slice(-9)}`,
        chaveAcesso,
        sequencia,
        mensagem: 'Carta de Correção registrada',
        codigoStatus: '135'
      };

      console.log('✅ CC-e registrada (MOCK):', mockResposta);
      return mockResposta;
    } catch (error) {
      console.error('❌ Erro ao enviar CC-e:', error);
      throw error;
    }
  }

  /**
   * Gera XML de cancelamento (simplificado)
   */
  private gerarXMLCancelamento(chaveAcesso: string, justificativa: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eventoCancNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
  <infEvento Id="ID110111${chaveAcesso}01">
    <cOrgao>42</cOrgao>
    <tpAmb>2</tpAmb>
    <CNPJ>79502563000138</CNPJ>
    <chNFe>${chaveAcesso}</chNFe>
    <dhEvento>${new Date().toISOString()}</dhEvento>
    <tpEvento>110111</tpEvento>
    <nSeqEvento>1</nSeqEvento>
    <verEvento>1.00</verEvento>
    <detEvento versao="1.00">
      <descEvento>Cancelamento</descEvento>
      <nProt>MOCK_PROTOCOLO</nProt>
      <xJust>${justificativa}</xJust>
    </detEvento>
  </infEvento>
</eventoCancNFe>`;
  }

  /**
   * Gera XML de Carta de Correção (simplificado)
   */
  private gerarXMLCCe(chaveAcesso: string, textoCorrecao: string, sequencia: number): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eventoCCe xmlns="http://www.portalfiscal.inf.br/nfe" versao="1.00">
  <infEvento Id="ID110110${chaveAcesso}${sequencia.toString().padStart(2, '0')}">
    <cOrgao>42</cOrgao>
    <tpAmb>2</tpAmb>
    <CNPJ>79502563000138</CNPJ>
    <chNFe>${chaveAcesso}</chNFe>
    <dhEvento>${new Date().toISOString()}</dhEvento>
    <tpEvento>110110</tpEvento>
    <nSeqEvento>${sequencia}</nSeqEvento>
    <verEvento>1.00</verEvento>
    <detEvento versao="1.00">
      <descEvento>Carta de Correcao</descEvento>
      <xCorrecao>${textoCorrecao}</xCorrecao>
      <xCondUso>A Carta de Correcao e disciplinada pelo paragrafo 1o-A do art. 7o do Convenio S/N, de 15 de dezembro de 1970 e pode ser utilizada para regularizacao de erro ocorrido na emissao de documento fiscal, desde que o erro nao esteja relacionado com: I - as variaveis que determinam o valor do imposto tais como: base de calculo, aliquota, diferenca de preco, quantidade, valor da operacao ou da prestacao; II - a correcao de dados cadastrais que implique mudanca do remetente ou do destinatario; III - a data de emissao ou de saida.</xCondUso>
    </detEvento>
  </infEvento>
</eventoCCe>`;
  }

  /**
   * Extrai chave de acesso do XML
   */
  private extrairChaveAcesso(xml: string): string {
    const match = xml.match(/Id="NFe(\d{44})"/);
    return match ? match[1] : '';
  }

  /**
   * Processo completo de emissão
   */
  async processarEmissao(pedidoId: string, empresaId: string): Promise<any> {
    try {
      console.log(`\n🚀 Iniciando processo de emissão da NF-e para pedido: ${pedidoId}`);

      // 1. Buscar dados da empresa fiscal
      const empresa = await prisma.empresaFiscal.findUnique({
        where: { id: empresaId }
      });

      if (!empresa) {
        throw new Error('Empresa fiscal não encontrada');
      }

      if (!empresa.certificadoPath || !empresa.certificadoSenha) {
        throw new Error('Certificado digital não configurado para esta empresa');
      }

      // 2. Buscar dados do pedido (mock)
      const dadosPedido = await this.mockSalesOrder(pedidoId);

      // 3. Gerar XML da NF-e
      console.log('📄 Gerando XML da NF-e...');
      const xmlNFe = this.generateNFeXML(dadosPedido);

      // 4. Assinar XML
      console.log('🔐 Assinando XML...');
      const xmlAssinado = await this.signXML(xmlNFe, 'MOCK_PFX_BASE64', 'MOCK_PASSWORD');

      // 5. Enviar para SEFAZ
      console.log('📤 Enviando para SEFAZ...');
      const resultado = await this.emitirNFe(xmlAssinado, 'MOCK_PFX_BASE64', 'MOCK_PASSWORD', '2');

      // 6. Salvar no banco de dados (mock)
      console.log('💾 Salvando NF-e no banco de dados...');

      return {
        success: true,
        chaveAcesso: resultado.chaveAcesso,
        protocolo: resultado.protocolo,
        dataAutorizacao: resultado.dataHoraAutorizacao,
        mensagem: resultado.mensagem,
        xml: xmlAssinado
      };
    } catch (error) {
      console.error('❌ Erro no processo de emissão:', error);
      throw error;
    }
  }
}

export default new NFeService();

