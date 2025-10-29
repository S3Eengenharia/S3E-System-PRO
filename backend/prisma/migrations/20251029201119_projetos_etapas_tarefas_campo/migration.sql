/*
  Warnings:

  - The `status` column on the `projetos` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ProjetoStatus" AS ENUM ('PROPOSTA', 'APROVADO', 'EXECUCAO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "TarefaCampoStatus" AS ENUM ('A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDO');

-- AlterTable
ALTER TABLE "etapas_admin" ADD COLUMN     "dataExpiracao" TIMESTAMP(3),
ADD COLUMN     "justificativa" TEXT,
ADD COLUMN     "nome" TEXT,
ADD COLUMN     "realizada" BOOLEAN;

-- AlterTable
ALTER TABLE "projetos" DROP COLUMN "status",
ADD COLUMN     "status" "ProjetoStatus" NOT NULL DEFAULT 'PROPOSTA';

-- CreateTable
CREATE TABLE "tarefas_campo" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "TarefaCampoStatus" NOT NULL DEFAULT 'A_FAZER',
    "responsavelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_campo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tarefas_campo_projetoId_idx" ON "tarefas_campo"("projetoId");

-- AddForeignKey
ALTER TABLE "tarefas_campo" ADD CONSTRAINT "tarefas_campo_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
