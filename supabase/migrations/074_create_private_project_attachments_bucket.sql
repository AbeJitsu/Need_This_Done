-- Reproduce the retained project-attachment boundary from migrations.
--
-- Purpose: fresh local and recovery environments must provide the private
-- bucket used by the project intake and authorized download routes.
-- Impact: creates or normalizes bucket metadata only; no objects are moved or
-- deleted. Application routes continue to use the service role after their
-- existing validation and project-access checks.
-- Verification: the retained schema manifest asserts privacy, size, and MIME
-- restrictions after a fresh local reset.
-- Rollback: remove the bucket only after confirming it contains no objects and
-- no retained caller uses it. Hosted application requires separate approval.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'project-attachments',
  'project-attachments',
  false,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]::text[]
)
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
