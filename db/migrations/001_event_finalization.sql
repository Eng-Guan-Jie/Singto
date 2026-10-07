-- PB-09: store the date(s) the organizer confirms.
-- Run once in the Neon SQL editor before using
-- Confirm Date. Safe to re-run.
--
-- finalized_date and finalized_at already exist in the
-- team's database; IF NOT EXISTS leaves them untouched.

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS finalized_date date,
  ADD COLUMN IF NOT EXISTS finalized_at timestamptz,
  -- Every confirmed day ("Multiple Dates" in the design).
  -- finalized_date keeps the first one.
  ADD COLUMN IF NOT EXISTS finalized_dates date[],
  ADD COLUMN IF NOT EXISTS finalization_note text,
  -- AGENTS.md 5.6: who made the confirmation.
  -- 'user' = the organizer pressed Confirm;
  -- 'system_auto' is reserved for automatic confirmation.
  ADD COLUMN IF NOT EXISTS finalized_by text
    CHECK (finalized_by IN ('user', 'system_auto'));
