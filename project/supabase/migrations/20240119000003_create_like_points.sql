-- Função específica para atualizar pontos de curtidas
create or replace function update_like_points(
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

  -- Registrar a transação de pontos
  insert into point_transactions (
    user_id,
    points_amount,
    transaction_type,
    created_at,
    source
  ) values (
    user_id_param,
    points_to_add,
    case 
      when points_to_add > 0 then 'earned'
      else 'spent'
    end,
    now(),
    'like'
  );
end;
$$;

-- Adicionar coluna source na tabela point_transactions se não existir
alter table point_transactions 
add column if not exists source text default 'general';

-- Criar índice para a coluna source
create index if not exists idx_point_transactions_source on point_transactions(source);
