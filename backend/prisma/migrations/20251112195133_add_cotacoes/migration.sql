-- AlterTable
ALTER TABLE "orcamento_items" ADD COLUMN     "cotacaoId" TEXT;

-- CreateTable
CREATE TABLE "cotacoes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ncm" TEXT,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "fornecedorId" TEXT,
    "fornecedorNome" TEXT,
    "dataAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cotacoes_fornecedorId_idx" ON "cotacoes"("fornecedorId");

-- CreateIndex
CREATE INDEX "cotacoes_dataAtualizacao_idx" ON "cotacoes"("dataAtualizacao");

-- CreateIndex
CREATE INDEX "cotacoes_ativo_idx" ON "cotacoes"("ativo");

-- CreateIndex
CREATE INDEX "orcamento_items_cotacaoId_idx" ON "orcamento_items"("cotacaoId");

-- AddForeignKey
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orcamento_items" ADD CONSTRAINT "orcamento_items_cotacaoId_fkey" FOREIGN KEY ("cotacaoId") REFERENCES "cotacoes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
