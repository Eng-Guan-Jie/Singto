# Feature List — Singto

## 1. Core Features

The following features are considered **core features** of the Singto scheduling system and are essential to the main scheduling workflow.

| ID   | Feature                  | Description                                                                                               | Core |
| ---- | ------------------------ | --------------------------------------------------------------------------------------------------------- | :--: |
| F-01 | Appointment Creation     | Allow organizers to create an appointment and specify basic appointment details and scheduling period.  |  ✅  |
| F-02 | Availability Submission  | Allow participants to submit their available dates through the web application.                          |  ✅  |
| F-03 | Availability Collection  | Collect and store availability information from multiple participants in one scheduling session.        |  ✅  |
| F-04 | Availability Analysis    | Compare participants' availability and identify common available dates.                                  |  ✅  |
| F-05 | Best Date Suggestion     | Suggest suitable dates based on the group's availability.                                                |  ✅  |
| F-06 | Availability Summary     | Present a clear summary of participants' availability and suitable scheduling options.                   |  ✅  |
| F-07 | Appointment Confirmation | Allow the organizer to select and confirm the final appointment date.                                   |  ✅  |
| F-08 | LINE Integration         | Allow users to initiate or access the scheduling process through a LINE group and receive relevant links. |  ✅  |
| F-09 | Scheduling Reminder      | Allow users to opt in to receive a reminder before the confirmed appointment by enabling the reminder option. |  ✅  |

---

## 2. Supporting Features

These features support the core scheduling experience but are not essential to the minimum scheduling workflow.

| ID   | Feature                  | Description                                                                                   | Core |
| ---- | ------------------------ | --------------------------------------------------------------------------------------------- | :--: |
| F-10 | Responsive Web Interface | Provide a mobile-friendly interface for users accessing the web application from smartphones. |  ❌  |
| F-11 | User Evaluation          | Collect user feedback and evaluate the usability and effectiveness of the scheduling system.  |  ❌  |

---

## 3. Core User Flow

The core features support the following main workflow:

**Call Singto → Create an Appointment → Share Availability → Find the Best Date → Confirm the Appointment → Receive Reminder (if enabled)**

### Workflow

1. **Create an Appointment**
   * Organizer creates an appointment through Singto.
   * Organizer provides basic appointment details and the scheduling period.

2. **Share Availability**
   * Singto provides participants with access to the scheduling session.
   * Participants enter their available dates.

3. **Find the Best Date**
   * The system collects and compares everyone's availability.
   * Singto identifies common available dates.
   * Suitable options are presented to the users.

4. **Confirm the Appointment**
   * Organizer reviews the suggested options.
   * Organizer selects the final date.
   * Organizer can enable the reminder option before confirming the appointment.
   * The confirmed appointment is recorded and shared with participants.

5. **Receive Reminder**
   * If the organizer enables the reminder option, Singto schedules a reminder.
   * Participants receive a reminder before the confirmed appointment.

---

## 4. Feature Priority

| Priority       | Meaning                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------- |
| **Core**       | Essential for the main Singto scheduling workflow and required for the MVP.                  |
| **Supporting** | Improves usability or user experience but is not required for the basic scheduling workflow. |

---

## 5. MVP Feature Set

The minimum viable product (MVP) should include the following core features:

* Appointment Creation
* Availability Submission
* Availability Collection
* Availability Analysis
* Best Date Suggestion
* Availability Summary
* Appointment Confirmation
* LINE Integration
* Scheduling Reminder

These features allow users to complete the scheduling workflow from creating an appointment and collecting availability to confirming a suitable date and optionally receiving a reminder before the confirmed appointment.