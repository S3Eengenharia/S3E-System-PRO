-- CreateTable
CREATE TABLE "etapas_admin" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "dataInicio" TIMESTAMP(3),
    "dataPrevista" TIMESTAMP(3) NOT NULL,
    "dataConclusao" TIMESTAMP(3),
    "observacoes" TEXT,
    "motivoExtensao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "etapas_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "etapas_admin_projetoId_idx" ON "etapas_admin"("projetoId");

-- CreateIndex
CREATE INDEX "etapas_admin_tipo_idx" ON "etapas_admin"("tipo");

-- CreateIndex
CREATE INDEX "etapas_admin_concluida_idx" ON "etapas_admin"("concluida");

-- AddForeignKey
ALTER TABLE "etapas_admin" ADD CONSTRAINT "etapas_admin_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "projetos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
