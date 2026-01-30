import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// CONFIGURAÇÃO
// ============================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_IDS = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id.trim())) || [];
const DEFAULT_AI = process.env.DEFAULT_AI || 'claude';

// Inicializar clientes
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// IAs disponíveis
const claude = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const gemini = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

console.log('🤖 Bot iniciado!');
console.log(`📊 Supabase: ${SUPABASE_URL}`);
console.log(`🧠 IA Padrão: ${DEFAULT_AI}`);
console.log(`✅ Claude: ${claude ? 'Ativo' : 'Inativo'}`);
console.log(`✅ OpenAI: ${openai ? 'Ativo' : 'Inativo'}`);
console.log(`✅ Gemini: ${gemini ? 'Ativo' : 'Inativo'}`);

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

// ============================================
// FUNÇÕES DE IA
// ============================================

async function askClaude(message, context = '') {
  if (!claude) throw new Error('Claude não configurado');
  
  const systemPrompt = `Você é um assistente do sistema Doctor Auto Prime, uma oficina mecânica premium.
${context ? `\nContexto: ${context}` : ''}

Responda de forma clara, objetiva e profissional em português.`;

  const response = await claude.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{
      role: 'user',
      content: message
    }]
  });

  return response.content[0].text;
}

async function askGPT(message, context = '') {
  if (!openai) throw new Error('OpenAI não configurado');

  const systemPrompt = `Você é um assistente do sistema Doctor Auto Prime, uma oficina mecânica premium.
${context ? `\nContexto: ${context}` : ''}

Responda de forma clara, objetiva e profissional em português.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ],
    max_tokens: 1024,
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

async function askGemini(message, context = '') {
  if (!gemini) throw new Error('Gemini não configurado');

  const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `Você é um assistente do sistema Doctor Auto Prime, uma oficina mecânica premium.
${context ? `\nContexto: ${context}` : ''}

Pergunta: ${message}

Responda de forma clara, objetiva e profissional em português.`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function askAI(message, aiType = DEFAULT_AI, context = '') {
  try {
    switch (aiType.toLowerCase()) {
      case 'claude':
        return await askClaude(message, context);
      case 'gpt':
      case 'openai':
        return await askGPT(message, context);
      case 'gemini':
        return await askGemini(message, context);
      default:
        // Tenta usar a primeira disponível
        if (claude) return await askClaude(message, context);
        if (openai) return await askGPT(message, context);
        if (gemini) return await askGemini(message, context);
        throw new Error('Nenhuma IA configurada');
    }
  } catch (error) {
    throw new Error(`Erro ao consultar IA: ${error.message}`);
  }
}

// ============================================
// COMANDOS DO BOT
// ============================================

// /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name;

  const welcomeMessage = `
🚗 *Doctor Auto Prime AI Bot*

Olá ${firstName}! 👋

Seu Telegram ID: \`${userId}\`

🤖 *IAs Disponíveis:*
${claude ? '✅ Claude (Anthropic)' : '❌ Claude'}
${openai ? '✅ GPT-4 (OpenAI)' : '❌ GPT-4'}
${gemini ? '✅ Gemini (Google)' : '❌ Gemini'}

📋 *Comandos:*

*💬 CONVERSAR COM IA*
/claude [pergunta] - Usar Claude
/gpt [pergunta] - Usar GPT-4
/gemini [pergunta] - Usar Gemini

*📊 CONSULTAS* ${isAdmin(userId) ? '' : '(Admin)'}
/stats - Estatísticas do sistema
/os - Ordens de serviço
/clientes [busca] - Buscar clientes
/patio - Status do pátio

*ℹ️ AJUDA*
/help - Ajuda completa
/about - Sobre o sistema

${!isAdmin(userId) ? '\n⚠️ Solicite acesso admin para funcionalidades completas.' : ''}
  `;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// /claude, /gpt, /gemini
bot.onText(/\/(claude|gpt|gemini)\s+(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const aiType = match[1];
  const question = match[2];

  bot.sendMessage(chatId, `🤖 Processando com ${aiType.toUpperCase()}...`);

  try {
    const response = await askAI(question, aiType);
    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

// /stats
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Acesso negado. Apenas administradores.');
    return;
  }

  try {
    bot.sendMessage(chatId, '⏳ Buscando estatísticas...');

    const today = new Date().toISOString().split('T')[0];

    const { data: os } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact' })
      .gte('created_at', today);

    const { data: clientes } = await supabase
      .from('clients')
      .select('*', { count: 'exact' });

    const { data: empresas } = await supabase
      .from('companies')
      .select('*', { count: 'exact' });

    // Perguntar à IA sobre insights
    const context = `OS hoje: ${os?.length || 0}, Total clientes: ${clientes?.length || 0}, Empresas: ${empresas?.length || 0}`;
    const insights = await askAI('Analise esses dados e dê insights rápidos:', DEFAULT_AI, context);

    const statsMessage = `
📊 *ESTATÍSTICAS - DOCTOR AUTO PRIME*

*📅 HOJE*
• Ordens de Serviço: ${os?.length || 0}

*💼 GERAL*
• Total de Clientes: ${clientes?.length || 0}
• Empresas Ativas: ${empresas?.length || 0}

*🤖 INSIGHTS DA IA:*
${insights}

*⏰ Atualizado*: ${new Date().toLocaleString('pt-BR')}
    `;

    bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

// /os
bot.onText(/\/os/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  try {
    bot.sendMessage(chatId, '⏳ Buscando ordens de serviço...');

    const { data: orders } = await supabase
      .from('ordens_servico')
      .select('*, clients(name), vehicles(plate, model)')
      .order('created_at', { ascending: false })
      .limit(5);

    if (!orders || orders.length === 0) {
      bot.sendMessage(chatId, '📭 Nenhuma ordem de serviço encontrada.');
      return;
    }

    let message = `📋 *ÚLTIMAS ORDENS DE SERVIÇO* (${orders.length})\n\n`;

    orders.forEach((os, index) => {
      message += `*${index + 1}. OS #${os.id}*\n`;
      message += `👤 ${os.clients?.name || 'N/A'}\n`;
      message += `🚗 ${os.vehicles?.plate || 'N/A'}\n`;
      message += `📍 ${os.posicao_patio || 'N/A'}\n`;
      message += `💰 ${formatCurrency(os.valor_aprovado)}\n\n`;
    });

    // Pedir insights à IA
    const context = `Últimas ${orders.length} OS: ${JSON.stringify(orders.map(o => ({ cliente: o.clients?.name, posicao: o.posicao_patio, valor: o.valor_aprovado })))}`;
    const insights = await askAI('Analise essas OS e identifique padrões:', DEFAULT_AI, context);

    message += `\n*🤖 Análise da IA:*\n${insights}`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

// /clientes
bot.onText(/\/clientes(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const searchTerm = match[1];

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  if (!searchTerm) {
    bot.sendMessage(chatId, '💡 Uso: /clientes [nome ou placa]');
    return;
  }

  try {
    bot.sendMessage(chatId, `🔍 Buscando "${searchTerm}"...`);

    const { data: clients } = await supabase
      .from('clients')
      .select('*, vehicles(*)')
      .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
      .limit(3);

    if (!clients || clients.length === 0) {
      bot.sendMessage(chatId, '📭 Nenhum cliente encontrado.');
      return;
    }

    let message = `👥 *RESULTADOS* (${clients.length})\n\n`;

    clients.forEach((client, index) => {
      message += `*${index + 1}. ${client.name}*\n`;
      message += `📱 ${client.phone || 'N/A'}\n`;
      message += `🏆 ${client.tier || 'Bronze'}\n\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

// /patio
bot.onText(/\/patio/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  try {
    bot.sendMessage(chatId, '⏳ Verificando pátio...');

    const posicoes = ['entrada', 'aguardando_orcamento', 'aguardando_aprovacao', 'aguardando_pecas', 'em_execucao', 'pronto_entrega'];

    const { data: orders } = await supabase
      .from('ordens_servico')
      .select('posicao_patio, vehicles(plate)')
      .in('posicao_patio', posicoes);

    let message = `🏭 *STATUS DO PÁTIO KANBAN*\n\n`;

    posicoes.forEach(posicao => {
      const count = orders?.filter(os => os.posicao_patio === posicao).length || 0;
      message += `📍 *${posicao.toUpperCase().replace(/_/g, ' ')}*: ${count}\n`;
    });

    // Pedir insights à IA
    const context = `Distribuição pátio: ${JSON.stringify(posicoes.map(p => ({ posicao: p, quantidade: orders?.filter(os => os.posicao_patio === p).length || 0 })))}`;
    const insights = await askAI('Identifique gargalos no pátio:', DEFAULT_AI, context);

    message += `\n*🤖 Análise da IA:*\n${insights}`;
    message += `\n\n⏰ ${new Date().toLocaleTimeString('pt-BR')}`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

// /help
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `
📚 *GUIA COMPLETO*

*💬 CONVERSAR COM IA*

\`/claude [pergunta]\` - Usar Claude (Anthropic)
\`/gpt [pergunta]\` - Usar GPT-4 (OpenAI)
\`/gemini [pergunta]\` - Usar Gemini (Google)

Exemplo:
\`/claude Como melhorar atendimento?\`

*📊 CONSULTAS (Admin)*

\`/stats\` - Estatísticas + insights de IA
\`/os\` - Últimas OS + análise de padrões
\`/clientes [busca]\` - Buscar clientes
\`/patio\` - Status + análise de gargalos

*🤖 SOBRE AS IAs*

• **Claude**: Melhor para análises complexas
• **GPT-4**: Versátil e rápido
• **Gemini**: Excelente com dados estruturados

*💡 DICAS*

• Perguntas claras = respostas melhores
• Use o contexto do sistema
• Combine comandos + IA para insights

*📞 SUPORTE*

Email: toliveira1802@gmail.com
Sistema: Doctor Auto Prime V1.1
  `;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// /about
bot.onText(/\/about/, async (msg) => {
  const chatId = msg.chat.id;

  const aboutMessage = `
🚗 *DOCTOR AUTO PRIME AI BOT*

*Versão:* 1.0.0
*Sistema:* Doctor Auto Prime V1.1

*🤖 IAs Integradas:*
${claude ? '✅ Claude 3.5 Sonnet (Anthropic)' : '❌ Claude'}
${openai ? '✅ GPT-4o Mini (OpenAI)' : '❌ GPT-4'}
${gemini ? '✅ Gemini 2.0 Flash (Google)' : '❌ Gemini'}

*📊 Funcionalidades:*
• Conversação com múltiplas IAs
• Análise inteligente de dados
• Insights automáticos
• Integração com Supabase
• Consultas ao sistema

*🔗 Links:*
🌐 https://doctorautoprime.vercel.app
📧 toliveira1802@gmail.com

*©️ Doctor Auto Prime 2026*
  `;

  bot.sendMessage(chatId, aboutMessage, { parse_mode: 'Markdown' });
});

// Mensagens gerais (conversa livre com IA padrão)
bot.on('message', async (msg) => {
  // Ignorar comandos
  if (msg.text && msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text) return;

  try {
    bot.sendMessage(chatId, `🤖 Pensando...`);
    
    const response = await askAI(text, DEFAULT_AI);
    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}\n\n💡 Use /help para ver comandos disponíveis.`);
  }
});

// Handlers de erro
bot.on('polling_error', (error) => {
  console.error('Erro de polling:', error.code);
});

bot.on('error', (error) => {
  console.error('Erro no bot:', error);
});

console.log('✅ Bot configurado e pronto!\n📱 Aguardando mensagens...\n');
