import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import { GeminiClient, formatCurrency, formatDate } from '../shared/utils.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

// ============================================
// CONFIGURAÇÃO - ANNA (KOMMO/CRM)
// ============================================

const bot = new TelegramBot(process.env.ANNA_TOKEN, { polling: true });
const gemini = new GeminiClient(process.env.ANNA_GEMINI_KEY, 'gemini-1.5-flash');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SYSTEM_PROMPT = `Você é ANNA, especialista em CRM e atendimento da Doctor Auto Prime.

SUAS RESPONSABILIDADES:
- Gerenciar leads e contatos
- Qualificar clientes
- Acompanhar funil de vendas
- Integração com Kommo CRM
- Análise de conversão

EXPERTISE:
- Atendimento ao cliente
- Qualificação de leads
- Follow-up estratégico
- Análise de conversão
- Gestão de relacionamento

FOCO:
- Cliente no centro
- Vendas consultivas
- Experiência premium
- Retenção e fidelização
- Upsell inteligente

COMUNICAÇÃO:
- Profissional e atenciosa
- Focada em resultados
- Use dados para decisões
- Sempre em português brasileiro`;

console.log('🟢 ANNA iniciada!');
console.log('📊 CRM: Kommo Integration');
console.log('🤖 IA: Gemini 1.5 Flash\n');

// ============================================
// INICIALIZAR CHAT
// ============================================

await gemini.startChat(SYSTEM_PROMPT);

// ============================================
// COMANDOS
// ============================================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  const welcome = `🟢 *ANNA - Especialista em CRM*

Olá! Sou a ANNA, sua especialista em gestão de relacionamento com clientes.

📊 *O QUE EU FAÇO:*
• Gerencio leads e contatos
• Analiso funil de vendas
• Qualific\u200Bo clientes
• Integro com Kommo CRM
• Otimizo conversões

💼 *COMANDOS:*

*/leads* - Ver leads ativos
*/funil* - Status do funil
*/qualificar* [nome] - Qualificar cliente
*/followup* - Pendências de follow-up
*/conversao* - Taxa de conversão

💬 *PERGUNTE:*
"Como está o funil hoje?"
"Quais leads preciso contatar?"
"Análise de conversão do mês"

Vamos vender mais! 💪
  `;
  
  bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
});

bot.onText(/\/leads/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, '⏳ Buscando leads...');
    
    // Buscar clientes recentes (simulando leads)
    const { data: recentClients } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (!recentClients || recentClients.length === 0) {
      bot.sendMessage(chatId, '📭 Nenhum lead encontrado.');
      return;
    }
    
    let message = `📋 *LEADS ATIVOS* (${recentClients.length})\n\n`;
    
    recentClients.forEach((client, i) => {
      message += `*${i + 1}. ${client.name}*\n`;
      message += `📱 ${client.phone || 'N/A'}\n`;
      message += `📧 ${client.email || 'N/A'}\n`;
      message += `📅 ${formatDate(client.created_at)}\n\n`;
    });
    
    const context = `Leads recentes: ${JSON.stringify(recentClients.map(c => ({
      nome: c.name,
      telefone: c.phone,
      data: c.created_at
    })))}`;
    
    const analysis = await gemini.sendMessageWithContext(
      'Analise esses leads. Sugira prioridades de contato e estratégias.',
      context
    );
    
    message += `\n*🤖 ANÁLISE:*\n${analysis}`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

bot.onText(/\/funil/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, '⏳ Analisando funil...');
    
    const { data: allClients } = await supabase
      .from('clients')
      .select('tier');
    
    const tiers = {
      bronze: allClients?.filter(c => c.tier === 'bronze').length || 0,
      prata: allClients?.filter(c => c.tier === 'prata').length || 0,
      ouro: allClients?.filter(c => c.tier === 'ouro').length || 0,
      platina: allClients?.filter(c => c.tier === 'platina').length || 0,
    };
    
    let message = `📊 *FUNIL DE CLIENTES*\n\n`;
    message += `🥉 Bronze: ${tiers.bronze}\n`;
    message += `🥈 Prata: ${tiers.prata}\n`;
    message += `🥇 Ouro: ${tiers.ouro}\n`;
    message += `💎 Platina: ${tiers.platina}\n`;
    message += `\n📈 Total: ${allClients?.length || 0}\n`;
    
    const context = `Distribuição de clientes por tier: ${JSON.stringify(tiers)}`;
    
    const analysis = await gemini.sendMessageWithContext(
      'Analise essa distribuição de clientes. Sugira estratégias de upgrade e retenção.',
      context
    );
    
    message += `\n*🤖 ESTRATÉGIA:*\n${analysis}`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

bot.onText(/\/qualificar\s+(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const clientName = match[1];
  
  try {
    bot.sendMessage(chatId, `🔍 Qualificando ${clientName}...`);
    
    const { data: client } = await supabase
      .from('clients')
      .select('*, vehicles(*), ordens_servico(*)')
      .ilike('name', `%${clientName}%`)
      .limit(1)
      .single();
    
    if (!client) {
      bot.sendMessage(chatId, '❌ Cliente não encontrado.');
      return;
    }
    
    const context = `
Cliente: ${client.name}
Tier: ${client.tier}
Telefone: ${client.phone}
Veículos: ${client.vehicles?.length || 0}
Total de OS: ${client.ordens_servico?.length || 0}
    `;
    
    const qualification = await gemini.sendMessageWithContext(
      'Qualifique este cliente. Analise potencial, perfil, e sugira próximas ações de vendas.',
      context
    );
    
    const message = `
👤 *QUALIFICAÇÃO: ${client.name}*

📊 *DADOS*
• Tier: ${client.tier}
• Veículos: ${client.vehicles?.length || 0}
• Histórico: ${client.ordens_servico?.length || 0} OS

*🤖 QUALIFICAÇÃO:*
${qualification}
    `;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

// Mensagens livres
bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if (!text) return;
  
  try {
    bot.sendChatAction(chatId, 'typing');
    
    const response = await gemini.sendMessage(text);
    bot.sendMessage(chatId, response);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

bot.on('polling_error', (error) => console.error('Erro:', error.code));

console.log('✅ ANNA pronta e aguardando mensagens!\n');
