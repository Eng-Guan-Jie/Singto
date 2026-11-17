# Singto – Project Comparison Table

## 1. Project Overview

**Project:** Singto – LINE-Integrated Group Scheduling Assistant  
**Live LINE Integration:** https://lin.ee/ob6Q2Yw

Singto addresses the difficulty of coordinating group schedules through LINE or Messenger. In a conventional group chat, participants share their availability across multiple messages, requiring the organizer to manually compare responses, follow up with people, and repeat discussions when no suitable date is found. This process can take several days or multiple rounds of discussion.

Singto provides a centralized scheduling workflow through LINE without requiring users to install another application.

**Core workflow:**

Create → Collect → Analyze → Confirm → Notify

A key design principle is that **Singto suggests suitable dates, but the organizer makes the final decision.** The system does not automatically confirm an event.

## 2. Feature Comparison

| Feature | Conventional Group Chat Scheduling | Singto |
|---|---|---|
| Event Creation | Event details are shared manually in chat messages. | Organizers create structured events through the web interface. |
| Availability Collection | Participants reply through separate messages, which may be delayed or overlooked. | Participants submit their availability through a shared event link. |
| Availability Overview | Organizers manually review and compare messages. | Availability is presented in a centralized calendar view. |
| Best Date Suggestion | Organizers manually compare participants' schedules. | A rule-based algorithm identifies dates with the highest participant availability. |
| Appointment Confirmation | The organizer announces the selected date in the group chat. | The organizer reviews the suggested date and confirms the final date. |
| Participant Notification | Organizers manually send updates to the group. | The system supports LINE-based event communication. |
| Application Accessibility | Participants can coordinate directly in the existing group chat. | Participants access the scheduling interface through a shared link without installing a separate application. |
| Availability Visibility | Information can become scattered across messages. | Participants and organizers can view submitted availability in a structured format. |

## 3. Best Date Algorithm Comparison

| Aspect | Manual Scheduling | Singto Best Date Algorithm |
|---|---|---|
| Availability Comparison | Organizer checks each participant's response manually. | The algorithm evaluates submitted availability programmatically. |
| Participant Eligibility | Depends on the organizer's manual interpretation. | Only participants with accepted status are included. |
| Multi-day Events | Organizer must check whether participants are available across the entire period. | A participant is counted only when available on every day in the consecutive date range. |
| Holiday Consideration | Depends on the organizer's awareness and manual checking. | Supports weekends and the fixed-date Thai public holidays defined in the calendar logic. |
| Multiple Suitable Dates | Organizer decides which dates appear suitable. | Returns all candidate dates tied for the highest availability count. |
| Final Decision | Organizer selects the date. | Organizer retains responsibility for selecting and confirming the date. |

**Algorithm classification:** Singto uses deterministic, rule-based scheduling logic. It does not use machine learning or a generative AI model to predict or select dates.

## 4. Testing and Evidence Comparison

| Testing Area | Evidence / Implementation | Status |
|---|---|---|
| Best Date Logic | Automated tests cover single-day and consecutive multi-day scheduling, holiday filtering, ties, and cases with no available participants. | Implemented and tested |
| Calendar Logic | Automated tests cover calendar-related date and holiday behavior. | Implemented and tested |
| Input Validation | Automated tests check validation behavior. | Implemented and tested |
| API Access Control | Tests cover access and authorization behavior. | Implemented and tested |
| Event Locking | Automated tests cover event locking behavior. | Implemented and tested |
| LINE Webhook and Cron | Tests cover webhook signature and scheduled cleanup behavior. | Implemented and tested |
| User Interface | The test documentation reports manual checks in a phone-sized browser and during user sessions. | Reported completed |
| LINE and Database Integration | The test documentation reports end-to-end testing with real LINE and Neon services in LINE groups. | Reported completed |
| User Evaluation | User sessions are mentioned, but individual session records and quantitative results are not included in the supplied test files. | Detailed evidence unavailable |
| SUS / TAM Evaluation | Completed questionnaire scores are not included in the supplied test files. | Results not documented |

According to `test/README.md`, the automated test suite contains **49 tests across seven test files**, with a reported result of **49 passed and 0 failed on 18 November 2026**. The README references an `npm-test.log`, but that log was not included in the supplied test ZIP.

These results demonstrate that the documented automated test cases passed. They do not, by themselves, establish improvements in real-world scheduling time or user satisfaction.

## 5. Product Development and User Feedback

| Challenge / Feedback | Product Decision or Improvement |
|---|---|
| Calendar colors were not sufficiently clear to users. | Added explanatory labels to make availability states easier to understand. |
| Participants wanted more visibility into other participants' availability. | Improved the participant view to provide more detailed daily availability information. |
| LINE Official Account message limitations affected the development and testing process. | Considered alternative account arrangements and selected a new account to continue without additional premium costs. |

These decisions reflect the project's focus on usability, accessibility, and practical implementation within the LINE ecosystem.

## 6. Development Deliverables

| Deliverable | Description |
|---|---|
| LINE Integration | LINE-based entry point and group communication. |
| Web Application | Interfaces for creating events, submitting availability, viewing schedules, and confirming dates. |
| Backend and Database | API endpoints and database integration for event and participant information. |
| Best Date Algorithm | Rule-based logic for identifying suitable dates based on participant availability. |
| UI/UX Design | Interface and calendar presentation designed around the scheduling workflow. |
| Testing | Automated test suite and documented manual and integration testing activities. |
| Documentation | Project proposal, testing documentation, and supporting project materials. |
| User Guide | Instructions to help users operate the scheduling assistant. |

## 7. Overall Comparison

Compared with conventional group-chat scheduling, Singto provides a more structured way to create events, collect participant availability, review suitable dates, and confirm appointments. It reduces the need for organizers to manually gather and compare availability scattered across chat messages.

Its main contribution is not fully automated decision-making, but rather the organization and analysis of scheduling information while keeping the final decision under human control.

The project combines LINE integration, a web-based interface, backend services, and deterministic scheduling logic to support a more convenient group scheduling process. Although the documented automated tests provide evidence of functional correctness for the tested cases, further quantitative user-evaluation evidence would be needed to demonstrate measurable improvements in scheduling efficiency and user satisfaction.