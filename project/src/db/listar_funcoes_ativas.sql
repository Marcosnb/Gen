-- Listar todos os triggers ativos nas tabelas questions e answers
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('questions', 'answers');

-- Listar todas as funções que podem estar relacionadas a pontos
SELECT 
    p.proname as nome_funcao,
    pg_get_functiondef(p.oid) as definicao_funcao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND (p.proname LIKE '%point%' OR p.proname LIKE '%ponto%');
