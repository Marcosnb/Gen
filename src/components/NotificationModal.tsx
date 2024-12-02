import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  created_at: string;
  question_id: string;
  question_title: string;
  answer_id: string;
  read: boolean;
  type: string;
}

interface NotificationModalProps {
  show: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  userId: string;
}

export function NotificationModal({ show, onMouseEnter, onMouseLeave, userId }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (show && userId) {
      fetchNotifications();
      subscribeToNotifications();
    }
  }, [show, userId]);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro ao buscar notificações:', error);
      return;
    }

    setNotifications(data || []);
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Marca a notificação como lida
    if (!notification.read) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification.id);
    }
  };

  if (!show) return null;

  return (
    <div 
      className="absolute right-0 mt-2 w-96 rounded-xl shadow-lg bg-card border border-border/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="p-4 border-b border-border/50 bg-muted/30 backdrop-blur-sm">
        <h2 className="text-lg font-semibold">Notificações</h2>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            Nenhuma notificação no momento
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                {notification.type === 'follow' ? (
                  <p className="text-sm mb-1">
                    {notification.question_title}
                  </p>
                ) : (
                  <p className="text-sm mb-1">
                    Nova resposta em: <span className="font-medium">{notification.question_title}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
