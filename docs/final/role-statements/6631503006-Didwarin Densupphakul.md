# Quality Assurance (QA) – Role Statement

**Student ID:** 6631503006  
**Name:** Didwarin Densupphakul  
**Role:** Quality Assurance (QA)

As the QA member of Singto, I was responsible for ensuring the system's reliability and verifying that its core functionalities behaved as expected. My contributions included preparing and maintaining automated test cases, defining expected outcomes, and checking the application's scheduling logic, API behavior, input validation, and access control.

I contributed to the automated testing suite using Node.js's built-in test runner. The suite contains 49 test cases across seven test files, covering Best Date recommendations, calendar and holiday calculations, event input validation, API authentication and authorization, event locking after confirmation, LINE webhook signature verification, and scheduled event cleanup.

For the Best Date functionality, I worked with a controlled test dataset to verify availability calculations, consecutive-day recommendations, holiday filtering, tie handling, and cases where no participants are available. The tests use mock database and LINE services to support isolated execution without accessing real user data.

The test suite is also integrated into the project's GitHub Actions workflow to run during pushes and pull requests.

**Evidence:**
- Automated test suite: `test/`
- Test overview and recorded results: `test/README.md`
- Best Date evaluation: `test/ai-eval.test.mjs`
- API and security tests: `test/api-access.test.mjs`, `test/webhook-and-cron.test.mjs`
- CI workflow: `.github/workflows/ci.yml`

**AI Disclosure:** AI tools may have been used to assist with test development, debugging, and documentation. Test scenarios, expected outcomes, and final test results were reviewed by the project team.

## Reflection

### 1. Lessons learned
Building Singto with AI affected every stage. Requirements and design moved
faster because ideas could become a working version quickly. Coding took
less effort, so more of our time went into checking the result. Our suite of
49 automated tests covers Best Date logic, input validation, API access
control, event locking and LINE webhook signature checks, and runs in GitHub
Actions on every push and pull request. Mocked database and LINE services let
us test without touching real user data.

**Better:** testing became part of the workflow instead of a last step.
Because the tests run automatically, we could change code and quickly see
whether the scheduling logic and access rules still worked.

**Worse:** AI output looks finished even when it is not fully checked. A
passing test only proves what we thought to test, so cases like ties,
holidays and "no one available" had to be defined by people before they
could be tested. Fast code can create false confidence if nobody reviews the
expected results.

### 2. Where I stand today
I am a student at the start of my career, with hands-on experience in
software testing from this project. AI can now produce a lot of routine
code, so I think the valuable skills are defining what correct behaviour
is, checking results, and caring about security and privacy.

### 3. My plan
**Next year:** keep building my testing skills, and try other areas of
software work to see which one I enjoy.

**In five years:** I do not know exactly which role I will have. I want to
keep looking for work that fits me and that I genuinely like, and to use AI
well while still checking its output.
