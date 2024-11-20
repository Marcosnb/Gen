import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) throw signInError;

      // Se o login for bem-sucedido, redirecionar para a página inicial
      if (data.user) {
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-xl border border-border/40 shadow-2xl shadow-primary/5 backdrop-blur-lg">
          {/* Card Header com Ícone */}
          <div className="p-6 pb-0 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <LogIn className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Bem-vindo de volta!
            </h1>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Entre para continuar na comunidade
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="p-6 pt-2">
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  E-mail
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-background/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>

              {/* Senha */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                    Senha
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg bg-background/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Botão de submit */}
              <button 
                type="submit" 
                disabled={loading}
                className={`w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors mt-6 flex items-center justify-center gap-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Entrando...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Entrar
                  </>
                )}
              </button>

              {/* Link para criar conta */}
              <p className="text-sm text-center text-muted-foreground mt-6">
                Não tem uma conta?{' '}
                <Link to="/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Criar conta
                </Link>
              </p>
            </div>
          </form>

          {/* Botão voltar */}
          <div className="p-6 pt-0 text-center border-t border-border/40">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}