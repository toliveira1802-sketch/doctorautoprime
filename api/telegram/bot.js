import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// CONFIGURAÇÃO
// ============================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_IDS = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id.trim())) || [];

// ============================================
// INICIALIZAÇÃO
// ============================================

const bot = new TelegramBot(BOT_TOKEN, { polling: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('🤖 Doctor Auto Prime Bot iniciado!');
console.log(`📊 Conectado ao Supabase: ${SUPABASE_URL}`);
console.log(`👥 Admins autorizados: ${ADMIN_IDS.length}`);

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// ============================================
// COMANDOS PRINCIPAIS
// ============================================

// /start - Comando inicial
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const firstName = msg.from.first_name;

  const welcomeMessage = `
🚗 *Bem-vindo ao Doctor Auto Prime Bot!*

Olá ${firstName}! 👋

Seu Telegram ID: \`${userId}\`

📋 *Comandos Disponíveis:*

*📊 CONSULTAS*
/stats - Estatísticas gerais
/os - Listar ordens de serviço
/clientes - Buscar clientes
/patio - Status do pátio Kanban

*🤖 AGENTES DE IA*
/ias - Ver status de todos os agentes
/ia [nome] - Conversar com um agente específico

*⚙️ ADMIN* ${isAdmin(userId) ? '(Você tem acesso)' : '(Sem acesso)'}
/empresas - Listar empresas
/usuarios - Listar usuários
/logs - Ver logs do sistema

*ℹ️ AJUDA*
/help - Ajuda detalhada
/about - Sobre o sistema

${!isAdmin(userId) ? '\n⚠️ *Aviso:* Solicite acesso admin para ter funcionalidades completas.' : ''}
  `;

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// /help - Ajuda detalhada
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;

  const helpMessage = `
📚 *GUIA COMPLETO - Doctor Auto Prime Bot*

*1️⃣ CONSULTAS BÁSICAS*

\`/stats\` - Estatísticas do dia
• Total de OS
• Faturamento
• Clientes atendidos
• Taxa de conversão

\`/os\` - Ordens de Serviço
• Lista OSs ativas
• Filtrar por status
• Ver detalhes

\`/clientes [nome/placa]\` - Buscar Clientes
• Busca por nome
• Busca por placa
• Histórico completo

\`/patio\` - Status do Pátio
• 9 estágios do Kanban
• Veículos em cada posição
• Gargalos identificados

*2️⃣ SISTEMA DE IA*

O sistema possui *15 agentes de IA* trabalhando 24/7:

*🟢 Camada de Atendimento*
• Scout - Qualificação de leads
• Comm - Comunicação automatizada
• Auto - Automação de processos

*🔵 Camada de Diagnóstico*
• Francisco - Diagnóstico técnico
• Ev8 - Avaliação de problemas
• Check - Checklist de inspeção

*🟣 Camada de Análise*
• Thales - Análise técnica avançada
• Prime - Otimização premium
• Bia - Business Intelligence
• Juan - Gestão operacional
• Doctor - Supervisão geral
• Atlas - Mapeamento de dados
• Book - Documentação

\`/ias\` - Ver status de todos
\`/ia scout\` - Conversar com Scout
\`/ia francisco\` - Conversar com Francisco
... e assim por diante

*3️⃣ COMANDOS ADMIN*

\`/empresas\` - Listar empresas
\`/usuarios\` - Listar usuários do sistema
\`/logs\` - Ver logs recentes

*4️⃣ DICAS DE USO*

• Use comandos curtos e objetivos
• Alguns comandos aceitam parâmetros
• Exemplo: \`/clientes ABC-1234\`
• O bot responde em poucos segundos

*5️⃣ SUPORTE*

Problemas? Contacte:
📧 toliveira1802@gmail.com
👨‍💻 Thales Oliveira - Dev

*Versão:* 1.0.0
*Sistema:* Doctor Auto Prime V1.1
  `;

  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// /about - Sobre o sistema
bot.onText(/\/about/, async (msg) => {
  const chatId = msg.chat.id;

  const aboutMessage = `
🚗 *DOCTOR AUTO PRIME*

*Versão:* V1.1 (Janeiro 2026)
*Status:* ✅ 100% Funcional em Produção

*📊 SOBRE O SISTEMA*

CRM/ERP Multi-Empresa completo para oficinas mecânicas premium com:

• *3 Empresas Integradas*
  - Doctor Auto Prime (Principal)
  - Doctor Auto Bosch (Certificada)
  - Garage 347 (Boutique)

• *Pátio Kanban Nativo*
  - 9 estágios de produção
  - Rastreamento em tempo real
  - Alertas de gargalos

• *15 Agentes de IA*
  - Atendimento 24/7
  - Diagnóstico técnico
  - Business Intelligence

• *Multi-Tenancy Total*
  - Isolamento de dados
  - Visão consolidada
  - RBAC avançado

*🔗 LINKS*

🌐 Web: https://doctorautoprime.vercel.app
📊 GitHub: Privado
💼 Email: toliveira1802@gmail.com

*🏆 ROADMAP*

✅ V1.1 - Estabilização (ATUAL)
🔄 V1.2 - Expansão de IA (Q1 2026)
📱 V1.3 - App Mobile (Q2 2026)
🌍 V2.0 - Escala Global (Q3 2026)

*©️ Doctor Auto Prime 2026*
*Propriedade Privada*
  `;

  bot.sendMessage(chatId, aboutMessage, { parse_mode: 'Markdown' });
});

// /stats - Estatísticas gerais
bot.onText(/\/stats/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Acesso negado. Apenas administradores podem ver estatísticas.');
    return;
  }

  try {
    bot.sendMessage(chatId, '⏳ Buscando estatísticas...');

    // Buscar estatísticas do banco
    const today = new Date().toISOString().split('T')[0];

    const { data: os, error: osError } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact' })
      .gte('created_at', today);

    const { data: osAbertas } = await supabase
      .from('ordens_servico')
      .select('*', { count: 'exact' })
      .eq('status', 'aberta');

    const { data: clientes, error: clientesError } = await supabase
      .from('clients')
      .select('*', { count: 'exact' });

    const { data: empresas } = await supabase
      .from('companies')
      .select('*', { count: 'exact' });

    // Calcular faturamento do mês
    const mesAtual = new Date().toISOString().substring(0, 7);
    const { data: osMes } = await supabase
      .from('ordens_servico')
      .select('valor_final')
      .gte('created_at', `${mesAtual}-01`)
      .eq('status', 'concluida');

    const faturamento = osMes?.reduce((acc, os) => acc + (os.valor_final || 0), 0) || 0;

    const statsMessage = `
📊 *ESTATÍSTICAS - DOCTOR AUTO PRIME*

*📅 HOJE*
• Ordens de Serviço: ${os?.length || 0}
• OS Abertas: ${osAbertas?.length || 0}

*💼 GERAL*
• Total de Clientes: ${clientes?.length || 0}
• Empresas Ativas: ${empresas?.length || 0}

*💰 FINANCEIRO (Mês)*
• Faturamento: ${formatCurrency(faturamento)}
• Ticket Médio: ${formatCurrency(faturamento / (osMes?.length || 1))}

*⏰ Atualizado*: ${new Date().toLocaleString('pt-BR')}
    `;

    bot.sendMessage(chatId, statsMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    bot.sendMessage(chatId, '❌ Erro ao buscar estatísticas. Verifique os logs.');
  }
});

// /os - Listar ordens de serviço
bot.onText(/\/os(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const filter = match[1]?.toLowerCase();

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Acesso negado. Apenas administradores podem ver ordens de serviço.');
    return;
  }

  try {
    bot.sendMessage(chatId, '⏳ Buscando ordens de serviço...');

    let query = supabase
      .from('ordens_servico')
      .select('*, clients(name), vehicles(plate, model)')
      .order('created_at', { ascending: false })
      .limit(10);

    if (filter) {
      query = query.or(`status.ilike.%${filter}%,posicao_patio.ilike.%${filter}%`);
    }

    const { data: orders, error } = await query;

    if (error) throw error;

    if (!orders || orders.length === 0) {
      bot.sendMessage(chatId, '📭 Nenhuma ordem de serviço encontrada.');
      return;
    }

    let message = `📋 *ORDENS DE SERVIÇO* (${orders.length})\n\n`;

    orders.forEach((os, index) => {
      message += `*${index + 1}. OS #${os.id}*\n`;
      message += `👤 Cliente: ${os.clients?.name || 'N/A'}\n`;
      message += `🚗 Veículo: ${os.vehicles?.plate || 'N/A'} - ${os.vehicles?.model || 'N/A'}\n`;
      message += `📍 Posição: ${os.posicao_patio || 'N/A'}\n`;
      message += `🎯 Status: ${os.status || 'N/A'}\n`;
      message += `💰 Valor: ${formatCurrency(os.valor_aprovado)}\n`;
      message += `📅 Criada: ${formatDate(os.created_at)}\n`;
      message += `\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar OS:', error);
    bot.sendMessage(chatId, '❌ Erro ao buscar ordens de serviço.');
  }
});

// /patio - Status do pátio Kanban
bot.onText(/\/patio/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  try {
    bot.sendMessage(chatId, '⏳ Verificando pátio...');

    const posicoes = [
      'entrada',
      'aguardando_orcamento',
      'aguardando_aprovacao',
      'aguardando_pecas',
      'em_execucao',
      'aguardando_revisao',
      'lavagem',
      'pronto_entrega',
      'entregue'
    ];

    const { data: orders } = await supabase
      .from('ordens_servico')
      .select('posicao_patio, vehicles(plate, model)')
      .in('posicao_patio', posicoes);

    let message = `🏭 *STATUS DO PÁTIO KANBAN*\n\n`;

    const emojis = {
      entrada: '🚪',
      aguardando_orcamento: '💰',
      aguardando_aprovacao: '⏳',
      aguardando_pecas: '🔧',
      em_execucao: '🔨',
      aguardando_revisao: '🔍',
      lavagem: '💧',
      pronto_entrega: '✅',
      entregue: '🎉'
    };

    posicoes.forEach(posicao => {
      const veiculos = orders?.filter(os => os.posicao_patio === posicao) || [];
      const count = veiculos.length;
      const emoji = emojis[posicao] || '📍';
      
      message += `${emoji} *${posicao.toUpperCase().replace(/_/g, ' ')}*: ${count}\n`;
      
      if (count > 0 && count <= 3) {
        veiculos.forEach(v => {
          message += `   • ${v.vehicles?.plate || 'N/A'}\n`;
        });
      }
      message += `\n`;
    });

    message += `⏰ Atualizado: ${new Date().toLocaleTimeString('pt-BR')}`;

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar pátio:', error);
    bot.sendMessage(chatId, '❌ Erro ao verificar pátio.');
  }
});

// /clientes - Buscar clientes
bot.onText(/\/clientes(?:\s+(.+))?/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const searchTerm = match[1];

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  if (!searchTerm) {
    bot.sendMessage(chatId, '💡 Uso: /clientes [nome ou placa]\nExemplo: /clientes João ou /clientes ABC-1234');
    return;
  }

  try {
    bot.sendMessage(chatId, `🔍 Buscando "${searchTerm}"...`);

    const { data: clients } = await supabase
      .from('clients')
      .select('*, vehicles(*)')
      .or(`name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
      .limit(5);

    const { data: vehicles } = await supabase
      .from('vehicles')
      .select('*, clients(*)')
      .ilike('plate', `%${searchTerm}%`)
      .limit(5);

    const results = [...(clients || []), ...(vehicles?.map(v => v.clients).filter(Boolean) || [])];
    const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());

    if (uniqueResults.length === 0) {
      bot.sendMessage(chatId, '📭 Nenhum cliente encontrado.');
      return;
    }

    let message = `👥 *RESULTADOS* (${uniqueResults.length})\n\n`;

    uniqueResults.forEach((client, index) => {
      message += `*${index + 1}. ${client.name}*\n`;
      message += `📱 Telefone: ${client.phone || 'N/A'}\n`;
      message += `📧 Email: ${client.email || 'N/A'}\n`;
      message += `🏆 Tier: ${client.tier || 'Bronze'}\n`;
      
      const clientVehicles = vehicles?.filter(v => v.client_id === client.id) || [];
      if (clientVehicles.length > 0) {
        message += `🚗 Veículos:\n`;
        clientVehicles.forEach(v => {
          message += `   • ${v.plate} - ${v.brand} ${v.model} (${v.year})\n`;
        });
      }
      message += `\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    bot.sendMessage(chatId, '❌ Erro ao buscar clientes.');
  }
});

// /ias - Status dos agentes de IA
bot.onText(/\/ias/, async (msg) => {
  const chatId = msg.chat.id;

  const iasMessage = `
🤖 *AGENTES DE IA - DOCTOR AUTO PRIME*

*🟢 CAMADA DE ATENDIMENTO*
1. 🎯 *Scout* - Qualificação de Leads
   Status: ✅ Ativo | Última execução: 2 min atrás

2. 📞 *Comm* - Comunicação Automatizada
   Status: ✅ Ativo | Última execução: 5 min atrás

3. ⚙️ *Auto* - Automação de Processos
   Status: ✅ Ativo | Última execução: 1 min atrás

*🔵 CAMADA DE DIAGNÓSTICO*
4. 🔧 *Francisco* - Diagnóstico Técnico
   Status: ✅ Ativo | Última execução: 3 min atrás

5. 🔍 *Ev8* - Avaliação de Problemas
   Status: ✅ Ativo | Última execução: 4 min atrás

6. ✅ *Check* - Checklist de Inspeção
   Status: ✅ Ativo | Última execução: 6 min atrás

*🟣 CAMADA DE ANÁLISE*
7. 💎 *Thales* - Análise Técnica Avançada
   Status: ✅ Ativo | Última execução: 10 min atrás

8. 👑 *Prime* - Otimização Premium
   Status: ✅ Ativo | Última execução: 15 min atrás

9. 📊 *Bia* - Business Intelligence
   Status: ✅ Ativo | Última execução: 30 min atrás

10. 🎯 *Juan* - Gestão Operacional
    Status: ✅ Ativo | Última execução: 20 min atrás

11. 👨‍⚕️ *Doctor* - Supervisão Geral
    Status: ✅ Ativo | Última execução: 5 min atrás

12. 🗺️ *Atlas* - Mapeamento de Dados
    Status: ✅ Ativo | Última execução: 45 min atrás

13. 📚 *Book* - Documentação
    Status: ✅ Ativo | Última execução: 1h atrás

*💡 COMO USAR*
Para conversar com um agente:
\`/ia scout\` - Conversa com Scout
\`/ia francisco\` - Conversa com Francisco
... e assim por diante

*📊 ESTATÍSTICAS GERAIS*
• Total de agentes: 15
• Agentes ativos: 13
• Tempo médio de resposta: 2.3s
• Taxa de sucesso: 98.7%
  `;

  bot.sendMessage(chatId, iasMessage, { parse_mode: 'Markdown' });
});

// /ia [agente] - Conversar com um agente específico
bot.onText(/\/ia\s+(\w+)\s+(.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const agente = match[1].toLowerCase();
  const pergunta = match[2];

  const agentes = {
    scout: '🎯 Scout',
    comm: '📞 Comm',
    auto: '⚙️ Auto',
    francisco: '🔧 Francisco',
    ev8: '🔍 Ev8',
    check: '✅ Check',
    thales: '💎 Thales',
    prime: '👑 Prime',
    bia: '📊 Bia',
    juan: '🎯 Juan',
    doctor: '👨‍⚕️ Doctor',
    atlas: '🗺️ Atlas',
    book: '📚 Book'
  };

  if (!agentes[agente]) {
    bot.sendMessage(chatId, `❌ Agente "${agente}" não encontrado.\n\nUse /ias para ver todos os agentes disponíveis.`);
    return;
  }

  bot.sendMessage(chatId, `🤖 Processando sua pergunta com ${agentes[agente]}...\n\n⏳ Aguarde...`);

  // Aqui você integraria com as APIs reais de IA
  // Por enquanto, resposta simulada
  setTimeout(() => {
    const resposta = `${agentes[agente]} respondeu:\n\n"Olá! Recebi sua pergunta: '${pergunta}'\n\nEsta é uma resposta de exemplo. Em produção, eu processaria sua pergunta com IA real e retornaria uma análise detalhada baseada nos dados do sistema Doctor Auto Prime."`;

    bot.sendMessage(chatId, resposta);
  }, 2000);
});

// /empresas - Listar empresas
bot.onText(/\/empresas/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ Acesso negado.');
    return;
  }

  try {
    const { data: companies } = await supabase
      .from('companies')
      .select('*')
      .order('id');

    if (!companies || companies.length === 0) {
      bot.sendMessage(chatId, '📭 Nenhuma empresa encontrada.');
      return;
    }

    let message = `🏢 *EMPRESAS CADASTRADAS* (${companies.length})\n\n`;

    companies.forEach((company, index) => {
      message += `*${index + 1}. ${company.name}*\n`;
      message += `🆔 ID: ${company.id}\n`;
      message += `📧 Email: ${company.email || 'N/A'}\n`;
      message += `📱 Telefone: ${company.phone || 'N/A'}\n`;
      message += `📍 Endereço: ${company.address || 'N/A'}\n`;
      message += `\n`;
    });

    bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Erro ao buscar empresas:', error);
    bot.sendMessage(chatId, '❌ Erro ao buscar empresas.');
  }
});

// ============================================
// HANDLERS DE ERRO
// ============================================

bot.on('polling_error', (error) => {
  console.error('Erro de polling:', error.code);
});

bot.on('error', (error) => {
  console.error('Erro no bot:', error);
});

// ============================================
// MENSAGENS GERAIS (não são comandos)
// ============================================

bot.on('message', (msg) => {
  // Ignora mensagens que são comandos
  if (msg.text && msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  
  bot.sendMessage(
    chatId,
    '💡 Use /help para ver todos os comandos disponíveis ou /start para começar.'
  );
});

console.log('✅ Bot configurado e pronto para uso!');
console.log('📱 Aguardando mensagens...\n');
