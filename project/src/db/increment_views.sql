-- Função para incrementar visualizações de forma segura
create or replace function increment_question_views(question_id uuid)
returns integer
language plpgsql
security definer
as $$
declare
  new_views integer;
begin
  update questions
  set views = coalesce(views, 0) + 1
  where id = question_id
  returning views into new_views;
  
  return new_views;
end;
$$;
