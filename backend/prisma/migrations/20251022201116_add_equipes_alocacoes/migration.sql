-- CreateEnum
CREATE TYPE "TipoEquipe" AS ENUM ('MONTAGEM', 'CAMPO', 'DISTINTA');

-- CreateTable
CREATE TABLE "equipes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoEquipe" NOT NULL,
    "membros" TEXT[],
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alocacoes_obra" (
    "id" TEXT NOT NULL,
    "equipeId" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFimPrevisto" TIMESTAMP(3) NOT NULL,
    "dataFimReal" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Planejada',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alocacoes_obra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "equipes_nome_key" ON "equipes"("nome");

-- AddForeignKey
ALTER TABLE "alocacoes_obra" ADD CONSTRAINT "alocacoes_obra_equipeId_fkey" FOREIGN KEY ("equipeId") REFERENCES "equipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alocacoes_obra" ADD CONSTRAINT "alocacoes_obra_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
