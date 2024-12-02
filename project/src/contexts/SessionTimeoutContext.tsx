import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos em milissegundos

type SessionTimeoutContextType = {
  resetTimeout: () => void;
};

const SessionTimeoutContext = createContext<SessionTimeoutContextType | undefined>(undefined);

export function SessionTimeoutProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const resetTimeout = () => {
    setLastActivity(Date.now());
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkInactivity = async () => {
      const inactiveTime = Date.now() - lastActivity;
      
      if (inactiveTime >= SESSION_TIMEOUT) {
        // Fazer logout
        await supabase.auth.signOut();
        navigate('/login');
      } else {
        // Agendar próxima verificação
        timeoutId = setTimeout(checkInactivity, Math.min(60000, SESSION_TIMEOUT - inactiveTime));
      }
    };

    // Eventos para resetar o timeout
    const handleActivity = () => {
      resetTimeout();
    };

    // Adicionar listeners para eventos de atividade
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Iniciar verificação
    timeoutId = setTimeout(checkInactivity, SESSION_TIMEOUT);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [lastActivity, navigate]);

  return (
    <SessionTimeoutContext.Provider value={{ resetTimeout }}>
      {children}
    </SessionTimeoutContext.Provider>
  );
}

export const useSessionTimeout = () => {
  const context = useContext(SessionTimeoutContext);
  if (context === undefined) {
    throw new Error('useSessionTimeout must be used within a SessionTimeoutProvider');
  }
  return context;
};
