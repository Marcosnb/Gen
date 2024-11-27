import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

interface GenerateResponse {
  text: string;
  error?: string;
}

export async function generateWithGemini(prompt: string): Promise<GenerateResponse> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return { text };
  } catch (error) {
    console.error('Erro ao gerar com Gemini:', error);
    return {
      text: '',
      error: 'Não foi possível gerar o conteúdo. Tente novamente.'
    };
  }
}

export const GEMINI_PROMPTS = {
  title: (currentTitle: string) => `Você é um assistente especializado em melhorar títulos de perguntas técnicas.

Melhore o seguinte título: "${currentTitle}"

Regras para o novo título:
1. Mantenha o mesmo tema e contexto do título original
2. Torne o título mais claro e específico
3. Use entre 60-100 caracteres
4. Mantenha em português
5. Não use emojis ou caracteres especiais
6. Seja mais direto e objetivo
7. O título DEVE terminar com um ponto de interrogação (?)

Retorne APENAS o título melhorado, sem explicações adicionais.`,

  content: (currentContent: string) => `Você é um assistente especializado em melhorar a descrição de perguntas técnicas.

Melhore o seguinte conteúdo da pergunta: "${currentContent}"

Regras para o novo conteúdo:
1. Mantenha o mesmo tema e contexto do conteúdo original
2. Torne a descrição mais clara e específica
3. Organize o texto em parágrafos lógicos
4. Mantenha em português
5. Adicione mais detalhes técnicos relevantes
6. Seja direto e objetivo
7. Use formatação markdown quando apropriado (ex: código, listas)
8. Mantenha um tom profissional e técnico

Retorne APENAS o conteúdo melhorado, sem explicações adicionais.`,
};