# Singto — LINE-Integrated Group Scheduling Assistant

**Live URL:**  
- **LINE:** https://lin.ee/ob6Q2Yw

---

## Problem

Finding a date that works for everyone in a group is harder than it looks. Most groups coordinate through LINE or Messenger, where members share their available dates in chat messages and the organizer has to manually collect and compare them.

This often leads to repeated discussions, delayed or missing responses, and availability scattered across the conversation. If someone's schedule changes after a date has been proposed, the organizer may need to repeat the process.

User research with people who regularly organize group activities showed that finding a suitable date can take **several days or multiple rounds of discussion**. Users wanted a centralized way to view everyone's availability and identify suitable dates more efficiently, without repeatedly chasing participants for responses.

## Process

**Approach:** Rather than asking users to adopt another platform, Singto integrates with the communication platform they already use. It starts the scheduling process through a LINE group and directs participants to a lightweight web application using a shared link. No separate application installation is required.

**Workflow:**

1. **Create:** The organizer starts an event through the LINE group and provides its title and preferred scheduling period.
2. **Collect:** Participants open the shared link and submit the dates they are available.
3. **Analyze:** The system consolidates participants' availability and uses a rule-based algorithm to identify dates with the highest availability.
4. **Confirm:** The organizer reviews the suggested dates and makes the final decision. The confirmed appointment is then displayed to participants.
5. **Notify:** The system supports LINE-based communication to share event information and confirmation with participants.

**Key decision:** The system suggests; people decide. Singto does not automatically confirm an appointment. The organizer retains control over the final scheduling decision.

**Development stages:**  
Requirement gathering and user research → requirements and compliance (PDPA) → system and UX design → scope definition and development → alpha build and LINE integration → testing and user validation → final delivery.

### Challenges & Lessons Learned

1. **Calendar Color Clarity:** During user testing, participants found it difficult to understand what each calendar color represented without explanations. We addressed this by adding clear labels to explain the meaning of each color, making availability easier to interpret.

2. **Availability Visibility:** Participants wanted to see detailed daily availability, including who was available or unavailable, similar to the event organizer's view. In response, we improved the participant view to provide more detailed visibility into other participants' availability.

3. **LINE OA Message Limits:** During development and testing, we encountered message limitations when sending LINE Official Account cards. We considered two alternatives: creating a new account or upgrading to a premium plan. We chose to create a new account so development and testing could continue without additional costs.

## Outcome

**Delivered:** A LINE-integrated scheduling assistant, a web application for creating events and collecting and viewing availability, Best Date functionality, backend APIs and database integration, UI/UX designs, automated testing, project documentation, and a user guide.

### Targets and Results

| Goal | Target / Measurement | Result |
|---|---|---|
| Main workflow | Create → Collect → Analyze → Confirm | Core workflow implemented. LINE and Neon integration testing was also reported in the project test documentation. |
| Automated testing | All documented test cases pass with no failures | **49 passed, 0 failed** across seven test files, as reported in `test/README.md` on 18 November 2026. |
| Discussion rounds | Reduce from approximately 3–5+ rounds to 1–2 rounds | To be measured through comparative user testing; no verified result available yet. |
| User evaluation | Users find the system easy to use, useful, and less effortful | User sessions are reported in the test documentation, but individual evaluation records and completed SUS/TAM scores are not available in the supplied evidence. |

**Testing note:** The automated test results demonstrate that the documented test cases passed. The project documentation also reports manual interface checks in a phone-sized browser and end-to-end testing with real LINE and Neon services. However, these results should not be treated as proof of a measured reduction in scheduling time or discussion rounds without corresponding user-evaluation data.

**Algorithm note:** Best Date is a deterministic, rule-based scheduling algorithm. It evaluates accepted participants' availability, supports consecutive multi-day scheduling, applies the configured weekend and fixed-date Thai public holiday filters, and returns dates tied for the highest availability count. It does not use machine learning or generative AI to make scheduling decisions.