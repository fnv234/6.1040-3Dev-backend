# Problem Framing 
**Authors**: Diego Peon, Francesca Venditti, Grace Zhou

## Domain

Our application operates at the intersection of organizational psychology, performance management, people analytics, and human–computer interaction. We focus on *360-degree feedback* for workplaces and student teams: orchestrating role-aware rater selection, collection, and synthesis across manager, direct-report, peer, and self reviews to produce timely, privacy-preserving, actionable reports at both the individual and team level.


## Problem 

In many organizations, 360 reviews are irregular, biased, and administratively heavy. Existing HR suites are over-configured for small teams, while DIY surveys and spreadsheets break anonymity and stall follow-through. Feedback may arrive late or not at all, also lacking synthesis and actionability.

 - Brittle role-aware linking: uncertainty about who should rate whom; conflicts of interest.
 - Anonymity and safety: small-team deanonymization and fear of retaliation reduce honesty.
 - Concise reporting: redundant, noisy comments make overarching themes hard to see.
 - Delayed, non-actionable outputs: long cycle times; no action tracking, lack of fixed and visible deadlines.
 - Privacy/compliance ambiguity: unclear retention, access, and purpose limits.

We propose a 360 management web app that imports an org chart or roster, automatically solicits reviews for everyone in the chart or select people from relevant people, and assembles anonymous, role-aware reports (optionally using an LLM to summarize themes and team throughlines) so teams can understand team dynamics, act accordingly, etc.

## Evidence 

- Organizations struggle with 360 review logistics: establishing reviewer-recipient relationships is complex and time-consuming. It is particularly difficult to convert raw feedback into actionable insights.
  - [360-Degree Feedback: You Are Probably Doing It Wrong](https://birgitpohl.medium.com/360-degree-feedback-you-are-probably-doing-it-wrong-8a6f0927e9bf)
  - [The Fatal Flaw With 360-Degree Surveys](https://hbr.org/2011/10/the-fatal-flaw-with-360-survey)
  - [Evidence-Based Answers to 15 Questions About Leveraging 360-Degree Feedback](https://www.apa.org/pubs/journals/features/cpb-64-3-157.pdf)

- Anonymity concerns undermine honesty and candor, especially in small teams. Employees fear retaliation and self-censor upward feedback when they believe managers can identify them.
  - [Are Anonymous Reviews Destructive?](https://www.shrm.org/topics-tools/news/employee-relations/anonymous-reviews-destructive)
  - [The Horrible Truth About 360-Degree Feedback](https://www.forbes.com/sites/lizryan/2015/10/21/the-horrible-truth-about-360-degree-feedback/)
  - [StackExchange: How to Approach the Request to Provide an Unstructured 360-Degree Evaluation for a Manager](https://workplace.stackexchange.com/questions/169075/how-to-approach-the-request-to-provide-an-unstructured-360-degree-evaluation-for)

- Lack of synthesis and action planning: managers report receiving difficult to parse data. Negative stigma around 360 reviewing make managers disillusioned despite 360-degree feedback's effectiveness.
  - [360-Degree Feedback as a Tool for Improving Employee Performance](https://www.researchgate.net/publication/374978873_360-Degree_Feedback_as_a_Tool_for_Improving_Employee_Performance)
  - [360 Reviews: good/bad idea?](https://www.manager-tools.com/forums/360-reviews-goodbad-idea)

## Comparables

### 1. Enterprise Performance Management Platforms
- **Examples**: CultureAmp, Lattice, 15Five, Workday, BambooHR
- **Strengths**:
  - Comprehensive HRIS integration and SSO support
  - Built-in goals, performance reviews, and engagement surveys
  - Strong compliance and audit trail features
  - Professional support and training resources
- **Limitations**:
  - Complex setup requiring IT and HR coordination
  - Expensive licensing models unsuitable for small teams or academic settings
  - Generic templates don't account for org-specific hierarchies
  - Limited automated rater selection based on org charts
  - Rigid anonymity controls that may not adapt to small team constraints

### 2. Survey and Spreadsheet Workflows
- **Examples**: Google Forms + Sheets, SurveyMonkey, Typeform, Microsoft Forms
- **Strengths**:
  - Fast to set up with low or no cost
  - Flexible question design and customization
  - Familiar tools with shallow learning curve
  - Easy export to CSV for manual analysis
- **Limitations**:
  - Entirely manual rater selection and assignment
  - No automated reminders or progress tracking
  - Weak or nonexistent anonymity guarantees (response metadata visible)
  - No built-in synthesis, theming, or action tracking
  - High administrative burden for coordinators
  - No role-based access or compliance features

### 3. Education-Focused Peer Review Tools
- **Examples**: TEAMMATES, Peergrade, Kritik, Canvas Peer Review
- **Strengths**:
  - Designed for course-based team evaluations
  - Clear rubric and structured feedback flows
  - Instructor dashboards for monitoring completion
  - Free or low-cost for academic use
- **Limitations**:
  - Limited to flat peer structures, not org-chart hierarchies
  - Minimal enterprise privacy, compliance, or SSO features
  - No manager/direct-report/peer role distinctions
  - Weak anonymization in small groups
  - Not designed for workplace competency frameworks

### 4. Collaboration Platform Add-ons
- **Examples**: Microsoft Viva Insights, Slack feedback bots, Officevibe
- **Strengths**:
  - Embedded in daily workflow (Slack, Teams, email)
  - Lightweight pulse surveys and quick feedback prompts
  - Low friction for participants
  - Good for continuous micro-feedback
- **Limitations**:
  - Shallow feedback not suited for comprehensive 360 reviews
  - Limited anonymity (tied to platform identity)
  - No org-chart-aware rater assignment
  - Minimal reporting and synthesis capabilities
  - Not designed for formal review cycles with action plans

### Our Unique Value Proposition
Our solution focuses on hierarchy or role-aware automation and trustworthy synthesis:
- Org-graph aware solicitation engine: import org chart/roster and auto-build reviewer sets by hierarchy.
- Anonymity by design: k-anonymity thresholds and degradations for small teams.
- Optional LLM-assisted, human-in-the-loop synthesis with quote-level provenance.
- Action plans with follow-through reminders and team-level themes.

## Features 
The core functionality is a web app that (1) imports or lets users input an org chart/roster, (2) auto-builds reviewer sets by hierarchy, then (3) prompts users to complete reviews and assembles insightful reports.

1. Org chart/roster import: CSV, manual, or HRIS; role mapping (manager, report, peer).

2. Cycle setup: templates and question bank for competencies or team specific matters; optional self-review.

3. Rater selection and coverage rules: minimum raters per role; conflict-of-interest exceptions can be handled too.

4. Solicitation engine: schedules, reminders, and load balancing to avoid rater fatigue.

5. Anonymity and privacy: k-anonymity thresholds, role-based access, and separate private-to-manager vs private-to-individual channels.

6. Collection UX: structured rubrics + free text; evidence attachments; guidance for behavior-based feedback and to avoid unstructured and noisy commenting.

7. Optional LLM summarization: thematic clustering, quote extraction with provenance (with person of interest redaction); human review required.

8. Reports: individual strengths, growth areas, and suggested actions; team-level aggregates and risk flags.

9. Bias and quality analytics: balance checks, outlier detection, sentiment/toxicity filters.

10. Action tracking: goals, follow-ups, reminders, and check-ins between cycles.

11. Integrations: Slack/Email notifications, SSO, HRIS sync, and controlled exports.

12. Accessibility options: screen-reader friendly, high-contrast UI, colorblind-friendly palette.

## Ethical analysis (Stakeholders)

**Direct stakeholders (key roles):**

- Employees being reviewed — receive feedback reports and action plans.

- Raters (peers, managers, direct reports) — provide structured and free-text feedback.

- HR administrators / team leads — set up cycles, choose templates, view team-level reports, monitor for toxicity, bias, and quality issues.

- Developers / product team — design features, privacy controls, and LLM integration.

**Indirect stakeholders:**

- Job candidates and future teammates — Concern: hiring or promotion decisions influenced by 360 reports they cannot see or contest.

- Legal/compliance officers — Concern: data retention, GDPR/privacy law compliance, and audit requirements.

- LLM service providers (if enabled) — Concern: processing sensitive employee feedback; data sharing agreements.

- Former employees — Concern: historical review data may persist and influence references or re-hiring decisions.

**One person, multiple roles**

A team lead sets up a 360 cycle for her team (direct stakeholder as Administrator). She is also reviewed by her manager and peers in the same cycle (direct stakeholder as Reviewee). Later, she provides upward feedback on her manager (direct stakeholder as Rater). In each role, she has different privacy expectations and power dynamics.

**Non-targeted / nefarious use**

- Retaliation and surveillance: managers use the system to identify and penalize employees who give critical feedback, stunting honesty.

- Gaming and collusion: groups of employees coordinate to inflate or deflate ratings for specific individuals.

- Weaponized reports: malicious actors submit false or exaggerated negative feedback to harm a colleague's standing or career.

**Variation in human ability & breakdowns**

- Vision: users with low vision struggle with small text in reporting, or admins with color-coded charts without labels or image-heavy dashboards.

- Cognitive load: complex rubrics, jargon-heavy prompts, or multi-step workflows create barriers for neurodivergent users or those with limited literacy.

- Motor control: small drag-and-drop interactions, small click targets, or time-limited forms exclude users with motor impairments.

Design must include accessible UI, screen-reader support, high-contrast and colorblind-friendly palettes, clear language, and flexible interaction modes.

**Changing hands (account transfer)**

When a team lead leaves and a new manager takes over, ownership of the 360 cycle and historical reports may transfer. Challenges: consent for data access by the new owner, ambiguous retention policies, and potential misuse of old feedback out of context. Features to smooth transfer: explicit ownership metadata, transfer workflows with participant notifications, and configurable data expiry or anonymization.

**Consider children (seven-year-old scenario)**

A seven-year-old uses a school-adapted version of the app where classmates rate each other on teamwork for a group project. The app generates a "team strengths" report. Influence: it may reinforce social hierarchies, teach early labeling behaviors ("leader" vs. "follower"), and expose children to peer judgment. 

The app should  
 - use age-appropriate, growth-oriented language
 - require parental and teacher consent
 - limit data retention, 
 - avoid deterministic labels or rankings

**Ethics Insights (each: observation + design response)**

1. 
    - **Observation (Stakeholders — power asymmetry / Features: role-based access)**: Managers with access to individual-level comments may identify and retaliate against employees who provide critical upward feedback, undermining honesty and psychological safety.
    - **Design response**: Default to role-aggregated, anonymized reports with k-anonymity thresholds; provide separate private-to-manager and private-to-individual channels with clear disclosure; allow employees to mark sensitive comments as redacted from manager view; audit and flag unusual access patterns.
2. 
    - **Observation (Time — short-term burden vs. long-term culture / Features: solicitation engine)**: One-shot annual review cycles create rater fatigue, generic feedback, and long delays between feedback and action, reducing effectiveness over time and eroding a culture of continuous improvement.
    - **Design response**: Introduce feedback windows, and frequency caps per rater; more frequent cycles compound into sustained behavior change rather than annual check-the-box exercises.
3. 
    - **Observation (Pervasiveness — surveillance risk / Features: data collection scope)**: If widely adopted, continuous 360 cycles could become a form of workplace surveillance, archiving subjective judgments that lose context over time and stunt experimentation or risk-taking.
    - **Design response**: Enforce strict retention limits with automatic expiry, and governance controls that prevent repurposing data; prohibit off-hours or non-work monitoring; make data scopes visible and reviewable by participants.
4. 
    - **Observation (Values — fairness and bias / Features: LLM summarization)**: Automated summarization may amplify majority opinions, wash out minority voices, or introduce stereotyped language, unfairly harming individuals from underrepresented groups or with dissenting viewpoints.
    - **Design response**: Require human-in-the-loop review of LLM outputs; run bias and balance checks; attach quote-level provenance; enforce neutral phrasing guidance; allow recipients to challenge summaries and append context; make LLM use opt-in per cycle with transparency about model providers.
5. 
    - **Observation (Stakeholders — small-team anonymity / Features: k-anonymity thresholds)**: In small teams, role-labeled feedback (e.g., "from your direct reports") combined with writing style can deanonymize raters, deterring honest critique and exposing vulnerable employees to retaliation.
    - **Design response**: Enforce per-role k-anonymity minimums; if thresholds are not met, aggregate roles or suppress attributions entirely; warn administrators before launching under-threshold cycles; offer trusted-only aggregate fallback mode.
6. 
    - **Observation (Time — data lifecycle and consent / Features: retention, exports)**: Long-term storage of sensitive feedback creates future harm as organizational context changes, people leave, and old judgments are repurposed beyond their original intent without renewed consent.
    - **Design response**: Set default retention limits per cycle with automatic archival or deletion; support reversible anonymization; watermark and scope exports with context ("not for HR decisions"); maintain immutable access logs; provide participant data access requests and deletion rights consistent with privacy law.