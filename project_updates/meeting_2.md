# Meeting 2 - November 20th Project Update

## Agenda
 - Review current backend concepts and database setup
 - Walk through authenticated routes/concept implementations
 - Identify open issues and prioritize work for next week
 - Discuss and touch back with Ane on what she wants to see ahead of the first demo submission next Tuesday (since we have a meeting on Monday)

## Progress report

- **Concept implementations**
  - Created functional design with concept specs and implemented initial draft of each concept (tests included)

- **Synchronization layer**
  - Implemented authenticated route syncs in `authenticated_routes.sync.ts` for:
    - `FeedbackForm`, `OrgGraph`, `ReviewCycle`, `ReportSynthesis` HTTP paths.
  - Fixed `actions(...)` usage so syncs correctly reference instrumented actions (no more `Action undefined is not instrumented` at startup).
  - Added `buildReviewers`/`prepareForSummary`/`generateDrafts`/`finalizeReports` syncs to connect concepts along the review lifecycle.

- **Frontend implementation**
  - Created pages for Login, Dashboard, Teams and form creation/management that currently uses mock data and accepts basic interaction through local storage

- **Infrastructure / deployment**
  - Configured MongoDB access via `MONGODB_URL` and `DB_NAME` env vars in `database.ts`.
  - Verified Render deploy flow 

## Design changes

- **Sync design**
  - Standardized `actions(...)` calls to always use `[Action, input, output?]` tuples to match the sync engine’s expectations.
  - Introduced placeholder authenticated route syncs that:
    - Gate routes by path prefix (e.g., `/FeedbackForm/`, `/OrgGraph/`, `/ReviewCycle/`, `/ReportSynthesis/`).
    - Currently act as pass-throughs via `Requesting.respond`, leaving room to plug in a real auth/session concept later.
    
## Issues

- **Feedback Submission Flow**
 - We haven’t received feedback and questions from our project pitch which we need to adjust implementation
 - Want to determine the method that would cause the least friction to distribute these forms.
    - Had the idea of distributing a unique link for each employee, but without the ability to set up an email that sends these this seems a bit obtuse. Is setting an email up possible?
    - Maybe best to have employees authenticate too?

## Plans and Decisions

- **Checkpoint Alpha Submission**
  - All concepts have been drafted out along with their implementation and tests. We're still iterating on these
  - We still have to create the frontend interaction for integrating the review cycles, the rest of the frontend is at some degree of functional

...

Notes:

- Unique link per employee would be great/viable
- Feedback: purpose of 360 isnt just to generate a summary for HR to read but aggregate all responses and anonymized way --> people have to receive the summary about themselves?
  - if implementable, then can do that but DO NOT HAVE TO 
