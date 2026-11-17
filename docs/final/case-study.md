# Singto — LINE-Integrated Group Scheduling Assistant

**Live URL:**
- **LINE:** https://lin.ee/ob6Q2Yw

---

## Problem

Finding a date that works for everyone in a group is harder than it looks. Most groups coordinate in LINE or Messenger: members post their available dates as messages, and the organizer manually collects and compares them.

This leads to repeated discussions, delayed or missing responses, and availability scattered across the chat. If someone's schedule changes after a date is proposed, the whole process starts over.

User research with people who regularly organize group activities showed that reaching a suitable date can take **several days or multiple rounds of discussion**. Users wanted one place to see everyone's availability and a quicker way to find a suitable date, without chasing each member.

---

## Process

**Approach:** Instead of asking users to adopt a new platform, Singto works inside the one they already use. It is a LINE-integrated assistant that starts the scheduling flow in the group chat and sends participants to a lightweight web app through a shared link. There is no app to install.

**Workflow:**

1. **Create:** a user starts an appointment from the LINE group chat and sets a title and preferred scheduling period.
2. **Collect:** participants open the shared link and select the dates they are available.
3. **Analyze:** the system compares everyone's availability, summarizes it in one view, and suggests suitable dates.
4. **Confirm:** the group picks a suggested date, and the confirmed appointment is shown to everyone.
5. **Notify:** participants get reminders about pending actions and confirmed appointments.

**Key decision:** the system suggests, people decide. Singto never confirms an appointment automatically.

**Stages:** requirement gathering and user research → requirements and compliance (PDPA) → system and UX design → scope lock and development → alpha build and LINE integration → testing and user validation → final delivery.

**Challenges & Lessons Learned:**

1. **Calendar Color Clarity:** During user testing, participants found it difficult to understand what each calendar color represented without explanations. We addressed this by adding clear labels to explain the meaning of each color, making availability easier to understand.

2. **Availability Visibility:** Participants wanted to see detailed daily availability, including who was available or unavailable, just like the event organizer. To address this, we updated the participant view to provide the same availability details as the organizer view.

3. **LINE OA Message Limits:** During development and testing, we encountered a message limit when sending LINE OA cards. We considered two solutions: creating a new account or upgrading to a premium plan. We chose to create a new account to continue development and testing without additional costs.

---

## Outcome

**Delivered:** a LINE scheduling assistant, a web app for collecting and viewing availability and confirming dates, backend APIs and database, UI/UX designs, test results, documentation, and a user guide.

**Targets and results:**

| Goal | Target | Result |
|---|---|---|
| Main workflow works end to end | Create → submit → suggest → confirm | [...] |
| Test cases | Pass with no critical errors | [...] |
| Discussion rounds | From ~3–5+ down to 1–2 | [...] |
| User evaluation | Easy to use, useful, less effort | [...] |
