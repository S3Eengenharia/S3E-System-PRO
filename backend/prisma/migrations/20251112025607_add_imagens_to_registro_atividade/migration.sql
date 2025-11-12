-- AlterTable
ALTER TABLE "registros_atividade" ADD COLUMN     "imagens" TEXT[] DEFAULT ARRAY[]::TEXT[];
