import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Settings as SettingsIcon, Loader2, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { InsufficientCoinsAlert } from '../components/InsufficientCoinsAlert';

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
  const [showInsufficientCoinsAlert, setShowInsufficientCoinsAlert] = useState(false);
  const [userCoins, setUserCoins] = useState(0);

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
      // Verificar moedas do usuário
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('points, is_admin')
        .eq('id', user?.id)
        .single();

      if (!currentProfile?.is_admin && currentProfile.points < 4) {
        setUserCoins(currentProfile.points);
        setShowInsufficientCoinsAlert(true);
        return;
      }

      // Verificar se o novo nome já existe (exceto para o usuário atual)
      if (fullName !== profile?.full_name) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('id')
          .eq('full_name', fullName)
          .neq('id', user?.id)
          .single();

        if (existingUser) {
          throw new Error('Já existe um usuário com este nome. Por favor, escolha outro nome.');
        }

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }
      }

      // Update email if changed
      if (email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: email,
        });
        if (emailError) throw emailError;
      }

      // Descontar moedas se não for admin
      if (!currentProfile?.is_admin) {
        const { error: pointsError } = await supabase
          .from('profiles')
          .update({ points: currentProfile.points - 4 })
          .eq('id', user?.id);

        if (pointsError) {
          throw new Error('Erro ao descontar moedas');
        }
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
    <>
      {/* Alerta de moedas insuficientes */}
      {showInsufficientCoinsAlert && (
        <InsufficientCoinsAlert
          requiredCoins={4}
          currentCoins={userCoins}
          onClose={() => setShowInsufficientCoinsAlert(false)}
        />
      )}

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
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-200/60 dark:border-blue-500/30 rounded-lg text-sm text-blue-800 dark:text-blue-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5 flex-shrink-0 text-blue-500 dark:text-blue-400"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm"
                >
                  <RefreshCw className="h-4 w-4" />
                  Gerar Novo Avatar
                </button>
              </div>
            </div>

            {/* Seção de Informações Pessoais */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium leading-6">Informações Pessoais</h3>
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor="fullName" className="text-sm font-medium">
                      Nome
                    </label>
                    {error?.includes('Já existe um usuário com este nome') && (
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                        <p className="text-xs text-red-500">
                          Já existe um usuário com este nome
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      const fullName = e.target.value;
                      setFullName(fullName);
                      setError(null);
                    }}
                    maxLength={10}
                    className={`input w-full ${error?.includes('Já existe um usuário com este nome') ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                    placeholder="Seu nome"
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
                    className="w-full px-4 py-2.5 bg-background text-foreground border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200"
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
            {error && !error.includes('Já existe um usuário com este nome') && (
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
            <div className="mt-6 flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E40AF] hover:bg-[#1E3A8A] text-white font-medium rounded-lg shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 text-sm"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Salvar alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
