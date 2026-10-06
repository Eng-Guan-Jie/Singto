-- PB-09: store the date(s) the organizer confirms.
-- Run once in the Neon SQL editor before deploying the
-- Confirm Date feature.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS confirmed_dates date[],
  ADD COLUMN IF NOT EXISTS confirmation_note text,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  -- AGENTS.md 5.6: who made the confirmation.
  -- 'user' = the organizer pressed Confirm;
  -- 'system_auto' is reserved for automatic confirmation.
  ADD COLUMN IF NOT EXISTS confirmed_by text
    CHECK (confirmed_by IN ('user', 'system_auto'));
