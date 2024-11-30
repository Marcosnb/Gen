-- Remove triggers e funções de notificação de follow
DROP TRIGGER IF EXISTS on_new_follower ON followers;
DROP FUNCTION IF EXISTS handle_new_follower();

-- Remove notificações existentes de follow
DELETE FROM notifications WHERE type = 'follow';

-- Atualiza a constraint do tipo para remover a opção 'follow'
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications 
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('answer'));
