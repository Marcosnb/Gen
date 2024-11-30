-- Listar todas as funções que podem estar criando perguntas ou respostas
SELECT 
    p.proname as nome_funcao,
    pg_get_functiondef(p.oid) as definicao_funcao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND (
        p.proname LIKE 'create%' 
        OR p.proname LIKE 'add%'
        OR p.proname LIKE 'insert%'
        OR p.proname LIKE 'new%'
        OR p.proname LIKE 'criar%'
        OR p.proname LIKE 'adicionar%'
        OR p.proname LIKE 'inserir%'
        OR p.proname LIKE 'novo%'
    );
