import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de seed para criar as 3 equipes fixas iniciais
 * 
 * Uso:
 * npx ts-node prisma/seed-equipes.ts
 */

async function main() {
  console.log('🚀 Iniciando seed de equipes...');

  // Buscar usuários existentes para usar como membros
  const usuarios = await prisma.user.findMany({
    where: { active: true },
    take: 6,
    orderBy: { createdAt: 'asc' }
  });

  if (usuarios.length < 6) {
    console.log(`⚠️  Aviso: Apenas ${usuarios.length} usuários encontrados.`);
    console.log('   Recomendado ter pelo menos 6 usuários (2 por equipe).');
    
    if (usuarios.length < 2) {
      throw new Error('É necessário ter pelo menos 2 usuários cadastrados para criar as equipes.');
    }
  }

  // Distribuir usuários entre as equipes
  const membrosEquipeA = usuarios.slice(0, 2).map(u => u.id);
  const membrosEquipeB = usuarios.length >= 4 
    ? usuarios.slice(2, 4).map(u => u.id)
    : [usuarios[0].id]; // Reusa usuário se não houver suficientes
  const membrosEquipeC = usuarios.length >= 6
    ? usuarios.slice(4, 6).map(u => u.id)
    : [usuarios[1].id]; // Reusa usuário se não houver suficientes

  // Criar Equipe A - MONTAGEM
  console.log('\n📦 Criando Equipe A (MONTAGEM)...');
  const equipeA = await prisma.equipe.upsert({
    where: { nome: 'Equipe A' },
    update: {},
    create: {
      nome: 'Equipe A',
      tipo: 'MONTAGEM',
      membros: membrosEquipeA,
      ativa: true
    }
  });
  console.log(`✅ Equipe A criada: ${equipeA.id}`);
  console.log(`   Membros: ${membrosEquipeA.join(', ')}`);

  // Criar Equipe B - CAMPO
  console.log('\n🏗️  Criando Equipe B (CAMPO)...');
  const equipeB = await prisma.equipe.upsert({
    where: { nome: 'Equipe B' },
    update: {},
    create: {
      nome: 'Equipe B',
      tipo: 'CAMPO',
      membros: membrosEquipeB,
      ativa: true
    }
  });
  console.log(`✅ Equipe B criada: ${equipeB.id}`);
  console.log(`   Membros: ${membrosEquipeB.join(', ')}`);

  // Criar Equipe C - DISTINTA
  console.log('\n⚡ Criando Equipe C (DISTINTA)...');
  const equipeC = await prisma.equipe.upsert({
    where: { nome: 'Equipe C' },
    update: {},
    create: {
      nome: 'Equipe C',
      tipo: 'DISTINTA',
      membros: membrosEquipeC,
      ativa: true
    }
  });
  console.log(`✅ Equipe C criada: ${equipeC.id}`);
  console.log(`   Membros: ${membrosEquipeC.join(', ')}`);

  // Resumo
  console.log('\n' + '='.repeat(50));
  console.log('✅ SEED DE EQUIPES CONCLUÍDO COM SUCESSO!');
  console.log('='.repeat(50));
  console.log('\n📊 Resumo:');
  console.log(`   - Equipe A (MONTAGEM): ${membrosEquipeA.length} membros`);
  console.log(`   - Equipe B (CAMPO): ${membrosEquipeB.length} membros`);
  console.log(`   - Equipe C (DISTINTA): ${membrosEquipeC.length} membros`);
  console.log(`   - Total de equipes: 3`);
  console.log('\n🚀 Próximos passos:');
  console.log('   1. Acesse a API em /api/obras/equipes para ver as equipes');
  console.log('   2. Use /api/obras/alocar para alocar equipes a projetos');
  console.log('   3. Consulte a documentação em GESTAO_OPERACIONAL_EQUIPES.md');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Erro ao executar seed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

