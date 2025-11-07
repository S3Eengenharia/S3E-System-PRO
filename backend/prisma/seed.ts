import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Deletar usuário existente se houver
  await prisma.user.deleteMany({
    where: { email: 'admin@s3e.com.br' }
  });

  // Criar usuário admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@s3e.com.br',
      password: hashedPassword,
      name: 'Administrador S3E',
      role: 'admin',
      active: true
    }
  });

  console.log('✅ Usuário Admin criado:', {
    email: admin.email,
    name: admin.name,
    role: admin.role
  });

  // Criar configuração do sistema
  const config = await prisma.configuracaoSistema.upsert({
    where: { id: 'sistema-config' },
    update: {},
    create: {
      id: 'sistema-config',
      temaPreferido: 'light',
      nomeEmpresa: 'S3E Engenharia',
      emailContato: 'contato@s3e.com.br',
      telefoneContato: '(48) 0000-0000'
    }
  });

  console.log('✅ Configuração do sistema criada:', config.nomeEmpresa);

  console.log('');
  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📝 Credenciais de acesso:');
  console.log('   Email: admin@s3e.com.br');
  console.log('   Senha: 123456');
  console.log('   Role: admin');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro no seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

