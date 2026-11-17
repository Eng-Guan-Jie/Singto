# Issue Log – Singto UAT

Repository: [Eng-Guan-Jie/Singto](https://github.com/Eng-Guan-Jie/Singto). Commit hashes link to the fix on `main`.

**Severity scale**

| Severity | Meaning |
|---|---|
| Critical | Blocks a MUST task or corrupts data. No workaround |
| High | Causes wrong results or Partial/Failed tasks for several users |
| Medium | Causes confusion, extra steps or help requests, but users can recover |
| Low | Cosmetic issue or minor friction |

**Status:** `Fixed` · `Partly fixed` · `Open` · `Not reproduced` · `Closed – design changed` · `Won't fix – out of scope`
**Retest:** `Pass` · `Fail` · `Pending` (fixed, not yet retested) · `—` (not applicable)

All fixed and changed items were retested on 18 Nov 2026 and passed (§3).

## Summary (as of 18 Nov 2026)

| Status | Count | Issues |
|---|---|---|
| Fixed | 4 | ISS-01, ISS-02, ISS-03, ISS-14 |
| Partly fixed | 1 | ISS-12 |
| Open | 6 | ISS-05, ISS-06, ISS-07, ISS-10, ISS-11, ISS-13 |
| Not reproduced | 1 | ISS-04 |
| Closed – design changed | 1 | ISS-08 |
| Won't fix – out of scope | 1 | ISS-09 |
| **Total** | **14** | 0 Critical · 3 High · 3 Medium · 6 Low · 2 n/a |

## 1. Defects and usability issues

| ID | Issue | Task | Users affected | Severity | Status | Fix commit | Retest |
|---|---|---|---|---|---|---|---|
| ISS-01 | **Quick Select also selects dates outside the organizer's date range** | T3 | U08 | High | Fixed | No separately named commit (note A) | Pass (18 Nov) |
| ISS-02 | **Calendar dates don't look tappable.** Users didn't realise they could select dates (no affordance) | T3 | U06 (Partial) | High | Fixed | No separately named commit (note A) | Pass (18 Nov) |
| ISS-03 | **The meaning of yellow is unclear.** The legend doesn't explain the in-between state | T4 | U03, U04, U05, U09, U10 (5/10) | High | Fixed | [`05b7b57`](https://github.com/Eng-Guan-Jie/Singto/commit/05b7b57) Explain each calendar colour in the legend | Pass (18 Nov) |
| ISS-04 | **The Availability Overview doesn't update in real time.** The organizer must reopen or refresh to see new submissions | T4 | U04, U05, U08 (3/10) | Low | Not reproduced | — (note B) | — |
| ISS-05 | **The "Schedule period" / start–end date label is misread** as the fixed dates of the meetup instead of the range to poll | T1 | U02, U04, U05, U08 (4/10) | Medium | Open | — | — |
| ISS-06 | **No easy way back to the full overview** after opening a day's details or applying the Best Date filter (no back button, tapping the date again does nothing) | T4, T5 | U02, U06 | Medium | Open | — | — |
| ISS-07 | **Single-day vs multi-day choice at Finalize is confusing.** Suggestion to move it to Create Event | T6 | U08 (needed an explanation), U09 (suggestion only) | Low | Open | — | — |
| ISS-08 | **Reminder before the event day is not sent** | T6 | U03 | — | Closed – design changed | [`221abfe`](https://github.com/Eng-Guan-Jie/Singto/commit/221abfe) · [`52f48ab`](https://github.com/Eng-Guan-Jie/Singto/commit/52f48ab) (note C) | Pass (18 Nov) |
| ISS-09 | **A withdrawal after finalization is not announced in LINE.** The count drops in the app only | T6 | U03 | — | Won't fix – out of scope | — (note D) | — |
| ISS-10 | **LIFF load time of about 3–5 s, with a laggy feel** | T1, T2 | U01, U04, U05, U07, U09 (5/10) | Medium | Open | — | — |
| ISS-11 | **Unclear next step after selecting availability** (no clear "Submit / Done" cue) | T3 | U07 | Low | Open | — | — |
| ISS-12 | **The event entry point is hard to find.** The user asked where to tap, and older events get buried in the chat | T2 | U07, U08 | Low | Partly fixed | [`34e82e3`](https://github.com/Eng-Guan-Jie/Singto/commit/34e82e3) Add on-going and archived events to the profile menu | Pass (18 Nov) |
| ISS-13 | **The "Quick Select" label is not self-explanatory** | T3 | U03 | Low | Open | — | — |
| ISS-14 | **The final-date LINE message shows only the attendee count**, not who is going | T6 | U03 | Low | Fixed | [`2b903fa`](https://github.com/Eng-Guan-Jie/Singto/commit/2b903fa) Show who joins and who declined on the confirmed card and a details page · [`7a36489`](https://github.com/Eng-Guan-Jie/Singto/commit/7a36489) Redesign the confirmed card with joined and declined panels | Pass (18 Nov) |

### Notes

- **A – ISS-01, ISS-02:** The team has confirmed both fixes. No commit names either fix, because development happened on `Singto_GuanJie` and the work reached `main` in batches. U06 (12 Nov) and U08 (15 Nov) tested the 9 Nov build ([`78e8830`](https://github.com/Eng-Guan-Jie/Singto/commit/78e8830)). The next push to `main` was the 17 Nov batch starting at [`4bc4d98`](https://github.com/Eng-Guan-Jie/Singto/commit/4bc4d98). The current code was checked for both issues:
  - **ISS-01:** `handleQuickSelect` in `src/pages/Overview/Overview.jsx` only selects dates between the event's start and end date. As a second safeguard, `api/events/[id]/availability.js` rejects any out-of-range date with *"Dates must be within the event's scheduling period."*
  - **ISS-02:** Days that are still empty show in grey, and the page opens on My Availability first ([`f5e0ca2`](https://github.com/Eng-Guan-Jie/Singto/commit/f5e0ca2)). Calendar days on the participant page now have tappable styling ([`b5aedde`](https://github.com/Eng-Guan-Jie/Singto/commit/b5aedde)).
- **B – ISS-04:** This could not be reproduced on the team's devices. It is likely related to the users' devices or connections rather than to Singto itself. The severity was lowered to Low.
- **C – ISS-08:** The design was changed. Instead of a reminder before the event date, the organizer can send a **reminder to fill in the form**: a bubble posted to the LINE group showing the current response count ([`221abfe`](https://github.com/Eng-Guan-Jie/Singto/commit/221abfe)). The remind button is hidden once everyone has responded ([`52f48ab`](https://github.com/Eng-Guan-Jie/Singto/commit/52f48ab)). Reminding people before the event itself is outside Singto's scope.
- **D – ISS-09:** Out of scope. Singto's purpose is to **find the best date**. What happens after the date is confirmed (withdrawals, attendance changes) is outside the product scope, so this is recorded as a user suggestion only.

### Suggested fixes for open issues

| ID | Suggested fix |
|---|---|
| ISS-05 | Rename to "Dates to choose from" or "Poll date range", with helper text: *"Friends will pick the days they're free within this range."* |
| ISS-06 | Tapping the selected date again resets to the full overview, plus an explicit "← Back to overview" / "Clear filter" button |
| ISS-07 | Ask "Is this a one-day or multi-day plan?" in Create Event |
| ISS-10 | Profile the LIFF init and first API call, add a skeleton loader, and defer non-critical requests |
| ISS-11 | Sticky "Submit availability" button with a confirmation toast |
| ISS-13 | Rename to "Select all / Weekends / Every …" or add a one-line hint |

## 2. Enhancement requests (backlog)

| ID | Request | Users | Priority | Status |
|---|---|---|---|---|
| ENH-01 | Voting / finalize-by deadline, so participants know when the organizer will lock the date | U01, U03 | Should | Open |
| ENH-02 | Show **who** is free on each date (to participants as well as the organizer) | U03 | Should | Done: participants can tap a day to see who is free on it ([`b5aedde`](https://github.com/Eng-Guan-Jie/Singto/commit/b5aedde)). Who joins is shown on the participant page and organizer Overview ([`7068cb7`](https://github.com/Eng-Guan-Jie/Singto/commit/7068cb7), [`8b3399e`](https://github.com/Eng-Guan-Jie/Singto/commit/8b3399e)) |
| ENH-03 | Best Date summary on the participant view | U05 | Should | Done: [`b5aedde`](https://github.com/Eng-Guan-Jie/Singto/commit/b5aedde) Show Best Date to participants |
| ENH-04 | "Cancel attendance" after a date is finalized | U02, U03 | Should | Open |
| ENH-05 | Thai language UI | U04 | Should | Done: [`b083245`](https://github.com/Eng-Guan-Jie/Singto/commit/b083245) Add Thai language following the LINE app setting · [`3e36aee`](https://github.com/Eng-Guan-Jie/Singto/commit/3e36aee) Add TH/EN language switch (9 Nov, after U04's 7 Nov session) |
| ENH-06 | "Maybe" availability option | U05 | Could | Open |
| ENH-07 | Google Calendar sync / integration | U02, U09 | Could | Open |
| ENH-08 | "Clear all selections" button | U10 | Could | Open |
| ENH-09 | Attach a link or image to an event | U01 | Could | Open |
| ENH-10 | More descriptive product name | U01 | Won't (this iteration) | Consider a tagline instead |

## 3. Retest log

All scenarios were run by the team on the current production build on 18 Nov 2026.

| Issue | Scenario | Expected | Date | Tester | Result |
|---|---|---|---|---|---|
| ISS-01 | Organizer sets a 7-day range in the middle of a month. Participant taps Quick Select → All Day, then Weekends | Only dates inside the range are selected | 18 Nov 2026 | Team | ✅ Pass |
| ISS-02 | A person who hasn't seen Singto opens a new event as a participant | Selects a date without help, within 10 s | 18 Nov 2026 | Team | ✅ Pass |
| ISS-08 | Organizer taps the remind button while some members haven't responded | A bubble with the response count is posted to the LINE group. The button is hidden once everyone has responded | 18 Nov 2026 | Team | ✅ Pass |
| ISS-03 | Open the Overview with at least one partly-available date | The legend explains green, yellow and red in words | 18 Nov 2026 | Team | ✅ Pass |
| ISS-12 | Create two events in the same group, then open the profile menu | Both events are listed under on-going | 18 Nov 2026 | Team | ✅ Pass |
| ISS-14 | Finalize a date with 2 joined and 1 declined | The LINE confirmed card shows who joined and who declined | 18 Nov 2026 | Team | ✅ Pass |
| ENH-02 | As a participant, tap a day on the calendar | The names of people free on that day are shown | 18 Nov 2026 | Team | ✅ Pass |
| ENH-03 | Open the event as a participant after 3 people have responded | Best Date summary is visible | 18 Nov 2026 | Team | ✅ Pass |
| ENH-05 | Switch the LINE app language to Thai, then use the TH/EN toggle | UI follows the LINE language and the toggle switches it | 18 Nov 2026 | Team | ✅ Pass |
