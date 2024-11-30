-- Função que será chamada pelo trigger
CREATE OR REPLACE FUNCTION public.handle_new_follower()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    question_id,
    question_title,
    answer_id,
    read,
    created_at
  ) VALUES (
    NEW.following_id,
    'follow',
    '',
    'Novo seguidor',
    '',
    false,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove o trigger se já existir
DROP TRIGGER IF EXISTS on_new_follower ON public.followers;

-- Cria o trigger
CREATE TRIGGER on_new_follower
  AFTER INSERT ON public.followers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_follower();
