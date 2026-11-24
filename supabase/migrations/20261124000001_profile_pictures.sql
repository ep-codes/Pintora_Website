-- Profile pictures. Each person's pictures are in their own folder of the "avatars" bucket, named by their id.
alter table public.profiles add column avatar_path text;
alter table public.profiles add constraint profiles_avatar_path_check
  check (avatar_path ~ ('^' || id::text || '/[0-9a-f-]{36}[.]jpg$'));
grant update (avatar_path) on public.profiles to authenticated;

-- Public: anyone with a picture's address can see it. The site shrinks pictures to small JPEGs before uploading.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 524288, array['image/jpeg']);

create policy "People can add pictures to their own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "People can list their own pictures" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "People can delete their own pictures" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
