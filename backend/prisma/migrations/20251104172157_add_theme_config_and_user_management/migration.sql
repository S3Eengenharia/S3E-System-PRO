-- CreateEnum
CREATE TYPE "StatusObra" AS ENUM ('BACKLOG', 'A_FAZER', 'ANDAMENTO', 'CONCLUIDO');

-- CreateTable
CREATE TABLE "configuracoes_sistema" (
    "id" TEXT NOT NULL DEFAULT 'sistema-config',
    "temaPreferido" TEXT NOT NULL DEFAULT 'light',
    "logoUrl" TEXT,
    "nomeEmpresa" TEXT NOT NULL DEFAULT 'S3E Engenharia',
    "emailContato" TEXT,
    "telefoneContato" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracoes_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "obras" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "nomeObra" TEXT NOT NULL,
    "status" "StatusObra" NOT NULL DEFAULT 'BACKLOG',
    "dataPrevistaInicio" TIMESTAMP(3),
    "dataPrevistaFim" TIMESTAMP(3),
    "dataInicioReal" TIMESTAMP(3),
    "dataFimReal" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "obras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tarefas_obra" (
    "id" TEXT NOT NULL,
    "obraId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "atribuidoA" TEXT,
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "dataPrevista" TIMESTAMP(3),
    "dataConclusaoReal" TIMESTAMP(3),
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tarefas_obra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_atividade" (
    "id" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "dataRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "descricaoAtividade" TEXT NOT NULL,
    "horasTrabalhadas" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registros_atividade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "obras_projetoId_key" ON "obras"("projetoId");

-- AddForeignKey
ALTER TABLE "obras" ADD CONSTRAINT "obras_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tarefas_obra" ADD CONSTRAINT "tarefas_obra_obraId_fkey" FOREIGN KEY ("obraId") REFERENCES "obras"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_atividade" ADD CONSTRAINT "registros_atividade_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "tarefas_obra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
