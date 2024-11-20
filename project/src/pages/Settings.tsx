import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Settings as SettingsIcon, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  gender: string;
  email?: string;
}

export function Settings() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string>('');

  // Form state
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadUserAndProfile();
  }, []);

  const loadUserAndProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      setUser(user);
      setEmail(user.email || '');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      if (profile) {
        setProfile(profile);
        setFullName(profile.full_name || '');
        setGender(profile.gender || '');
        setCurrentAvatar(profile.avatar_url || generateNewAvatar());
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Não foi possível carregar suas informações');
    } finally {
      setLoading(false);
    }
  };

  const generateNewAvatar = () => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`;
  };

  const handleGenerateNewAvatar = () => {
    const newAvatar = generateNewAvatar();
    setCurrentAvatar(newAvatar);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Update email if changed
      if (email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });
        if (emailError) throw emailError;
      }

      // Update profile using the current avatar URL
      const { error: profileError } = await supabase.rpc('update_user_profile', {
        p_full_name: fullName,
        p_avatar_url: currentAvatar,
        p_gender: gender
      });

      if (profileError) throw profileError;

      setSuccess(true);
      await loadUserAndProfile();

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.message || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mt-16">
      <div className="bg-card border border-border rounded-lg shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Configurações do Perfil</h1>
          </div>
          <p className="mt-2 text-muted-foreground">
            Gerencie suas informações pessoais e preferências de conta
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-6 space-y-8">
          {/* Aviso sobre senha */}
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-5 w-5 flex-shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>
              Por motivos de segurança e normas da plataforma, não é possível alterar a senha através desta interface.
            </span>
          </div>

          {/* Seção do Avatar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-muted/40 rounded-lg">
            <img
              src={currentAvatar}
              alt="Avatar"
              className="h-24 w-24 rounded-full ring-2 ring-primary/20"
            />
            <div className="space-y-2">
              <h3 className="font-medium">Foto do Perfil</h3>
              <p className="text-sm text-muted-foreground">
                Esta foto será exibida em seu perfil e em suas perguntas
              </p>
              <button
                type="button"
                onClick={handleGenerateNewAvatar}
                className="btn-secondary text-sm"
              >
                Gerar Novo Avatar
              </button>
            </div>
          </div>

          {/* Seção de Informações Pessoais */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium leading-6">Informações Pessoais</h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium">
                  Nome Completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input w-full"
                  placeholder="Seu nome completo"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Este é o nome que será exibido para outros usuários
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input w-full"
                  placeholder="seu@email.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Usado para login e notificações
                </p>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  Gênero
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Prefiro não informar</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                  <option value="other">Outro</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  Esta informação é opcional
                </p>
              </div>
            </div>
          </div>

          {/* Mensagens de Feedback */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-4 bg-green-500/10 text-green-500 rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
              <p>Perfil atualizado com sucesso!</p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-border">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/')}
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
