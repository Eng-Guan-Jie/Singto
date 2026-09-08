# Product Backlog — Singto

## 1. Product Overview

**Singto** is a LINE-integrated group scheduling assistant designed to simplify group appointment coordination.

Instead of manually asking participants about their availability through group chats, Singto allows users to create an appointment, define a scheduling period, share a scheduling link, collect participants' available dates, compare the responses, and suggest suitable dates for the group.

The Product Backlog contains the product features and user stories required to support Singto's core scheduling workflow.

---

## 2. Product Backlog

| ID | Epic | User Story | Priority | Story Points |
|---|---|---|---|---:|
| PB-01 | Appointment Management | As an organizer, I want to create an appointment with basic details so that I can start the scheduling process. | High | 3 |
| PB-02 | Appointment Management | As an organizer, I want to specify a scheduling period so that participants can provide their available dates within the relevant period. | High | 2 |
| PB-03 | Participant Access | As a participant, I want to access an appointment through a shared link so that I can join the scheduling process easily. | High | 2 |
| PB-04 | Availability Collection | As an organizer and participant, I want to select my available dates so that the system can compare my availability with other participants. | High | 5 |
| PB-05 | Availability Collection | As an organizer, I want to view my and participants' submitted availability so that I can see the group's scheduling information in one place. | High | 3 |
| PB-06 | Availability Analysis | As a user, I want the system to automatically compare everyone's availability so that common available dates can be identified without manually checking each participant. | **High (Core)** | 5 |
| PB-07 | Date Suggestion | As an organizer, I want the system to suggest suitable dates based on participants' availability so that I can make a scheduling decision more efficiently. | High | 5 |
| PB-08 | Availability Summary | As a user, I want to see a clear summary of everyone's availability so that I can easily understand the available dates. | High | 3 |
| PB-09 | Appointment Confirmation | As an organizer, I want to confirm the selected date so that the final appointment can be recorded and shared with participants. | High | 3 |
| PB-10 | LINE Integration | As a user, I want to start the scheduling process through a LINE group so that I can coordinate appointments using a platform I already use. | High | 5 |
| PB-11 | LINE Integration | As a participant, I want to receive the scheduling link through LINE so that I can access the appointment and submit my availability easily. | High | 3 |
| PB-12 | Scheduling Reminder | As a participant, I want to receive a reminder before a confirmed appointment so that I do not forget the scheduled date. | Medium | 3 |
| PB-13 | Responsive Web Application | As a user, I want the web application to work well on mobile devices so that I can complete the scheduling process conveniently from my phone. | Medium | 3 |

---

## 3. Core User Workflow

The main Singto workflow is:

**Call Singto → Create an Appointment → Share Availability → Find the Best Date → Confirm the Appointment → Receive Reminder**

The corresponding backlog items are:

### 1. Create an Appointment
- PB-01 — Create Appointment
- PB-02 — Specify Scheduling Period

### 2. Share Availability
- PB-03 — Participant Access
- PB-04 — Submit Availability

### 3. Find the Best Date
- PB-05 — View Availability
- PB-06 — Analyze Availability **(Core)**
- PB-07 — Suggest Suitable Dates
- PB-08 — Availability Summary

### 4. Confirm the Appointment
- PB-09 — Confirm Appointment

### 5. LINE Integration
- PB-10 — LINE Integration
- PB-11 — Share Scheduling Link

### 6. Receive Reminder
- PB-12 — Scheduling Reminder

---

## 4. Core Feature

### PB-06 — Availability Analysis

**Core Feature:** Automatically compare group availability and identify common available dates.

This is the core feature because the user research consistently identified difficulty in finding a date when everyone is available as the main scheduling pain point.

Users reported that they often need to:

- Ask participants about their availability individually.
- Propose multiple dates before finding a suitable option.
- Wait for delayed or missing responses.
- Track availability information scattered across group chats.
- Spend several days or multiple rounds reaching a scheduling decision.

PB-06 directly addresses this pain by automatically comparing submitted availability and identifying common available dates.

---

## 5. Acceptance Criteria

### PB-01 — Create Appointment

- Organizer can create a new appointment.
- Organizer can enter the basic appointment details.
- The system successfully creates and stores the appointment.

### PB-02 — Specify Scheduling Period

- Organizer can define the dates available for scheduling.
- Participants can only submit availability within the defined scheduling period.
- The scheduling period is associated with the created appointment.

### PB-03 — Participant Access

- Participants can access the appointment through a shared link.
- Participants can view the relevant appointment information.
- Participants do not need to install a standalone mobile application.

### PB-04 — Submit Availability

- Organizer can select their available dates
- Participants can select their available dates.
- Participants can submit their availability successfully.
- Submitted availability is stored and associated with the correct appointment and participant.

### PB-05 — View Availability

- Organizer and participants can view all other participants' submitted availability.
- Availability information is presented in a clear and understandable format.
- The system identifies which participants have submitted their availability.

### PB-06 — Analyze Availability

- The system compares the availability of all members (organizer and participants).
- The system identifies whether at least one date exists where every member is available.
- If no date has full availability, the system identifies the date(s) with the highest number of available members.
- The analysis is based on the availability submitted by all members.
- The result does not require the organizer to manually compare each member's availability.

### PB-07 — Suggest Suitable Dates

- If a date exists where all members are available, the system suggests that date.
- If no date works for everyone, the system suggests the date(s) with the highest availability from PB-06's analysis.
- Suggested dates are presented clearly, distinguishing full-availability dates from partial-availability dates.
- The organizer can review the suggested dates before confirming an appointment.

### PB-08 — Availability Summary

- Users can view a summary of common available dates.
- The summary is easy to understand on a mobile device.
- Users can distinguish suitable dates from unavailable dates.

### PB-09 — Confirm Appointment

- Organizer can select one of the suggested dates.
- The selected date is saved as the confirmed appointment date.
- Confirmed appointment information can be displayed to participants.

### PB-10 — LINE Integration

- Users can interact with Singto through LINE.
- Users can initiate the scheduling process through a LINE group.
- Singto can direct users to the relevant web application.

### PB-11 — Share Scheduling Link

- Singto can provide the scheduling link through LINE.
- Participants can open the link and access the relevant appointment.
- The link directs participants to the correct scheduling session.

### PB-12 — Scheduling Reminder

- Participants receive a reminder before a confirmed appointment.
- The reminder includes the confirmed appointment date.
- The reminder is sent through the project's supported LINE notification flow.
- The reminder is based on the confirmed appointment date.

### PB-13 — Responsive Web Application

- The web application is usable on smartphones.
- Core scheduling functions remain accessible on smaller screens.
- The interface is readable and easy to navigate.

---

## 6. Priority Definition

| Priority | Definition |
|---|---|
| **High** | Essential for the core scheduling workflow or required for Singto to address its main user problem. |
| **Medium** | Improves usability or user experience but is not essential to the core scheduling workflow. |
| **Low** | Nice-to-have functionality that can be considered if time and resources allow. |

---

## 7. User Pain Traceability

| User Pain Point | Related Backlog Items |
|---|---|
| Different schedules make it difficult to find a common date. | PB-04, PB-06, PB-07 |
| Users need to ask participants about availability individually. | PB-04, PB-06 |
| Availability information becomes scattered across chat conversations. | PB-05, PB-08 |
| Users need to propose multiple dates and go through multiple discussion rounds. | PB-06, PB-07 |
| Delayed or missing responses make scheduling take longer. | PB-04, PB-05 |
| Users want a clear overview of everyone's availability. | PB-05, PB-08 |
| Users want a simple scheduling process without installing another app. | PB-03, PB-10, PB-11, PB-13 |
| Users want to reduce the time and effort required to coordinate schedules. | PB-06, PB-07, PB-08 |
| Users may forget the confirmed appointment. | PB-12 |
| Users want a mobile-friendly and easy-to-use interface. | PB-13 |

---

## 8. Scope Decisions

The following features were considered during user research but are intentionally excluded from the current Product Backlog to maintain the project's MVP scope.

### Out of Scope

- Standalone mobile application
- Full Google Calendar or Apple Calendar synchronization
- Time-of-day selection or time-based availability management
- Automatic appointment confirmation without organizer confirmation
- Venue, restaurant, or transportation booking
- Payment or financial transaction features
- Weather-based scheduling
- Activity recommendation or activity voting
- Complex recurring appointment management

These features may provide additional value for some users but are not required to solve the primary problem identified through the user research: **finding a suitable date for a group efficiently.**

---

## 9. MVP Scope

The MVP focuses on the following features:

1. Appointment Creation
2. Scheduling Period Definition
3. Participant Access
4. Availability Submission
5. Availability Collection
6. **Availability Analysis (Core)**
7. Suitable Date Suggestion
8. Availability Summary
9. Appointment Confirmation
10. LINE Integration
11. Scheduling Link Sharing
12. Scheduling Reminder
13. Responsive Web Interface

The MVP supports the complete scheduling workflow from creating an appointment and collecting availability to identifying and confirming a suitable date and receiving a reminder.