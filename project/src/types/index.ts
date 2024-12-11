export interface User {
  id: string;
  email?: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  tags: string[];
  views: number;
  is_anonymous: boolean;
  audio_url?: string;
  likes_count: number;
  answers_count: number;
  answer_count?: number;
  is_following?: boolean;
  user?: User;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface Answer {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  question_id: string;
  likes_count: number;
  user?: User;
  profiles?: {
    full_name: string;
    avatar_url: string;
  };
}

export interface Tag {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  questions_count?: number;
}

export interface QuestionLike {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}

export interface AnswerLike {
  id: string;
  user_id: string;
  answer_id: string;
  created_at: string;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}
