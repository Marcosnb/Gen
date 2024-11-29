import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type OnlineStatusContextType = {
  onlineUsers: { [key: string]: boolean };
  isUserOnline: (userId: string) => boolean;
};

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<{ [key: string]: boolean }>({});
  const [session, setSession] = useState<any>(null);

  // Gerencia a sessão do usuário
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Gerencia status online/offline
  useEffect(() => {
    if (!session?.user?.id) {
      setOnlineUsers({});
      return;
    }

    let isSubscribed = true;

    // Atualiza status no Supabase
    const updateStatus = async (isOnline: boolean) => {
      if (!session?.user?.id || !isSubscribed) return;

      try {
        const { error } = await supabase
          .from('user_status')
          .upsert({
            user_id: session.user.id,
            is_online: isOnline,
            last_seen: new Date().toISOString()
          });

        if (error) {
          console.error('Erro ao atualizar status:', error);
        }
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
      }
    };

    // Busca status inicial de todos os usuários
    const fetchInitialStatus = async () => {
      if (!isSubscribed) return;

      try {
        const { data, error } = await supabase
          .from('user_status')
          .select('user_id, is_online');
        
        if (error) throw error;

        if (data && isSubscribed) {
          const statusMap = data.reduce((acc, status) => ({
            ...acc,
            [status.user_id]: status.is_online
          }), {});
          setOnlineUsers(statusMap);
        }
      } catch (error) {
        console.error('Erro ao buscar status inicial:', error);
      }
    };

    // Configura o canal de realtime
    const channel = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_status'
        },
        (payload) => {
          if (!isSubscribed) return;
          const { new: newStatus } = payload;
          setOnlineUsers(prev => ({
            ...prev,
            [newStatus.user_id]: newStatus.is_online
          }));
        }
      )
      .subscribe();

    // Inicializa o status
    const initialize = async () => {
      await updateStatus(true);
      await fetchInitialStatus();
    };

    initialize();

    // Mantém status online com heartbeat
    const heartbeat = setInterval(() => {
      updateStatus(true);
    }, 30000);

    // Eventos de visibilidade da página
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === 'visible';
      updateStatus(isVisible);
    };

    // Eventos de saída
    const handleBeforeUnload = () => {
      updateStatus(false);
    };

    // Adiciona event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    // Cleanup
    return () => {
      isSubscribed = false;
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      channel.unsubscribe();
      updateStatus(false);
    };
  }, [session]);

  const isUserOnline = (userId: string) => {
    return onlineUsers[userId] || false;
  };

  return (
    <OnlineStatusContext.Provider value={{ onlineUsers, isUserOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export const useOnlineStatus = () => {
  const context = useContext(OnlineStatusContext);
  if (context === undefined) {
    throw new Error('useOnlineStatus must be used within a OnlineStatusProvider');
  }
  return context;
};
