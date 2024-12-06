import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
  id: string;
  created_at: string;
  question_id: string;
  question_title: string;
  answer_id: string;
  read: boolean;
  type: string;
}

interface MobileNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNotificationModal({ isOpen, onClose }: MobileNotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [isOpen, user]);

  const fetchNotifications = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return;
    }

    setNotifications(data || []);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);
    }

    navigate(`/pergunta/${notification.question_id}#answer-${notification.answer_id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-x-0 top-[56px] z-50 h-[calc(100vh-56px)] border-t bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Notificações</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          {notifications.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhuma notificação no momento
            </p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`cursor-pointer rounded-lg p-4 transition-colors ${
                  notification.read ? 'bg-muted/50' : 'bg-muted'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <p className="text-sm">
                    {notification.type === 'answer'
                      ? 'Nova resposta em:'
                      : notification.type === 'comment'
                      ? 'Novo comentário em:'
                      : 'Nova atividade em:'}
                  </p>
                  <p className="font-medium">{notification.question_title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
