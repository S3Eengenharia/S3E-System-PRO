-- CreateEnum
CREATE TYPE "StatusAlocacao" AS ENUM ('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');

-- AlterTable
ALTER TABLE "tarefas_obra" ADD COLUMN     "alocacaoId" TEXT,
ADD COLUMN     "dataPrevistaFim" TIMESTAMP(3),
ADD COLUMN     "equipeId" TEXT;

-- CreateTable
CREATE TABLE "alocacoes_equipe" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "status" "StatusAlocacao" NOT NULL DEFAULT 'PLANEJADA',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alocacoes_equipe_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "alocacoes_equipe_tarefaId_idx" ON "alocacoes_equipe"("tarefaId");

-- CreateIndex
CREATE INDEX "alocacoes_equipe_obraId_idx" ON "alocacoes_equipe"("obraId");

-- CreateIndex
CREATE INDEX "alocacoes_equipe_equipeId_idx" ON "alocacoes_equipe"("equipeId");

-- CreateIndex
CREATE INDEX "alocacoes_equipe_dataInicio_dataFim_idx" ON "alocacoes_equipe"("dataInicio", "dataFim");

-- AddForeignKey
ALTER TABLE "alocacoes_equipe" ADD CONSTRAINT "alocacoes_equipe_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
