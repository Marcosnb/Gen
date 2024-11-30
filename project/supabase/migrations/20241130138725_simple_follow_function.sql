-- Adiciona coluna type se não existir
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'answer';

-- Função simples para criar notificação de follow
CREATE OR REPLACE FUNCTION create_follow_notification(
  follower_id uuid,
  following_id uuid
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, question_id, question_title, answer_id, created_at)
  VALUES (following_id, 'follow', '', 'Novo seguidor', '', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
