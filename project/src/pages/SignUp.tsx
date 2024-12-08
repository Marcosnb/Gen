import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft, UserPlus, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { signupRateLimiter } from '../utils/rateLimiter';
import { validateInput, sanitizeHtml } from '../utils/securityUtils';
import { validatePassword } from '../utils/passwordValidator';
import { logger } from '../utils/logger';

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
      // Verificar se o nome já existe
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('full_name', formData.name.trim())
        .single();

      if (existingUser) {
        throw new Error('Já existe um usuário com este nome. Por favor, escolha outro nome.');
      }

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // Validar entrada
      if (!validateInput(formData.email, 'email')) {
        throw new Error('Email inválido');
      }
      if (!validateInput(formData.name, 'username')) {
        throw new Error('Nome de usuário inválido. Use entre 3 e 20 caracteres, apenas letras, números, _ e -');
      }

      // Validar força da senha
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
      }

      // Verificar rate limit
      if (signupRateLimiter.isRateLimited(formData.email)) {
        throw new Error('Muitas tentativas de registro. Por favor, aguarde alguns minutos.');
      }

      // Sanitizar entradas
      const sanitizedName = sanitizeHtml(formData.name);
      const sanitizedEmail = sanitizeHtml(formData.email);

      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password: formData.password,
        options: {
          data: {
            full_name: sanitizedName,
            gender: formData.gender,
            avatar_url: avatar
          }
        }
      });

      if (authError) {
        logger.warn('Erro no registro', { email: sanitizedEmail, error: authError.message });
        
        if (authError.message.includes('Password should be at least')) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        } else if (authError.message.includes('Email already registered')) {
          throw new Error('Este email já está registrado');
        } else if (authError.message.includes('valid email')) {
          throw new Error('Por favor, insira um email válido');
        }
        throw new Error('Erro ao criar conta. Tente novamente.');
      }

      // 2. Se a conta foi criada com sucesso, salvar os dados adicionais do usuário
      if (authData.user) {
        // Gerar URL do avatar no momento do salvamento
        const seed = encodeURIComponent(sanitizedName);
        const gender = formData.gender === 'male' ? 'male' : 'female';
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&gender=${gender}`;

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              full_name: sanitizedName,
              email: sanitizedEmail,
              gender: formData.gender,
              avatar_url: avatarUrl,
              points: 0,
              is_admin: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            },
          ]);

        if (profileError) {
          logger.error('Erro ao criar perfil', { userId: authData.user.id, error: profileError });
        } else {
          logger.info('Registro bem-sucedido', { userId: authData.user.id });
        }

        // Resetar rate limit após sucesso
        signupRateLimiter.reset(formData.email);

        // 3. Redirecionar para a página inicial
        navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao criar sua conta. Tente novamente.');
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
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Crie sua conta
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Junte-se à nossa comunidade
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 pt-6">
            <div className="space-y-4">
              {/* Avatar Preview */}
              <div className="flex justify-center mb-4">
                {avatar ? (
                  <div className="relative group">
                    <img
                      src={avatar}
                      alt="Avatar"
                      className="w-28 h-28 rounded-2xl border-4 border-background shadow-lg transition-all group-hover:scale-105 group-hover:rotate-3"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs text-primary font-medium px-3 text-center">
                        Avatar gerado automaticamente
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-2xl border-4 border-background bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs text-center px-3">
                      Digite seu nome para gerar um avatar
                    </span>
                  </div>
                )}
              </div>

              {/* Nome */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-muted-foreground">
                  Nome
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    const fullName = e.target.value;
                    setFormData({ ...formData, name: fullName });
                    setError(null);
                  }}
                  maxLength={10}
                  className={`w-full px-4 py-3 rounded-xl bg-background/50 border focus:ring-2 transition-all outline-none ${
                    error?.includes('Já existe um usuário com este nome')
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-border/50 focus:border-primary/50 focus:ring-primary/20'
                  }`}
                  placeholder="Seu nome"
                  required
                />
                {error?.includes('Já existe um usuário com este nome') && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
                    Já existe um usuário com este nome
                  </p>
                )}
              </div>

              {/* Gênero */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Gênero</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`
                    flex items-center justify-center py-3 rounded-xl cursor-pointer transition-all
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
                    flex items-center justify-center py-3 rounded-xl cursor-pointer transition-all
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
              {error && !error.includes('Já existe um usuário com este nome') && (
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
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Ou</span>
                </div>
              </div>

              <Link 
                to="/login" 
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border/50 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-background/50 transition-all hover:scale-[0.98] active:scale-[0.97]"
              >
                <LogIn className="h-4 w-4" />
                Entrar com uma conta existente
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}