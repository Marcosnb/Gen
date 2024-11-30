-- Ver o conteúdo da função handle_new_answer
SELECT pg_get_functiondef(oid) as definicao_funcao
FROM pg_proc
WHERE proname = 'handle_new_answer';
