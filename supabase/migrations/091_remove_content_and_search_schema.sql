-- Remove repository-retired CMS, changelog, chatbot/vector-search, analytics,
-- enrollment, and media storage objects. Bucket rows are deleted explicitly;
-- object rows must already be absent or the foreign key fails closed.

do $$
declare object record;
begin
  for object in select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public' and tablename = any(array['page_content_history','enrollments','page_content','page_embeddings','page_views','pages','blog_posts','changelog_entries','media'])
  loop execute format('drop policy %I on %I.%I', object.policyname, object.schemaname, object.tablename); end loop;
  for object in select distinct event_object_schema as schemaname, event_object_table as tablename, trigger_name from information_schema.triggers
    where event_object_schema = 'public' and event_object_table = any(array['page_content_history','enrollments','page_content','page_embeddings','page_views','pages','blog_posts','changelog_entries','media'])
  loop execute format('drop trigger %I on %I.%I', object.trigger_name, object.schemaname, object.tablename); end loop;
end $$;

drop function if exists public.cleanup_page_content_history() restrict;
drop function if exists public.match_page_embeddings(extensions.vector, double precision, integer) restrict;
drop function if exists public.set_blog_published_at() restrict;
drop function if exists public.set_blog_published_at_on_insert() restrict;
drop function if exists public.set_published_at() restrict;
drop function if exists public.update_changelog_entries_updated_at() restrict;
drop function if exists public.update_enrollments_updated_at() restrict;
drop function if exists public.update_media_updated_at() restrict;
drop view if exists public.page_view_stats restrict;

drop table if exists public.page_content_history restrict;
drop table if exists public.enrollments restrict;
drop table if exists public.page_content restrict;
drop table if exists public.page_embeddings restrict;
drop table if exists public.page_views restrict;
drop table if exists public.pages restrict;
drop table if exists public.blog_posts restrict;
drop table if exists public.changelog_entries restrict;
drop table if exists public.media restrict;

drop policy if exists "Authenticated users can delete media" on storage.objects;
drop policy if exists "Authenticated users can delete product images" on storage.objects;
drop policy if exists "Authenticated users can update media" on storage.objects;
drop policy if exists "Authenticated users can update product images" on storage.objects;
drop policy if exists "Authenticated users can upload media" on storage.objects;
drop policy if exists "Authenticated users can upload product images" on storage.objects;
drop policy if exists "Public can view media library images" on storage.objects;
drop policy if exists "Public can view product images" on storage.objects;

set storage.allow_delete_query = 'true';
delete from storage.objects where bucket_id in ('media-library', 'product-images');
delete from storage.buckets where id in ('media-library', 'product-images');
reset storage.allow_delete_query;
