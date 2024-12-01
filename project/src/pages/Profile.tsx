import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { HelpCircle, MessageCircle, ThumbsUp, User as UserIcon, ArrowLeft, Settings, Coins } from 'lucide-react';

interface UserStats {
  questions_count: number;
  answers_count: number;
  likes_given_count: number;
  likes_received_count: number;
}

export function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Card de Informações do Usuário */}
        <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Avatar e Informações Básicas */}
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-border">
                  <UserIcon className="w-12 h-12 text-primary/60" />
                </div>
                {/* Informações para mobile */}
                <div className="md:hidden">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground">Membro desde {new Date(user?.created_at || '').toLocaleDateString()}</p>
                    </div>
                    <Link 
                      to="/configuracoes"
                      className="md:hidden p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="hidden md:block">
                    <h2 className="text-2xl font-bold text-foreground">
                      {user?.email}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Membro desde {new Date(user?.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  
                  <Link 
                    to="/configuracoes"
                    className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    Editar Perfil
                  </Link>
                </div>
                
                {/* Estatísticas de Seguidores */}
                <div className="flex items-center gap-6 mt-6">
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

        {/* Card de Moedas */}
        <div className="bg-card rounded-xl border border-yellow-500/30 shadow-sm overflow-hidden">
          <div className="p-6 relative">
            {/* Efeito de gradiente sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5" />
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
              {/* Contador de Moedas */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-md">
                    <Coins className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-yellow-700/90">Suas Moedas</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-bold text-yellow-600">
                      {points}
                    </span>
                    <span className="text-base text-yellow-600/80">moedas</span>
                  </div>
                </div>
              </div>

              {/* Dicas */}
              <div className="md:max-w-xs w-full space-y-3">
                <h4 className="text-sm font-medium text-yellow-700">Como ganhar mais moedas:</h4>
                <div className="space-y-2">
                  {[
                    { icon: <MessageCircle className="h-4 w-4" />, text: 'Faça perguntas interessantes' },
                    { icon: <MessageCircle className="h-4 w-4" />, text: 'Responda outras pessoas' },
                    { icon: <ThumbsUp className="h-4 w-4" />, text: 'Receba curtidas da comunidade' }
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-yellow-600/90">
                      <div className="p-2 bg-yellow-500/10 rounded-lg">
                        {tip.icon}
                      </div>
                      <span>{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card de Estatísticas */}
        <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Estatísticas de Engajamento</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Perguntas e Respostas */}
              <div className="space-y-6">
                {/* Perguntas */}
                <div className="group p-4 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                      <HelpCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{stats?.questions_count || 0}</span>
                        <span className="text-muted-foreground">perguntas</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Perguntas criadas por você</p>
                    </div>
                  </div>
                </div>

                {/* Respostas */}
                <div className="group p-4 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{stats?.answers_count || 0}</span>
                        <span className="text-muted-foreground">respostas</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Respostas dadas por você</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Curtidas */}
              <div className="space-y-6">
                {/* Curtidas Dadas */}
                <div className="group p-4 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                      <ThumbsUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{stats?.likes_given_count || 0}</span>
                        <span className="text-muted-foreground">curtidas dadas</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Perguntas que você curtiu</p>
                    </div>
                  </div>
                </div>

                {/* Curtidas Recebidas */}
                <div className="group p-4 rounded-lg border border-border/40 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-primary/10 rounded-lg">
                      <ThumbsUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">{stats?.likes_received_count || 0}</span>
                        <span className="text-muted-foreground">curtidas recebidas</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">Em suas perguntas e respostas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
