-- Função para atualizar pontos do usuário
create or replace function update_user_points(
  user_id_param uuid,
  points_to_add int
)
returns void
language plpgsql
security definer
as $$
declare
  current_points int;
begin
  -- Buscar os pontos atuais do usuário
  select points into current_points
  from profiles
  where id = user_id_param;

  -- Se não tiver pontos ainda, inicializar com 0
  if current_points is null then
    current_points := 0;
  end if;

  -- Atualizar os pontos
  update profiles
  set points = current_points + points_to_add
  where id = user_id_param;
end;
$$;
