import { ArrowLeft, Shield, Users, FileText, Code, AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function Terms() {
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
                  Termos de Uso
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
                <Users className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e usar a plataforma Perguntas, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa plataforma.
              </p>
            </div>
          </section>

          {/* Seção 2 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <FileText className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">2. Uso da Plataforma</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed mb-4">
                Nossa plataforma foi projetada para permitir que usuários façam e respondam perguntas de maneira respeitosa e construtiva. Você concorda em:
              </p>
              <ul className="grid gap-3 text-muted-foreground list-none pl-0">
                {[
                  'Fornecer informações precisas e verdadeiras',
                  'Manter a segurança de sua conta e senha',
                  'Não usar a plataforma para fins ilegais ou não autorizados',
                  'Não publicar conteúdo ofensivo, difamatório ou prejudicial'
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
                <Code className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">3. Conteúdo do Usuário</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Ao publicar conteúdo em nossa plataforma, você mantém seus direitos autorais, mas nos concede uma licença para usar, modificar, executar e exibir publicamente esse conteúdo.
              </p>
            </div>
          </section>

          {/* Seção 4 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">4. Propriedade Intelectual</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo original, recursos e funcionalidades são de propriedade da Perguntas e são protegidos por leis internacionais de direitos autorais, marcas registradas e outros direitos de propriedade intelectual.
              </p>
            </div>
          </section>

          {/* Seção 5 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">5. Limitação de Responsabilidade</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                A Perguntas não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de dados, lucros ou receita.
              </p>
            </div>
          </section>

          {/* Seção 6 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">6. Modificações dos Termos</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Reservamos o direito de modificar estes termos a qualquer momento. Continuando a usar a plataforma após as alterações, você aceita os novos termos.
              </p>
            </div>
          </section>

          {/* Seção 7 */}
          <section className="space-y-4 p-6 sm:p-8 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-3 text-primary">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <XCircle className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">7. Encerramento</h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Podemos encerrar ou suspender seu acesso à plataforma imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes termos.
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
                to="/privacy" 
                className="text-primary hover:text-primary/90 hover:underline transition-colors"
              >
                Política de Privacidade
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
