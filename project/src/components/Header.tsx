import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Bell, User, Menu, Moon, Sun, Settings } from 'lucide-react';
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
    setShowDropdown(false);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <header className="bg-background border-b border-border fixed w-full top-0 z-10 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <button className="p-2 -ml-2 text-muted-foreground hover:text-foreground lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 text-transparent bg-clip-text">
              Rede Q&A
            </h1>
          </div>

          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <input
                type="text"
                placeholder="Pesquisar perguntas..."
                className="input pl-10 pr-3 py-2.5"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-sm">⌘K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <Link to="/perguntar" className="btn-primary">
                <PlusCircle className="h-5 w-5 mr-2" />
                Fazer Pergunta
              </Link>
            )}

            <div className="relative">
              <button className="p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background rounded-lg">
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center transform -translate-y-1 translate-x-1">
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            <button 
              onClick={toggleDarkMode}
              className="p-2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-background rounded-lg
              transition-all duration-300 ease-in-out transform hover:rotate-12"
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            >
              {isDarkMode ? (
                <Moon className="h-6 w-6" />
              ) : (
                <Sun className="h-6 w-6 text-amber-500" />
              )}
            </button>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 hover:opacity-80"
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt={userProfile.full_name || 'Avatar'}
                        className="h-full w-full object-cover"
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
                  </div>
                  <span className="hidden md:inline-block">Meu Perfil</span>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => setShowDropdown(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Meu Perfil
                      </Link>
                      <Link
                        to="/configuracoes"
                        className="flex items-center px-4 py-2 text-sm hover:bg-accent"
                        onClick={() => setShowDropdown(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Configurações
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-destructive hover:bg-accent"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      
      {/* Barra de pesquisa mobile */}
      <div className="p-3 bg-background border-t border-border md:hidden">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Pesquisar perguntas..."
            className="input pl-10"
          />
        </div>
      </div>
    </header>
  );
}