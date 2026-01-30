import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🧪 TESTANDO CONEXÕES...\n');

// ============================================
// TESTE 1: Telegram Bot
// ============================================

async function testTelegram() {
  try {
    console.log('1️⃣ Testando Telegram Bot...');
    
    if (!BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN não configurado');
    }

    const bot = new TelegramBot(BOT_TOKEN);
    const me = await bot.getMe();
    
    console.log('✅ Telegram Bot OK!');
    console.log(`   • Nome: ${me.first_name}`);
    console.log(`   • Username: @${me.username}`);
    console.log(`   • ID: ${me.id}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro no Telegram Bot:', error.message);
    return false;
  }
}

// ============================================
// TESTE 2: Supabase
// ============================================

async function testSupabase() {
  try {
    console.log('2️⃣ Testando Supabase...');
    
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Testar conexão buscando empresas
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .limit(1);

    if (error) throw error;

    console.log('✅ Supabase OK!');
    console.log(`   • URL: ${SUPABASE_URL}`);
    console.log(`   • Empresas encontradas: ${companies?.length || 0}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro no Supabase:', error.message);
    return false;
  }
}

// ============================================
// TESTE 3: Dados do Sistema
// ============================================

async function testData() {
  try {
    console.log('3️⃣ Testando dados do sistema...');
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    const { data: os } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact' });

    const { data: clients } = await supabase
      .from('clients')
      .select('*', { count: 'exact' });

    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact' });

    console.log('✅ Dados do sistema OK!');
    console.log(`   • Ordens de Serviço: ${os?.length || 0}`);
    console.log(`   • Clientes: ${clients?.length || 0}`);
    console.log(`   • Veículos: ${vehicles?.length || 0}\n`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error.message);
    return false;
  }
}

// ============================================
// EXECUTAR TODOS OS TESTES
// ============================================

async function runAllTests() {
  console.log('════════════════════════════════════════\n');
  console.log('🤖 DOCTOR AUTO PRIME - TELEGRAM BOT');
  console.log('📋 Teste de Conexões e Configuração\n');
  console.log('════════════════════════════════════════\n');

  const results = {
    telegram: await testTelegram(),
    supabase: await testSupabase(),
    data: await testData()
  };

  console.log('════════════════════════════════════════\n');
  console.log('📊 RESULTADO FINAL:\n');
  console.log(`   Telegram Bot:  ${results.telegram ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`   Supabase:      ${results.supabase ? '✅ OK' : '❌ FALHOU'}`);
  console.log(`   Dados:         ${results.data ? '✅ OK' : '❌ FALHOU'}`);
  console.log('\n════════════════════════════════════════\n');

  const allOk = Object.values(results).every(r => r === true);

  if (allOk) {
    console.log('✅ TODOS OS TESTES PASSARAM!');
    console.log('🚀 O bot está pronto para ser iniciado com: npm start\n');
  } else {
    console.log('❌ ALGUNS TESTES FALHARAM!');
    console.log('🔧 Verifique as configurações em .env e tente novamente.\n');
    process.exit(1);
  }
}

runAllTests();
