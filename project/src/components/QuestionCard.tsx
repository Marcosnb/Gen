import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Flame, Eye, ChevronDown, Send, Tag, ArrowBigUp } from 'lucide-react';
import { useState } from 'react';
import type { Question } from '../types';
import { supabase } from '../lib/supabase';

interface QuestionCardProps {
  question: Question;
  onClick?: () => void;
}

export function QuestionCard({ question, onClick }: QuestionCardProps) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(question.upvotes);

  const handleAccordionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAccordionOpen(!isAccordionOpen);
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;

    try {
      const { error } = await supabase.rpc('answer_question', {
        p_question_id: question.id,
        p_content: answer.trim(),
      });

      if (error) throw error;

      setAnswer('');
      setIsAccordionOpen(false);
      // TODO: Refresh answers
    } catch (error) {
      console.error('Error submitting answer:', error);
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
      className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 overflow-hidden"
    >
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-blue-50/20 dark:from-blue-900/10 dark:to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="relative grid grid-cols-[auto_1fr] gap-6 p-6">
        {/* Voting and Interaction Column */}
        <div className="flex flex-col items-center gap-4">
          {/* Upvote Button with Advanced Interaction */}
          <div className="flex flex-col items-center">
            <button
              onClick={handleUpvote}
              className={`group/upvote p-2 rounded-lg transition-all duration-300 ${
                isUpvoted 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-500 dark:text-gray-400 hover:text-blue-500'
              }`}
            >
              <Flame 
                className={`h-6 w-6 transition-transform duration-300 ${
                  isUpvoted 
                    ? 'scale-110 fill-blue-100 dark:fill-blue-900/50' 
                    : 'group-hover/upvote:scale-110'
                }`} 
              />
            </button>
            <span className={`text-sm font-semibold mt-1 ${
              isUpvoted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'
            }`}>
              {upvotes}
            </span>
          </div>

          {/* Stats Icons */}
          <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
            <div className="flex flex-col items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              <MessageCircle className="h-5 w-5 opacity-70 group-hover:opacity-100" />
              <span className="text-xs mt-1">{question.answer_count || 0}</span>
            </div>
            <div className="flex flex-col items-center hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
              <Eye className="h-5 w-5 opacity-70 group-hover:opacity-100" />
              <span className="text-xs mt-1">{question.views}</span>
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
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-100 dark:ring-blue-900/30"
                />
                {question.is_answered && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-md">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
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

          {/* Question Content */}
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
              {question.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
              {question.content}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {question.tags?.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium transition-all hover:scale-105"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Answer Section */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleAccordionClick}
              className="flex items-center justify-between w-full px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Responder</span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-300 ${
                  isAccordionOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Answer Form */}
            {isAccordionOpen && (
              <div 
                className="mt-4 animate-in slide-in-from-top duration-300"
                onClick={e => e.stopPropagation()}
              >
                <form onSubmit={handleAnswerSubmit} className="space-y-4">
                  <textarea
                    value={answer}
                    onChange={e => setAnswer(e.target.value)}
                    placeholder="Digite sua resposta..."
                    rows={3}
                    className="w-full bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none transition-all duration-300 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Suporta markdown
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsAccordionOpen(false)}
                        className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!answer.trim()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-50"
                      >
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