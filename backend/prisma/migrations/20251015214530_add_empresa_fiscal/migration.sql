-- AlterTable
ALTER TABLE "notas_fiscais" ADD COLUMN "empresaFiscalId" TEXT;

-- CreateTable
CREATE TABLE "empresas_fiscais" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cnpj" TEXT NOT NULL,
    "inscricaoEstadual" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "endereco" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT,
    "bairro" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "regimeTributario" TEXT NOT NULL,
    "certificadoPath" TEXT,
    "certificadoSenha" TEXT,
    "certificadoValidade" DATETIME,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_fiscais_cnpj_key" ON "empresas_fiscais"("cnpj");
