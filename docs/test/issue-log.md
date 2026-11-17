# Issue Log – Singto UAT

**Severity scale**

| Severity | Meaning |
|---|---|
| Critical | Blocks a MUST task or corrupts data. No workaround |
| High | Causes wrong results or Partial/Failed tasks for several users |
| Medium | Causes confusion, extra steps or help requests, but users can recover |
| Low | Cosmetic issue or minor friction |

**Status:** `Fixed` · `Open` · `Won't fix`
**Retest:** `Pass` · `Fail` · `Pending` · `—` (not fixed yet)

> 🔧 Replace every `TODO` in the *Fix commit* column with the short commit hash, e.g. [`a1b2c3d`](https://github.com/ORG/REPO/commit/a1b2c3d). After retesting, update *Retest* with the result and date.

## 1. Defects and usability issues

| ID | Issue | Task | Users affected | Severity | Status | Fix commit | Retest |
|---|---|---|---|---|---|---|---|
| ISS-01 | **Quick Select also selects dates outside the organizer's date range** | T3 | U08 | High | Fixed | `TODO` | Pending |
| ISS-02 | **Calendar dates don't look tappable.** Users didn't realise they could select dates (no affordance) | T3 | U06 (Partial) | High | Fixed | `TODO` | Pending |
| ISS-03 | **The meaning of yellow is unclear.** The legend doesn't explain the in-between state | T4 | U03, U04, U05, U09, U10 (5/10) | High | Open | — | — |
| ISS-04 | **The Availability Overview doesn't update in real time.** The organizer must reopen or refresh to see new submissions | T4 | U04, U05, U08 (3/10) | High | Open | — | — |
| ISS-05 | **The "Schedule period" / start–end date label is misread** as the fixed dates of the meetup instead of the range to poll | T1 | U02, U04, U05, U08 (4/10) | Medium | Open | — | — |
| ISS-06 | **No easy way back to the full overview** after opening a day's details or applying the Best Date filter (no back button, tapping the date again does nothing) | T4, T5 | U02, U06 | Medium | Open | — | — |
| ISS-07 | **Single-day vs multi-day choice at Finalize is confusing.** Users suggest moving it to Create Event | T6 | U08, U09 | Medium | Open | — | — |
| ISS-08 | **Reminder before the event day is not sent.** It was in the design but missed in implementation | T6 | U03 | Medium | Open | — | — |
| ISS-09 | **A withdrawal after finalization is not announced in LINE.** The count drops in the app only | T6 | U03 | Medium | Open | — | — |
| ISS-10 | **LIFF load time of about 3–5 s, with a laggy feel** | T1, T2 | U01, U04, U05, U07, U09 (5/10) | Medium | Open | — | — |
| ISS-11 | **Unclear next step after selecting availability** (no clear "Submit / Done" cue) | T3 | U07 | Low | Open | — | — |
| ISS-12 | **The event entry point is hard to find.** The user asked where to tap, and older events get buried in the chat | T2 | U07, U08 | Low | Open | — | — |
| ISS-13 | **The "Quick Select" label is not self-explanatory** | T3 | U03 | Low | Open | — | — |
| ISS-14 | **The final-date LINE message shows only the attendee count**, not who is going | T6 | U03 | Low | Open | — | — |

### Suggested fixes

| ID | Suggested fix |
|---|---|
| ISS-03 | Add a visible legend under the calendar: *Green = everyone free · Yellow = some free · Red = no one free* (plus a tooltip that shows the count) |
| ISS-04 | Poll or subscribe for updates (e.g. refetch on focus or every N seconds, or use websockets/Supabase realtime) |
| ISS-05 | Rename to "Dates to choose from" or "Poll date range", with helper text: *"Friends will pick the days they're free within this range."* |
| ISS-06 | Tapping the selected date again resets to the full overview, plus an explicit "← Back to overview" / "Clear filter" button |
| ISS-07 | Ask "Is this a one-day or multi-day plan?" in Create Event |
| ISS-10 | Profile the LIFF init and first API call, add a skeleton loader, and defer non-critical requests |
| ISS-11 | Sticky "Submit availability" button with a confirmation toast |
| ISS-12 | Add a rich-menu entry or `/events` command that lists the group's events |

## 2. Enhancement requests (backlog)

These are feature requests, not defects. They are candidates for SHOULD/COULD in the next iteration.

| ID | Request | Users | Priority (proposed) |
|---|---|---|---|
| ENH-01 | Voting / finalize-by deadline, so participants know when the organizer will lock the date | U01, U03 | Should |
| ENH-02 | Show **who** is free on each date (to participants as well as the organizer) | U03 | Should |
| ENH-03 | Best Date summary on the participant view | U05 | Should |
| ENH-04 | "Cancel attendance" after a date is finalized | U02, U03 | Should |
| ENH-05 | Thai language UI | U04 | Should |
| ENH-06 | "Maybe" availability option | U05 | Could |
| ENH-07 | Google Calendar sync / integration | U02, U09 | Could |
| ENH-08 | "Clear all selections" button | U10 | Could |
| ENH-09 | Attach a link or image to an event | U01 | Could |
| ENH-10 | More descriptive product name (the name "Singto" doesn't explain the function) | U01 | Won't (this iteration). Consider a tagline instead |

## 3. Retest log

| Date | Issue | Tester | Scenario | Result | Notes |
|---|---|---|---|---|---|
| TODO | ISS-01 | | Organizer sets a range, participant uses Quick Select → only dates inside the range are selected | | |
| TODO | ISS-02 | | New participant opens the event → identifies tappable dates without help | | |
