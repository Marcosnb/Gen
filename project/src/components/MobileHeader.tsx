import React, { useState, useRef, useEffect } from 'react';
import { Search, Menu, Moon, Sun, MessageCircle, User, Settings, ShieldCheck, LogOut, PlusCircle, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MobileNotificationModal } from './MobileNotificationModal';
import { supabase } from '../lib/supabase';

export function MobileHeader() {
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme ? savedTheme === 'dark' : prefersDark;
    }
    return false;
  });

  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchNotificationUnreadCount();
      fetchUnreadMessagesCount();
      subscribeToNotifications();
      subscribeToMessages();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setUserProfile(profile);
  };

  const fetchNotificationUnreadCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    
    setUnreadCount(count || 0);
  };

  const fetchUnreadMessagesCount = async () => {
    if (!user) return;
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', user.id)
      .is('read_at', null);
    
    setUnreadMessagesCount(count || 0);
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchNotificationUnreadCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `to_user_id=eq.${user.id}`
        },
        () => {
          fetchUnreadMessagesCount();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setShowDropdown(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    const newTheme = !isDarkMode ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <MobileNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />

      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo-feedelize-menu.svg"
              alt="Feedelize Logo"
              className="h-6 w-auto transition-transform duration-300 dark:invert"
            />
          </Link>

          {/* Ações */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                {/* Fazer Pergunta */}
                <Link to="/perguntar" className="p-2 hover:bg-muted/50 rounded-lg">
                  <PlusCircle className="h-5 w-5 text-blue-500" />
                </Link>

                {/* Mensagens */}
                <Link to="/mensagens" className="p-2 hover:bg-muted/50 rounded-lg relative">
                  <img 
                    src="/mensagem.svg" 
                    alt="Mensagens" 
                    className="h-5 w-5 invert-0 dark:invert opacity-70" 
                  />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>

                {/* Notificações */}
                <button
                  onClick={() => setIsNotificationModalOpen(true)}
                  className="p-2 hover:bg-muted/50 rounded-lg relative"
                >
                  <img 
                    src="/notificacao.svg" 
                    alt="Notificações" 
                    className="h-5 w-5 invert-0 dark:invert opacity-70" 
                  />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Alternar tema */}
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-muted/50 rounded-lg"
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDarkMode ? (
                <Moon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-amber-500" />
              )}
            </button>

            {user && (
              /* Menu do usuário */
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 hover:bg-muted/50 rounded-lg"
                >
                  <Menu className="h-5 w-5 text-muted-foreground" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="h-4 w-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        to="/configuracoes"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Configurações
                      </Link>
                      {userProfile?.is_admin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md"
                          onClick={() => setShowDropdown(false)}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          Admin
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted rounded-md w-full text-left text-red-500"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
