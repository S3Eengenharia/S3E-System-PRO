-- CreateTable
CREATE TABLE "despesas_fixas" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "diaVencimento" INTEGER NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "fornecedor" TEXT,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despesas_fixas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos_despesa_fixa" (
    "id" TEXT NOT NULL,
    "despesaFixaId" TEXT NOT NULL,
    "mesReferencia" TEXT NOT NULL,
    "valorPago" DECIMAL(10,2) NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_despesa_fixa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "despesas_fixas_categoria_idx" ON "despesas_fixas"("categoria");

-- CreateIndex
CREATE INDEX "despesas_fixas_ativa_idx" ON "despesas_fixas"("ativa");

-- CreateIndex
CREATE INDEX "pagamentos_despesa_fixa_despesaFixaId_idx" ON "pagamentos_despesa_fixa"("despesaFixaId");

-- CreateIndex
CREATE INDEX "pagamentos_despesa_fixa_mesReferencia_idx" ON "pagamentos_despesa_fixa"("mesReferencia");

-- AddForeignKey
ALTER TABLE "pagamentos_despesa_fixa" ADD CONSTRAINT "pagamentos_despesa_fixa_despesaFixaId_fkey" FOREIGN KEY ("despesaFixaId") REFERENCES "despesas_fixas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
