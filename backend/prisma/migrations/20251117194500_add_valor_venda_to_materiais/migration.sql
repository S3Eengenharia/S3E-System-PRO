-- Add valorVenda column if it does not exist yet
ALTER TABLE "materiais"
ADD COLUMN IF NOT EXISTS "valorVenda" DOUBLE PRECISION;

-- Also ensure porcentagemLucro exists (for backward compatibility)
ALTER TABLE "materiais"
ADD COLUMN IF NOT EXISTS "porcentagemLucro" DOUBLE PRECISION;

