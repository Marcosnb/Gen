-- Função para criar notificação quando alguém seguir
CREATE OR REPLACE FUNCTION handle_new_follower()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, question_id, question_title, answer_id, created_at)
  VALUES (NEW.following_id, 'follow', '', 'Novo seguidor', '', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que chama a função quando alguém segue
CREATE TRIGGER on_new_follower
  AFTER INSERT ON followers
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_follower();
