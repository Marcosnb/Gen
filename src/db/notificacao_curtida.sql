-- Função para criar notificação quando receber curtida
create or replace function notificar_curtida()
returns trigger as $$
declare
  question_info record;
begin
  -- Verificar se os IDs necessários estão presentes
  if NEW.question_id is null then
    raise exception 'ID da pergunta não pode ser nulo';
  end if;

  if NEW.user_id is null then
    raise exception 'ID do usuário não pode ser nulo';
  end if;

  -- Buscar informações da pergunta
  select title, user_id into strict question_info 
  from questions 
  where id = NEW.question_id;

  -- Criar notificação para o autor da pergunta (se não for o próprio autor curtindo)
  if question_info.user_id != NEW.user_id then
    insert into notifications (
      user_id,
      question_id,
      question_title,
      created_at,
      read
    ) values (
      question_info.user_id,
      NEW.question_id,
      question_info.title,
      now(),
      false
    );
  end if;

  return NEW;
exception
  when no_data_found then
    raise exception 'Pergunta não encontrada';
  when others then
    raise exception 'Erro ao processar notificação de curtida: % | Estado: NEW.question_id=%, NEW.user_id=%', 
      SQLERRM, NEW.question_id, NEW.user_id;
end;
$$ language plpgsql;

-- Remover trigger antigo se existir
drop trigger if exists trigger_notificar_curtida on question_likes;

-- Criar o trigger
create trigger trigger_notificar_curtida
after insert on question_likes
for each row
execute function notificar_curtida();
