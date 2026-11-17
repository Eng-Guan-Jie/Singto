# Singto – AI Logic Documentation

## 1. Overview

Singto is a group scheduling assistant that collects participants' availability and identifies suitable meeting dates.

The Best Date feature uses a deterministic, rule-based algorithm to compare participant availability and recommend the date or consecutive date range that accommodates the greatest number of accepted participants.

**Core principle:** "Singto suggests, but the human decides." The organizer remains responsible for selecting and confirming the final date.

### AI Implementation Status

The current Best Date feature is an **algorithmic scheduling and recommendation system**, not a machine-learning model or generative AI system.

The implementation does not establish the use of a trained ML model, LLM, or generative AI inference for scheduling decisions. Therefore, this document describes the implemented scheduling algorithm rather than claiming that the application uses an AI model.

---

## 2. Where – Implementation Location

The Best Date functionality is implemented primarily in the frontend, using availability data retrieved from the backend API.

| Component | File | Responsibility |
|---|---|---|
| Organizer Best Date logic | `src/pages/Overview/Overview.jsx` | Calculates and displays the organizer's best date options. |
| Shared scheduling logic | `src/lib/bestDate.js` | Provides reusable date summarization and recommendation functions for the participant page. |
| Participant interface | `src/pages/Participant/Participant.jsx` | Displays Best Date suggestions to participants. |
| Calendar and holiday rules | `src/lib/calendar.js` | Generates candidate calendar dates and identifies weekends and fixed-date Thai public holidays. |
| Availability API | `api/events/[id]/availability.js` | Retrieves accepted participants' availability and calculates availability counts. |
| Database | Neon PostgreSQL, accessed through `api/_db.js` | Stores participant responses and availability records. |

**Implementation note:** The organizer's Overview page contains its own copy of the Best Date calculation, while the participant page imports the shared functions from `src/lib/bestDate.js`. Both implementations follow the same scheduling rules.

---

## 3. How – Scheduling Logic

### 3.1 Processing Workflow

1. **Collect availability:** Participants submit the dates they are available for an event.
2. **Retrieve availability:** The frontend requests availability information from `api/events/[id]/availability.js`.
3. **Filter participants:** Only participants with an `accepted` status are included in scheduling calculations.
4. **Generate candidate date sets:** The system generates single-day, consecutive two-day, consecutive three-day, or holiday candidates, depending on the selected filter.
5. **Calculate availability:** The system counts participants who are available for each candidate date set.
6. **Rank recommendations:** It identifies the highest availability count and returns every candidate that achieves that count.
7. **Human confirmation:** The organizer reviews the suggestions and chooses the final date.

### 3.2 Recommendation Rules

The implementation provides four filters:

| Filter | Candidate dates |
|---|---|
| Single Date | Each individual date in the event period |
| Two Days | Consecutive two-day date ranges |
| Three Days | Consecutive three-day date ranges |
| Holiday | Saturdays, Sundays, and fixed-date Thai public holidays |

For a multi-day candidate, a participant is considered available only when they have submitted availability for **every date in that candidate range**.

For example, if a participant is available on Monday but unavailable on Tuesday, they are not counted as available for the Monday–Tuesday option.

The system then applies the following ranking rule:

- Calculate the number of available participants for each candidate.
- Identify the maximum availability count.
- Return all candidates with that maximum count.
- Return an empty list if the maximum count is zero.

**Tie handling:** Multiple candidates with the same highest availability count are all displayed. The implementation does not apply an additional preference-based tie-break rule.

**Holiday handling:** The holiday filter includes Saturdays, Sundays, and fixed-date Thai public holidays defined in `src/lib/calendar.js`. Lunar holidays and substitution holidays are not included in the current fixed-date list.

### 3.3 Availability Calculation

The API counts availability records belonging to accepted participants. Accepted participants who have not submitted any available dates remain part of the total participant count but are not counted as available on any date.

This ensures that the displayed availability count reflects the accepted participants, rather than only those who have submitted responses.

---

## 4. Prove – Test Set and Evaluation Evidence

### 4.1 Proposed Controlled Test Dataset

The following synthetic dataset can be used to verify the implemented recommendation rules.

**Event period:** 21–25 November 2026  
**Participants:** P01–P04, all with accepted status.

| Participant | Sat 21 Nov | Sun 22 Nov | Mon 23 Nov | Tue 24 Nov | Wed 25 Nov |
|---|---|---|---|---|---|
| P01 | Available | Available | Available | Available | Available |
| P02 | Available | Available | Available | Busy | Busy |
| P03 | Available | Available | Busy | Available | Busy |
| P04 | Available | Busy | Busy | Available | Available |

### 4.2 Expected Results

**Single Date**

| Date | Expected available count |
|---|---:|
| 21 November | 4 |
| 22 November | 3 |
| 23 November | 2 |
| 24 November | 3 |
| 25 November | 2 |

Expected recommendation: **21 November (4/4)**.

**Two Days**

| Consecutive dates | Expected available count |
|---|---:|
| 21–22 November | 3 |
| 22–23 November | 2 |
| 23–24 November | 1 |
| 24–25 November | 2 |

Expected recommendation: **21–22 November (3/4)**.

**Three Days**

| Consecutive dates | Expected available count |
|---|---:|
| 21–23 November | 2 |
| 22–24 November | 1 |
| 23–25 November | 1 |

Expected recommendation: **21–23 November (2/4)**.

**Holiday Filter**

Both 21 and 22 November are weekend dates.

Expected recommendations:
- 21 November: 4/4
- 22 November: 3/4

Expected recommendation: **21 November (4/4)**.

These expected results are calculated independently from the proposed dataset and should be checked against the actual application output.

### 4.3 Additional Test Cases

| Test ID | Scenario | Expected result |
|---|---|---|
| AI-01 | Single-date availability ranking | The date with the highest available participant count is returned. |
| AI-02 | Consecutive two-day calculation | Only participants available on both dates are counted. |
| AI-03 | Consecutive three-day calculation | Only participants available on all three dates are counted. |
| AI-04 | Holiday filtering | Only weekends and configured fixed-date Thai holidays are considered. |
| AI-05 | Equal highest counts | All candidates tied for the highest count are returned. |
| AI-06 | No available participants | The recommendation list is empty. |
| AI-07 | Participant without submitted availability | The accepted participant remains in the total count but is not counted as available. |

### 4.4 Baseline

The baseline is manual scheduling, where an organizer reviews the same participant availability dataset and identifies suitable dates without using Singto.

The manual and Singto-assisted conditions should use the same availability information and selection criteria.

This baseline evaluates the practical benefit of automating the comparison process. It is not a comparison against a machine-learning model.

### 4.5 Evidence to Collect

The following evidence should be collected before claiming that the algorithm has passed evaluation:

- The synthetic test dataset and independently calculated expected results.
- Screenshots or recorded outputs from each Best Date filter.
- Comparison of expected and actual availability counts.
- Results of the additional test cases, including tie and no-availability scenarios.
- Relevant source code references.
- Test execution records, including any failures and fixes.

**Current evidence status:** The source implementation is present in the submitted project. The ZIP does not establish completed execution of the proposed evaluation dataset or provide recorded results for these test cases.

---

## 5. Measure – Evaluation Metrics

The scheduling algorithm and the user experience should be evaluated separately.

### 5.1 Algorithm Evaluation

| Metric | Measurement |
|---|---|
| Availability Calculation Correctness | Whether the calculated participant counts match the independently calculated expected counts. |
| Recommendation Rule Conformance | Whether the application returns the correct highest-scoring candidate set, including tied candidates. |
| Test Case Pass Rate | Number of passed algorithm test cases divided by the total executed test cases. |
| Zero-Availability Handling | Whether the system correctly returns no suggestions when nobody is available. |
| Processing Time | Time required to calculate and display recommendations under consistent test conditions. |

These metrics evaluate whether the implemented rules work correctly. They do not measure the accuracy of a trained AI model.

### 5.2 User Evaluation

The practical value of Best Date can also be evaluated through the manual-versus-Singto user testing process described in the project Test Plan.

Relevant metrics include:

- Task Completion Rate
- Task Completion Time
- Task Error Rate
- Assistance Requests
- System Usability Scale (SUS)
- Technology Acceptance Model (TAM)

User evaluation results should be reported separately from algorithm test results.

---

## 6. Limitations

- Recommendations depend on the accuracy and completeness of submitted availability.
- Only accepted participants are included in availability calculations.
- Participants who have not submitted availability are treated as unavailable for the relevant dates.
- Multi-day recommendations require a participant to be available on every date in the candidate range.
- Holiday identification is limited to weekends and the fixed-date Thai public holidays currently defined in the source code.
- The system ranks candidates by availability count and does not consider additional personal preferences or priorities.
- Multiple candidates with equal maximum counts are returned without a further tie-breaking mechanism.
- The organizer remains responsible for reviewing and confirming the final date.

---

## 7. AI Disclosure

Singto's Best Date feature uses deterministic, rule-based scheduling logic to compare participant availability and identify suitable dates.

The reviewed implementation does not establish the use of machine-learning training, LLM inference, or generative AI for its scheduling recommendations.

Any AI assistance used during software development or documentation should be disclosed separately from the functionality implemented in the delivered application.