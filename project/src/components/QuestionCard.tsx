import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Flame, Eye, ChevronDown, Send, Tag, ArrowBigUp, Trash2, Code, Book, Lightbulb, HelpCircle, Wrench, Laptop, Globe, Database, Shield, Cpu, PenTool, Zap, FileCode, Settings, Users, Cloud, Smartphone, Film, Music, Gamepad, Camera, Radio, Tv, Theater, Popcorn, Heart, Star, Coffee, Wallet, Briefcase, Scale, Leaf, Microscope, Building2, Languages, Brush, FlowerIcon as Flower, UtensilsCrossed, Brain, Shirt, Sparkles, Smile, Calendar, Umbrella, GraduationCap, Dumbbell, Wine, School, Coins, ShoppingBag, Map, Church, Plane, Palette, Clapperboard, CrossIcon as Cross, Footprints, Sun, Store, ShoppingCart, Building, GanttChart, Bus, Pizza, Crown, Bike, Drumstick, CircuitBoard, Rocket, LineChart, Presentation, Telescope, Atom, TestTube, Dna, Stethoscope, Apple, Medal, PersonStanding, Target, BarChart, Bot, Network, PartyPopper, Volume2, Play, Pause, Mic } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../types';
import { supabase } from '../lib/supabase';
import { suggestedTags } from './TagInput';
import { InsufficientCoinsAlert } from './InsufficientCoinsAlert';

interface Answer {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  audio_url?: string | null;
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
  const navigate = useNavigate();
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerCount, setAnswerCount] = useState(question.answer_count);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(2);
  const [startIndex, setStartIndex] = useState(0);
  const answersContainerRef = useRef<HTMLDivElement>(null);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showInsufficientCoinsAlert, setShowInsufficientCoinsAlert] = useState(false);
  const [requiredCoins, setRequiredCoins] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isAnswerAnonymous, setIsAnswerAnonymous] = useState(false);
  const [followingAnswerUsers, setFollowingAnswerUsers] = useState<{ [key: string]: boolean }>({});
  const [answersFollowStatus, setAnswersFollowStatus] = useState<{ [key: string]: boolean }>({});
  const [currentAnswerCount, setCurrentAnswerCount] = useState(question.answer_count || 0);

  // Estados do player de áudio
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);

  // Estados de gravação de áudio
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Estado para controlar o áudio de cada resposta
  const [playingAnswers, setPlayingAnswers] = useState<{ [key: string]: boolean }>({});
  const [answerTimes, setAnswerTimes] = useState<{ [key: string]: { current: number; total: number } }>({});
  const answerAudiosRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Estado para controlar o áudio da pergunta
  const [questionAudioPlaying, setQuestionAudioPlaying] = useState(false);
  const [questionTime, setQuestionTime] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const questionAudioRef = useRef<HTMLAudioElement | null>(null);

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
      const { data: answersData, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', question.id)
        .order('created_at', { ascending: false });

      if (answersError) throw answersError;

      if (answersData) {
        // Pegar os IDs únicos dos usuários
        const userIds = [...new Set(answersData.map(answer => answer.user_id))];

        // Buscar todos os perfis de uma vez
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        // Criar um mapa de perfis por ID
        const profilesMap = (profilesData || []).reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {});

        // Combinar as respostas com os perfis
        const answersWithProfiles = answersData.map(answer => ({
          ...answer,
          profiles: profilesMap[answer.user_id] || {
            id: answer.user_id,
            full_name: 'Usuário',
            avatar_url: '/default-avatar.png'
          }
        }));

        setAnswers(answersWithProfiles);
      }
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnswers();

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
          if (payload.eventType === 'DELETE') {
            setAnswers(current => current.filter(a => a.id !== payload.old.id));
            setAnswerCount(prev => prev - 1);
          } else {
            await fetchAnswers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [question.id]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        
        setIsAdmin(!!profile?.is_admin);
      }
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    const checkLikeStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          // Verificar se o usuário já curtiu
          const { data: likeData } = await supabase
            .from('question_likes')
            .select('*')
            .eq('question_id', question.id)
            .eq('user_id', session.user.id)
            .single();
          
          setIsLiked(!!likeData);
        }

        // Buscar contagem total de curtidas
        const { count } = await supabase
          .from('question_likes')
          .select('*', { count: 'exact' })
          .eq('question_id', question.id);
        
        setLikeCount(count || 0);
      } catch (error) {
        console.error('Erro ao verificar curtidas:', error);
      }
    };

    checkLikeStatus();
  }, [question.id]);

  useEffect(() => {
    checkFollowStatus();
  }, [question.user_id]);

  useEffect(() => {
    checkAnswersFollowStatus();
  }, [answers]);

  useEffect(() => {
    // Criar um canal específico para cada questão
    const channel = supabase
      .channel(`answers-${question.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta todos os tipos de eventos
          schema: 'public',
          table: 'answers',
          filter: `question_id=eq.${question.id}`
        },
        async (payload) => {
          console.log('Mudança detectada:', payload);
          
          // Busca o número atual de respostas
          const { count } = await supabase
            .from('answers')
            .select('*', { count: 'exact', head: true })
            .eq('question_id', question.id);
          
          console.log('Novo número de respostas:', count);
          setCurrentAnswerCount(count || 0);
          
          // Atualiza a lista de respostas
          fetchAnswers();
        }
      );

    // Inscreve no canal e adiciona log para debug
    channel.subscribe((status) => {
      console.log(`Status da inscrição para questão ${question.id}:`, status);
    });

    // Cleanup ao desmontar
    return () => {
      console.log(`Removendo canal para questão ${question.id}`);
      supabase.removeChannel(channel);
    };
  }, [question.id]); // Dependência apenas no ID da questão

  const checkAnswersFollowStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const followStatusMap: { [key: string]: boolean } = {};

      for (const answer of answers) {
        if (answer.user_id) {
          const { data: follower } = await supabase
            .from('followers')
            .select('*')
            .eq('follower_id', session.user.id)
            .eq('following_id', answer.user_id)
            .single();

          followStatusMap[answer.id] = !!follower;
        }
      }

      setAnswersFollowStatus(followStatusMap);
    } catch (error) {
      console.error('Erro ao verificar status de seguidor das respostas:', error);
    }
  };

  const handleAnswerFollow = async (e: React.MouseEvent, answerId: string, answerUserId: string) => {
    e.stopPropagation();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        navigate('/login');
        return;
      }

      if (session.user.id === answerUserId) {
        alert('Você não pode seguir a si mesmo');
        return;
      }

      const currentFollowingStatus = answersFollowStatus[answerId] || false;

      if (currentFollowingStatus) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', answerUserId);

        if (error) throw error;
        setAnswersFollowStatus(prev => ({
          ...prev,
          [answerId]: false
        }));
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert([{
            follower_id: session.user.id,
            following_id: answerUserId,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        setAnswersFollowStatus(prev => ({
          ...prev,
          [answerId]: true
        }));
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      alert('Erro ao processar sua solicitação');
    }
  };

  const checkFollowStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && question.user_id) {
        const { data: follower } = await supabase
          .from('followers')
          .select('*')
          .eq('follower_id', session.user.id)
          .eq('following_id', question.user_id)
          .single();
        
        setIsFollowing(!!follower);
      }
    } catch (error) {
      console.error('Erro ao verificar status de seguidor:', error);
    }
  };

  const handleAccordionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAccordionOpen(!isAccordionOpen);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim() && !audioUrl) return;

    try {
      // Verificar se o usuário está logado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const answerData = {
        content: answer.trim(),
        question_id: question.id,
        user_id: session.user.id,
        audio_url: audioUrl,
        created_at: new Date().toISOString()
      };

      const { data: newAnswer, error: answerError } = await supabase
        .from('answers')
        .insert([answerData])
        .select('*')
        .single();

      if (answerError) throw answerError;

      // Buscar o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        return;
      }

      // Combinar a resposta com os dados do perfil
      const answerWithProfile = {
        ...newAnswer,
        profiles: profile
      };

      // Atualizar a lista de respostas localmente
      setAnswers(prev => [...prev, answerWithProfile]);
      setAnswerCount(prev => prev + 1);
      
      // Limpar os campos após envio
      setAnswer('');
      setAudioUrl(null);
    } catch (error: any) {
      console.error('Erro ao enviar resposta:', error);
      alert(error?.message || 'Erro ao enviar resposta. Por favor, tente novamente.');
    }
  };

  const handleLike = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        navigate('/login');
        return;
      }

      // Otimistic update
      const newIsLiked = !isLiked;
      const likeDelta = newIsLiked ? 1 : -1;
      setIsLiked(newIsLiked);
      setLikeCount(prev => prev + likeDelta);

      if (!isLiked) {
        // Adicionar curtida
        const { error: addError } = await supabase
          .from('question_likes')
          .insert([
            {
              question_id: question.id,
              user_id: session.user.id
            }
          ]);

        if (addError) {
          // Reverter em caso de erro
          setIsLiked(false);
          setLikeCount(prev => prev - 1);
          throw new Error(`Erro ao adicionar curtida: ${addError.message}`);
        }

        // Adicionar pontos ao autor da pergunta
        const { error: pointsError } = await supabase
          .rpc('update_user_points', {
            user_id_param: question.user_id,
            points_to_add: 10
          });

        if (pointsError) {
          // Reverter em caso de erro
          setIsLiked(false);
          setLikeCount(prev => prev - 1);
          throw new Error(`Erro ao atualizar pontos: ${pointsError.message}`);
        }

      } else {
        // Remover curtida
        const { error: removeError } = await supabase
          .from('question_likes')
          .delete()
          .eq('question_id', question.id)
          .eq('user_id', session.user.id);

        if (removeError) {
          // Reverter em caso de erro
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          throw new Error(`Erro ao remover curtida: ${removeError.message}`);
        }

        // Remover pontos do autor da pergunta
        const { error: pointsError } = await supabase
          .rpc('update_user_points', {
            user_id_param: question.user_id,
            points_to_add: -10
          });

        if (pointsError) {
          // Reverter em caso de erro
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          throw new Error(`Erro ao atualizar pontos: ${pointsError.message}`);
        }
      }

    } catch (error) {
      console.error('Erro ao processar curtida:', error);
      alert('Erro ao processar curtida');
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        navigate('/login');
        return;
      }

      if (session.user.id === question.user_id) {
        alert('Você não pode seguir a si mesmo');
        return;
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', question.user_id);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert([{
            follower_id: session.user.id,
            following_id: question.user_id,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        setIsFollowing(true);
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      alert('Erro ao processar sua solicitação');
    }
  };

  const handleFollowAnswerUser = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        navigate('/login');
        return;
      }

      if (session.user.id === userId) {
        alert('Você não pode seguir a si mesmo');
        return;
      }

      if (followingAnswerUsers[userId]) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', userId);

        if (error) throw error;
        setFollowingAnswerUsers(prev => ({ ...prev, [userId]: false }));
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert([{
            follower_id: session.user.id,
            following_id: userId,
            created_at: new Date().toISOString()
          }]);

        if (error) throw error;
        setFollowingAnswerUsers(prev => ({ ...prev, [userId]: true }));
      }
    } catch (error) {
      console.error('Erro ao seguir/deixar de seguir:', error);
      alert('Erro ao processar sua solicitação');
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      // Verificar se é admin e pontos
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, points')
        .eq('id', session.user.id)
        .single();

      // Encontrar a resposta para verificar o dono
      const answer = answers.find(a => a.id === answerId);
      
      // Só permite deletar se for admin ou dono da resposta
      if (!profile?.is_admin && session.user.id !== answer?.user_id) {
        alert('Você não tem permissão para excluir esta resposta');
        return;
      }

      // Verificar se tem moedas suficientes (9 moedas)
      if (!profile?.is_admin && profile.points < 9) {
        setRequiredCoins(9);
        setUserCoins(profile.points);
        setShowInsufficientCoinsAlert(true);
        return;
      }

      // Descontar moedas se não for admin
      if (!profile?.is_admin) {
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ points: profile.points - 9 })
          .eq('id', session.user.id);

        if (pointsError) {
          console.error('Erro ao descontar moedas:', pointsError);
          alert('Erro ao descontar moedas');
          return;
        }
      }

      const { error } = await supabase
        .from('answers')
        .delete()
        .eq('id', answerId);

      if (error) throw error;

      // Atualiza o estado local imediatamente após excluir com sucesso
      setAnswers(prevAnswers => {
        const newAnswers = prevAnswers.filter(a => a.id !== answerId);
        setAnswerCount(newAnswers.length); // Atualiza o contador baseado no novo array de respostas
        return newAnswers;
      });
      
      // Ajusta a paginação se necessário
      if (startIndex > 0 && answers.length <= VISIBLE_ANSWERS) {
        setStartIndex(0);
      }
    } catch (error) {
      console.error('Erro ao deletar resposta:', error);
      alert('Erro ao deletar resposta');
    }
  };

  const handleDeleteQuestion = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      // Verificar se é admin e pontos
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin, points')
        .eq('id', session.user.id)
        .single();

      // Só permite deletar se for admin ou dono da pergunta
      if (!profile?.is_admin && session.user.id !== question.user_id) {
        alert('Você não tem permissão para excluir esta pergunta');
        return;
      }

      // Verificar se tem moedas suficientes (5 moedas)
      if (!profile?.is_admin && profile.points < 5) {
        setRequiredCoins(5);
        setUserCoins(profile.points);
        setShowInsufficientCoinsAlert(true);
        return;
      }

      // Descontar moedas se não for admin
      if (!profile?.is_admin) {
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ points: profile.points - 5 })
          .eq('id', session.user.id);

        if (pointsError) {
          console.error('Erro ao descontar moedas:', pointsError);
          alert('Erro ao descontar moedas');
          return;
        }
      }

      // Chamar a função segura de deleção
      const { error } = await supabase.rpc('delete_question_safely', {
        question_id_param: question.id
      });

      if (error) throw error;
      
      // A atualização será feita pelo listener em tempo real na página Home
    } catch (error) {
      console.error('Erro ao deletar pergunta:', error);
      alert('Erro ao deletar pergunta');
    }
  };

  const getTagIcon = (tag: string) => {
    // A tag agora é o ID, então vamos tentar encontrar a tag sugerida correspondente
    const suggestedTag = suggestedTags.find(t => t.id === tag);
    
    // Se encontrarmos a tag sugerida, usamos seu ID
    const tagToUse = suggestedTag ? suggestedTag.id : tag.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');

    const tagMap: { [key: string]: any } = {
      // Relacionamentos e Sociedade
      'namoro': Heart,
      'igreja': Church,
      'religiao': Cross,
      'familia': Users,
      'casamento': Heart,
      'sexo': Heart,
      'relacionamento': Heart,
      'amizade': Heart,
      'politica': GanttChart,
      'autoconhecimento': Brain,
	

      // Lazer e Entretenimento
      'shopping': Store,
      'compra': ShoppingCart,
      'praia': Sun,
      'cinema': Clapperboard,
      'tv': Tv,
      'musica': Music,
      'jogos': Gamepad,
      'teatro': Theater,
      'arte': Palette,
      'cultura': Book,
      'entretenimento': Popcorn,
      'lazer': Star,
      'diversao': Smile,
      'hobby': Heart,
      'literatura': Book,
      'historia': Book,
      'danca': PersonStanding,
      'fotografia': Camera,

      // Lugares e Mobilidade
      'cidade': Building,
      'viagem': Plane,
      'transporte': Bus,

      // Alimentação e Bebidas
      'alimentacao': Pizza,
      'gastronomia': UtensilsCrossed,
      'culinaria': UtensilsCrossed,
      'cafe': Coffee,
      'cerveja': Wine,
      'vinho': Wine,
      'cha': Coffee,
      'nutricao': Apple,
      'cozinha': UtensilsCrossed,
      'restaurante': UtensilsCrossed,
      'comida': Drumstick,
      'bebida': Wine,

      // Educação e Conhecimento
      'escola': School,
      'faculdade': GraduationCap,
      'educacao': Book,
      'ensino': Book,
      'aprendizado': Lightbulb,
      'idiomas': Languages,
      'linguas-estrangeiras': Languages,
      'matematica': Code,
      'filosofia': Brain,
      'sociologia': Users,
      'geografia': Map,
      'arqueologia': Microscope,

      // Tecnologia e Ciência
      'tecnologia': Laptop,
      'internet': Globe,
      'programacao': Code,
      'robotica': Bot,
      'inteligencia-artificial': CircuitBoard,
      'chatgpt': Bot,
      'machine-learning': Network,
      'deep-learning': Network,
      'data-science': BarChart,
      'computacao-nuvem': Cloud,
      'ciencia': Microscope,
      'fisica': Atom,
      'quimica': TestTube,
      'biologia': Dna,
      'astronomia': Telescope,

      // Saúde e Bem-estar
      'saude': Stethoscope,
      'esporte': Medal,
      'yoga': PersonStanding,
      'psicologia': Brain,
      'bem-estar': Heart,
      'exercicios': Dumbbell,
      'meditacao': Brain,
      'medicina': Stethoscope,
      'musculacao': Dumbbell,
      'corrida': PersonStanding,

      // Negócios e Finanças
      'economia': Coins,
      'financas': Wallet,
      'financas-pessoais': Wallet,
      'empreendedorismo': Rocket,
      'trabalho': Briefcase,
      'direito': Scale,
      'negocios': Briefcase,
      'startup': Rocket,
      'venture-capital': LineChart,
      'pitch': Presentation,
      'mvp': Target,
      'lean-startup': Rocket,
      'aceleradora': Rocket,
      'marketing': Target,
      'marketing-digital': Target,

      // Casa e Estilo
      'decoracao': Brush,
      'jardinagem': Flower,
      'moda': Shirt,
      'beleza': Sparkles,
      'casa': Building,
      'maquiagem': Sparkles,
      'artesanato': Brush,

      // Indústria e Engenharia
      'mecanica': Wrench,
      'automoveis': Building,
      'agricultura': Microscope,
      'arquitetura': Building,
      'engenharia': Wrench,

      // Meio Ambiente e Natureza
      'meio-ambiente': Leaf,
      'sustentabilidade': Leaf,
      'animais': Heart,
      'natureza': Leaf,

      // Esportes
      'futebol': Medal,
      'esportes': Medal,
      'bike': Bike,
	  
	  // Outros
	  'outros': Globe,
	  'festa': PartyPopper,
	  'estilo': Sparkles,
	  'academia': Dumbbell,
	  'fitness': PersonStanding,
	  'vegano': Leaf,
	  'lanche': Pizza,
	  'hobby': Target,
	  'desenho': PenTool,
	  'amizade': Heart,
	  'vida': Sparkles,
	  'natureza': Leaf,
	 
    };

    // Retornar o ícone correspondente ou o ícone padrão (Tag)
    return tagMap[tagToUse] || Tag;
  };

  // Funções para controle do áudio
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = pos * audioRef.current.duration;
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Função para iniciar gravação
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Upload do áudio para o Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('audio_answers')
          .upload(`answer-${Date.now()}.webm`, audioBlob);

        if (uploadError) {
          console.error('Erro ao fazer upload do áudio:', uploadError);
          return;
        }

        // Obter URL pública do áudio
        const { data: { publicUrl } } = supabase.storage
          .from('audio_answers')
          .getPublicUrl(uploadData.path);

        setAudioUrl(publicUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
    }
  };

  // Função para parar gravação
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Estado para controlar o áudio de cada resposta
  const toggleAnswerAudio = (answerId: string, audioUrl: string) => {
    // Se já existe um áudio para esta resposta
    if (answerAudiosRef.current[answerId]) {
      if (playingAnswers[answerId]) {
        answerAudiosRef.current[answerId].pause();
      } else {
        answerAudiosRef.current[answerId].play();
      }
      setPlayingAnswers(prev => ({ ...prev, [answerId]: !prev[answerId] }));
    } else {
      // Se é a primeira vez tocando este áudio
      const audio = new Audio(audioUrl);
      answerAudiosRef.current[answerId] = audio;

      audio.addEventListener('timeupdate', () => {
        setAnswerTimes(prev => ({
          ...prev,
          [answerId]: {
            current: audio.currentTime,
            total: audio.duration
          }
        }));
      });

      audio.addEventListener('ended', () => {
        setPlayingAnswers(prev => ({ ...prev, [answerId]: false }));
      });

      audio.addEventListener('loadedmetadata', () => {
        setAnswerTimes(prev => ({
          ...prev,
          [answerId]: {
            current: 0,
            total: audio.duration
          }
        }));
      });

      audio.play();
      setPlayingAnswers(prev => ({ ...prev, [answerId]: true }));
    }
  };

  // Função para determinar o estilo da barra baseado no número de respostas
  const getIntensityStyle = (respostas: number) => {
    // Verde -> Laranja -> Vermelho com novos níveis
    if (respostas >= 27) return 'h-full bg-gradient-to-t from-red-600 via-red-500 to-red-400 scale-100';
    if (respostas >= 16) return 'h-4/5 bg-gradient-to-t from-orange-600 via-orange-500 to-orange-400 scale-95';
    if (respostas >= 10) return 'h-3/5 bg-gradient-to-t from-yellow-500 via-yellow-400 to-yellow-300 scale-90';
    if (respostas >= 8) return 'h-2/5 bg-gradient-to-t from-lime-600 via-lime-500 to-lime-400 scale-85';
    if (respostas >= 5) return 'h-1/5 bg-gradient-to-t from-green-600 via-green-500 to-green-400 scale-80';
    return 'h-1/5 bg-gray-200 dark:bg-gray-700 scale-75 opacity-30'; // Sem cor para 0-3 respostas
  };

  // Função para controlar o áudio da pergunta
  const toggleQuestionAudio = (audioUrl: string) => {
    if (questionAudioRef.current) {
      if (questionAudioPlaying) {
        questionAudioRef.current.pause();
      } else {
        questionAudioRef.current.play();
      }
      setQuestionAudioPlaying(!questionAudioPlaying);
    } else {
      const audio = new Audio(audioUrl);
      questionAudioRef.current = audio;

      audio.addEventListener('timeupdate', () => {
        setQuestionTime({
          current: audio.currentTime,
          total: audio.duration
        });
      });

      audio.addEventListener('ended', () => {
        setQuestionAudioPlaying(false);
      });

      audio.addEventListener('loadedmetadata', () => {
        setQuestionTime({
          current: 0,
          total: audio.duration
        });
      });

      audio.play();
      setQuestionAudioPlaying(true);
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative bg-white dark:bg-[#080C16] rounded-2xl shadow-sm dark:shadow-none border border-gray-100 dark:border-blue-900/50 transition-all duration-300 overflow-hidden"
    >
      {/* Alerta de moedas insuficientes */}
      {showInsufficientCoinsAlert && (
        <InsufficientCoinsAlert
          requiredCoins={requiredCoins}
          currentCoins={userCoins}
          onClose={() => setShowInsufficientCoinsAlert(false)}
        />
      )}

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-50/30 dark:from-blue-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative grid grid-cols-[auto_1fr] gap-6 p-6">
        {/* Voting and Interaction Column */}
        <div className="flex flex-col items-center gap-4">
          {/* Like Button */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleLike}
              disabled={session?.user?.id === question.user_id}
              className={`p-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                isLiked 
                  ? 'text-red-600 dark:text-red-400 bg-red-100/80 dark:bg-red-900/30 shadow-inner backdrop-blur-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
              } ${session?.user?.id === question.user_id ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={session?.user?.id === question.user_id ? 'Você não pode curtir sua própria pergunta' : ''}
            >
              <Flame className="w-5 h-5" />
            </button>
            <span className="text-xs text-muted-foreground mt-1">{likeCount}</span>
          </div>

          {/* Stats Icons with Tooltips */}
          <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center group/stat relative">
              <div
                className="relative w-1.5 h-12 bg-gray-200/30 dark:bg-gray-700/30 rounded-full overflow-hidden group-hover/stat:shadow-lg transition-all duration-300"
              >
                <div 
                  className={`absolute bottom-0 w-full rounded-full transition-all duration-500 transform-gpu ${getIntensityStyle(currentAnswerCount)}`}
                  style={{ 
                    boxShadow: currentAnswerCount >= 4 ? '0 -2px 8px rgba(0,0,0,0.15)' : 'none',
                    filter: currentAnswerCount >= 4 ? 'brightness(1.2) saturate(1.2)' : 'none'
                  }}
                />
                {/* Efeito de brilho na borda apenas para respostas >= 4 */}
                {currentAnswerCount >= 4 && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300" />
                )}
              </div>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-lg">
                Intensidade de respostas
              </span>
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className="space-y-4">
          {/* Header with User Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <img
                  src={question.profiles?.avatar_url || '/default-avatar.png'}
                  alt={question.profiles?.full_name || 'Usuário'}
                  className="relative w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-lg transform group-hover:scale-105 transition-all duration-300 aspect-square"
                />
                {question.is_answered && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1.5 rounded-full shadow-lg animate-in fade-in duration-300 ring-2 ring-white dark:ring-gray-800">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 flex items-center gap-2">
                      {question.profiles?.full_name || 'Usuário'}
                      {(isAdmin || session?.user?.id === question.user_id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteQuestion();
                          }}
                          className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          Excluir pergunta
                        </button>
                      )}
                      {session?.user && session?.user?.id !== question.user_id && question.user_id && (
                        <button
                          onClick={handleFollow}
                          className={`text-xs ${isFollowing ? 'text-emerald-700' : 'text-emerald-500'} hover:text-emerald-700 transition-colors`}
                        >
                          {isFollowing ? 'Seguindo' : 'Seguir'}
                        </button>
                      )}
                      {session?.user && session?.user?.id !== question.user_id && question.user_id && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await supabase.auth.getSession().then(({ data: { session } }) => {
                              if (session) {
                                localStorage.setItem('selectedContactId', question.user_id);
                                navigate('/mensagens');
                              } else {
                                navigate('/login');
                              }
                            });
                          }}
                          className="p-1 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center"
                          title="Enviar mensagem"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                      )}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(question.created_at), {
                      locale: ptBR,
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content with Better Typography */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2 leading-snug">
              {question.title}
            </h3>
            <div className="mt-4 text-sm text-muted-foreground">
              {question.content}
            </div>
            
            {/* Player de Áudio */}
            {question.audio_url && (
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-card dark:bg-card/80 border border-border rounded-lg shadow-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleQuestionAudio(question.audio_url);
                    }}
                    className="p-2 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                  >
                    {questionAudioPlaying ? (
                      <Pause className="h-4 w-4 text-primary" />
                    ) : (
                      <Play className="h-4 w-4 text-primary" />
                    )}
                  </button>
                  
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      className="flex-1 h-1.5 bg-muted dark:bg-muted/50 rounded-full cursor-pointer group relative"
                    >
                      <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all group-hover:bg-primary/90"
                        style={{ 
                          width: questionTime.total 
                            ? `${(questionTime.current / questionTime.total) * 100}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground min-w-[40px]">
                      {questionTime.total 
                        ? `${formatTime(questionTime.current)} / ${formatTime(questionTime.total)}` 
                        : '0:00'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Tags */}
          <div className="flex flex-wrap gap-2">
            {question.tags?.map((tagId) => {
              // Encontrar a tag sugerida correspondente
              const suggestedTag = suggestedTags.find(t => t.id === tagId);
              const TagIcon = getTagIcon(tagId);
              return (
                <span
                  key={tagId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium transition-all hover:scale-105 hover:bg-blue-100/80 dark:hover:bg-blue-900/40 backdrop-blur-sm cursor-pointer"
                  title={suggestedTag?.label || tagId}
                >
                  <TagIcon className="w-3 h-3" />
                  {suggestedTag?.label || tagId}
                </span>
              );
            })}
          </div>

          {/* Answer Section with Smooth Transitions */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-blue-900/30">
            <button
              onClick={handleAccordionClick}
              className="flex items-center justify-between w-full px-4 py-2.5 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all rounded-xl hover:bg-blue-100/80 dark:hover:bg-blue-900/20 backdrop-blur-sm"
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
                        <div className="sticky top-0 z-10 bg-gradient-to-b from-white dark:from-[#080C16] to-transparent h-8 w-full" />
                      )}
                      
                      {answers.slice(startIndex, startIndex + visibleCount).map((answer) => (
                        <div 
                          key={answer.id} 
                          className={`bg-gray-50 dark:bg-[#080C16] rounded-xl p-4 space-y-3 transition-all duration-300 border border-transparent dark:border-blue-900/30 ${
                            startIndex + visibleCount === answers.length ? 'animate-pulse-once' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                                <img
                                  src={answer.profiles?.avatar_url || '/default-avatar.png'}
                                  alt={answer.profiles?.full_name || 'Usuário'}
                                  className="relative w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 shadow-lg transform group-hover:scale-105 transition-all duration-300 aspect-square"
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                  {answer.profiles?.full_name || 'Usuário'}
                                  {session?.user && session?.user?.id !== answer.user_id && answer.user_id && (
                                    <button
                                      onClick={(e) => handleAnswerFollow(e, answer.id, answer.user_id)}
                                      className={`text-xs ${answersFollowStatus[answer.id] ? 'text-emerald-700' : 'text-emerald-500'} hover:text-emerald-700 transition-colors`}
                                    >
                                      {answersFollowStatus[answer.id] ? 'Seguindo' : 'Seguir'}
                                    </button>
                                  )}
                                  {session?.user && session?.user?.id !== answer.user_id && answer.user_id && (
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        await supabase.auth.getSession().then(({ data: { session } }) => {
                                          if (session) {
                                            localStorage.setItem('selectedContactId', answer.user_id);
                                            navigate('/mensagens');
                                          } else {
                                            navigate('/login');
                                          }
                                        });
                                      }}
                                      className="p-1 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors flex items-center"
                                      title="Enviar mensagem"
                                    >
                                      <MessageCircle className="h-4 w-4" />
                                    </button>
                                  )}
                                  {(isAdmin || session?.user?.id === answer.user_id) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteAnswer(answer.id);
                                      }}
                                      className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                                    >
                                      Excluir resposta
                                    </button>
                                  )}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {formatDistanceToNow(new Date(answer.created_at), {
                                    addSuffix: true,
                                    locale: ptBR,
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {answer.content}
                          </p>
                          {answer.audio_url && (
                            <div className="mt-4 flex flex-col gap-2">
                              <div className="flex items-center gap-2 px-3 py-2 bg-card dark:bg-card/80 border border-border rounded-lg shadow-sm">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleAnswerAudio(answer.id, answer.audio_url);
                                  }}
                                  className="p-2 rounded-full hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors"
                                >
                                  {playingAnswers[answer.id] ? (
                                    <Pause className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Play className="h-4 w-4 text-primary" />
                                  )}
                                </button>
                                
                                <div className="flex-1 flex items-center gap-2">
                                  <div
                                    className="flex-1 h-1.5 bg-muted dark:bg-muted/50 rounded-full cursor-pointer group relative"
                                  >
                                    <div
                                      className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all group-hover:bg-primary/90"
                                      style={{ 
                                        width: answerTimes[answer.id] 
                                          ? `${(answerTimes[answer.id].current / answerTimes[answer.id].total) * 100}%` 
                                          : '0%' 
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-muted-foreground min-w-[40px]">
                                    {answerTimes[answer.id] 
                                      ? `${formatTime(answerTimes[answer.id].current)} / ${formatTime(answerTimes[answer.id].total)}` 
                                      : '0:00'
                                    }
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {hasMoreBelow && (
                        <div className="sticky bottom-0 z-10 bg-gradient-to-t from-white dark:from-[#080C16] to-transparent h-8 w-full" />
                      )}
                    </div>
                    
                    {/* Navegação */}
                    <div className="flex justify-center items-center space-x-3 mt-4">
                      {hasMoreBelow && (
                        <button
                          onClick={handleLoadMore}
                          className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-200 rounded-lg hover:bg-blue-100/80 dark:hover:bg-blue-900/20"
                        >
                          <span>Visualizar mais</span>
                        </button>
                      )}
                      
                      {/* Contador no meio */}
                      {(hasMoreAbove || hasMoreBelow) && (
                        <span className="flex items-center justify-center w-8 h-8 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-[#080C16] rounded-full">
                          {remainingAnswers}
                        </span>
                      )}
                      
                      {hasMoreAbove && (
                        <button
                          onClick={handleShowLess}
                          className="flex items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-all duration-200 rounded-lg hover:bg-blue-100/80 dark:hover:bg-blue-900/20"
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
                <form onSubmit={handleAnswerSubmit} className="mt-4">
                  <div className="relative bg-white dark:bg-[#080C16] rounded-xl p-3 border border-gray-200 dark:border-blue-900/30 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="relative">
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder="Digite sua resposta..."
                        maxLength={127}
                        className="w-full bg-transparent text-gray-800 dark:text-gray-200 text-sm focus:outline-none resize-none min-h-[80px] pr-24"
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-2">
                        {!isRecording && !audioUrl && (
                          <button
                            type="button"
                            onClick={startRecording}
                            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                          >
                            <Mic className="h-4 w-4" />
                          </button>
                        )}

                        {isRecording && (
                          <button
                            type="button"
                            onClick={stopRecording}
                            className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                          >
                            <Pause className="h-4 w-4" />
                          </button>
                        )}
                        {audioUrl && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                if (isPlaying) {
                                  audioRef.current?.pause();
                                } else {
                                  if (audioRef.current) {
                                    audioRef.current.play();
                                  } else {
                                    const audio = new Audio(audioUrl);
                                    audio.onended = () => setIsPlaying(false);
                                    audioRef.current = audio;
                                    audio.play();
                                  }
                                }
                                setIsPlaying(!isPlaying);
                              }}
                              className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200"
                              title={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
                            >
                              {isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (audioRef.current) {
                                  audioRef.current.pause();
                                  setIsPlaying(false);
                                }
                                setAudioUrl(null);
                              }}
                              className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200"
                              title="Excluir áudio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-blue-900/30">
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {answer.length}/127 caracteres
                      </div>
                      <button
                        type="submit"
                        disabled={!answer.trim() && !audioUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Send className="h-4 w-4" />
                        Enviar
                      </button>
                    </div>
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