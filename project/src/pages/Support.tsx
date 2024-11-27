import { ArrowLeft, Mail, MessageCircle, FileText, AlertCircle, Book, Heart, HelpCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Support() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Botão Voltar */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Home</span>
          </Link>

          {/* Título e Pesquisa */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-primary-foreground mb-4">
              Como podemos ajudar?
            </h1>
            <p className="text-primary-foreground/90 text-lg mb-8">
              Encontre respostas para suas dúvidas e aprenda a usar melhor nossa plataforma
            </p>

            {/* Barra de Pesquisa */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Busque por artigos, tutoriais ou dúvidas comuns..."
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-background/95 backdrop-blur border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Seção de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Card - Guia Rápido */}
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Book className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Guia Rápido</h3>
                <p className="text-muted-foreground mb-4">
                  Aprenda os conceitos básicos e comece a usar a plataforma em minutos
                </p>
                <ul className="space-y-2">
                  <li>
                    <button className="text-primary hover:underline text-sm text-left w-full">
                      • Como fazer uma pergunta efetiva
                    </button>
                  </li>
                  <li>
                    <button className="text-primary hover:underline text-sm text-left w-full">
                      • Usando tags para melhor visibilidade
                    </button>
                  </li>
                  <li>
                    <button className="text-primary hover:underline text-sm text-left w-full">
                      • Formatação de código e markdown
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card - FAQ */}
          <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Perguntas Frequentes</h3>
                <p className="text-muted-foreground mb-4">
                  Respostas para as dúvidas mais comuns da comunidade
                </p>
                <ul className="space-y-2">
                  <li>
                    <button className="text-primary hover:underline text-sm text-left w-full">
                      • Como editar ou excluir uma pergunta
                    </button>
                  </li>
                  <li>
                    <button className="text-primary hover:underline text-sm text-left w-full">
                      • Diretrizes da comunidade
                    </button>
                  </li>
                  <li>
                    <button className="text-primary hover:underline text-sm text-left w-full">
                      • Sistema de reputação e badges
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Contato */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-center">
            Outras formas de ajuda
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email */}
            <div className="group bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Email</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Responderemos em até 24 horas
              </p>
              <a
                href="mailto:suporte@exemplo.com"
                className="text-sm text-primary hover:underline inline-flex items-center gap-1"
              >
                suporte@exemplo.com
              </a>
            </div>

            {/* Chat */}
            <div className="group bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <MessageCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Chat ao Vivo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Disponível em horário comercial
              </p>
              <button className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                Iniciar conversa
              </button>
            </div>

            {/* Reportar */}
            <div className="group bg-card rounded-xl border border-border p-6 text-center hover:shadow-lg transition-all duration-300">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
                <AlertCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-medium mb-2">Reportar Problema</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Encontrou um bug ou problema?
              </p>
              <button className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                Abrir chamado
              </button>
            </div>
          </div>
        </div>

        {/* Documentação */}
        <div className="mt-12 p-6 bg-card rounded-xl border border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Documentação Completa</h3>
              <p className="text-muted-foreground mb-4">
                Explore nossa documentação detalhada com guias, tutoriais e exemplos
              </p>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <span>Acessar documentação</span>
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
            Feito com <Heart className="w-4 h-4 text-red-500" /> para a comunidade
          </p>
        </div>
      </div>
    </div>
  );
}