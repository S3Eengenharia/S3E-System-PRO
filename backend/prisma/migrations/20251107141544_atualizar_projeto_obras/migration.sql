-- DropForeignKey
ALTER TABLE "public"."projetos" DROP CONSTRAINT "projetos_orcamentoId_fkey";

-- AlterTable
ALTER TABLE "projetos" ADD COLUMN     "dataConclusao" TIMESTAMP(3),
ADD COLUMN     "responsavelId" TEXT,
ADD COLUMN     "tipo" TEXT NOT NULL DEFAULT 'Instalacao',
ALTER COLUMN "orcamentoId" DROP NOT NULL,
ALTER COLUMN "valorTotal" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_orcamentoId_fkey" FOREIGN KEY ("orcamentoId") REFERENCES "orcamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projetos" ADD CONSTRAINT "projetos_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
