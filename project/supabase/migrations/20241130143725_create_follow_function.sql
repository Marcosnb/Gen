-- Cria função que faz follow e notificação juntos
CREATE OR REPLACE FUNCTION follow_user(
  follower uuid,
  following uuid
) RETURNS void AS $$
BEGIN
  -- Insere o follow
  INSERT INTO followers (follower_id, following_id)
  VALUES (follower, following);
  
  -- Insere a notificação
  INSERT INTO notifications (
    user_id,
    type,
    question_id,
    question_title,
    answer_id,
    read
  ) VALUES (
    following,
    'follow',
    '',
    'Novo seguidor',
    '',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
