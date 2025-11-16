# Development Plan

## Feature Plans
| **Feature**                               | **Alpha Checkpoint**                             | **Beta Checkpoint**                         | **Final Release**                                 |
| ----------------------------------------- | ------------------------------------------------ | ------------------------------------------- | ------------------------------------------------- |
| **Authentication (HR login only)**        | Basic login flow; HR can sign in                 | Employee accounts added as non-admin users  | Polished auth, password reset, improved UX        |
| **Org chart import (CSV)**                | Upload CSV + display basic roster                | Improved parsing; hierarchy display         | Smart suggestions for reviewer groups             |
| **Send feedback forms**                   | HR can select a user/team and send a simple form | Full cycle: form builder, email/send flow   | Scheduled cycles, templates, smarter routing      |
| **Employee response UI**                  | Basic response form view                         | Polished UI & validation                    | Mobile-friendly, accessibility improvements       |
| **Anonymous mode settings (k-anonymity)** | Stub: toggle in settings but not enforced        | Fully enforced anonymity + thresholds       | Degradation warnings, advanced privacy guardrails |
| **Response dashboard**                    | HR sees list of responses (not anonymized yet)   | Aggregated + anonymized (if enabled) charts | Drill-down, theme extraction, history of cycles   |
| **LLM-assisted synthesis**                | Stubbed button w/ placeholder text               | Working summarization w/ quote provenance   | Adjustable tone, theme clustering, action plans   |
| **Deployment**                            | Temporary dev environment                        | Public URL for Beta                         | Stable hosted production                          |
| **Screen recording (2 min)**              | Alpha demo recorded                              | Updated Beta walkthrough                    | Final polished video                              |


## Responsibilities

[VERY PRELIMINARY FEEL FREE TO CHANGE but delete this comment before Tuesday night]

| **Area**                                       | **Primary Owner** | **Secondary** | **Notes**                                             |
| ---------------------------------------------- | ----------------- | ------------- | ----------------------------------------------------- |
| **OrgGraph & Roles**                           | Diego             | Grace         | Data model, import flows, conflict-of-interest rules. |
| **ReviewCycle + Solicitation Engine**          | Francesca         | Diego         | Workflows, reminders, deadlines, load balancing.      |
| **FeedbackCollection + Privacy (k-anonymity)** | Grace             | Francesca     | Sensitive storage, role merging, redaction pipeline.  |
| **ReportSynthesis (LLM + non-LLM)**            | Grace/Francesca             | Francesca     | Thematic clustering, quote provenancing, editor UI.   |
| **Front-end UX**                               | Diego         | Grace/Francesca         | Review submission UI, dashboard, accessibility.       |   |



### Checkpoint Alpha
Expected Alpha Feature Set:

- HR login

- CSV roster import (minimal validation)

- Send a basic feedback form

- Employees can submit responses

- Non-anonymous response viewing

- Deployment link


### Checkpoint Beta 
Expected Beta Feature Set:
- Anonymous mode fully implemented

- Reviewer groups built via org chart hierarchy

- Aggregated response dashboard

- Basic LLM summarization with provenance

- Polished front-end flows

- Stable deployment

## Key Risks
| **Risk**                                              | **Impact**                       | **Mitigation**                                             | **Fallback Option**                                          |
| ----------------------------------------------------- | -------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| **Org chart hierarchy parsing is complex**            | Reviewer grouping may fail       | Start with strict CSV template + simple parent/child model | Allow manual selection of reviewers instead of auto-building |
| **k-anonymity threshold is tricky to implement**      | Could break anonymity guarantees | Start with simple “minimum group size = k” rule            | Disable anonymity for small groups; show warning instead     |
| **LLM summarization takes too long or is unreliable** | Poor user experience during Beta | Cache responses, limit summary length, pre-process quotes  | Provide non-AI summaries plus raw quotes                     |
| **Deployment issues / downtime**                      | Checkpoint submission could fail | Use Vercel + Railway with rollback commits                 | Provide backup local recording for video demo                |
| **Email/send-out workflow may be too complex**        | Could block Alpha                | Simulate “sending” with an in-app notification             | Full email delivery added only for Final Release             |
| **Team bandwidth**                                    | Delays                           | Early scoping; weekly milestones                           | Cut optional features (templates, scheduling)                |
