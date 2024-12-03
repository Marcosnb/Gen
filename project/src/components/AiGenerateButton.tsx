import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { generateWithGemini, GEMINI_PROMPTS } from '../lib/gemini';

interface AiGenerateButtonProps {
  onGenerate: (text: string) => void;
  type: 'title' | 'content';
  disabled?: boolean;
  currentTitle?: string;
}

export function AiGenerateButton({ onGenerate, type, disabled, currentTitle }: AiGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateWithAI = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Define o prompt baseado no tipo
      const prompt = type === 'title' 
        ? GEMINI_PROMPTS.title(currentTitle || '')
        : GEMINI_PROMPTS.content(currentTitle || '');

      // Chama a API do Gemini
      const { text, error } = await generateWithGemini(prompt);
      
      if (error) {
        setError(error);
        return;
      }

      // Garante que o texto gerado não ultrapasse o limite de caracteres
      const maxLength = type === 'title' ? 80 : 120;
      const truncatedText = text.slice(0, maxLength);

      onGenerate(truncatedText);
    } catch (error) {
      console.error('Erro ao gerar com IA:', error);
      setError('Ocorreu um erro ao gerar o conteúdo');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={generateWithAI}
        disabled={disabled || isGenerating || !currentTitle?.trim()}
        className={`
          group
          relative inline-flex items-center gap-2.5 px-4 py-2.5
          text-sm font-medium rounded-lg
          transition-all duration-300
          border ml-3 select-none
          backdrop-blur-sm
          ${
            disabled || isGenerating || !currentTitle?.trim()
              ? 'bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700/50 cursor-not-allowed backdrop-blur-sm'
              : 'bg-white/80 hover:bg-blue-50/80 active:bg-blue-100/80 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-white/20 shadow-sm hover:shadow-md dark:shadow-[0_0_1rem_rgba(255,255,255,0.02)] dark:hover:shadow-[0_0_1rem_rgba(255,255,255,0.05)]'
          }
        `}
      >
        {/* Gradient overlay */}
        <div className={`
          absolute inset-0 rounded-lg
          ${disabled || isGenerating || !currentTitle?.trim()
            ? 'bg-gradient-to-br from-zinc-400/5 via-transparent to-zinc-400/5 dark:from-zinc-600/20 dark:via-transparent dark:to-zinc-600/20'
            : 'bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10'
          }
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          pointer-events-none
        `} />

        {/* Button content */}
        <div className="relative flex items-center gap-2.5">
          <Sparkles className={`
            h-4 w-4 flex-shrink-0 transition-transform duration-300
            ${isGenerating ? 'animate-pulse' : 'group-hover:rotate-12'}
            ${disabled || isGenerating || !currentTitle?.trim()
              ? 'text-zinc-400 dark:text-zinc-500'
              : 'text-blue-600 dark:text-blue-400'
            }
          `} />
          <span className={`${isGenerating ? 'animate-pulse' : ''} whitespace-nowrap`}>
            {isGenerating ? 'Gerando...' : type === 'title' ? 'Melhorar título com IA' : 'Melhorar detalhes com IA'}
          </span>
        </div>
      </button>

      {/* Mensagem de erro */}
      {error && (
        <div className="absolute top-full mt-2 right-0 z-50 w-64 p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-lg shadow-sm">
          <p className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
