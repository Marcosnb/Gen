import React, { useState, useEffect } from 'react';
import { TagInput } from '../components/TagInput';
import { ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AiGenerateButton } from '../components/AiGenerateButton';

interface Tag {
  id: string;
  label: string;
}

export function AskQuestion() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login', { replace: true });
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setIsAnonymous(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      // Validações básicas
      if (!title.trim()) {
        throw new Error('O título é obrigatório');
      }
      if (!content.trim()) {
        throw new Error('O conteúdo é obrigatório');
      }

      // Pegar o usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('Você precisa estar logado para fazer uma pergunta');
      }

      // Preparar os dados da pergunta
      const questionData = {
        user_id: isAnonymous ? null : session.user.id,
        title: title.trim(),
        content: content.trim(),
        is_anonymous: isAnonymous,
        tags: tags.map(tag => tag.id),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        views: 0,
        upvotes: 0,
        points_spent: 0
      };

      // Inserir a pergunta no banco
      const { error: insertError } = await supabase
        .from('questions')
        .insert([questionData]);

      if (insertError) throw insertError;

      // Atualizar os pontos do usuário se não for anônimo
      if (!isAnonymous) {
        // Primeiro, buscar os pontos atuais
        const { data: currentPoints } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', session.user.id)
          .single();

        // Calcular novos pontos
        const newPoints = (currentPoints?.points || 0) + 7;

        // Atualizar os pontos
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ points: newPoints })
          .eq('id', session.user.id);

        if (pointsError) {
          console.error('Erro ao atualizar pontos:', pointsError);
        }
      }

      setSuccess(isAnonymous ? 'Pergunta publicada com sucesso!' : 'Pergunta publicada com sucesso! Você ganhou 7 pontos!');
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao publicar pergunta');
      console.error('Erro ao publicar pergunta:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20">
      {/* Mensagens de feedback */}
      {(error || success) && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-100 text-green-800 rounded-lg">
              {success}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card do Título */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="title" className="block text-sm font-medium">
                  Título da Pergunta
                </label>
                <AiGenerateButton
                  type="title"
                  onGenerate={setTitle}
                  disabled={isLoading || !title.trim()}
                  currentTitle={title}
                />
              </div>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full h-14"
                placeholder="Ex: Como implementar autenticação JWT em Node.js?"
                required
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Seja específico e imagine que está fazendo uma pergunta para outra pessoa
              </p>
            </div>
          </div>

          {/* Card do Conteúdo */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="content" className="block text-sm font-medium">
                  Detalhes da Pergunta
                </label>
                <AiGenerateButton
                  type="content"
                  onGenerate={setContent}
                  disabled={isLoading || !content.trim()}
                  currentTitle={content}
                />
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="input w-full resize-y"
                placeholder="Descreva todos os detalhes que possam ajudar alguém a responder sua pergunta..."
                required
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                Inclua todo o contexto necessário, código relevante e o que você já tentou fazer
              </p>
            </div>
          </div>

          {/* Card das Tags */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="space-y-2">
              <label htmlFor="tags" className="block text-sm font-medium">
                Tags
              </label>
              <TagInput
                selectedTags={tags}
                onChange={setTags}
                maxTags={5}
                disabled={isLoading}
                className="min-h-[56px]"
              />
              <p className="text-sm text-muted-foreground">
                Adicione até 5 tags para ajudar outras pessoas a encontrar sua pergunta
              </p>
            </div>
          </div>

          {/* Card das Opções */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Opções de Publicação</h3>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex items-center h-6">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                    disabled={isLoading}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <label htmlFor="anonymous" className="text-sm font-medium">
                      Postar anonimamente
                    </label>
                    {isAnonymous && (
                      <span className="
                        inline-flex items-center gap-1.5 
                        px-2.5 py-1 
                        text-xs font-medium 
                        rounded-full
                        bg-gradient-to-r from-amber-500/10 to-orange-500/10
                        text-amber-700
                        border border-amber-200/60
                        shadow-sm
                        animate-fadeIn
                        transition-all duration-200
                        hover:shadow-md hover:border-amber-300/80
                      ">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor" 
                          className="w-3.5 h-3.5 text-amber-500"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" 
                            clipRule="evenodd" 
                          />
                        </svg>
                        <span className="relative top-px">
                          Não será possível editar ou apagar depois
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Sua pergunta será publicada sem mostrar seu nome ou informações de perfil
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              to="/"
              className={`
                group relative inline-flex items-center gap-2.5 px-4 py-2.5
                text-sm font-medium rounded-lg
                transition-all duration-300
                border select-none backdrop-blur-sm
                ${isLoading
                  ? 'bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-700/50 cursor-not-allowed'
                  : 'bg-white/80 hover:bg-zinc-50/80 active:bg-zinc-100/80 dark:bg-white/5 dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20 shadow-sm hover:shadow-md dark:shadow-[0_0_1rem_rgba(255,255,255,0.02)] dark:hover:shadow-[0_0_1rem_rgba(255,255,255,0.05)]'
                }
              `}
              tabIndex={isLoading ? -1 : undefined}
              aria-disabled={isLoading}
            >
              {/* Gradient overlay */}
              <div className={`
                absolute inset-0 rounded-lg
                ${isLoading
                  ? 'bg-gradient-to-br from-zinc-400/5 via-transparent to-zinc-400/5 dark:from-zinc-600/20 dark:via-transparent dark:to-zinc-600/20'
                  : 'bg-gradient-to-br from-zinc-500/5 via-transparent to-zinc-500/5 dark:from-zinc-400/10 dark:to-zinc-400/10'
                }
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                pointer-events-none
              `} />

              {/* Button content */}
              <div className="relative flex items-center gap-2.5">
                <ArrowLeft className={`
                  h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5
                  ${isLoading ? 'text-zinc-400 dark:text-zinc-500' : 'text-zinc-600 dark:text-zinc-400'}
                `} />
                <span>Cancelar</span>
              </div>
            </Link>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`
                group relative inline-flex items-center gap-2.5 px-4 py-2.5
                text-sm font-medium rounded-lg
                transition-all duration-300
                border select-none backdrop-blur-sm
                ${isLoading
                  ? 'bg-blue-100/80 dark:bg-blue-900/30 text-blue-300 dark:text-blue-500 border-blue-200/50 dark:border-blue-800/50 cursor-not-allowed'
                  : 'bg-blue-50/80 hover:bg-blue-100/80 active:bg-blue-200/80 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-400/20 hover:border-blue-300 dark:hover:border-blue-400/30 shadow-sm hover:shadow-md dark:shadow-[0_0_1rem_rgba(59,130,246,0.03)] dark:hover:shadow-[0_0_1rem_rgba(59,130,246,0.06)]'
                }
              `}
            >
              {/* Gradient overlay */}
              <div className={`
                absolute inset-0 rounded-lg
                ${isLoading
                  ? 'bg-gradient-to-br from-blue-400/5 via-transparent to-blue-400/5 dark:from-blue-600/20 dark:via-transparent dark:to-blue-600/20'
                  : 'bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-400/10 dark:to-purple-400/10'
                }
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                pointer-events-none
              `} />

              {/* Button content */}
              <div className="relative flex items-center gap-2.5">
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-blue-200/30 dark:border-blue-700/30
                      border-t-blue-300 dark:border-t-blue-500 rounded-full animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 text-blue-600 dark:text-blue-300
                      transition-transform duration-300 group-hover:translate-x-0.5" />
                    <span>Publicar Pergunta</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
