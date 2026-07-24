-- Retire the unused internal workflow automation feature.
-- The application no longer exposes workflow APIs or a BullMQ worker.
-- Drop child tables first so all execution history and logs are removed.

DROP TABLE IF EXISTS public.workflow_logs;
DROP TABLE IF EXISTS public.workflow_executions;
DROP TABLE IF EXISTS public.workflows;
