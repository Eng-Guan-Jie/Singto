# Quality Assurance (QA) – Role Statement

**Student ID:** [Student ID]  
**Name:** [Full Name]  
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