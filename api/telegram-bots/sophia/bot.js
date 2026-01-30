import TelegramBot from 'node-telegram-bot-api';
import { GeminiClient } from '../shared/utils.js';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// CONFIGURAÇÃO - SOPHIA (ASSISTENTE PESSOAL)
// ============================================

const bot = new TelegramBot(process.env.SOPHIA_TOKEN, { polling: true });
const gemini = new GeminiClient(process.env.SOPHIA_GEMINI_KEY, 'gemini-2.0-flash-exp');

const SYSTEM_PROMPT = `Você é SOPHIA, assistente pessoal inteligente.

SUAS RESPONSABILIDADES:
- Ajudar com tarefas pessoais
- Organizar agenda e lembretes
- Dar conselhos e sugestões
- Conversar de forma amigável
- Ser proativa e prestativa

PERSONALIDADE:
- Amigável e carinhosa
- Profissional quando necessário
- Empática e compreensiva
- Senso de humor sutil
- Sempre positiva

HABILIDADES:
- Gestão de tempo
- Produtividade
- Organização pessoal
- Suporte emocional
- Informações gerais

COMUNICAÇÃO:
- Use emojis apropriados
- Seja conversacional
- Mostre interesse genuíno
- Sempre em português brasileiro`;

console.log('🔵 SOPHIA iniciada!');
console.log('👤 Assistente Pessoal');
console.log('🤖 IA: Gemini 2.0 Flash Exp\n');

// ============================================
// INICIALIZAR CHAT
// ============================================

await gemini.startChat(SYSTEM_PROMPT);

// ============================================
// COMANDOS
// ============================================

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name;
  
  const welcome = `🔵 *SOPHIA - Sua Assistente Pessoal*

Olá ${firstName}! 👋

Sou a SOPHIA, sua assistente pessoal com IA! 

💁‍♀️ *O QUE EU FAÇO:*
• Ajudo com tarefas do dia a dia
• Organizo sua agenda
• Dou conselhos e sugestões
• Converso sobre qualquer assunto
• Estou sempre aqui pra você!

💬 *COMO USAR:*
Pode me perguntar qualquer coisa! Sou sua amiga virtual.

Exemplos:
"Me ajuda a organizar meu dia?"
"Preciso de uma ideia para jantar"
"Me dá uma motivação!"
"Conta uma curiosidade interessante"

✨ Estou aqui para tornar seu dia melhor!
  `;
  
  bot.sendMessage(chatId, welcome, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const help = `💡 *COMO EU POSSO AJUDAR*

🗓️ *ORGANIZAÇÃO*
• Planejamento do dia
• Lembretes importantes
• Gestão de tempo
• Produtividade

💭 *CONVERSAÇÃO*
• Conselhos pessoais
• Suporte emocional
• Ideias criativas
• Curiosidades

🎯 *TAREFAS*
• Listas de afazeres
• Priorização
• Motivação
• Dicas práticas

❤️ *BEM-ESTAR*
• Mindfulness
• Exercícios rápidos
• Pausas produtivas
• Equilíbrio

Só me perguntar! Estou aqui pra você! 😊
  `;
  
  bot.sendMessage(chatId, help, { parse_mode: 'Markdown' });
});

bot.onText(/\/motivacao/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, '✨ Deixa eu pensar em algo especial...');
    
    const motivation = await gemini.sendMessage(
      'Me dê uma mensagem motivacional poderosa e personalizada. Seja inspiradora mas genuína.'
    );
    
    bot.sendMessage(chatId, `💪 ${motivation}`);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Erro: ${error.message}`);
  }
});

bot.onText(/\/dica/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    bot.sendMessage(chatId, '💡 Procurando uma dica útil...');
    
    const tip = await gemini.sendMessage(
      'Me dê uma dica prática e útil para melhorar o dia de alguém. Pode ser sobre produtividade, bem-estar ou vida pessoal.'
    );
    
    bot.sendMessage(chatId, `✨ ${tip}`);
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
    // Mostrar "digitando..."
    bot.sendChatAction(chatId, 'typing');
    
    const response = await gemini.sendMessage(text);
    bot.sendMessage(chatId, response);
  } catch (error) {
    bot.sendMessage(chatId, `❌ Desculpe, tive um problema: ${error.message}`);
  }
});

bot.on('polling_error', (error) => console.error('Erro:', error.code));

console.log('✅ SOPHIA pronta e aguardando mensagens!\n');
