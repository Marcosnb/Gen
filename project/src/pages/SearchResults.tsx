import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { QuestionCard } from '../components/QuestionCard';
import type { Question } from '../types';

interface SearchResult extends Question {}

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'title' | 'tags'>('all');

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      
      setLoading(true);
      try {
        // Construir a query baseada no filtro ativo
        let queryFilter = '';
        switch (activeFilter) {
          case 'title':
            queryFilter = `title.ilike.%${query}%`;
            break;
          case 'tags':
            queryFilter = `tags.cs.{${query.toLowerCase()}}`;
            break;
          default: // 'all'
            queryFilter = `title.ilike.%${query}%,tags.cs.{${query.toLowerCase()}}`;
        }

        // Busca as questões
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select(`
            *,
            likes_count:question_likes(count),
            answers_count:answers(count)
          `)
          .or(queryFilter)
          .order('created_at', { ascending: false })
          .limit(20);

        if (questionsError) throw questionsError;

        if (questionsData && questionsData.length > 0) {
          // Pega os IDs dos usuários únicos
          const userIds = [...new Set(questionsData
            .map(q => q.user_id)
            .filter(id => id != null))];

          // Busca os perfis dos usuários
          const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

          if (profilesError) throw profilesError;

          // Cria um mapa de perfis por ID
          const profilesMap = (profilesData || []).reduce((acc, profile) => {
            acc[profile.id] = profile;
            return acc;
          }, {});

          // Combina os dados
          const processedResults = questionsData.map(question => ({
            id: question.id,
            title: question.title,
            content: question.content,
            user_id: question.user_id,
            created_at: question.created_at,
            tags: Array.isArray(question.tags) ? question.tags : [],
            views: question.views || 0,
            likes_count: question.likes_count?.[0]?.count || 0,
            answers_count: question.answers_count?.[0]?.count || 0,
            profiles: profilesMap[question.user_id] || {
              id: question.user_id,
              full_name: 'Usuário Anônimo',
              avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
            }
          }));

          setResults(processedResults);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Erro na busca:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, activeFilter]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 mt-20">
      {/* Navegação */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para a página inicial
      </Link>

      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border/40">
        <div className="bg-primary/10 p-3 rounded-xl">
          <SearchIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            Resultados da busca
          </h1>
          <p className="text-muted-foreground">
            {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''} para <span className="text-primary font-medium">"{query}"</span>
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === 'all' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setActiveFilter('title')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === 'title'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          Títulos
        </button>
        <button
          onClick={() => setActiveFilter('tags')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeFilter === 'tags'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          }`}
        >
          Tags
        </button>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Buscando resultados...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-4">
          {results.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
            <SearchIcon className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium">Nenhum resultado encontrado</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Não encontramos nenhum resultado para sua busca. Tente usar palavras-chave diferentes ou verificar a ortografia.
          </p>
          <Link 
            to="/"
            className="inline-flex items-center justify-center px-4 py-2 mt-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar para a página inicial
          </Link>
        </div>
      )}
    </div>
  );
}
