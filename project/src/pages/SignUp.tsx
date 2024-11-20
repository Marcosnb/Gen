import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FormData {
  name: string;
  email: string;
  password: string;
  gender: 'male' | 'female';
}

export function SignUp() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    gender: 'male',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Gera um avatar baseado no nome e gênero
  useEffect(() => {
    if (formData.name) {
      const seed = encodeURIComponent(formData.name);
      const gender = formData.gender === 'male' ? 'male' : 'female';
      const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=${gender}`;
      setAvatar(avatarUrl);
    }
  }, [formData.name, formData.gender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // 2. Se a conta foi criada com sucesso, salvar os dados adicionais do usuário
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: formData.name,
              gender: formData.gender,
              avatar_url: avatar,
              points: 1000,
              is_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
          ]);

        if (profileError) {
          console.error('Erro ao criar perfil:', profileError);
          throw profileError;
        }

        // 3. Redirecionar para a página inicial
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
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
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Crie sua conta
            </h1>
            <p className="text-sm text-muted-foreground mt-2 mb-6">
              Junte-se à nossa comunidade de perguntas e respostas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-2">
            <div className="space-y-4">
              {/* Avatar Preview */}
              <div className="flex justify-center mb-6">
                {avatar ? (
                  <div className="relative group">
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full border-4 border-background shadow-lg transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-primary font-medium">
                        Avatar gerado automaticamente
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-background bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm text-center px-4">
                      Digite seu nome para gerar um avatar
                    </span>
                  </div>
                )}
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                  Nome completo
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-background/50 border border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Gênero */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`
                    flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all
                    ${formData.gender === 'male' 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'border border-border/50 hover:border-primary/30 hover:bg-primary/5'}
                  `}>
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">
                      Masculino
                    </span>
                  </label>
                  <label className={`
                    flex items-center justify-center p-3 rounded-lg cursor-pointer transition-all
                    ${formData.gender === 'female' 
                      ? 'bg-primary/10 border-primary text-primary' 
                      : 'border border-border/50 hover:border-primary/30 hover:bg-primary/5'}
                  `}>
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">
                      Feminino
                    </span>
                  </label>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                  E-mail
                </label>
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
                    Criando conta...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Criar conta
                  </>
                )}
              </button>

              {/* Link para login */}
              <p className="text-sm text-center text-muted-foreground mt-6">
                Já tem uma conta?{' '}
                <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  Fazer login
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