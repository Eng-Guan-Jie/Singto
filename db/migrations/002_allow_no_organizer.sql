-- "Delete my account" (AGENTS.md 5.1).
-- Run once in the Neon SQL editor before using it.
-- Safe to re-run.
--
-- When an organizer deletes their account, their events
-- stay for the other members but must no longer point to
-- them, so organizer_line_user_id has to allow NULL.
-- (Does nothing if the column already allows NULL.)

ALTER TABLE events
  ALTER COLUMN organizer_line_user_id DROP NOT NULL;

-- Check before relying on deletions: list foreign keys
-- that point at events or participants. If the audit log
-- table is listed with ON DELETE CASCADE, deleting an event
-- or a person would also delete their audit log rows,
-- which must be kept for at least 90 days (AGENTS.md 5.4).
SELECT
  conrelid::regclass AS from_table,
  confrelid::regclass AS to_table,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype = 'f'
  AND confrelid IN ('events'::regclass, 'participants'::regclass);
