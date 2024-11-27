import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShieldCheck, ChevronRight, Cookie, ChevronUp } from 'lucide-react';

export function TermsNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Atrasa a exibição do card para uma melhor experiência
    const showTimeout = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(showTimeout);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    // Aguarda a animação terminar antes de remover o componente
    setTimeout(() => setIsVisible(false), 300);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Versão Mobile - Botão Flutuante */}
      <div className="md:hidden">
        <button
          onClick={toggleExpand}
          className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 ${isExpanded ? 'scale-95' : 'scale-100'}`}
        >
          <ShieldCheck className="h-5 w-5" />
          <span className="font-medium">Termos e Privacidade</span>
        </button>

        {/* Modal Mobile */}
        {isExpanded && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden">
            <div className="fixed inset-x-0 bottom-0 bg-card border-t border-border animate-slide-up">
              {/* Cabeçalho do Modal */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Termos e Privacidade</h3>
                </div>
                <button
                  onClick={toggleExpand}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Valorizamos sua privacidade. Ao usar nossa plataforma, você concorda com nossos termos e políticas.
                </p>

                <div className="space-y-2">
                  <Link 
                    to="/termos" 
                    className="flex items-center justify-between w-full p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    onClick={toggleExpand}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Termos de Uso</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                  
                  <Link 
                    to="/privacidade" 
                    className="flex items-center justify-between w-full p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                    onClick={toggleExpand}
                  >
                    <div className="flex items-center gap-2">
                      <Cookie className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Política de Privacidade</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </div>

                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Você pode ajustar suas preferências a qualquer momento nas{' '}
                    <Link 
                      to="/configuracoes"
                      onClick={toggleExpand}
                      className="text-primary hover:text-primary/90 hover:underline transition-colors"
                    >
                      configurações
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Versão Desktop - Card Original */}
      <div className="hidden md:block">
        <div 
          className={`fixed bottom-4 right-4 max-w-sm w-full transform transition-all duration-300 ease-in-out
            ${isClosing ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}
        >
          <div className="bg-card/95 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-border/50 relative">
            {/* Botão Fechar */}
            <button
              onClick={handleClose}
              className="absolute -top-2 -right-2 p-1.5 bg-background rounded-lg hover:bg-muted transition-colors duration-200 group shadow-sm border border-border/50"
              aria-label="Fechar aviso"
            >
              <X className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            {/* Ícone e Conteúdo */}
            <div className="space-y-4">
              {/* Cabeçalho */}
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Política de Privacidade</h3>
                  <p className="text-xs text-muted-foreground">Última atualização: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              {/* Mensagem Principal */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Valorizamos sua privacidade. Ao usar nossa plataforma, você concorda com nossos termos e políticas.
                </p>
                
                {/* Links */}
                <div className="space-y-2">
                  <Link 
                    to="/termos" 
                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Termos de Uso</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                  
                  <Link 
                    to="/privacidade" 
                    className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <Cookie className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Política de Privacidade</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                </div>
              </div>

              {/* Rodapé */}
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Você pode ajustar suas preferências de cookies e privacidade a qualquer momento nas{' '}
                  <Link 
                    to="/configuracoes" 
                    className="text-primary hover:text-primary/90 hover:underline transition-colors"
                  >
                    configurações
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
