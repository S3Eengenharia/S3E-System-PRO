-- AlterTable
ALTER TABLE "materiais" ADD COLUMN     "ultimaAtualizacaoPreco" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "historico_precos" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "precoAntigo" DOUBLE PRECISION,
    "precoNovo" DOUBLE PRECISION NOT NULL,
    "motivo" TEXT,
    "usuario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_precos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "historico_precos_materialId_idx" ON "historico_precos"("materialId");

-- CreateIndex
CREATE INDEX "historico_precos_createdAt_idx" ON "historico_precos"("createdAt");

-- AddForeignKey
ALTER TABLE "historico_precos" ADD CONSTRAINT "historico_precos_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "materiais"("id") ON DELETE CASCADE ON UPDATE CASCADE;
