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

      if (!answersError && !questionsError) {
        setStats({
          questions_count: questionsCount?.length || 0,
          answers_count: answersCount?.length || 0,
          likes_given_count: 0,
          likes_received_count: 0
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

      setLoading(false);
    };

    checkUser();
  }, [navigate]);

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
              <p className="text-muted-foreground">
                Membro desde {new Date(user?.created_at || '').toLocaleDateString()}
                <br />
                <span className="flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  Você tem {points} pontos
                </span>
              </p>
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
