/**
 * Script para inicializar datas de atualização de preços
 * 
 * Este script define a data atual como ultimaAtualizacaoPreco
 * para todos os materiais que já possuem preço definido.
 * 
 * Execute uma única vez após aplicar a migration:
 * npx tsx src/scripts/inicializarDatasPrecos.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function inicializarDatasPrecos() {
  try {
    console.log('🔄 Iniciando atualização de datas de preços...\n');

    // Buscar todos os materiais com preço definido mas sem data de atualização
    const materiais = await prisma.material.findMany({
      where: {
        preco: {
          not: null
        },
        ultimaAtualizacaoPreco: null
      }
    });

    console.log(`📋 Encontrados ${materiais.length} materiais para atualizar\n`);

    if (materiais.length === 0) {
      console.log('✅ Nenhum material precisa de atualização!');
      return;
    }

    const dataAtual = new Date();
    let atualizados = 0;

    // Atualizar em lote
    for (const material of materiais) {
      await prisma.material.update({
        where: { id: material.id },
        data: {
          ultimaAtualizacaoPreco: dataAtual
        }
      });

      atualizados++;
      
      if (atualizados % 50 === 0) {
        console.log(`✅ ${atualizados}/${materiais.length} materiais atualizados...`);
      }
    }

    console.log(`\n✅ CONCLUÍDO! ${atualizados} materiais atualizados com sucesso!`);
    console.log(`📅 Data definida: ${dataAtual.toLocaleDateString('pt-BR')} às ${dataAtual.toLocaleTimeString('pt-BR')}\n`);

    // Estatísticas
    console.log('📊 ESTATÍSTICAS:');
    console.log(`   - Materiais atualizados: ${atualizados}`);
    console.log(`   - Todos os preços agora têm validade de 30 dias`);
    console.log(`   - Flags aparecerão como VERDE (preço atualizado) ✅\n`);

  } catch (error) {
    console.error('❌ Erro ao inicializar datas:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar
inicializarDatasPrecos()
  .then(() => {
    console.log('🎉 Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });

