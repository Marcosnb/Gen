import { ArrowLeft, Shield, Users, FileText, Code, AlertTriangle, RefreshCw, XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function Terms() {
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
              Termos de Uso
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
            <Users className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Ao acessar e usar a plataforma Perguntas, você concorda em cumprir e estar vinculado aos seguintes termos e condições de uso. Se você não concordar com qualquer parte destes termos, não deverá usar nossa plataforma.
          </p>
        </section>

        {/* Seção 2 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <FileText className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">2. Uso da Plataforma</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Nossa plataforma foi projetada para permitir que usuários façam e respondam perguntas de maneira respeitosa e construtiva. Você concorda em:
          </p>
          <ul className="grid gap-3 text-muted-foreground">
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">1</span>
              </div>
              Fornecer informações precisas e verdadeiras
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">2</span>
              </div>
              Manter a segurança de sua conta e senha
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">3</span>
              </div>
              Não usar a plataforma para fins ilegais ou não autorizados
            </li>
            <li className="flex items-start gap-2">
              <div className="h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary text-sm">4</span>
              </div>
              Não publicar conteúdo ofensivo, difamatório ou prejudicial
            </li>
          </ul>
        </section>

        {/* Seção 3 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <Code className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">3. Conteúdo do Usuário</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Ao publicar conteúdo em nossa plataforma, você mantém seus direitos autorais, mas nos concede uma licença para usar, modificar, executar e exibir publicamente esse conteúdo.
          </p>
        </section>

        {/* Seção 4 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <Shield className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">4. Propriedade Intelectual</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Todo o conteúdo original, recursos e funcionalidades são de propriedade da Perguntas e são protegidos por leis internacionais de direitos autorais, marcas registradas e outros direitos de propriedade intelectual.
          </p>
        </section>

        {/* Seção 5 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">5. Limitação de Responsabilidade</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            A Perguntas não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de dados, lucros ou receita.
          </p>
        </section>

        {/* Seção 6 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <RefreshCw className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">6. Modificações dos Termos</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Reservamos o direito de modificar estes termos a qualquer momento. Continuando a usar a plataforma após as alterações, você aceita os novos termos.
          </p>
        </section>

        {/* Seção 7 */}
        <section className="space-y-4 p-6 rounded-2xl bg-card border border-border/50 hover:border-border/80 transition-colors">
          <div className="flex items-center gap-3 text-primary">
            <XCircle className="h-5 w-5" />
            <h2 className="text-xl font-semibold text-foreground">7. Encerramento</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Podemos encerrar ou suspender seu acesso à plataforma imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes termos.
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
              to="/privacidade" 
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
  );
}
