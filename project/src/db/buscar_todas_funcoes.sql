-- Listar TODAS as funções do banco que podem estar relacionadas a pontos
SELECT 
    p.proname as nome_funcao,
    pg_get_functiondef(p.oid) as definicao_funcao
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND (
        p.proname LIKE '%point%' 
        OR p.proname LIKE '%ponto%'
        OR p.proname LIKE '%answer%'
        OR p.proname LIKE '%question%'
        OR p.proname LIKE '%resposta%'
        OR p.proname LIKE '%pergunta%'
    );
