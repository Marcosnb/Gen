import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Flame, TrendingUp, Plus, MessageCircle, Search, ArrowRight, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QuestionCard } from '../components/QuestionCard';
import type { Question } from '../types';
import { supabase } from '../lib/supabase';

export function Home() {
  const [selectedFilter, setSelectedFilter] = useState('recent');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();

    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel('public:questions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions'
        },
        async (payload) => {
          console.log('Mudança detectada em questions:', payload);
          
          if (payload.eventType === 'DELETE') {
            // Remover a pergunta do estado local
            setQuestions(prevQuestions => 
              prevQuestions.filter(q => q.id !== payload.old.id)
            );
          } else {
            // Para INSERT e UPDATE, recarregar todas as perguntas
            await fetchQuestions();
          }
        }
      )
      .subscribe();

    // Cleanup: desinscrever dos canais quando o componente for desmontado
    return () => {
      channel.unsubscribe();
    };
  }, [selectedFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Primeiro, buscar as perguntas com contadores
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select(`
          *,
          likes_count:question_likes(count),
          answers_count:answers(count)
        `);

      if (questionsError) {
        console.error('Erro Supabase:', questionsError);
        throw questionsError;
      }

      console.log('Dados recebidos - Perguntas:', questionsData);

      // Se tiver dados, buscar os perfis dos usuários
      if (questionsData && questionsData.length > 0) {
        // Filtrar user_ids não nulos
        const userIds = [...new Set(questionsData
          .map(q => q.user_id)
          .filter(id => id != null))];

        console.log('IDs de usuários encontrados:', userIds);

        // Buscar perfis apenas se houver IDs de usuários
        let profilesMap = {};
        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

          if (profilesError) {
            console.error('Erro ao buscar perfis:', profilesError);
          } else {
            console.log('Dados recebidos - Perfis:', profilesData);
            
            // Mapear os perfis por ID para fácil acesso
            profilesMap = (profilesData || []).reduce((acc, profile) => {
              acc[profile.id] = profile;
              return acc;
            }, {});
          }
        }

        // Combinar os dados
        let filteredQuestions = questionsData.map(question => {
          const profile = question.user_id ? profilesMap[question.user_id] : null;
          
          return {
            id: question.id,
            title: question.title,
            content: question.content,
            user_id: question.user_id,
            created_at: question.created_at,
            tags: Array.isArray(question.tags) ? question.tags : [],
            views: question.views || 0,
            upvotes: question.likes_count?.[0]?.count || 0,
            is_answered: question.is_answered || false,
            answer_count: question.answers_count?.[0]?.count || 0,
            profiles: profile || {
              id: question.user_id,
              full_name: 'Usuário Anônimo',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
            }
          };
        });

        console.log('Perguntas processadas:', filteredQuestions);

        // Aplicar os filtros
        switch (selectedFilter) {
          case 'recent':
            filteredQuestions.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            break;
          case 'top':
            filteredQuestions.sort((a, b) => b.upvotes - a.upvotes);
            break;
          case 'trending':
            filteredQuestions.sort((a, b) => b.answer_count - a.answer_count);
            break;
        }

        setQuestions(filteredQuestions);
      } else {
        setQuestions([]);
      }
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError('Erro ao carregar perguntas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar uma resposta
  const handleDeleteResponse = async (responseId: number) => {
    try {
      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', responseId)
        .eq('user_id', session?.user?.id); // Garante que apenas o próprio usuário pode deletar

      if (error) {
        console.error('Erro ao deletar resposta:', error);
        return;
      }

      // Atualiza a lista de respostas localmente
      setResponses(prevResponses => 
        prevResponses.filter(response => response.id !== responseId)
      );
    } catch (error) {
      console.error('Erro ao deletar resposta:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header com Visual Hierarchy e Micro-interações */}
        <div className="relative max-w-5xl mx-auto">
          {/* Decorative Background com Gradiente Suave */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/3 to-transparent dark:from-primary/10 rounded-3xl" />
          
          <div className="relative rounded-3xl border border-border/50 backdrop-blur-sm p-8 mb-8 group hover:border-primary/20 transition-all duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground group-hover:text-primary/90 transition-colors duration-300">
                  Últimas Perguntas
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Explore perguntas da comunidade ou compartilhe suas dúvidas para ganhar moedas e ajuda de outras pessoas
                </p>
              </div>

              {/* Filtros com Visual Feedback Aprimorado */}
              <div className="flex flex-nowrap items-center gap-2 bg-background/50 backdrop-blur-sm p-2 rounded-lg border border-border/50 shadow-sm">
                <button
                  onClick={() => setSelectedFilter('recent')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap min-w-[120px] justify-center transition-all duration-300 ${
                    selectedFilter === 'recent'
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02] ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Clock className={`h-4 w-4 transition-transform duration-300 ${
                    selectedFilter === 'recent' ? 'scale-110' : ''
                  }`} />
                  <span>Recentes</span>
                </button>
                <button
                  onClick={() => setSelectedFilter('top')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap min-w-[120px] justify-center transition-all duration-300 ${
                    selectedFilter === 'top'
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02] ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Flame className={`h-4 w-4 transition-transform duration-300 ${
                    selectedFilter === 'top' ? 'scale-110' : ''
                  }`} />
                  <span>Mais quentes</span>
                </button>
                <button
                  onClick={() => setSelectedFilter('trending')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap min-w-[120px] justify-center transition-all duration-300 ${
                    selectedFilter === 'trending'
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02] ring-1 ring-primary/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <TrendingUp className={`h-4 w-4 transition-transform duration-300 ${
                    selectedFilter === 'trending' ? 'scale-110' : ''
                  }`} />
                  <span>Em alta</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Cards com Loading States Aprimorados */}
        {loading ? (
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border/50 animate-pulse"
                >
                  <div className="flex p-6 gap-6">
                    {/* Coluna de Interações */}
                    <div className="flex flex-col items-center gap-4 w-[60px]">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                      <div className="w-8 h-8 bg-muted rounded-lg" />
                    </div>
                    
                    {/* Coluna de Conteúdo */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-24" />
                          <div className="h-3 bg-muted rounded w-32" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-6 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-16" />
                        <div className="h-6 bg-muted rounded w-20" />
                        <div className="h-6 bg-muted rounded w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="max-w-5xl mx-auto">
            <div className="bg-destructive/10 text-destructive rounded-xl p-8 text-center border border-destructive/20">
              <p className="text-lg font-medium">{error}</p>
              <button
                onClick={fetchQuestions}
                className="mt-4 px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg text-sm font-medium transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="max-w-5xl mx-auto">
            <div className="bg-card rounded-xl p-8 text-center border border-border">
              <p className="text-lg text-muted-foreground">
                Nenhuma pergunta encontrada.
              </p>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid gap-6">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onClick={() => {/* TODO: Navigate to question details */}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
