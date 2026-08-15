-- Remove out-of-band anonymous access from the retained private attachment bucket.
--
-- Purpose: restore the repository's server-controlled Storage boundary. The
-- hosted project was found with anonymous read and upload policies on
-- project-attachments even though the bucket is marked private.
-- Impact: anonymous clients can no longer list, read, or upload objects in
-- project-attachments. Existing server-side service-role routes and bucket
-- limits/MIME rules remain unchanged. No object bytes are moved or deleted.
-- Verification: the retained schema manifest and hosted parity verifier must
-- find no project-attachments policy and anonymous Storage listing must expose
-- no object metadata.
-- Rollback: do not recreate anonymous access. If a future retained caller
-- needs access, add a separately reviewed authenticated or server-issued,
-- path-scoped forward policy.

drop policy if exists "Allow anonymous read" on storage.objects;
drop policy if exists "Allow anonymous uploads" on storage.objects;
