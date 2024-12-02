-- Primeiro, remover os triggers e funções antigas
DROP TRIGGER IF EXISTS trigger_pontos_pergunta ON questions;
DROP TRIGGER IF EXISTS trigger_pontos_resposta ON answers;
DROP FUNCTION IF EXISTS adicionar_pontos_conteudo();

-- Criar a nova função com os valores corretos
create or replace function adicionar_pontos_conteudo()
returns trigger as $$
declare
    pontos_adicionar int;
begin
    -- Determina os pontos baseado na tabela que está sendo atualizada
    IF TG_TABLE_NAME = 'questions' THEN
        pontos_adicionar := 5; -- 5 pontos por criar uma pergunta
    ELSIF TG_TABLE_NAME = 'answers' THEN
        pontos_adicionar := 7; -- 7 pontos por criar uma resposta
    END IF;

    -- Atualiza os pontos do usuário
    perform update_user_points(NEW.user_id, pontos_adicionar);
    
    return NEW;
end;
$$ language plpgsql;

-- Criar os novos triggers
create trigger trigger_pontos_pergunta
    after insert on questions
    for each row
    execute function adicionar_pontos_conteudo();

create trigger trigger_pontos_resposta
    after insert on answers
    for each row
    execute function adicionar_pontos_conteudo();
