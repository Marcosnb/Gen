-- Função para deletar uma pergunta e todas suas dependências
create or replace function delete_question(question_id_param uuid)
returns void
language plpgsql
security definer
as $$
begin
    -- Primeiro, deletar todas as curtidas relacionadas
    delete from question_likes
    where question_id = question_id_param;

    -- Deletar todas as notificações relacionadas
    delete from notifications
    where question_id = question_id_param;

    -- Deletar todas as respostas relacionadas
    delete from answers
    where question_id = question_id_param;

    -- Finalmente, deletar a pergunta
    delete from questions
    where id = question_id_param;

    if not found then
        raise exception 'Pergunta não encontrada';
    end if;
end;
$$;
