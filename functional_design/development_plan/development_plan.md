# Updated Development Plan - Progress & Adjustments

## Progress Made (as of December 2025)

### Completed Features
- **Core Infrastructure**
  - Basic server setup with Deno and MongoDB
  - HR admin registration and email/password authentication
  - Database models and schemas for all major concepts

- **Feedback System**
  - FeedbackForm concept with creation, sending, retrieval, and submission
  - Validation for question types and required fields
  - Bulk form creation for teams via OrgGraph
  - Query helpers by creator, reviewer, and target

- **Testing**
  - Unit tests for core functionality
  - Integration tests for API endpoints
  - Fixed critical issues in feedback form creation and retrieval

- **Org Graph & Review Cycles**
  - OrgGraph roster import with teams, roles, and basic ownership
  - Manager/peer/report discovery helpers
  - ReviewCycle concept for cycles, assignments, activation, and responses
  - Sync wiring to auto-build reviewers from the org graph

- **Feedback Form Retrieval**
  - Email + Access Code 
  - Unique form based on role/requirements
  - Submit form 
  - Progress screen from HR side

### In Progress
- **Org Chart & Hierarchy**
  - Additional guardrails and ergonomics around roster import
  - Better support for per-admin scoping and cleanup

- **Privacy Features**
  - Initial implementation of k-anonymity on response sets
  - Wiring k-anonymity into the end-to-end response pipeline
  - Hardening authenticated routes beyond current passthrough syncs

## Updated Feature Plans

| **Feature**                     | **Status** | **Target Completion** | **Notes** |
|---------------------------------|------------|----------------------|-----------|
| **Authentication**              | ✅ Complete | beta | HR admin registration & login working (12/2)|
| **Feedback Forms**              | ✅ Complete | - | FeedbackForm concept with validation and query helpers implemented |
| **Response Collection**         | ✅ Complete | beta | ReviewCycle and submission flows implemented -> access through login screen (12/2) |
| **Org Chart Import**            | ✅ Complete | beta | Roster import with teams, roles, and owner scoping implemented (12/2)|
| **Anonymous Mode**              | 🟡 In Progress | beta | k-anonymity behavior implemented in ReportSynthesis; not yet fully wired into syncs |
| **Response Dashboard**          | ✅ Complete | beta | Backend report/reponseSet APIs exist; HR-facing dashboard UI is also complete -> "Responses" tab |
| **LLM-assisted Synthesis**      | 🟡 In Progress | beta | Gemini-backed draft summary implemented; requires API key and UX integration -> team discussion in process if we still want this feature (12/2) |
| **Deployment**                  | 🟡 In Progress | beta | Local Deno + Mongo dev stable; CI/CD and production environment still, we do have working version deployed though|

## Key Changes (12/2 Update)

Our focus for the beta checkpoint was to ensure max implementation feasibility in order to have most components ready for the user testing stage. We worked on allowing users to input feedback and making sure the process of submitting and retrieving feedback (from the HR) end is smooth and accurate.  

**New Additions**:
   - There are now *three* features that can be accessed through the login screen (corresponding backend implementations) 

  1. Login (for HR)

  2. Create account (for HR)
  
  3. Enter access code and submit feedback form (for team members) -> AccessCode concept 
  

## Current Challenges

1. **Technical**:
   - Ensuring clean boundaries between concepts (OrgGraph, ReviewCycle, ReportSynthesis) -> resolved (12/2)
   - Designing an auth story that supports multiple HR admins and scoped data-> resolved (12/2)

2. **Design**:
   - Balancing backend completeness with minimal but usable dashboard UI -> resolved (12/2)
   - Time to wire together concepts end-to-end and harden edge cases -> resolved (12/2)

## Next Steps

1. Wire ReviewCycle export into ReportSynthesis.ingestResponses so users can receive synthesized responses 
2. Hook up k-anonymity into the ingestion pipeline and verify it under realistic response distributions
3. Potentially implement LLM-synthesis

## Risk Assessment Updates

| **Risk** | **Status** | **Impact** | **Mitigation** |
|----------|------------|------------|----------------|
| Data consistency | Controlled (12/2) | High | Clear ownership per concept, careful updates on shared collections |
| Performance | Active | Medium | Adding pagination, indexing, and limiting response payloads |
| Feature creep | Controlled | Medium | Keep dashboard and LLM UX minimal |
| Integration complexity | Active | High | Early API contracts between ReviewCycle, OrgGraph, and ReportSynthesis |
| Auth & privacy correctness | Active | High | Incremental rollout of auth/session and k-anonymity with tests |

## Team Responsibilities

| **Area** | **Lead** | **Support** | **Status** |
|----------|----------|-------------|------------|
| **Backend Services** | Francesca | Diego | In Progress |
| **Data Models** | Grace | Francesca | In Progress |
| **API Development** | Diego | Grace | In Progress |
| **Testing** | Grace | Francesca | In Progress |
| **Documentation** | Diego | Grace | Not Started |

