import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Flame, Eye, ChevronDown, Send, Tag, ArrowBigUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { Question } from '../types';
import { supabase } from '../lib/supabase';

interface Answer {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface QuestionCardProps {
  question: Question;
  onClick?: () => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(question.upvotes);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerCount, setAnswerCount] = useState(question.answer_count);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);
  const [startIndex, setStartIndex] = useState(0);
  const answersContainerRef = useRef<HTMLDivElement>(null);

  const VISIBLE_ANSWERS = 2;
  const visibleAnswers = answers.slice(startIndex, startIndex + VISIBLE_ANSWERS);
  const remainingAnswers = answers.length - (startIndex + VISIBLE_ANSWERS);
  const hasMoreAbove = startIndex > 0;
  const hasMoreBelow = startIndex + VISIBLE_ANSWERS < answers.length;

  const handleLoadMore = () => {
    const newStartIndex = Math.min(
      startIndex + 2,
      answers.length - VISIBLE_ANSWERS
    );
    setStartIndex(newStartIndex);
    
    if (answersContainerRef.current) {
      answersContainerRef.current.scrollTo({
        top: answersContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleShowLess = () => {
    const newStartIndex = Math.max(0, startIndex - 2);
    setStartIndex(newStartIndex);
    
    if (answersContainerRef.current) {
      answersContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    const scrollPosition = container.scrollTop;
    const totalHeight = container.scrollHeight;
    const visibleHeight = container.clientHeight;
    
    // Calcula a posição relativa do scroll (0 a 1)
    const scrollRatio = scrollPosition / (totalHeight - visibleHeight);
    
    // Calcula o novo índice inicial baseado no scroll, incrementando de 2 em 2
    const maxStartIndex = Math.max(0, answers.length - VISIBLE_ANSWERS);
    const newStartIndex = Math.min(
      maxStartIndex,
      Math.floor(scrollRatio * answers.length / 2) * 2 // Garante que o índice seja sempre par
    );
    
    if (newStartIndex !== startIndex) {
      setStartIndex(newStartIndex);
    }
  };

  const fetchAnswers = async () => {
    try {
      setIsLoading(true);
      console.log('Buscando respostas para a pergunta:', question.id);
      
      // Primeiro, buscar as respostas
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', question.id)
        .order('created_at', { ascending: false });

      if (answersError) {
        console.error('Erro ao buscar respostas:', answersError);
        return;
      }

      // Se temos respostas, buscar os perfis dos usuários
      if (answersData && answersData.length > 0) {
        // Buscar todos os perfis de uma vez
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', answersData.map(a => a.user_id));

        if (profilesError) {
          console.error('Erro ao buscar perfis:', profilesError);
          return;
        }

        // Combinar respostas com perfis
        const answersWithProfiles = answersData.map(answer => {
          const profile = profilesData?.find(p => p.id === answer.user_id);
          return {
            ...answer,
            profiles: {
              full_name: profile?.full_name || 'Usuário Anônimo',
              avatar_url: profile?.avatar_url || '/default-avatar.png'
            }
          };
        });

        console.log('Respostas com perfis:', answersWithProfiles);
        setAnswers(answersWithProfiles);
        setAnswerCount(answersWithProfiles.length);
      } else {
        setAnswers([]);
        setAnswerCount(0);
      }
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();

    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel(`answers_${question.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${question.id}`
        },
        async (payload) => {
          console.log('Mudança detectada:', payload);
          // Recarregar todas as respostas quando houver mudança
          await fetchAnswers();
        }
      )
      .subscribe();

    // Cleanup: desinscrever do canal quando o componente for desmontado
    return () => {
      channel.unsubscribe();
    };
  }, [question.id]);

  const handleAccordionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAccordionOpen(!isAccordionOpen);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    try {
      // Verificar se o usuário está logado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        alert('Você precisa estar logado para responder');
        return;
      }

      // Inserir resposta
      const { data: newAnswer, error: answerError } = await supabase
        .from('answers')
        .insert([{
          question_id: question.id,
          user_id: session.user.id,
          content: answer.trim(),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (answerError) {
        console.error('Erro ao criar resposta:', answerError);
        throw answerError;
      }

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        return;
      }

      // Atualizar pontos do usuário
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', session.user.id)
        .single();

      if (!userError && userData) {
        const newPoints = (userData.points || 0) + 50;
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ points: newPoints })
          .eq('id', session.user.id);

        if (pointsError) {
          console.error('Erro ao atualizar pontos:', pointsError);
        }
      }

      // Limpar o campo de resposta
      setAnswer('');
      
    } catch (error: any) {
      console.error('Erro ao enviar resposta:', error);
      alert(error?.message || 'Erro ao enviar resposta. Por favor, tente novamente.');
    }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase.rpc('toggle_question_upvote', {
        p_question_id: question.id,
      });

      if (error) throw error;

      setIsUpvoted(!isUpvoted);
      setUpvotes(prev => isUpvoted ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error toggling upvote:', error);
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-gray-800 transition-all duration-300 overflow-hidden"
    >
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-50/30 dark:from-blue-900/20 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative grid grid-cols-[auto_1fr] gap-6 p-6">
        {/* Voting and Interaction Column */}
        <div className="flex flex-col items-center gap-4">
          {/* Upvote Button with Advanced Interaction */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleUpvote}
              className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isUpvoted 
                  ? 'text-red-600 dark:text-red-400 bg-red-100/80 dark:bg-red-900/30 shadow-inner backdrop-blur-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-100/80 dark:hover:bg-red-900/30'
              }`}
            >
              <Flame 
                className={`h-5 w-5 transition-transform duration-300 ${
                  isUpvoted 
                    ? 'scale-110 animate-pulse' 
                    : 'hover:scale-110'
                }`} 
              />
            </button>
            <span className={`text-sm font-semibold mt-1.5 transition-all duration-300 ${
              isUpvoted ? 'text-red-600 dark:text-red-400 scale-110' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {upvotes}
            </span>
          </div>

          {/* Stats Icons with Tooltips */}
          <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center group/stat relative">
              <button className="group p-2.5 rounded-xl transition-all duration-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transform hover:scale-105 backdrop-blur-sm">
                <MessageCircle className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </button>
              <span className="text-xs mt-1.5 transition-all duration-300 group-hover/stat:text-blue-500">{answerCount || 0}</span>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300 whitespace-nowrap">Respostas</span>
            </div>
            <div className="flex flex-col items-center group/stat relative">
              <button className="group p-2.5 rounded-xl transition-all duration-300 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/30 transform hover:scale-105 backdrop-blur-sm">
                <Eye className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              </button>
              <span className="text-xs mt-1.5 transition-all duration-300 group-hover/stat:text-blue-500">{question.views}</span>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300 whitespace-nowrap">Visualizações</span>
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className="space-y-4">
          {/* Header with User Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={question.profiles?.avatar_url || '/default-avatar.png'}
                  alt={question.profiles?.full_name || 'Usuário'}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900/30 transition-all duration-300 group-hover:scale-105 group-hover:ring-blue-200 dark:group-hover:ring-blue-700/30"
                />
                {question.is_answered && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg animate-in fade-in duration-300">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                  {question.profiles?.full_name || 'Usuário'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(question.created_at), {
                    locale: ptBR,
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Question Content with Better Typography */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-snug">
              {question.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-300">
              {question.content}
            </p>
          </div>

          {/* Interactive Tags */}
          <div className="flex flex-wrap gap-2">
            {question.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium transition-all hover:scale-105 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 backdrop-blur-sm cursor-pointer"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Answer Section with Smooth Transitions */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleAccordionClick}
              className="flex items-center justify-between w-full px-4 py-2.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all rounded-xl hover:bg-blue-50/80 dark:hover:bg-blue-900/20 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {answerCount > 0 ? `${answerCount} Respostas` : 'Responder'}
                </span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-300 ${
                  isAccordionOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isAccordionOpen && (
              <div 
                className="mt-3 animate-in slide-in-from-top duration-300 space-y-4"
                onClick={e => e.stopPropagation()}
              >
                {isLoading ? (
                  <div className="text-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Carregando respostas...</p>
                  </div>
                ) : answers.length > 0 ? (
                  <>
                    <div 
                      ref={answersContainerRef}
                      onScroll={handleScroll}
                      className="space-y-4 max-h-[500px] overflow-y-auto scroll-smooth relative"
                    >
                      {hasMoreAbove && (
                        <div className="sticky top-0 z-10 bg-gradient-to-b from-white dark:from-gray-900 to-transparent h-8 w-full" />
                      )}
                      
                      {visibleAnswers.map((answer, index) => (
                        <div 
                          key={answer.id} 
                          className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3 transition-all duration-300 ${
                            index === visibleAnswers.length - 1 ? 'animate-pulse-once' : ''
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={answer.profiles?.avatar_url || '/default-avatar.png'}
                              alt={answer.profiles?.full_name || 'Usuário'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {answer.profiles?.full_name || 'Usuário Anônimo'}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDistanceToNow(new Date(answer.created_at), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {answer.content}
                          </p>
                        </div>
                      ))}
                      
                      {hasMoreBelow && (
                        <div className="sticky bottom-0 z-10 bg-gradient-to-t from-white dark:from-gray-900 to-transparent h-8 w-full" />
                      )}
                    </div>
                    
                    {/* Navegação */}
                    <div className="flex justify-center items-center space-x-3 mt-4">
                      {hasMoreBelow && (
                        <button
                          onClick={handleLoadMore}
                          className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-200 rounded-lg hover:bg-blue-50/80 dark:hover:bg-blue-900/20"
                        >
                          <span>Visualizar mais</span>
                        </button>
                      )}
                      
                      {/* Contador no meio */}
                      {(hasMoreAbove || hasMoreBelow) && (
                        <span className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                          {remainingAnswers}
                        </span>
                      )}
                      
                      {hasMoreAbove && (
                        <button
                          onClick={handleShowLess}
                          className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-200 rounded-lg hover:bg-blue-50/80 dark:hover:bg-blue-900/20"
                        >
                          <span>Visualizar menos</span>
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                    Nenhuma resposta ainda. Seja o primeiro a responder!
                  </div>
                )}

                {/* Formulário de Resposta */}
                <form onSubmit={handleAnswerSubmit} className="mt-4 space-y-4">
                  <div className="relative group">
                    <textarea
                      value={answer}
                      onChange={e => setAnswer(e.target.value)}
                      placeholder="Digite sua resposta..."
                      rows={3}
                      className="w-full bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none transition-all duration-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 group-hover:border-blue-200 dark:group-hover:border-blue-700/50"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 text-gray-400">
                      <span className="text-xs">{answer.length}/1000</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={!answer.trim()}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                      <Send className="h-4 w-4" />
                      Enviar resposta
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}