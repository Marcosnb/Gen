import { AlertCircle, Coins, X, TrendingUp, MessageCircle, ThumbsUp } from 'lucide-react';

interface InsufficientCoinsAlertProps {
  requiredCoins: number;
  currentCoins: number;
  onClose: () => void;
}

export function InsufficientCoinsAlert({ requiredCoins, currentCoins, onClose }: InsufficientCoinsAlertProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 text-destructive mb-6">
          <div className="p-2 bg-destructive/10 rounded-full">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold">Moedas Insuficientes</h3>
        </div>

        {/* Coin Status */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Necessário</span>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Coins className="h-5 w-5" />
              <span className="text-lg font-bold">{requiredCoins}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Seu saldo</span>
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Coins className="h-5 w-5" />
              <span className="text-lg font-bold">{currentCoins}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="h-2 bg-amber-200/50 dark:bg-amber-900/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 dark:bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((currentCoins / requiredCoins) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-amber-700/70 dark:text-amber-400/70 mt-2">
              Você precisa de mais {requiredCoins - currentCoins} moedas
            </p>
          </div>
        </div>

        {/* How to Earn Coins */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Como ganhar mais moedas
          </h4>
          
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Faça perguntas relevantes</h5>
                <p className="text-xs text-muted-foreground">
                  Perguntas bem elaboradas e úteis para a comunidade
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <MessageCircle className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Responda perguntas</h5>
                <p className="text-xs text-muted-foreground">
                  Ajude outros usuários com respostas detalhadas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="p-2 bg-primary/10 rounded-full">
                <ThumbsUp className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Receba curtidas</h5>
                <p className="text-xs text-muted-foreground">
                  Suas contribuições são valorizadas pela comunidade
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Fechar
        </button>
      </div>
    </div>
  );
}
