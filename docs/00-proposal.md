Singto – Updated Project Proposal

1. Project Overview

Singto is a LINE-integrated group scheduling assistant that helps people coordinate appointments with multiple participants through a web-based application.

Instead of collecting everyone's availability manually through a group chat, Singto provides a shared scheduling link where participants can submit their available dates and times. The system collects and compares the responses, summarizes the group's availability, and suggests suitable options for the organizer to review and confirm.

The project focuses on making group scheduling simpler, clearer, and less repetitive while keeping LINE as the main communication channel.

2. Problem Statement

Groups currently rely on chat-based communication such as LINE or Messenger to coordinate appointments. The organizer often needs to manually collect and compare each participant's availability, while responses may arrive at different times or be missed entirely. As a result, scheduling information can become scattered across the conversation, requiring repeated questions and multiple rounds of discussion before a suitable date is found.

The problem becomes more noticeable when participants have different schedules, when the group is larger, or when an appointment requires planning in advance. Changes in a participant's availability after a date has been proposed may also require the group to repeat part of the coordination process.

Based on the project user research, participants reported difficulties including delayed or missing responses, scattered availability information, schedule conflicts, repeated follow-ups, and the need to manually compare multiple possible dates. These findings indicate a need for a simple tool that centralizes availability information and helps groups identify suitable dates more efficiently.

3. Proposed Solution

Singto addresses this problem by integrating a scheduling assistant with LINE and a web application.

The proposed workflow is:

The organizer starts a scheduling process through Singto.

The organizer creates an appointment and defines the scheduling period.

Singto creates a shared scheduling link associated with the appointment.

The organizer shares the link in the LINE group.

Participants open the shared link and submit their available dates and times.

Singto collects and compares the submitted availability.

The system provides an availability summary and suggests suitable dates and times.

The organizer reviews the suggestions and confirms the final appointment.

Singto schedules and sends a reminder through LINE before the confirmed appointment.

The system is intended to support the scheduling decision rather than make the decision automatically. The organizer remains responsible for reviewing the suggested options and confirming the final appointment.

4. Target Users

4.1 Primary Users

Singto targets people who frequently coordinate plans or activities with groups, including:

Friends and social groups

Classmates and university students

Coworkers

Family members

Community or activity groups

The primary users include two roles:

Organizer — creates the appointment, shares the scheduling link, reviews suggested dates, and confirms the final appointment.

Participant — accesses the shared scheduling link and provides availability.

4.2 Secondary Users

Secondary users include people who occasionally need to coordinate schedules with multiple people, such as:

People organizing occasional gatherings or special events

Groups planning meetings or activities in advance

4.3 User Characteristics and Needs

Based on the user research, target users generally:

Use mobile devices as their primary communication and scheduling devices.

Commonly use LINE, Messenger, or group chats to coordinate appointments.

Need to coordinate with people who have different schedules and availability.

Prefer a simple scheduling process with minimal steps.

Need a clear overview of everyone's available dates and times.

Want to reduce repeated questions, follow-ups, waiting for responses, and manual comparison.

Value time savings and convenience.

May be discouraged by app installation, complicated procedures, excessive steps, or inaccurate scheduling results.

5. Project Objectives

Reduce the time required to coordinate group schedules by streamlining the collection and comparison of participants' availability.

Reduce repetitive communication by providing a centralized view of participants' available dates and times.

Help groups reach scheduling decisions more efficiently by automatically identifying and suggesting suitable dates and times.

Provide a convenient scheduling experience through LINE and the web application without requiring users to install a standalone mobile application.

6. Project Scope

6.1 In Scope

The project includes:

Appointment creation

Scheduling period definition

Shared scheduling link generation

Availability submission

Availability collection and summary

Common availability analysis

Suggested date and time generation

Appointment confirmation

LINE integration

Pre-appointment scheduling reminders

Responsive web interface

6.2 Out of Scope

The project does not include:

A standalone mobile application

Replacing LINE as the group's communication platform

Automatically confirming an appointment without organizer/user confirmation

Full synchronization with personal calendars such as Google Calendar or Apple Calendar

Venue, restaurant, transportation, or other external-service booking

Payment or financial transaction management

Advanced travel planning or activity recommendations

Weather-based scheduling

Complex recurring appointments or long-term calendar management

7. Expected Outcome

The expected outcome is a functional prototype of Singto that allows a group to complete the main scheduling workflow from appointment creation and availability submission to date suggestion, confirmation, and a pre-appointment reminder.

The project aims to reduce repetitive scheduling discussions and manual comparison while providing users with a clearer view of group availability and a simpler way to reach a scheduling decision.