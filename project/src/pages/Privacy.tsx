import { ArrowLeft, Shield, Database, Lock, Share2, UserCheck, Cookie, RefreshCw, Eye, UserCog } from "lucide-react";
import { Link } from "react-router-dom";

export function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Hero Section */}
        <div className="relative mb-8 sm:mb-12">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Home</span>
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                  Política de Privacidade
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground">
                  Última atualização: {new Date().toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium shadow-sm hover:bg-primary/15 transition-colors">
                <Shield className="h-4 w-4" />
                <span>Documento Oficial</span>
              </div>
            </div>
          </div>
          
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-border/0 via-border to-border/0"></div>
        </div>

        {/* Conteúdo */}
        <div className="grid gap-6 sm:gap-8">
          {/* Seção 1 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Eye className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">1. Informações que Coletamos</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Coletamos informações que você nos fornece diretamente ao usar nossa plataforma, incluindo dados de registro, conteúdo publicado e interações com outros usuários.
              </p>
            </div>
          </section>

          {/* Seção 2 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Database className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">2. Como Usamos suas Informações</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Utilizamos suas informações para os seguintes propósitos:
              </p>
              <ul className="grid gap-3 text-muted-foreground list-none pl-0">
                {[
                  'Fornecer, manter e melhorar nossos serviços',
                  'Personalizar sua experiência na plataforma',
                  'Comunicar-nos com você sobre atualizações e novidades',
                  'Detectar e prevenir atividades fraudulentas'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Seção 3 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Share2 className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">3. Compartilhamento de Informações</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Não vendemos suas informações pessoais. Compartilhamos suas informações apenas quando necessário para fornecer os serviços ou quando exigido por lei.
              </p>
            </div>
          </section>

          {/* Seção 4 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">4. Segurança dos Dados</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração ou destruição.
              </p>
            </div>
          </section>

          {/* Seção 5 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Cookie className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">5. Cookies e Tecnologias Similares</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, entender como você usa nossos serviços e personalizar nosso conteúdo.
              </p>
            </div>
          </section>

          {/* Seção 6 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <UserCog className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">6. Seus Direitos</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Você tem direito a acessar, corrigir ou excluir suas informações pessoais. Entre em contato conosco para exercer esses direitos.
              </p>
            </div>
          </section>
        </div>

        {/* Rodapé */}
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>
              {new Date().getFullYear()} Perguntas. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                to="/termos" 
                className="text-primary hover:text-primary/90 hover:underline transition-colors"
              >
                Termos de Uso
              </Link>
              <span>•</span>
              <Link 
                to="/suporte" 
                className="hover:text-foreground transition-colors"
              >
                Suporte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
