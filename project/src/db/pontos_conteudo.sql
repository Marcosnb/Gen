-- Função para adicionar pontos ao criar perguntas ou respostas
create or replace function adicionar_pontos_conteudo()
returns trigger as $$
declare
    pontos_adicionar int;
    pergunta_user_id uuid;
begin
    -- Determina os pontos baseado na tabela que está sendo atualizada
    IF TG_TABLE_NAME = 'questions' THEN
        pontos_adicionar := 5; -- Pontos por criar uma pergunta (alterado de 7 para 5)
    ELSIF TG_TABLE_NAME = 'answers' THEN
        -- Buscar o user_id da pergunta
        SELECT user_id INTO pergunta_user_id
        FROM questions
        WHERE id = NEW.question_id;

        -- Só adiciona pontos se não for o autor da pergunta
        IF NEW.user_id != pergunta_user_id THEN
            pontos_adicionar := 7; -- Pontos por criar uma resposta (alterado de 20 para 7)
        ELSE
            pontos_adicionar := 0; -- Não ganha pontos se responder própria pergunta
        END IF;
    END IF;

    -- Atualiza os pontos do usuário apenas se houver pontos para adicionar
    IF pontos_adicionar > 0 THEN
        perform update_user_points(NEW.user_id, pontos_adicionar);
    END IF;
    
    return NEW;
end;
$$ language plpgsql;

-- Trigger para tabela de perguntas
create or replace trigger trigger_pontos_pergunta
    after insert on questions
    for each row
    execute function adicionar_pontos_conteudo();

-- Trigger para tabela de respostas
create or replace trigger trigger_pontos_resposta
    after insert on answers
    for each row
    execute function adicionar_pontos_conteudo();
