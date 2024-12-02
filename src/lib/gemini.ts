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
  title: (currentTitle: string) => `Você é um assistente especializado em melhorar títulos de perguntas.

Melhore o seguinte título: "${currentTitle}"

Regras:
1. Use no máximo 80 caracteres
2. Termine com ponto de interrogação (?)
3. Seja direto e objetivo
4. Mantenha o mesmo tema e contexto
5. Mantenha em português
6. Evite palavras desnecessárias
7. Comece com "Como", "Qual", "Por que", etc.

Retorne APENAS o título melhorado, sem explicações adicionais.`,

  content: (currentContent: string) => `Você é um assistente especializado em melhorar descrições de perguntas.

Melhore o seguinte conteúdo: "${currentContent}"

Regras:
1. Use aproximadamente 120 caracteres (é importante usar a maior parte deste limite)
2. Termine a pergunta com ponto de interrogação (?)
3. Remova quaisquer comentários entre asteriscos (** **)
4. Mantenha o mesmo tema e contexto
5. Seja detalhado mas objetivo
6. Mantenha em português
7. Inclua informações relevantes como:
 - Contexto do problema
 - Detalhes específicos
 - O que já foi tentado (se mencionado)
 - Resultado esperado

Retorne APENAS o conteúdo melhorado, sem explicações adicionais.`
};