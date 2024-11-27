import { supabase } from '../lib/supabase';

export const setupMessageCleanup = () => {
  const scheduleNextMidnight = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    
    const timeUntilMidnight = midnight.getTime() - now.getTime();
    
    // Agenda a primeira execução para a próxima meia-noite
    setTimeout(async () => {
      await deleteReadMessages();
      // Depois configura para rodar todos os dias à meia-noite
      setInterval(deleteReadMessages, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  };

  const deleteReadMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      const { error } = await supabase
        .from('messages')
        .delete()
        .not('read_at', 'is', null)
        .eq('to_user_id', session.user.id);

      if (error) {
        console.error('Erro ao deletar mensagens:', error);
      } else {
        console.log('Mensagens lidas deletadas com sucesso');
      }
    } catch (error) {
      console.error('Erro ao deletar mensagens:', error);
    }
  };

  // Inicia o agendamento
  scheduleNextMidnight();
};
