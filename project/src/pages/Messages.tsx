import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageCircle, Send } from 'lucide-react';
import { setupMessageCleanup } from '../services/messageCleanup';

interface Message {
  id: string;
  content: string;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
}

interface Contact {
  id: string;
  full_name: string;
  avatar_url: string;
  last_message?: string;
  unread_count?: number;
}

export function Messages() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  // Gerencia a sessão do usuário
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        navigate('/login');
        return;
      }
      setSession(currentSession);
      fetchContacts(currentSession.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/login');
        return;
      }
      setSession(session);
      fetchContacts(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Função para buscar contatos e suas mensagens
  const fetchContacts = async (userId: string) => {
    try {
      // Busca todos os contatos
      const { data: contacts, error: contactsError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .neq('id', userId);

      if (contactsError) throw contactsError;

      // Para cada contato, busca mensagens não lidas e última mensagem
      const contactsWithMessages = await Promise.all(
        (contacts || []).map(async (contact) => {
          // Busca contagem de mensagens não lidas
          const { data, error: countError } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('from_user_id', contact.id)
            .eq('to_user_id', userId)
            .is('read_at', null);

          if (countError) throw countError;

          // Busca última mensagem
          const { data: lastMessages, error: messageError } = await supabase
            .from('messages')
            .select('content, created_at')
            .or(`and(from_user_id.eq.${contact.id},to_user_id.eq.${userId}),and(from_user_id.eq.${userId},to_user_id.eq.${contact.id})`)
            .order('created_at', { ascending: false })
            .limit(1);

          if (messageError) throw messageError;

          // Se não houver mensagens não lidas, não mostra o contador
          const unreadCount = (data?.length || 0) > 0 ? data.length : undefined;

          return {
            ...contact,
            unread_count: unreadCount,
            last_message: lastMessages?.[0]?.content
          };
        })
      );

      // Ordena os contatos: primeiro os que têm mensagens não lidas, depois por data da última mensagem
      const sortedContacts = contactsWithMessages.sort((a, b) => {
        if (a.unread_count && !b.unread_count) return -1;
        if (!a.unread_count && b.unread_count) return 1;
        return 0;
      });

      setContacts(sortedContacts);
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Gerencia as atualizações em tempo real
  useEffect(() => {
    if (!session?.user?.id) return;

    let channel = supabase.channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `to_user_id=eq.${session.user.id}`
        },
        () => {
          fetchContacts(session.user.id);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [session]);

  const fetchMessages = async (contactId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        from_user_id,
        to_user_id
      `)
      .or(`from_user_id.eq.${session.user.id},to_user_id.eq.${session.user.id}`)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar mensagens:', error);
      return;
    }

    setMessages(messages || []);

    // Marca todas as mensagens deste contato como lidas
    const { error: updateError } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('from_user_id', contactId)
      .eq('to_user_id', session.user.id)
      .is('read_at', null);

    if (updateError) {
      console.error('Erro ao marcar mensagens como lidas:', updateError);
    }
  };

  useEffect(() => {
    if (!selectedContact) return;

    const subscription = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(from_user_id=eq.${selectedContact.id},to_user_id=eq.${selectedContact.id})`
        },
        () => {
          fetchMessages(selectedContact.id);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [selectedContact]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedContact) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        content: newMessage,
        from_user_id: session.user.id,
        to_user_id: selectedContact.id
      });

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
      return;
    }

    setNewMessage('');
    fetchMessages(selectedContact.id);
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="bg-card border border-border/50 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm bg-background/95">
        <div className="grid grid-cols-[300px_1fr] min-h-[700px]">
          {/* Lista de Contatos */}
          <div className="border-r border-border/50 bg-muted/20">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-foreground/90">Mensagens</h2>
              <p className="text-sm text-muted-foreground mt-1">Suas conversas recentes</p>
            </div>
            
            <div className="px-3">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-muted-foreground mt-2">Carregando contatos...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center p-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum contato encontrado</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        fetchMessages(contact.id);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        selectedContact?.id === contact.id
                          ? 'bg-primary/10 hover:bg-primary/15'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                        {contact.avatar_url ? (
                          <img
                            src={contact.avatar_url}
                            alt={contact.full_name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <MessageCircle className="h-5 w-5 text-primary" />
                        )}
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="font-medium truncate">{contact.full_name}</p>
                        {contact.unread_count > 0 ? (
                          <p className="text-sm text-primary truncate font-medium">
                            Você tem {contact.unread_count} {contact.unread_count === 1 ? 'nova mensagem' : 'novas mensagens'}
                          </p>
                        ) : contact.last_message ? (
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.last_message}
                          </p>
                        ) : null}
                      </div>
                      {contact.unread_count && contact.unread_count > 0 && (
                        <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center">
                          {contact.unread_count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área de Mensagens */}
          <div className="flex flex-col bg-background/50">
            {selectedContact ? (
              <>
                {/* Cabeçalho do Chat */}
                <div className="p-4 border-b border-border/50 bg-muted/20 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background">
                      {selectedContact.avatar_url ? (
                        <img
                          src={selectedContact.avatar_url}
                          alt={selectedContact.full_name}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <MessageCircle className="h-5 w-5 text-primary" />
                      )}
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                    </div>
                    <div>
                      <p className="font-medium text-lg">{selectedContact.full_name}</p>
                      <p className="text-sm text-muted-foreground">Online</p>
                    </div>
                  </div>
                </div>

                {/* Lista de Mensagens */}
                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.from_user_id === selectedContact.id
                          ? 'justify-start'
                          : 'justify-end'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl ${
                          message.from_user_id === selectedContact.id
                            ? 'bg-muted/50'
                            : 'bg-primary text-primary-foreground'
                        } shadow-sm`}
                      >
                        <p className="leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(message.created_at).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input de Mensagem */}
                <div className="p-4 border-t border-border/50 bg-muted/20 backdrop-blur-sm">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Digite sua mensagem..."
                      className="flex-1 px-4 py-3 rounded-xl bg-background border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground/90">Suas mensagens</p>
                <p className="text-muted-foreground mt-2">Selecione um contato para iniciar uma conversa</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
