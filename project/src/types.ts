// Interface para o perfil de usuário do Supabase
interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

// Interface para uma resposta do Supabase
interface Answer {
  id: string;
  content: string;
  user_id: string;
  question_id: string;
  created_at: string;
  is_accepted: boolean;
  upvotes: number;
  is_anonymous?: boolean;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

// Interface para uma pergunta do Supabase
interface Question {
  id: string;
  title: string;
  content: string;
  user_id: string;
  created_at: string;
  tags: string[];
  views: number;
  upvotes: number;
  is_answered: boolean;
  answer_count: number;
  audio_url?: string;
  is_anonymous?: boolean;
  is_followers_only?: boolean;
  profiles: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

export type { Profile, Answer, Question };