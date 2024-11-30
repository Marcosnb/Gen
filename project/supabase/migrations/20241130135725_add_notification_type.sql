-- Adiciona coluna type sem alterar registros existentes
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'answer';

-- Atualiza a política de segurança para incluir o novo campo
ALTER POLICY "Enable read access for authenticated users" ON "public"."notifications"
    USING (auth.uid() = user_id);

-- Cria função para inserir notificação de seguidor
CREATE OR REPLACE FUNCTION public.create_follow_notification(
  follower_id uuid,
  following_id uuid
) RETURNS void AS $$
BEGIN
  INSERT INTO notifications (user_id, type, question_id, question_title, answer_id, created_at)
  VALUES (following_id, 'follow', '', 'Novo seguidor', '', NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
