-- Remover todos os triggers possíveis relacionados a pontos nas tabelas questions e answers
DROP TRIGGER IF EXISTS trigger_pontos_pergunta ON questions;
DROP TRIGGER IF EXISTS trigger_pontos_resposta ON answers;
DROP TRIGGER IF EXISTS question_points_trigger ON questions;
DROP TRIGGER IF EXISTS answer_points_trigger ON answers;
DROP TRIGGER IF EXISTS add_points_question_trigger ON questions;
DROP TRIGGER IF EXISTS add_points_answer_trigger ON answers;

-- Remover todas as funções antigas possíveis
DROP FUNCTION IF EXISTS adicionar_pontos_conteudo();
DROP FUNCTION IF EXISTS add_points_for_content();
DROP FUNCTION IF EXISTS add_points_on_content();
DROP FUNCTION IF EXISTS points_for_content();

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
