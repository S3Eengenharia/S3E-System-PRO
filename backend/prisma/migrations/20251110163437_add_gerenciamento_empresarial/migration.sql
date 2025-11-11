-- CreateTable
CREATE TABLE "funcionarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "salario" DECIMAL(10,2) NOT NULL,
    "dataAdmissao" TIMESTAMP(3) NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vales" (
    "id" TEXT NOT NULL,
    "funcionarioId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "kmAtual" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gastos_veiculo" (
    "id" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "km" INTEGER,
    "obraId" TEXT,
    "responsavel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gastos_veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planos_estrategicos" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "prazo" TIMESTAMP(3) NOT NULL,
    "responsavel" TEXT NOT NULL,
    "prioridade" TEXT NOT NULL DEFAULT 'Média',
    "status" TEXT NOT NULL DEFAULT 'Pendente',
    "categoria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "planos_estrategicos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "funcionarios_cpf_key" ON "funcionarios"("cpf");

-- CreateIndex
CREATE INDEX "vales_funcionarioId_idx" ON "vales"("funcionarioId");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE INDEX "gastos_veiculo_veiculoId_idx" ON "gastos_veiculo"("veiculoId");

-- CreateIndex
CREATE INDEX "gastos_veiculo_data_idx" ON "gastos_veiculo"("data");

-- CreateIndex
CREATE INDEX "planos_estrategicos_status_idx" ON "planos_estrategicos"("status");

-- CreateIndex
CREATE INDEX "planos_estrategicos_prioridade_idx" ON "planos_estrategicos"("prioridade");

-- AddForeignKey
ALTER TABLE "vales" ADD CONSTRAINT "vales_funcionarioId_fkey" FOREIGN KEY ("funcionarioId") REFERENCES "funcionarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gastos_veiculo" ADD CONSTRAINT "gastos_veiculo_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
