import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários padrão
  const adminPassword = await bcrypt.hash('123456A', 10);
  const adminOldPassword = await bcrypt.hash('123456', 10);
  const devPassword = await bcrypt.hash('134679@Aj', 10);
  const eletricistaPassword = await bcrypt.hash('eletricista123', 10);

  // Deletar usuários existentes se houver
  await prisma.user.deleteMany({
    where: { 
      OR: [
        { email: 'admin@s3e.com.br' },
        { email: 'admin@s3eengenharia.com.br' },
        { email: 'antoniojrtech@gmail.com' },
        { email: 'eletricista1@s3e.com' },
        { email: 'eletricista2@s3e.com' }
      ]
    }
  });

  // Criar usuário admin principal (para testes)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@s3eengenharia.com.br',
      password: adminPassword,
      name: 'Administrador S3E',
      role: 'admin',
      active: true
    }
  });

  // Criar usuário admin antigo (manter compatibilidade)
  const adminOld = await prisma.user.create({
    data: {
      email: 'admin@s3e.com.br',
      password: adminOldPassword,
      name: 'Administrador S3E (Antigo)',
      role: 'admin',
      active: true
    }
  });

  console.log('✅ Usuário Admin criado:', {
    email: admin.email,
    name: admin.name,
    role: admin.role
  });

  console.log('✅ Usuário Admin (Antigo) criado:', {
    email: adminOld.email,
    name: adminOld.name,
    role: adminOld.role
  });

  // Criar usuário desenvolvedor
  const developer = await prisma.user.create({
    data: {
      email: 'antoniojrtech@gmail.com',
      password: devPassword,
      name: 'António Jr - Desenvolvedor',
      role: 'desenvolvedor',
      active: true
    }
  });

  console.log('✅ Usuário Desenvolvedor criado:', {
    email: developer.email,
    name: developer.name,
    role: developer.role
  });

  // Criar eletricistas de exemplo
  const eletricista1 = await prisma.user.create({
    data: {
      email: 'eletricista1@s3e.com',
      password: eletricistaPassword,
      name: 'João Silva',
      role: 'eletricista',
      active: true
    }
  });

  const eletricista2 = await prisma.user.create({
    data: {
      email: 'eletricista2@s3e.com',
      password: eletricistaPassword,
      name: 'Carlos Santos',
      role: 'eletricista',
      active: true
    }
  });

  console.log('✅ Eletricistas criados:', {
    eletricista1: eletricista1.name,
    eletricista2: eletricista2.name
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
  console.log('');
  console.log('👤 ADMIN (PRINCIPAL - Para Testes):');
  console.log('   Email: admin@s3eengenharia.com.br');
  console.log('   Senha: 123456A');
  console.log('   Role: admin');
  console.log('');
  console.log('👤 ADMIN (ANTIGO):');
  console.log('   Email: admin@s3e.com.br');
  console.log('   Senha: 123456');
  console.log('   Role: admin');
  console.log('');
  console.log('👨‍💻 DESENVOLVEDOR:');
  console.log('   Email: antoniojrtech@gmail.com');
  console.log('   Senha: 134679@Aj');
  console.log('   Role: desenvolvedor');
  console.log('   Acesso: UNIVERSAL (todas as páginas e funcionalidades)');
  console.log('');
  console.log('⚡ ELETRICISTAS:');
  console.log('   Email: eletricista1@s3e.com / eletricista2@s3e.com');
  console.log('   Senha: eletricista123');
  console.log('   Role: eletricista');
  console.log('   Acesso: Obras, Tarefas da Obra, Movimentações');
  console.log('');
  console.log('💡 DICA: Use eletricistas para testar a funcionalidade de Tarefas da Obra!');
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

