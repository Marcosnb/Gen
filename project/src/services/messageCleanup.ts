import { supabase } from '../lib/supabase';

export const setupMessageCleanup = () => {
  const scheduleNextCleanup = () => {
    const now = new Date();
    const targetTime = new Date(now);
    targetTime.setHours(15, 33, 0, 0); // Define para 15:33

    // Se já passou das 15:33 hoje, agenda para amanhã
    if (now > targetTime) {
      targetTime.setDate(targetTime.getDate() + 1);
    }
    
    const timeUntilCleanup = targetTime.getTime() - now.getTime();
    console.log('Próxima limpeza agendada para:', targetTime);
    
    // Agenda a primeira execução
    setTimeout(async () => {
      console.log('Iniciando limpeza de mensagens...');
      await deleteReadMessages();
      // Depois configura para rodar todos os dias no mesmo horário
      setInterval(deleteReadMessages, 24 * 60 * 60 * 1000);
    }, timeUntilCleanup);
  };

  const deleteReadMessages = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;

      // Pega a data das 15:33 de hoje
      const today = new Date();
      today.setHours(15, 33, 0, 0);

      console.log('Deletando mensagens marcadas como lidas antes das 15:33...');
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('read_boolean', true)
        .lt('read_at', today.toISOString()); // Só deleta se foi marcada como lida antes das 15:33

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
  scheduleNextCleanup();
};
