import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiClient {
  constructor(apiKey, modelName = 'gemini-2.0-flash-exp') {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: modelName });
    this.chat = null;
  }

  async startChat(systemPrompt = '') {
    this.chat = this.model.startChat({
      history: systemPrompt ? [{
        role: 'user',
        parts: [{ text: systemPrompt }]
      }, {
        role: 'model',
        parts: [{ text: 'Entendido! Como posso ajudar?' }]
      }] : [],
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });
    return this.chat;
  }

  async sendMessage(message) {
    if (!this.chat) {
      await this.startChat();
    }
    
    const result = await this.chat.sendMessage(message);
    return result.response.text();
  }

  async sendMessageWithContext(message, context = '') {
    const fullMessage = context 
      ? `Contexto: ${context}\n\nPergunta: ${message}`
      : message;
    
    return await this.sendMessage(fullMessage);
  }
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('pt-BR');
}
