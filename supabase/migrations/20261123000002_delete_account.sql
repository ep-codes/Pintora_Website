-- Lets a signed-in person delete their own account (Settings → Delete account).
-- Their profile goes with it, because profiles.id cascades from auth.users.
create function public.delete_account() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = (select auth.uid());
$$;
revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;
