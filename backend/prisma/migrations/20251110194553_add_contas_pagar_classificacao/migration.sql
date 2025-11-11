-- AlterTable
ALTER TABLE "contas_pagar" ADD COLUMN     "despesaFixaId" TEXT,
ADD COLUMN     "funcionarioId" TEXT,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'FORNECEDOR';

-- CreateIndex
CREATE INDEX "contas_pagar_tipo_idx" ON "contas_pagar"("tipo");

-- CreateIndex
CREATE INDEX "contas_pagar_status_idx" ON "contas_pagar"("status");
