import React, { useState, useEffect, useRef } from 'react';
import { Search, PlusCircle, Bell, User, Menu, Moon, Sun, Settings, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  gender?: string;
}

export function Header() {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [notifications] = useState(3);
  const [unreadCount, setUnreadCount] = useState(0);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
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
    checkAuth();

    // Inscrever para atualizações de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
    });

    // Inscrever para atualizações do perfil
    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          if (payload.new && payload.new.id === userProfile?.id) {
            setUserProfile(payload.new as UserProfile);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      profileSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && userProfile?.id) {
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
  }, [isAuthenticated, userProfile?.id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    if (session?.user) {
      fetchUserProfile(session.user.id);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, gender')
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setShowDropdown(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
    setHoverTimeout(timeout);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) clearTimeout(hoverTimeout);
    };
  }, [hoverTimeout]);

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40 fixed w-full top-0 z-10 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-4">
          <div className="flex items-center gap-6">
            <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all lg:hidden focus:outline-none focus:ring-2 focus:ring-primary/30">
              <Menu className="h-5 w-5" />
            </button>
            
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-primary/20 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute inset-0 bg-primary/30 rounded-xl -rotate-6 group-hover:-rotate-12 transition-transform duration-300" />
                <div className="relative h-full w-full bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold">
                  Q
                </div>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 text-transparent bg-clip-text group-hover:scale-105 transition-all duration-300">
                Rede Q&A
              </h1>
            </Link>
          </div>

          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors duration-300 ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <input
                type="text"
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
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Link 
                to="/perguntar" 
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Fazer Pergunta</span>
              </Link>
            )}

            <div className="flex items-center gap-2">
              <Link
                to="/mensagens"
                className="relative p-2 rounded-lg hover:bg-muted/80 transition-colors duration-200"
              >
                <MessageCircle className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-xs font-medium text-white bg-red-500 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>

              <button
                className="relative p-2 rounded-lg hover:bg-muted/80 transition-colors duration-200"
                onClick={() => {}}
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
            </div>

            <button 
              onClick={toggleDarkMode}
              className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDarkMode ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5 text-amber-500" />
              )}
            </button>

            {isAuthenticated ? (
              <div 
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                ref={dropdownRef}
              >
                <button
                  className="flex items-center gap-2 p-1.5 hover:bg-muted/50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <div className="relative h-8 w-8 rounded-xl overflow-hidden ring-2 ring-primary/20 transition-transform duration-300 hover:scale-105">
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
                  <span className="hidden md:inline-block font-medium">
                    Meu Perfil
                  </span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-card border border-border/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-border/50 bg-muted/30 backdrop-blur-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-xl overflow-hidden ring-2 ring-primary/20">
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
                          <p className="text-sm font-semibold truncate">
                            {userProfile?.full_name || 'Usuário'}
                          </p>
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
              <div className="flex items-center gap-2">
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
    </header>
  );
}