-- Atualizar a função answer_question para remover a parte dos pontos
CREATE OR REPLACE FUNCTION public.answer_question(p_question_id uuid, p_content text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
declare
    v_user_id uuid;
begin
    -- Get the current user's ID
    v_user_id := auth.uid();
    
    -- Check if user is authenticated
    if v_user_id is null then
        raise exception 'Not authenticated';
    end if;

    -- Insert the answer
    insert into answers (question_id, user_id, content)
    values (p_question_id, v_user_id, p_content);

    -- Update question answer count
    update questions 
    set answer_count = answer_count + 1
    where id = p_question_id;
end;
$function$;
