-- AlterTable
ALTER TABLE "equipes" ADD COLUMN     "descricao" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "pdf_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "description" TEXT,
    "customization" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdf_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pdf_templates_userId_idx" ON "pdf_templates"("userId");

-- AddForeignKey
ALTER TABLE "pdf_templates" ADD CONSTRAINT "pdf_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
