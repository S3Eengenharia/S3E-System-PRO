/*
  Warnings:

  - You are about to drop the column `valorPago` on the `contas_pagar` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotal` on the `contas_pagar` table. All the data in the column will be lost.
  - You are about to drop the column `clienteId` on the `contas_receber` table. All the data in the column will be lost.
  - You are about to drop the column `projetoId` on the `contas_receber` table. All the data in the column will be lost.
  - You are about to drop the column `valorRecebido` on the `contas_receber` table. All the data in the column will be lost.
  - You are about to drop the column `valorTotal` on the `contas_receber` table. All the data in the column will be lost.
  - Added the required column `valorParcela` to the `contas_pagar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `valorParcela` to the `contas_receber` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendaId` to the `contas_receber` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."contas_pagar" DROP CONSTRAINT "contas_pagar_fornecedorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."contas_receber" DROP CONSTRAINT "contas_receber_clienteId_fkey";

-- AlterTable
ALTER TABLE "contas_pagar" DROP COLUMN "valorPago",
DROP COLUMN "valorTotal",
ADD COLUMN     "valorParcela" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "fornecedorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "contas_receber" DROP COLUMN "clienteId",
DROP COLUMN "projetoId",
DROP COLUMN "valorRecebido",
DROP COLUMN "valorTotal",
ADD COLUMN     "valorParcela" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "vendaId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "vendas" (
    "id" TEXT NOT NULL,
    "numeroVenda" TEXT NOT NULL,
    "orcamentoId" TEXT NOT NULL,
    "dataVenda" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorTotal" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "clienteId" TEXT NOT NULL,
    "projetoId" TEXT,
    "formaPagamento" TEXT NOT NULL DEFAULT 'À vista',
    "parcelas" INTEGER NOT NULL DEFAULT 1,
    "valorEntrada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vendas_numeroVenda_key" ON "vendas"("numeroVenda");

-- CreateIndex
CREATE UNIQUE INDEX "vendas_orcamentoId_key" ON "vendas"("orcamentoId");

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_receber" ADD CONSTRAINT "contas_receber_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contas_pagar" ADD CONSTRAINT "contas_pagar_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
