import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  HelpCircle, 
  MessageCircle, 
  ThumbsUp, 
  User as UserIcon, 
  Settings, 
  Coins,
  BarChart2,
  FileQuestion,
  ChevronRight
} from 'lucide-react';

interface UserStats {
  questions_count: number;
  answers_count: number;
  likes_given_count: number;
  likes_received_count: number;
}

interface Question {
  id: string;
  title: string;
  created_at: string;
  answers_count: number;
}

type TabType = 'questions' | 'stats' | 'coins';

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('questions');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    // Verificar se o usuário está logado
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/');
        return;
      }

      setUser(session.user);

      // Buscar estatísticas do usuário
      const { data: answersCount, error: answersError } = await supabase
        .from('answers')
        .select('id', { count: 'exact' })
        .eq('user_id', session.user.id);

      const { data: questionsCount, error: questionsError } = await supabase
        .from('questions')
        .select('id', { count: 'exact' })
        .eq('user_id', session.user.id);

      // Buscar curtidas dadas pelo usuário
      const { count: likesGiven } = await supabase
        .from('question_likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', session.user.id);

      // Buscar curtidas recebidas nas perguntas do usuário
      const { count: likesReceived } = await supabase
        .from('question_likes')
        .select('*', { count: 'exact', head: true })
        .in('question_id', questionsCount?.map(q => q.id) || []);

      if (!answersError && !questionsError) {
        setStats({
          questions_count: questionsCount?.length || 0,
          answers_count: answersCount?.length || 0,
          likes_given_count: likesGiven || 0,
          likes_received_count: likesReceived || 0
        });
      }

      // Buscar pontos do usuário
      const { data: userPoints, error: pointsError } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', session.user.id)
        .single();

      if (!pointsError && userPoints) {
        setPoints(userPoints.points || 0);
      }

      fetchFollowCounts();
      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (user && activeTab === 'questions') {
      fetchUserQuestions();
    }
  }, [user, activeTab]);

  const fetchUserQuestions = async () => {
    if (!user) return;
    
    setLoadingQuestions(true);
    try {
      // Buscar perguntas do usuário com contagem de respostas
      const { data, error } = await supabase
        .from('questions')
        .select(`
          id,
          title,
          created_at,
          answers:answers(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const questionsWithCounts = data.map(q => ({
        id: q.id,
        title: q.title,
        created_at: q.created_at,
        answers_count: q.answers?.[0]?.count || 0
      }));

      setQuestions(questionsWithCounts);
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchFollowCounts = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      // Get followers count
      const { count: followers } = await supabase
        .from('followers')
        .select('*', { count: 'exact' })
        .eq('following_id', session.user.id);

      // Get following count
      const { count: following } = await supabase
        .from('followers')
        .select('*', { count: 'exact' })
        .eq('follower_id', session.user.id);

      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Erro ao buscar contagem de seguidores:', error);
    }
  };

  const handleDeleteQuestion = async (questionId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Evita que o clique propague para o card
    
    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)
        .eq('user_id', user?.id); // Garante que apenas o próprio usuário pode deletar

      if (error) throw error;

      // Atualiza a lista de perguntas localmente
      setQuestions(prevQuestions => 
        prevQuestions.filter(q => q.id !== questionId)
      );
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 sm:pt-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6">
        {/* Card de Informações do Usuário */}
        <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-4 sm:gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-border">
                <UserIcon className="w-12 h-12 text-primary/60" />
              </div>
              
              {/* Informações do Usuário */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col items-center sm:items-start gap-2">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {user?.email}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Membro desde {new Date(user?.created_at || '').toLocaleDateString()}
                    </p>
                  </div>

                  {/* Botão de Configurações */}
                  <Link 
                    to="/configuracoes"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors text-sm w-full sm:w-auto"
                  >
                    <Settings className="h-4 w-4" />
                    Editar Perfil
                  </Link>
                </div>

                {/* Estatísticas de Seguidores */}
                <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
                  <button className="group flex flex-col items-center hover:bg-muted px-4 py-2 rounded-lg transition-colors">
                    <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {followingCount}
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                      seguindo
                    </span>
                  </button>
                  
                  <div className="h-8 w-px bg-border/60" />
                  
                  <button className="group flex flex-col items-center hover:bg-muted px-4 py-2 rounded-lg transition-colors">
                    <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {followerCount}
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                      {followerCount === 1 ? 'seguidor' : 'seguidores'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação em Abas */}
        <div className="border-b border-border/40">
          <div className="flex sm:justify-start justify-center -mb-px space-x-8">
            <button
              onClick={() => setActiveTab('questions')}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === 'questions'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Perguntas
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Estatísticas
            </button>
            <button
              onClick={() => setActiveTab('coins')}
              className={`pb-4 px-1 border-b-2 transition-colors ${
                activeTab === 'coins'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              Moedas
            </button>
          </div>
        </div>

        {/* Conteúdo das Abas */}
        <div className="space-y-4">
          {/* Aba de Perguntas */}
          {activeTab === 'questions' && (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Suas Perguntas</h3>
                  
                  {/* Lista de Perguntas */}
                  <div className="space-y-3">
                    {loadingQuestions ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : questions.length > 0 ? (
                      <div className="grid gap-3">
                        {questions.map((question) => (
                          <div 
                            key={question.id} 
                            className="w-full p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-all duration-200"
                          >
                            <div className="flex items-start gap-4">
                              <div className="p-2.5 bg-primary/10 rounded-lg shrink-0 mt-0.5">
                                <FileQuestion className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground line-clamp-2">
                                  {question.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                  <span>
                                    Postado {formatDistanceToNow(new Date(question.created_at), { 
                                      addSuffix: true,
                                      locale: ptBR 
                                    })}
                                  </span>
                                  <span className="inline-block w-1 h-1 rounded-full bg-border" />
                                  <span>
                                    {question.answers_count} {question.answers_count === 1 ? 'resposta' : 'respostas'}
                                  </span>
                                </p>
                              </div>
                              <button
                                onClick={(e) => handleDeleteQuestion(question.id, e)}
                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                              >
                                Excluir
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileQuestion className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground">Você ainda não fez nenhuma pergunta</p>
                        <button
                          onClick={() => navigate('/new-question')}
                          className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors text-sm"
                        >
                          <FileQuestion className="h-4 w-4" />
                          Fazer uma pergunta
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba de Estatísticas */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Estatísticas de Engajamento</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Perguntas */}
                    <div className="group p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                          <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">{stats?.questions_count || 0}</span>
                            <span className="text-muted-foreground">perguntas</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">Perguntas criadas</p>
                        </div>
                      </div>
                    </div>

                    {/* Respostas */}
                    <div className="group p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                          <MessageCircle className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">{stats?.answers_count || 0}</span>
                            <span className="text-muted-foreground">respostas</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">Respostas dadas</p>
                        </div>
                      </div>
                    </div>

                    {/* Curtidas Dadas */}
                    <div className="group p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                          <ThumbsUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">{stats?.likes_given_count || 0}</span>
                            <span className="text-muted-foreground">curtidas dadas</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">Perguntas que você curtiu</p>
                        </div>
                      </div>
                    </div>

                    {/* Curtidas Recebidas */}
                    <div className="group p-4 rounded-xl border border-border/40 hover:bg-muted/50 transition-all duration-200">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                          <ThumbsUp className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-foreground">{stats?.likes_received_count || 0}</span>
                            <span className="text-muted-foreground">curtidas recebidas</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 truncate">Em suas perguntas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Aba de Moedas */}
          {activeTab === 'coins' && (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Suas Moedas</h3>
                  
                  <div className="space-y-6">
                    {/* Total de Moedas */}
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Coins className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total de moedas</p>
                        <p className="text-2xl font-bold text-foreground">{points}</p>
                      </div>
                    </div>

                    {/* Como Ganhar Moedas */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">Como ganhar moedas</h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Responda outras pessoas</p>
                            <p className="text-sm text-muted-foreground">Ganhe 7 moedas por resposta</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <ThumbsUp className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Receba curtidas da comunidade</p>
                            <p className="text-sm text-muted-foreground">Ganhe 10 moedas por curtida</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <HelpCircle className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Faça perguntas interessantes</p>
                            <p className="text-sm text-muted-foreground">Ganhe 5 moedas por pergunta</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
