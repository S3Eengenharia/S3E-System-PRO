/*
  Warnings:

  - Made the column `orcamentoId` on table `projetos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."projetos" DROP CONSTRAINT "projetos_orcamentoId_fkey";

-- AlterTable
ALTER TABLE "projetos" ALTER COLUMN "orcamentoId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
