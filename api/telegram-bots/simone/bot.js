import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import { GeminiClient, formatCurrency, formatDate } from '../shared/utils.js';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// CONFIGURAÇÃO - SIMONE (EMPRESA)
// ============================================

const bot = new TelegramBot(process.env.SIMONE_TOKEN, { polling: true });
const gemini = new GeminiClient(process.env.SIMONE_GEMINI_KEY, 'gemini-2.0-flash-thinking-exp');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const SYSTEM_PROMPT = `Você é SIMONE, a IA gestora da empresa Doctor Auto Prime.

SUAS RESPONSABILIDADES:
- Gerenciar dados da oficina mecânica
- Analisar ordens de serviço
- Gerar relatórios e insights
- Monitorar pátio e operações
- Ajudar na tomada de decisões

EMPRESAS QUE VOCÊ GERENCIA:
1. Doctor Auto Prime (Principal)
2. Doctor Auto Bosch (Certificada Bosch)
3. Garage 347 (Boutique)

DADOS DISPONÍVEIS:
- Ordens de serviço (OS)
- Clientes e veículos
- Status do pátio Kanban (9 estágios)
- Histórico financeiro

COMUNICAÇÃO:
- Seja profissional mas acessível
- Use emojis relevantes
- Dê insights práticos
- Sempre em português brasileiro`;

console.log('🟣 SIMONE iniciada!');
console.log('📊 Empresa: Doctor Auto Prime');
console.log('🤖 IA: Gemini 2.0 Flash Thinking Exp\n');

// ============================================
// INICIALIZAR CHAT COM CONTEXTO
// ============================================

await gemini.startChat(SYSTEM_PROMPT);

// ============================================
// COMANDOS
// ============================================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  const welcome = `🟣 *SIMONE - Gestora Doctor Auto Prime*

Olá! Sou a SIMONE, sua IA de gestão empresarial.

🏢 *O QUE EU FAÇO:*
• Analiso dados da empresa
• Gero relatórios e insights
• Monitoro operações
• Ajudo em decisões estratégicas

📊 *COMANDOS:*

*/stats* - Estatísticas gerais
*/os* - Ordens de serviço
*/patio* - Status do pátio
*/clientes* [busca] - Buscar cliente
*/relatorio* - Relatório completo

💬 *CONVERSA LIVRE:*
Pode me perguntar qualquer coisa sobre a empresa!

Exemplo: "Como está o faturamento hoje?"
  `;
  
  bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
});

bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, '⏳ Analisando dados...');
    
    const today = new Date().toISOString().split('T')[0];
    
    const { data: osHoje } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact' })
      .gte('created_at', today);
    
    const { data: osAbertas } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact' })
      .eq('status', 'aberta');
    
    const { data: clientes } = await supabase
      .from('clients')
      .select('*', { count: 'exact' });
    
    const context = `
Dados do sistema:
- OS criadas hoje: ${osHoje?.length || 0}
- OS abertas: ${osAbertas?.length || 0}
- Total de clientes: ${clientes?.length || 0}
    `;
    
    const analysis = await gemini.sendMessageWithContext(
      'Analise esses dados e dê insights sobre o desempenho da empresa. Seja objetiva e prática.',
      context
    );
    
    const message = `
📊 *ESTATÍSTICAS - DOCTOR AUTO PRIME*

*📅 HOJE*
• OS Criadas: ${osHoje?.length || 0}
• OS Abertas: ${osAbertas?.length || 0}

*💼 GERAL*
• Total Clientes: ${clientes?.length || 0}

*🤖 ANÁLISE DA SIMONE:*
${analysis}

*⏰* ${new Date().toLocaleString('pt-BR')}
    `;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

bot.onText(/\/os/, async (msg) => {
  const chatId = msg.chat.id;
  
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
    
    let message = `📋 *ÚLTIMAS ORDENS DE SERVIÇO*\n\n`;
    
    orders.forEach((os, i) => {
      message += `*${i + 1}. OS #${os.id}*\n`;
      message += `👤 ${os.clients?.name || 'N/A'}\n`;
      message += `🚗 ${os.vehicles?.plate || 'N/A'}\n`;
      message += `📍 ${os.posicao_patio || 'N/A'}\n`;
      message += `💰 ${formatCurrency(os.valor_aprovado)}\n\n`;
    });
    
    const context = `Últimas OS: ${JSON.stringify(orders.map(o => ({
      cliente: o.clients?.name,
      posicao: o.posicao_patio,
      valor: o.valor_aprovado
    })))}`;
    
    const analysis = await gemini.sendMessageWithContext(
      'Analise essas ordens de serviço. Identifique padrões e dê recomendações.',
      context
    );
    
    message += `\n*🤖 ANÁLISE:*\n${analysis}`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

bot.onText(/\/patio/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, '⏳ Verificando pátio...');
    
    const posicoes = [
      'entrada', 'aguardando_orcamento', 'aguardando_aprovacao',
      'aguardando_pecas', 'em_execucao', 'pronto_entrega'
    ];
    
    const { data: orders } = await supabase
      .from('ordens_servico')
      .select('posicao_patio, vehicles(plate)')
      .in('posicao_patio', posicoes);
    
    let message = `🏭 *STATUS DO PÁTIO KANBAN*\n\n`;
    
    posicoes.forEach(pos => {
      const count = orders?.filter(os => os.posicao_patio === pos).length || 0;
      message += `📍 *${pos.toUpperCase().replace(/_/g, ' ')}*: ${count}\n`;
    });
    
    const context = `Status do pátio: ${JSON.stringify(
      posicoes.map(p => ({
        posicao: p,
        quantidade: orders?.filter(os => os.posicao_patio === p).length || 0
      }))
    )}`;
    
    const analysis = await gemini.sendMessageWithContext(
      'Analise o fluxo do pátio. Identifique gargalos e sugira melhorias.',
      context
    );
    
    message += `\n*🤖 ANÁLISE:*\n${analysis}`;
    message += `\n\n⏰ ${new Date().toLocaleTimeString('pt-BR')}`;
    
    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

bot.onText(/\/clientes\s+(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const search = match[1];
  
  try {
    bot.sendMessage(chatId, `🔍 Buscando "${search}"...`);
    
    const { data: clients } = await supabase
      .from('clients')
      .select('*, vehicles(*)')
      .or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
      .limit(3);
    
    if (!clients || clients.length === 0) {
      bot.sendMessage(chatId, '📭 Nenhum cliente encontrado.');
      return;
    }
    
    let message = `👥 *RESULTADOS* (${clients.length})\n\n`;
    
    clients.forEach((c, i) => {
      message += `*${i + 1}. ${c.name}*\n`;
      message += `📱 ${c.phone || 'N/A'}\n`;
      message += `🏆 Tier: ${c.tier || 'Bronze'}\n\n`;
    });
    
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
    bot.sendMessage(chatId, '🤔 Analisando...');
    
    const response = await gemini.sendMessage(text);
    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

bot.on('polling_error', (error) => console.error('Erro:', error.code));

console.log('✅ SIMONE pronta e aguardando mensagens!\n');
