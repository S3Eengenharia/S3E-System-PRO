import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@s3e.com.br' },
    update: {},
    create: {
      email: 'admin@s3e.com.br',
      password: hashedPassword,
      name: 'Admin S3E',
      role: 'admin',
      active: true,
    },
  });

  console.log('✅ Usuário admin criado com sucesso!');
  console.log('📧 Email:', admin.email);
  console.log('🔑 Senha:', '123456');
  console.log('👤 Nome:', admin.name);
  console.log('🎭 Role:', admin.role);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✨ Seed concluído com sucesso!');
  })
  .catch(async (e) => {
    console.error('❌ Erro ao executar seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

