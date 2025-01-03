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

  -- Registrar a transação de pontos
  insert into point_transactions (
    user_id,
    points_amount,
    transaction_type,
    created_at
  ) values (
    user_id_param,
    points_to_add,
    case 
      when points_to_add > 0 then 'earned'
      else 'spent'
    end,
    now()
  );
end;
$$;

-- Criar tabela para registrar transações de pontos se não existir
create table if not exists point_transactions (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  points_amount int not null,
  transaction_type text not null check (transaction_type in ('earned', 'spent')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Criar índices para melhor performance
create index if not exists idx_point_transactions_user_id on point_transactions(user_id);
create index if not exists idx_point_transactions_created_at on point_transactions(created_at);
