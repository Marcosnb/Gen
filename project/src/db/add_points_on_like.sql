-- Função para adicionar pontos quando recebe like
create or replace function add_points_on_like(user_id uuid, points_to_add integer)
returns void as $$
begin
  update profiles
  set points = points + points_to_add
  where id = user_id;
end;
$$ language plpgsql;
