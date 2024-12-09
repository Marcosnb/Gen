import React, { useState, useEffect, useRef } from 'react';
import { Search, PlusCircle, Bell, User, Menu, Moon, Sun, Settings, MessageCircle, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { NotificationModal } from './NotificationModal';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  gender?: string;
  is_admin: boolean;
}

export function Header() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationHoverTimeout, setNotificationHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const { user, loading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const hasThemeSaved = localStorage.getItem('theme') !== null;
      if (!hasThemeSaved) {
        setIsDarkMode(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id);
    } else {
      setUserProfile(null);
    }
  }, [user]);

  useEffect(() => {
    if (user && userProfile?.id) {
      // Buscar contagem inicial de mensagens não lidas
      fetchUnreadCount();

      // Inscrever para atualizações em tempo real
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Escuta todos os eventos (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'messages',
            filter: `to_user_id=eq.${userProfile.id}`
          },
          (payload) => {
            console.log('Mudança detectada:', payload);
            // Atualiza a contagem sempre que houver qualquer mudança
            fetchUnreadCount();
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    }
  }, [user, userProfile?.id]);

  useEffect(() => {
    if (user) {
      fetchNotificationUnreadCount();
      subscribeToNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
      }
    };

    loadProfile();

    // Inscrever para mudanças no perfil
    const profileChannel = supabase.channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          setUserProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      profileChannel.unsubscribe();
    };
  }, [user]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, gender, is_admin')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      if (profile) {
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const fetchUnreadCount = async () => {
    if (!userProfile?.id) return;

    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', userProfile.id)
      .is('read_at', null);

    if (error) {
      console.error('Erro ao buscar mensagens não lidas:', error);
      return;
    }

    setUnreadCount(count || 0);
  };

  const fetchNotificationUnreadCount = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('read', false);
    
    setNotificationUnreadCount(count || 0);
  };

  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user?.id}`
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setShowDropdown(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleMouseEnter = async (type: 'notifications' | 'profile') => {
    if (type === 'notifications') {
      if (notificationHoverTimeout) clearTimeout(notificationHoverTimeout);
      setShowNotifications(true);
      // Marca todas as notificações como lidas
      if (notificationUnreadCount > 0) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user?.id)
          .eq('read', false);
        setNotificationUnreadCount(0);
      }
    } else {
      if (hoverTimeout) clearTimeout(hoverTimeout);
      setShowDropdown(true);
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (notificationHoverTimeout) clearTimeout(notificationHoverTimeout);
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [notificationHoverTimeout, hoverTimeout]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 fixed w-full top-0 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between md:justify-start items-center h-16 py-2">
          <div className={`flex items-center gap-6 ${!user ? "flex-1 justify-center md:justify-start" : ""}`}>
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo-feedelize-menu.svg"
                alt="Feedelize Logo"
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-105 [filter:brightness(0)_saturate(100%)_invert(31%)_sepia(98%)_saturate(1000%)_hue-rotate(211deg)_brightness(97%)_contrast(107%)]"
              />
            </Link>
          </div>

          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors duration-300 ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar perguntas..."
                className="w-full pl-10 pr-12 py-2.5 bg-muted/50 hover:bg-muted/70 focus:bg-background border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all duration-300"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="hidden sm:flex px-2 py-1 bg-muted/80 text-muted-foreground rounded-lg text-xs font-medium items-center gap-1">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <>

                <Link 
                  to="/perguntar" 
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span>Fazer Pergunta</span>
                </Link>

                <div className="flex items-center gap-2">
                  <Link
                    to="/mensagens"
                    className="relative p-2 rounded-lg hover:bg-muted/80 transition-colors duration-200"
                  >
                    <img 
                      src="/mensagem.svg" 
                      alt="Mensagens" 
                      className="h-5 w-5 invert-0 dark:invert opacity-70 hover:opacity-100 transition-opacity" 
                    />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-medium text-white bg-red-500 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <div 
                    className="relative"
                    onMouseEnter={() => handleMouseEnter('notifications')}

                    onMouseLeave={() => {
                      const timeout = setTimeout(() => {
                        setShowNotifications(false);
                      }, 200);
                      setNotificationHoverTimeout(timeout);
                    }}
                    ref={notificationRef}
                  >
                    <button
                      className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <img 
                        src="/notificacao.svg" 
                        alt="Notificações" 
                        className="h-5 w-5 invert-0 dark:invert opacity-70 hover:opacity-100 transition-opacity" 
                      />
                      {notificationUnreadCount > 0 && (
                        <span className="absolute top-0 right-0 -mt-1 -mr-1 px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                          {notificationUnreadCount}
                        </span>
                      )}
                    </button>

                    <NotificationModal
                      show={showNotifications}
                      onMouseEnter={() => {
                        if (notificationHoverTimeout) clearTimeout(notificationHoverTimeout);
                      }}
                      onMouseLeave={() => {
                        const timeout = setTimeout(() => {
                          setShowNotifications(false);
                        }, 200);
                        setNotificationHoverTimeout(timeout);
                      }}
                      userId={user?.id || ''}
                    />
                  </div>

                  <button 
                    onClick={toggleDarkMode}
                    className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
                  >
                    {isDarkMode ? (
                      <Moon className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Sun className="h-5 w-5 text-amber-500" />
                    )}
                  </button>
                </div>
              </>

            )}

            {user ? (
              <div 
                className="relative"
                onMouseEnter={() => handleMouseEnter('profile')}

                onMouseLeave={handleMouseLeave}
                ref={dropdownRef}
              >
                <button
                  className="flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 rounded-full blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                    <div className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800 shadow-lg transition-transform duration-300 hover:scale-105">
                      {userProfile?.avatar_url ? (
                        <img
                          src={userProfile.avatar_url}
                          alt={userProfile.full_name || 'Avatar'}


                          className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.id}`;
                          }}
                        />
                      ) : (
                        <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
                    </div>
                  </div>
                  <span className="hidden md:inline-block font-medium">
                    Meu Perfil
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-card border border-border/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border/50 bg-muted/30 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-800">
                          {userProfile?.avatar_url ? (
                            <img
                              src={userProfile.avatar_url}
                              alt={userProfile.full_name || 'Avatar'}


                              className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                            />
                          ) : (
                            <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">
                              {userProfile?.full_name || 'Usuário'}
                            </p>
                            {userProfile?.is_admin && (
                              <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-red-500/10 text-red-500 rounded-md">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            Minha Conta
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/50 rounded-lg transition-all duration-300 group"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Meu Perfil</p>
                          <p className="text-xs text-muted-foreground">Visualize e edite seu perfil</p>
                        </div>
                      </Link>

                      <Link
                        to="/configuracoes"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/50 rounded-lg transition-all duration-300 mt-1 group"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                          <Settings className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Configurações</p>
                          <p className="text-xs text-muted-foreground">Personalize sua experiência</p>
                        </div>
                      </Link>

                      <Link
                        to="/privacy"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/50 rounded-lg transition-all duration-300 mt-1 group"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-110">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Termos e Privacidade</p>
                          <p className="text-xs text-muted-foreground">Leia sobre nossas políticas de privacidade</p>
                        </div>
                      </Link>

                      <div className="px-2 my-2">
                        <div className="h-px bg-border/50" />
                      </div>

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-300 group"
                      >
                        <div className="h-9 w-9 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive transition-transform duration-300 group-hover:scale-110">
                          <LogOut className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Sair</p>
                          <p className="text-xs opacity-70">Encerrar sessão atual</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-muted/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </Link>
                <Link
                  to="/signup"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Criar conta</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        userId={user?.id || ''}
      />
    </header>
  );
}