-- CreateEnum
CREATE TYPE "FuncaoPessoa" AS ENUM ('TECNICO_1', 'ELETRICISTA_2', 'ENGENHEIRO', 'AUXILIAR');

-- CreateTable
CREATE TABLE "pessoas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "funcao" "FuncaoPessoa" NOT NULL,
    "disponivel" BOOLEAN NOT NULL DEFAULT true,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pessoas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pessoas_email_key" ON "pessoas"("email");
