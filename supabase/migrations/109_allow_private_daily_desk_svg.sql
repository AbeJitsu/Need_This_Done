-- Permit the deterministic Daily Desk SVG graphic in the already-private
-- agent-media-private bucket. The bucket remains non-public and no browser
-- Storage policy is added; owner APIs still issue short-lived signed URLs.

update storage.buckets
set allowed_mime_types = array[
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'audio/mpeg',
  'audio/wav',
  'text/vtt',
  'application/x-subrip',
  'text/plain'
]::text[]
where id = 'agent-media-private';
