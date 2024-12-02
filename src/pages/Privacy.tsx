import { ArrowLeft, Shield, Database, Lock, Share2, UserCheck, Cookie, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="relative mb-12 pb-8 border-b border-border">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Home</span>
        </Link>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Política de Privacidade
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Última atualização: {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm">
            <Shield className="h-4 w-4" />
            <span>Documento Oficial</span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="grid gap-8">
        {/* Seção 1 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <Database className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">1. Informações que Coletamos</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Coletamos diferentes tipos de informações para fornecer e melhorar nossos serviços:
          </p>
          <ul className="grid gap-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">1</span>
              </div>
              Informações de registro (nome, email, senha)
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">2</span>
              </div>
              Dados de uso e interação com a plataforma
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">3</span>
              </div>
              Informações do dispositivo e navegador
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">4</span>
              </div>
              Cookies e tecnologias similares
            </li>
          </ul>
        </section>

        {/* Seção 2 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <Lock className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">2. Como Usamos suas Informações</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Utilizamos suas informações para:
          </p>
          <ul className="grid gap-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">1</span>
              </div>
              Fornecer e manter nossos serviços
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">2</span>
              </div>
              Melhorar a experiência do usuário
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">3</span>
              </div>
              Enviar atualizações e notificações importantes
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">4</span>
              </div>
              Prevenir fraudes e abusos
            </li>
          </ul>
        </section>

        {/* Seção 3 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <Share2 className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">3. Compartilhamento de Informações</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Não vendemos suas informações pessoais. Compartilhamos dados apenas:
          </p>
          <ul className="grid gap-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">1</span>
              </div>
              Com seu consentimento explícito
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">2</span>
              </div>
              Com prestadores de serviços essenciais
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">3</span>
              </div>
              Quando exigido por lei
            </li>
          </ul>
        </section>

        {/* Seção 4 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <Shield className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">4. Segurança dos Dados</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
          </p>
        </section>

        {/* Seção 5 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <UserCheck className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">5. Seus Direitos</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Você tem direito a:
          </p>
          <ul className="grid gap-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">1</span>
              </div>
              Acessar seus dados pessoais
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">2</span>
              </div>
              Corrigir dados imprecisos
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">3</span>
              </div>
              Solicitar a exclusão de seus dados
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">4</span>
              </div>
              Retirar seu consentimento
            </li>
          </ul>
        </section>

        {/* Seção 6 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <Cookie className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">6. Cookies e Tecnologias Similares</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Usamos cookies e tecnologias similares para melhorar a experiência do usuário, analisar o tráfego e personalizar o conteúdo. Você pode controlar o uso de cookies através das configurações do seu navegador.
          </p>
        </section>

        {/* Seção 7 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <RefreshCw className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">7. Alterações na Política</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Podemos atualizar esta política periodicamente. Notificaremos sobre alterações significativas através de um aviso em nossa plataforma ou por email.
          </p>
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
  );
}
