import React, { useState, useEffect } from 'react';
import { TagInput } from '../components/TagInput';
import { ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

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
        tags: tags.map(tag => tag.label),
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

      setSuccess('Pergunta publicada com sucesso!');
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao publicar pergunta');
      console.error('Erro ao publicar pergunta:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header da página */}
      <div className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <div>
              <h1 className="text-xl font-semibold">Fazer uma Pergunta</h1>
              <p className="text-sm text-muted-foreground">
                Compartilhe seus conhecimentos com a comunidade
              </p>
            </div>
          </div>
        </div>
      </div>

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
              <label htmlFor="title" className="block text-sm font-medium">
                Título da Pergunta
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full"
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
              <label htmlFor="content" className="block text-sm font-medium">
                Detalhes da Pergunta
              </label>
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
              />
              <p className="text-sm text-muted-foreground">
                Adicione até 5 tags para ajudar outras pessoas a encontrar sua pergunta
              </p>
            </div>
          </div>

          {/* Card das Opções */}
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Opções de Publicação</h3>
              
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
                <div>
                  <label htmlFor="anonymous" className="text-sm font-medium">
                    Postar anonimamente
                  </label>
                  <p className="text-sm text-muted-foreground">
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
              className="btn-secondary"
              tabIndex={isLoading ? -1 : undefined}
              aria-disabled={isLoading}
            >
              Cancelar
            </Link>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Publicar Pergunta
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
