/*
  Warnings:

  - A unique constraint covering the columns `[numeroSequencial]` on the table `orcamentos` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "orcamentos" ADD COLUMN     "motivoRecusa" TEXT,
ADD COLUMN     "numeroSequencial" SERIAL NOT NULL,
ADD COLUMN     "recusadoAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'Pendente';

-- CreateIndex
CREATE UNIQUE INDEX "orcamentos_numeroSequencial_key" ON "orcamentos"("numeroSequencial");
