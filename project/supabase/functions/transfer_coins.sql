-- Função para transferir moedas entre usuários
create or replace function transfer_coins(
  sender_id uuid,
  receiver_id uuid,
  amount int
)
returns void
language plpgsql
security definer
as $$
declare
  sender_points int;
begin
  -- Verificar se o valor é positivo
  if amount <= 0 then
    raise exception 'O valor da transferência deve ser maior que zero';
  end if;

  -- Verificar se o remetente tem moedas suficientes
  select points into sender_points
  from profiles
  where id = sender_id;

  if sender_points < amount then
    raise exception 'Saldo insuficiente';
  end if;

  -- Realizar a transferência em uma transação
  update profiles
  set points = points - amount
  where id = sender_id;

  update profiles
  set points = points + amount
  where id = receiver_id;
end;
$$;
