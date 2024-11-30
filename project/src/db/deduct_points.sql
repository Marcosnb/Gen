-- Função para descontar moedas do usuário
create or replace function deduct_points(
  user_id uuid,
  points_to_deduct integer
)
returns boolean
language plpgsql
security definer
as $$
declare
  current_points integer;
begin
  -- Buscar pontos atuais do usuário
  select points into current_points
  from profiles
  where id = user_id;

  -- Verificar se tem pontos suficientes
  if current_points >= points_to_deduct then
    -- Descontar os pontos
    update profiles
    set points = points - points_to_deduct
    where id = user_id;
    return true;
  else
    return false;
  end if;
end;
$$;
