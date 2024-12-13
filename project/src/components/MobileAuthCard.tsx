import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';

export function MobileAuthCard() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Se não houver usuário, aguarda um pouco antes de mostrar o card
    const timer = setTimeout(() => {
      setVisible(!user);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  // Não mostra o card se houver usuário ou se ainda não passou o delay
  if (user || !visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:hidden">
      <div className="relative">
        {/* Gradiente de blur embaixo do card */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-background/0 backdrop-blur-sm -z-10" />
        
        {/* Card */}
        <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-lg">
          {/* Texto */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Junte-se à comunidade
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Faça perguntas por áudio, compartilhe conhecimento e conecte-se com outros usuários.
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Link
              to="/signup"
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-300 hover:shadow-md text-center"
            >
              Criar conta
            </Link>
            <Link
              to="/login"
              className="flex-1 bg-muted hover:bg-muted/80 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors text-center"
            >
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
