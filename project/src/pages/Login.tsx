import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loginRateLimiter } from '../utils/rateLimiter';
import { validateInput, sanitizeHtml } from '../utils/securityUtils';
import { logger } from '../utils/logger';

interface FormData {
  email: string;
  password: string;
}

export function Login() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validar entrada
      if (!validateInput(formData.email, 'email')) {
        throw new Error('Email inválido');
      }

      // Verificar rate limit
      if (loginRateLimiter.isRateLimited(formData.email)) {
        throw new Error('Muitas tentativas de login. Por favor, aguarde alguns minutos.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: sanitizeHtml(formData.email),
        password: formData.password,
      });

      if (signInError) {
        logger.warn('Falha no login', { email: formData.email, error: signInError.message });
        
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos');
        } else if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Por favor, confirme seu email antes de fazer login');
        }
        throw signInError;
      }

      // Se o login for bem-sucedido, resetar o rate limit
      loginRateLimiter.reset(formData.email);
      logger.info('Login bem-sucedido', { userId: data.user?.id });

      if (data.user) {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card rounded-2xl border border-border/40 shadow-2xl shadow-primary/5 backdrop-blur-lg overflow-hidden">
          {/* Card Header com Ícone */}
          <div className="p-8 pb-0 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 transform hover:scale-105 transition-transform duration-300">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Bem-vindo de volta!
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Entre com sua conta para continuar
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-8 pt-6">
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-background/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mostrar erro se houver */}
              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Botão de submit */}
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[0.98] active:scale-[0.97]'
                }`}
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />Entrando...</>
                ) : (
                  <><LogIn className="h-4 w-4" />Entrar</>
                )}
              </button>

              {/* Link para criar conta */}
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Link 
                to="/signup" 
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all hover:scale-[0.98] active:scale-[0.97]"
              >
                <UserPlus className="h-4 w-4" />
                Criar nova conta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}