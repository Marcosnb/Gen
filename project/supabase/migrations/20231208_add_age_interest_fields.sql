-- Adiciona campos age e interest na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS age integer,
ADD COLUMN IF NOT EXISTS interest text;

-- Atualiza a função update_user_profile
CREATE OR REPLACE FUNCTION update_user_profile(
  p_full_name text,
  p_avatar_url text,
  p_gender text,
  p_age integer DEFAULT NULL,
  p_interest text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET 
    full_name = p_full_name,
    avatar_url = p_avatar_url,
    gender = p_gender,
    age = COALESCE(p_age, age),
    interest = COALESCE(p_interest, interest),
    updated_at = NOW()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
