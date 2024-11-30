-- Listar TODOS os triggers do banco de dados
SELECT 
    tgname AS trigger_name,
    tgrelid::regclass AS table_name,
    tgfoid::regproc AS function_name,
    pg_get_triggerdef(oid) AS trigger_definition
FROM pg_trigger
WHERE tgisinternal = false;
