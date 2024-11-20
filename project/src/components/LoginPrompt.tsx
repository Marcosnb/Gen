import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPromptProps {
  isVisible: boolean;
  onClose: () => void;
}

export function LoginPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verifica o estado inicial da autenticação
    checkAuth();

    // Inscreve-se para mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    // Mostra o prompt após 3 segundos se não estiver autenticado
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    // Cleanup
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  if (isAuthenticated || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-card rounded-lg border border-border shadow-lg p-4 animate-slide-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium">
            Faça login para interagir
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Para fazer perguntas e interagir com a comunidade, você precisa ter uma conta.
          </p>
          <div className="mt-3 flex gap-3">
            <Link
              to="/login"
              className="btn-primary text-sm py-1.5 px-3"
            >
              Fazer login
            </Link>
            <Link
              to="/signup"
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Criar conta
            </Link>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
          aria-label="Fechar"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}