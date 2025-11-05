-- AlterTable
ALTER TABLE "orcamento_items" ADD COLUMN     "descricao" TEXT;

-- AlterTable
ALTER TABLE "orcamentos" ADD COLUMN     "condicaoPagamento" TEXT,
ADD COLUMN     "descontoValor" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "descricaoProjeto" TEXT,
ADD COLUMN     "empresaCNPJ" TEXT,
ADD COLUMN     "enderecoObra" TEXT,
ADD COLUMN     "impostoPercentual" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "previsaoInicio" TIMESTAMP(3),
ADD COLUMN     "previsaoTermino" TIMESTAMP(3),
ADD COLUMN     "responsavelObra" TEXT;

-- CreateTable
CREATE TABLE "orcamento_fotos" (
    "id" TEXT NOT NULL,
    "orcamentoId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "legenda" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orcamento_fotos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orcamento_fotos" ADD CONSTRAINT "orcamento_fotos_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
