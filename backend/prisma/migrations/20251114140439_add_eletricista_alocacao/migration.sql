-- AlterTable
ALTER TABLE "alocacoes_obra" ADD COLUMN     "eletricistaId" TEXT,
ALTER COLUMN "equipeId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "alocacoes_obra_equipeId_idx" ON "alocacoes_obra"("equipeId");

-- CreateIndex
CREATE INDEX "alocacoes_obra_eletricistaId_idx" ON "alocacoes_obra"("eletricistaId");

-- CreateIndex
CREATE INDEX "alocacoes_obra_projetoId_idx" ON "alocacoes_obra"("projetoId");

-- AddForeignKey
ALTER TABLE "alocacoes_obra" ADD CONSTRAINT "alocacoes_obra_eletricistaId_fkey" FOREIGN KEY ("eletricistaId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
