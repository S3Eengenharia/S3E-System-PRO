#!/bin/sh
set -e

echo "🚀 Iniciando setup do backend S3E..."
echo "📦 Versão da aplicação: $(node -e "console.log(require('./package.json').version)")"

# Aguardar PostgreSQL ficar pronto (já é feito pelo healthcheck do compose)
echo "🗄️  Executando migrações do banco..."
npx prisma migrate deploy

echo "🌱 Executando seed do banco..."
npx tsx prisma/seed.ts

echo "✅ Setup concluído com sucesso!"
echo "🎯 Iniciando aplicação Node.js..."
exec node dist/app.js