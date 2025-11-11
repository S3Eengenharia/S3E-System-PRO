-- AlterTable
ALTER TABLE "obras" ADD COLUMN     "clienteId" TEXT,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "tipoObra" TEXT NOT NULL DEFAULT 'PROJETO',
ALTER COLUMN "projetoId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
