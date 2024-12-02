-- Função para deletar uma pergunta e todas suas dependências de forma segura
create or replace function delete_question_safely(question_id_param uuid)
returns void
language plpgsql
security definer
as $$
declare
    v_user_id uuid;
begin
    -- Verificar se a pergunta existe
    select user_id into v_user_id
    from questions
    where id = question_id_param;

    if not found then
        raise exception 'Pergunta não encontrada';
    end if;

    -- Deletar em ordem para evitar violações de chave estrangeira
    
    -- 1. Deletar curtidas
    delete from question_likes
    where question_id = question_id_param;

    -- 2. Deletar notificações
    delete from notifications
    where question_id = question_id_param;

    -- 3. Deletar respostas
    delete from answers
    where question_id = question_id_param;

    -- 4. Finalmente, deletar a pergunta
    delete from questions
    where id = question_id_param;

end;
$$;
