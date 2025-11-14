-- AlterTable
ALTER TABLE "kits" ADD COLUMN     "itensFaltantes" JSONB,
ADD COLUMN     "statusEstoque" TEXT NOT NULL DEFAULT 'COMPLETO',
ADD COLUMN     "temItensCotacao" BOOLEAN NOT NULL DEFAULT false;
