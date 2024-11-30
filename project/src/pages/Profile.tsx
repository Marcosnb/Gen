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
      {/* Conteúdo principal */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Card de Informações do Usuário */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <UserIcon className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{user?.email}</h2>
              <div className="text-sm text-muted-foreground">
                Membro desde {new Date(user?.created_at || '').toLocaleDateString()}
              </div>
              <div className="flex gap-6 mt-3">
                <div className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-3 py-1.5 rounded-lg transition-colors">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {followingCount}
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                      seguindo
                    </span>
                  </div>
                </div>
                <div className="h-8 w-px bg-border/60" />
                <div className="group flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-3 py-1.5 rounded-lg transition-colors">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {followerCount}
                    </span>
                    <span className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">
                      {followerCount === 1 ? 'seguidor' : 'seguidores'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Link 
              to="/configuracoes"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm"
            >
              <Settings className="h-4 w-4" />
              Editar Perfil
            </Link>
          </div>
        </div>

        {/* Card de Moedas */}
        <div className="group relative overflow-hidden bg-gradient-to-br from-[#FFD700]/10 via-[#FFA500]/10 to-[#FF8C00]/10 rounded-xl border border-yellow-500/30 p-6 shadow-lg transition-all duration-300 hover:shadow-yellow-500/10">
          {/* Efeito de brilho no hover */}
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10"></div>
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
            {/* Lado esquerdo - Moedas */}
            <div className="flex items-center gap-5">
              {/* Ícone animado */}
              <div className="relative transform transition-transform duration-300 group-hover:scale-105">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 blur-md"></div>
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg">
                  <Coins className="h-8 w-8 text-white drop-shadow" />
                </div>
              </div>
              
              {/* Contador de moedas */}
              <div>
                <h3 className="text-lg font-medium text-yellow-700/90 mb-1">Suas Moedas</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-transparent bg-gradient-to-r from-yellow-600 to-amber-500 bg-clip-text">
                    {points}
                  </span>
                  <span className="text-lg font-medium text-yellow-600/80">moedas</span>
                </div>
              </div>
            </div>

            {/* Lado direito - Dicas */}
            <div className="relative md:max-w-[280px] w-full md:w-auto">
              <div className="rounded-xl bg-gradient-to-br from-yellow-500/5 to-amber-500/5 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium text-yellow-700 mb-3">
                  Como ganhar mais moedas:
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { icon: <div className="p-2 bg-yellow-500/10 rounded-full"><MessageCircle className="h-4 w-4 text-yellow-600" /></div>, text: 'Faça perguntas interessantes' },
                    { icon: <div className="p-2 bg-yellow-500/10 rounded-full"><MessageCircle className="h-4 w-4 text-yellow-600" /></div>, text: 'Responda outras pessoas' },
                    { icon: <div className="p-2 bg-yellow-500/10 rounded-full"><ThumbsUp className="h-4 w-4 text-yellow-600" /></div>, text: 'Receba curtidas da comunidade' }
                  ].map((tip, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-yellow-600/90">
                      <span className="flex-shrink-0">{tip.icon}</span>
                      <span className="flex-1">{tip.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Decoração de fundo */}
          <div className="absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent"></div>
        </div>

        {/* Card de Estatísticas */}
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Estatísticas de Engajamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Perguntas e Respostas */}
            <div className="space-y-6">
              {/* Perguntas */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats?.questions_count || 0}</span>
                    <span className="text-muted-foreground">perguntas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Perguntas criadas por você</p>
                </div>
              </div>

              {/* Respostas */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats?.answers_count || 0}</span>
                    <span className="text-muted-foreground">respostas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Respostas dadas por você</p>
                </div>
              </div>
            </div>

            {/* Curtidas */}
            <div className="space-y-6">
              {/* Curtidas Dadas */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ThumbsUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats?.likes_given_count || 0}</span>
                    <span className="text-muted-foreground">curtidas dadas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Perguntas que você curtiu</p>
                </div>
              </div>

              {/* Curtidas Recebidas */}
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ThumbsUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{stats?.likes_received_count || 0}</span>
                    <span className="text-muted-foreground">curtidas recebidas</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Em suas perguntas e respostas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
