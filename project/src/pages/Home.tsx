import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock, Flame, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { QuestionCard } from '../components/QuestionCard';
import type { Question } from '../types';
import { supabase } from '../lib/supabase';

// Dados de exemplo para desenvolvimento
const mockQuestions: Question[] = [
  {
    id: '1',
    title: 'Como implementar autenticação com Next.js e Supabase?',
    content: 'Estou desenvolvendo uma aplicação com Next.js e gostaria de implementar autenticação usando Supabase. Quais são as melhores práticas?',
    user_id: '1',
    created_at: new Date().toISOString(),
    tags: ['next.js', 'supabase', 'auth'],
    views: 120,
    upvotes: 15,
    is_answered: true,
    answer_count: 3,
    profiles: {
      id: '1',
      full_name: 'João Silva',
      avatar_url: 'https://github.com/shadcn.png'
    }
  },
  {
    id: '2',
    title: 'Dúvida sobre gerenciamento de estado com React Query',
    content: 'Qual a melhor forma de gerenciar cache e estado de servidor usando React Query? Tenho uma aplicação com muitas chamadas API.',
    user_id: '2',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    tags: ['react', 'react-query', 'cache'],
    views: 85,
    upvotes: 8,
    is_answered: false,
    answer_count: 1,
    profiles: {
      id: '2',
      full_name: 'Maria Santos',
      avatar_url: 'https://github.com/shadcn.png'
    }
  },
  {
    id: '3',
    title: 'Melhor prática para deploy de aplicação React',
    content: 'Quais são as melhores práticas e plataformas para fazer deploy de uma aplicação React em produção?',
    user_id: '3',
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    tags: ['react', 'deploy', 'devops'],
    views: 200,
    upvotes: 25,
    is_answered: true,
    answer_count: 5,
    profiles: {
      id: '3',
      full_name: 'Pedro Costa',
      avatar_url: 'https://github.com/shadcn.png'
    }
  }
];

export function Home() {
  const [selectedFilter, setSelectedFilter] = useState('recent');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [selectedFilter]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usando dados mockados para desenvolvimento
      let filteredQuestions = [...mockQuestions];

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
          filteredQuestions.sort((a, b) => b.views - a.views);
          break;
      }

      setQuestions(filteredQuestions);
    } catch (err) {
      console.error('Erro ao carregar perguntas:', err);
      setError('Erro ao carregar perguntas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header com Visual Hierarchy */}
        <div className="relative max-w-5xl mx-auto">
          {/* Decorative Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 rounded-3xl" />
          
          <div className="relative rounded-3xl border border-border/50 backdrop-blur-sm p-8 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">
                  Últimas Perguntas
                </h1>
                <p className="text-lg text-muted-foreground">
                  Explore perguntas da comunidade ou faça a sua própria pergunta
                </p>
              </div>

              {/* Filtros com Visual Feedback */}
              <div className="flex items-center gap-1 bg-background/50 backdrop-blur-sm p-1 rounded-xl border border-border/50">
                <button
                  onClick={() => setSelectedFilter('recent')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === 'recent'
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Recentes</span>
                </button>
                <button
                  onClick={() => setSelectedFilter('top')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === 'top'
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Flame className="h-4 w-4" />
                  <span>Mais quentes</span>
                </button>
                <button
                  onClick={() => setSelectedFilter('trending')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedFilter === 'trending'
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Em alta</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Cards com Loading States */}
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card rounded-xl border border-border animate-pulse"
              >
                <div className="flex p-6 gap-6">
                  <div className="w-[160px] h-[140px] bg-muted rounded-lg" />
                  <div className="flex-1 space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-8 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="flex gap-3">
                      <div className="h-4 bg-muted rounded w-20" />
                      <div className="h-4 bg-muted rounded w-20" />
                      <div className="h-4 bg-muted rounded w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive rounded-xl p-8 text-center border border-destructive/20">
            <p className="text-lg font-medium">{error}</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center border border-border">
            <p className="text-lg text-muted-foreground">
              Nenhuma pergunta encontrada.
            </p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto grid gap-6">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onClick={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
