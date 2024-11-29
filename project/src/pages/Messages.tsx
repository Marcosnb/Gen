import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageCircle, Send, Check, CheckCheck, ArrowLeft } from 'lucide-react';
import { setupMessageCleanup } from '../services/messageCleanup';
import { useOnlineStatus } from '../contexts/OnlineStatusContext';

interface Message {
  id: number;
  content: string;
  created_at: string;
  from_user_id: string;
  to_user_id: string;
  type?: 'text' | 'image';
  read_at?: string;
  image_url?: string;
  read_boolean?: boolean;
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
      await fetchContacts(currentSession.user.id);
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

  // Efeito para verificar o localStorage quando os contatos são carregados
  useEffect(() => {
    const savedContactId = localStorage.getItem('selectedContactId');
    if (savedContactId) {
      const fetchSelectedContact = async () => {
        try {
          const { data: contact, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', savedContactId)
            .single();

          if (error) {
            console.error('Erro ao buscar contato:', error);
            return;
          }

          if (contact) {
            const newContact = {
              ...contact,
              unread_count: 0,
              last_message: null
            };
            
            setContacts(prevContacts => {
              // Verifica se o contato já existe na lista
              const exists = prevContacts.some(c => c.id === contact.id);
              if (!exists) {
                // Se não existe, adiciona o novo contato
                return [newContact, ...prevContacts];
              }
              return prevContacts;
            });
            
            setSelectedContact(contact);
            setMessages([]); // Limpa as mensagens já que é uma nova conversa
          }
        } catch (error) {
          console.error('Erro ao buscar contato:', error);
        }
      };

      fetchSelectedContact();
    }
  }, []);

  // Função para buscar contatos e suas mensagens
  const fetchContacts = async (userId: string) => {
    try {
      // Primeiro, busca todas as mensagens do usuário
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('from_user_id, to_user_id')
        .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`);

      if (messagesError) throw messagesError;

      // Se não houver mensagens, limpa a lista de contatos e retorna
      if (!messagesData || messagesData.length === 0) {
        setContacts([]);
        setLoading(false);
        return;
      }

      // Obtém IDs únicos dos contatos que têm mensagens
      const contactIds = new Set(
        messagesData?.flatMap(msg => [msg.from_user_id, msg.to_user_id])
          .filter(id => id !== userId)
      );

      // Se não houver contatos, limpa a lista e retorna
      if (contactIds.size === 0) {
        setContacts([]);
        setLoading(false);
        return;
      }

      // Busca informações dos contatos
      const { data: contacts, error: contactsError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', Array.from(contactIds));

      if (contactsError) throw contactsError;

      // Para cada contato, busca mensagens não lidas e última mensagem
      const contactsWithMessages = await Promise.all(
        (contacts || []).map(async (contact) => {
          // Verifica se ainda existem mensagens para este contato
          const { count: messageCount, error: countError } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .or(`and(from_user_id.eq.${contact.id},to_user_id.eq.${userId}),and(from_user_id.eq.${userId},to_user_id.eq.${contact.id})`);

          if (countError) throw countError;

          // Se não houver mensagens para este contato, retorna null
          if (!messageCount) return null;

          // Busca contagem de mensagens não lidas
          const { count: unreadCount, error: unreadError } = await supabase
            .from('messages')
            .select('id', { count: 'exact' })
            .eq('to_user_id', userId)
            .eq('from_user_id', contact.id)
            .is('read_at', null);

          if (unreadError) throw unreadError;

          // Busca última mensagem
          const { data: lastMessages, error: messageError } = await supabase
            .from('messages')
            .select('content, created_at')
            .or(`and(from_user_id.eq.${contact.id},to_user_id.eq.${userId}),and(from_user_id.eq.${userId},to_user_id.eq.${contact.id})`)
            .order('created_at', { ascending: false })
            .limit(1);

          if (messageError) throw messageError;

          return {
            ...contact,
            unread_count: unreadCount || 0,
            last_message: lastMessages?.[0]?.content
          };
        })
      );

      // Filtra contatos nulos (sem mensagens) e ordena
      const validContacts = contactsWithMessages.filter(contact => contact !== null);
      const sortedContacts = validContacts.sort((a, b) => {
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

  // Função para atualizar o contador de mensagens não lidas
  const updateUnreadCount = async (contactId: string) => {
    if (!session?.user?.id) return;

    try {
      // Busca a contagem atual de mensagens não lidas
      const { count: unreadCount, error: countError } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('to_user_id', session.user.id)
        .eq('from_user_id', contactId)
        .is('read_at', null);

      if (countError) throw countError;

      // Atualiza o estado local dos contatos com a nova contagem
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === contactId
            ? { ...contact, unread_count: unreadCount || 0 }
            : contact
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar contador de mensagens não lidas:', error);
    }
  };

  // Função para marcar mensagens como lidas
  const originalMarkMessagesAsRead = async (contactId: string) => {
    if (!session?.user?.id) return;

    try {
      const now = new Date().toISOString();

      // Atualiza o estado local imediatamente
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === contactId
            ? { ...contact, unread_count: 0 }
            : contact
        )
      );

      // Atualiza as mensagens locais
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.to_user_id === session.user.id && msg.from_user_id === contactId && !msg.read_at
            ? { ...msg, read_at: now }
            : msg
        )
      );

      // Atualiza no banco de dados
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: now })
        .eq('to_user_id', session.user.id)
        .eq('from_user_id', contactId)
        .is('read_at', null);

      if (updateError) throw updateError;

    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      // Reverte o estado local em caso de erro
      fetchContacts(session.user.id);
    }
  };

  const markMessageAsReadForDeletion = async (messageId: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_boolean: true })
        .eq('id', messageId);

      if (error) {
        console.error('Erro ao marcar mensagem para deleção:', error);
      }
    } catch (error) {
      console.error('Erro ao marcar mensagem para deleção:', error);
    }
  };

  const markMessagesAsRead = async (contactId: string) => {
    try {
      // Primeiro executa a função original para manter a lógica do read_at
      await originalMarkMessagesAsRead(contactId);

      // Depois marca as mensagens para deleção usando read_boolean
      const { error } = await supabase
        .from('messages')
        .update({ read_boolean: true })
        .eq('to_user_id', session?.user?.id)
        .eq('from_user_id', contactId)
        .is('read_boolean', null);

      if (error) {
        console.error('Erro ao marcar mensagens para deleção:', error);
      }
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
    }
  };

  // Efeito para marcar mensagens como lidas quando a conversa é selecionada
  useEffect(() => {
    if (!selectedContact?.id || !session?.user?.id) return;

    const markAsRead = async () => {
      try {
        await markMessagesAsRead(selectedContact.id);
      } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
      }
    };

    markAsRead();
  }, [selectedContact?.id, session?.user?.id]);

  // Função para deletar mensagens lidas à meia-noite
  const deleteReadMessages = async () => {
    if (!session?.user?.id) return;

    try {
      // Deleta todas as mensagens que foram lidas (read_boolean = true)
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('read_boolean', true);

      if (error) {
        console.error('Erro ao deletar mensagens:', error);
        return;
      }

      console.log('Mensagens lidas deletadas com sucesso');

      // Atualiza a lista de mensagens após a deleção
      if (selectedContact) {
        fetchMessages(selectedContact.id);
      }
    } catch (error) {
      console.error('Erro ao deletar mensagens:', error);
    }
  };

  // Configura a limpeza para executar à meia-noite
  useEffect(() => {
    console.log('Iniciando sistema de limpeza automática de mensagens...');
    
    const scheduleNextMidnight = () => {
      const now = new Date();
      const tonight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // próximo dia
        0, // hora 00
        0, // minuto 00
        0  // segundo 00
      );
      
      const msUntilMidnight = tonight.getTime() - now.getTime();
      
      console.log(`Próxima limpeza agendada para meia-noite (em ${Math.round(msUntilMidnight/1000/60)} minutos)`);
      
      return setTimeout(() => {
        console.log('Executando limpeza da meia-noite...');
        deleteReadMessages();
        // Agenda a próxima execução
        scheduleNextMidnight();
      }, msUntilMidnight);
    };

    // Inicia o agendamento
    const timeoutId = scheduleNextMidnight();

    // Cleanup do timeout
    return () => {
      console.log('Parando sistema de limpeza automática...');
      clearTimeout(timeoutId);
    };
  }, [session?.user?.id]);

  // Gerencia as atualizações em tempo real
  useEffect(() => {
    if (!session?.user?.id) return;

    let isSubscribed = true;
    const channelName = `messages:${session.user.id}`;

    const handleRealTimeUpdate = (payload: any) => {
      if (!isSubscribed) return;
      
      const { new: newMessage, eventType } = payload;
      console.log('Recebido evento de mensagem:', newMessage, 'Tipo:', eventType);

      // Se é uma nova mensagem para o usuário atual
      if (newMessage.to_user_id === session.user.id) {
        // Atualiza o contador de mensagens não lidas
        setContacts(prevContacts =>
          prevContacts.map(contact => {
            if (contact.id === newMessage.from_user_id) {
              // Se estiver na conversa atual, não incrementa o contador
              if (selectedContact?.id === contact.id) {
                markMessagesAsRead(contact.id);
                return contact;
              }
              // Caso contrário, incrementa o contador
              return {
                ...contact,
                unread_count: (contact.unread_count || 0) + 1
              };
            }
            return contact;
          })
        );
      }

      // Se estiver na conversa atual, atualiza as mensagens
      if (selectedContact && 
         (newMessage.from_user_id === selectedContact.id || 
          newMessage.to_user_id === selectedContact.id)) {
        fetchMessages(selectedContact.id);
      }
    };

    // Configuração do canal
    let channel: any;

    const setupChannel = () => {
      // Remove canal existente se houver
      if (channel) {
        channel.unsubscribe();
      }

      // Cria novo canal
      channel = supabase.channel(channelName);

      // Configura os listeners
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `or(to_user_id.eq.${session.user.id},from_user_id.eq.${session.user.id})`
          },
          handleRealTimeUpdate
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            console.log('Canal conectado com sucesso');
            // Atualiza a lista de contatos quando o canal conecta
            fetchContacts(session.user.id);
          }
        });
    };

    // Configura o canal inicial
    setupChannel();

    // Cleanup function
    return () => {
      isSubscribed = false;
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [session?.user?.id, selectedContact?.id]);

  // Função para buscar mensagens
  const fetchMessages = async (contactId: string) => {
    try {
      if (!session?.user?.id) return;

      // Se for uma nova conversa iniciada do card de pergunta, não busca mensagens
      const savedContactId = localStorage.getItem('selectedContactId');
      if (savedContactId) {
        setMessages([]);
        return;
      }

      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(from_user_id.eq.${session.user.id},to_user_id.eq.${contactId}),` +
          `and(from_user_id.eq.${contactId},to_user_id.eq.${session.user.id})`
        )
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Marca as mensagens como lidas
      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('to_user_id', session.user.id)
        .eq('from_user_id', contactId)
        .is('read_at', null);

      if (updateError) {
        console.error('Erro ao marcar mensagens como lidas:', updateError);
      }

      // Atualiza o estado local das mensagens
      setMessages(messages || []);

      // Atualiza o contador de mensagens não lidas do contato
      setContacts(prevContacts =>
        prevContacts.map(contact =>
          contact.id === contactId
            ? { ...contact, unread_count: 0 }
            : contact
        )
      );

    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
    }
  };

  useEffect(() => {
    if (!selectedContact) return;

    // Buscar mensagens existentes
    const fetchMessages = async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_user_id.eq.${session?.user?.id},to_user_id.eq.${selectedContact.id}),and(from_user_id.eq.${selectedContact.id},to_user_id.eq.${session?.user?.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        return;
      }

      setMessages(messages || []);

      // Marcar mensagens recebidas como lidas
      const unreadMessages = messages?.filter(
        (msg) => msg.to_user_id === session?.user?.id && !msg.read_at
      ) || [];

      if (unreadMessages.length > 0) {
        const { error: updateError } = await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadMessages.map(msg => msg.id));

        if (updateError) {
          console.error('Erro ao marcar mensagens como lidas:', updateError);
        }
      }
    };

    fetchMessages();

    // Inscrever-se para atualizações em tempo real
    const messagesSubscription = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `or(and(from_user_id=eq.${session?.user?.id},to_user_id=eq.${selectedContact.id}),and(from_user_id=eq.${selectedContact.id},to_user_id=eq.${session?.user?.id}))`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Nova mensagem
            const newMessage = payload.new as Message;
            setMessages((currentMessages) => [...currentMessages, newMessage]);

            // Se a mensagem foi recebida, marcar como lida
            if (newMessage.to_user_id === session?.user?.id) {
              const { error: updateError } = await supabase
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('id', newMessage.id);

              if (updateError) {
                console.error('Erro ao marcar nova mensagem como lida:', updateError);
              }
            }
          } else if (payload.eventType === 'UPDATE') {
            // Atualização de mensagem (ex: marcada como lida)
            const updatedMessage = payload.new as Message;
            setMessages((currentMessages) =>
              currentMessages.map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          }
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [selectedContact, session?.user?.id]);

  useEffect(() => {
    let isMounted = true;

    const markAsRead = async () => {
      if (!isMounted || !selectedContact?.id || !session?.user?.id) return;
      
      try {
        await markMessagesAsRead(selectedContact.id);
      } catch (error) {
        console.error('Erro ao marcar mensagens como lidas:', error);
      }
    };

    markAsRead();

    return () => {
      isMounted = false;
    };
  }, [selectedContact?.id, session?.user?.id]);

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedContact || !session?.user?.id) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        from_user_id: session.user.id,
        to_user_id: selectedContact.id,
        created_at: new Date().toISOString(),
        read_at: null
      };

      // Adiciona a mensagem otimisticamente
      const tempId = Date.now();
      setMessages(prev => [...prev, { ...messageData, id: tempId }]);
      setNewMessage('');

      // Envia a mensagem para o servidor
      const { error } = await supabase
        .from('messages')
        .insert([messageData]);

      if (error) {
        console.error('Erro ao enviar mensagem:', error);
        // Remove a mensagem temporária em caso de erro
        setMessages(prev => prev.filter(msg => msg.id !== tempId));
        return;
      }

      // Atualiza a lista de contatos após enviar a mensagem
      await fetchContacts(session.user.id);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Função para formatar a data e hora das mensagens
  const formatMessageDateTime = (dateStr: string) => {
    const messageDate = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));
    const time = messageDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    if (diffInDays === 0) {
      return `Hoje às ${time}`;
    } else if (diffInDays === 1) {
      return `Ontem às ${time}`;
    } else if (diffInDays < 7) {
      return `${messageDate.toLocaleDateString('pt-BR', { weekday: 'long' })} às ${time}`;
    } else {
      return messageDate.toLocaleDateString('pt-BR', { 
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Função para agrupar mensagens por data
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      const dateKey = date.toLocaleDateString('pt-BR');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="bg-card/95 border border-border/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-sm">
        <div className="grid md:grid-cols-[320px_1fr] min-h-[750px]">
          {/* Lista de Contatos */}
          <div className={`border-r border-border/50 bg-background/50 ${selectedContact ? 'hidden md:block' : 'block'}`}>
            <div className="p-6 border-b border-border/50">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Mensagens
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Suas conversas recentes</p>
            </div>
            <div className="px-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-[200px] gap-3">
                  <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
                  <p className="text-sm text-muted-foreground">Carregando conversas...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-primary/60" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">Nenhuma conversa ainda</h3>
                  <p className="text-sm text-muted-foreground">
                    Suas conversas aparecerão aqui quando você começar a interagir
                  </p>
                </div>
              ) : (
                <div className="space-y-1 py-3">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact);
                        fetchMessages(contact.id);
                      }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group ${
                        selectedContact?.id === contact.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted/80'
                      }`}
                    >
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center ring-2 ring-background overflow-hidden">
                          {contact.avatar_url ? (
                            <img
                              src={contact.avatar_url}
                              alt={contact.full_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <MessageCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        {contact.unread_count > 0 && (
                          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1.5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
                            {contact.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`font-medium truncate ${
                            selectedContact?.id === contact.id 
                              ? 'text-primary-foreground' 
                              : 'text-foreground'
                          }`}>
                            {contact.full_name}
                          </p>
                        </div>
                        {contact.last_message && (
                          <p className={`text-sm truncate mt-0.5 ${
                            selectedContact?.id === contact.id
                              ? 'text-primary-foreground/80'
                              : 'text-muted-foreground'
                          }`}>
                            {contact.last_message}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Área de Chat */}
          <div className="flex flex-col bg-background/30">
            {selectedContact ? (
              <>
                {/* Cabeçalho do Chat */}
                <div className="px-8 py-6 border-b border-border/50 bg-background/50">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedContact(null)}
                      className="md:hidden p-2 hover:bg-muted/60 rounded-lg text-muted-foreground"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-background overflow-hidden">
                      {selectedContact.avatar_url ? (
                        <img
                          src={selectedContact.avatar_url}
                          alt={selectedContact.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <MessageCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{selectedContact.full_name}</h3>
                      <p className="text-sm text-muted-foreground">Clique para ver o perfil</p>
                    </div>
                  </div>
                </div>

                {/* Lista de Mensagens */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Badge de aviso sobre exclusão */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-full text-sm flex items-center gap-2 border border-yellow-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/>
                        <path d="M12 8V12"/>
                        <path d="M12 16H12.01"/>
                      </svg>
                      Mensagens lidas serão excluídas automaticamente à meia-noite
                    </div>
                  </div>

                  {Object.entries(groupMessagesByDate(messages.filter(m => 
                    (m.from_user_id === selectedContact.id && m.to_user_id === session?.user?.id) || 
                    (m.from_user_id === session?.user?.id && m.to_user_id === selectedContact.id)
                  ))).map(([date, dateMessages]) => (
                    <div key={date} className="space-y-6">
                      <div className="flex items-center justify-center">
                        <div className="bg-muted/50 text-muted-foreground text-xs px-4 py-1.5 rounded-full">
                          {date}
                        </div>
                      </div>
                      {dateMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.from_user_id === session?.user?.id ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`relative max-w-[70%] px-5 py-3.5 shadow-md ${
                              message.from_user_id === session?.user?.id
                                ? 'bg-primary text-primary-foreground rounded-[20px] rounded-br-sm'
                                : 'bg-muted text-foreground rounded-[20px] rounded-bl-sm'
                            }`}
                          >
                            <p className="leading-relaxed whitespace-pre-wrap break-words text-[15px]">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-end gap-2 mt-1.5">
                              <span className={`text-[11px] ${
                                message.from_user_id === session?.user?.id
                                  ? 'text-primary-foreground/70'
                                  : 'text-muted-foreground'
                              }`}>
                                {message.created_at && formatMessageDateTime(message.created_at)}
                              </span>
                              {message.from_user_id === session?.user?.id && (
                                <div className="flex items-center gap-1">
                                  <span className={`text-[11px] flex items-center gap-1 ${
                                    message.read_at 
                                      ? 'text-primary-foreground'
                                      : 'text-primary-foreground/70'
                                  }`}>
                                    {message.read_at ? (
                                      <>
                                        <CheckCheck className="h-3.5 w-3.5" />
                                        <span className="relative top-[0.5px]">Lida</span>
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-3.5 w-3.5" />
                                        <span className="relative top-[0.5px]">Enviada</span>
                                      </>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Input de Mensagem */}
                <div className="p-6 border-t border-border/50 bg-background/50">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="w-full h-14 bg-muted rounded-2xl pl-6 pr-32 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <div className="absolute right-2">
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="h-10 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <MessageCircle className="h-10 w-10 text-primary/60" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Selecione um contato</h2>
                <p className="text-muted-foreground max-w-md">
                  Escolha um contato da lista à esquerda para iniciar uma conversa ou continuar uma conversa existente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
