# Problem Framing 
**Authors**: Diego Peon, Francesca Venditti, Grace Zhou

## Domain

Our application operates at the intersection of organizational psychology, performance management, people analytics, and human–computer interaction. We focus on 360-degree feedback for workplaces and student teams: orchestrating role-aware rater selection, collection, and synthesis across manager, direct-report, peer, and self reviews to produce timely, privacy-preserving, actionable reports at both the individual and team level.


## Problem 

In many organizations, 360 reviews are irregular, biased, and administratively heavy. Existing HR suites are over-configured for small teams, while DIY surveys and spreadsheets break anonymity and stall follow-through. Feedback may arrive late or not at all, also lacking synthesis and actionability.

 - Brittle role-aware linking: uncertainty about who should rate whom; conflicts of interest.
 - Anonymity and safety: small-team deanonymization and fear of retaliation reduce honesty.
 - Concise reporting: redundant, noisy comments make overarching themes hard to see.
 - Delayed, non-actionable outputs: long cycle times; no action tracking, lack of fixed and visible deadlines.
 - Privacy/compliance ambiguity: unclear retention, access, and purpose limits.

We propose a 360 management web app that imports an org chart or roster, automatically solicits reviews from the right people, and assembles anonymous, role-aware reports (optionally using an LLM to summarize themes and team throughlines) so teams can act accordingly.

## Evidence 

- Common social friction at meetups, parties, and other types of events is widely reported: attendees skip introductions or stick to small cliques, and some have anxiety related to the event, despite actually wanting to create new connections. The following links describe the frequent feelings of social anxiety, social friction, and the negative consequences of uncomfortable social situations from research and blog standpoints. 
  - [How to survive a social event when you have social anxiety](https://idontmind.com/journal/how-to-survive-a-social-event-when-you-have-social-anxiety)
  - [Social Friction](https://www.etiquetteer.com/columns/2020/9/6/social-friction-vol-19-issue-49)
  - [Dealing with social friction](https://www.girlschase.com/article/dealing-social-friction-part-1-what-friction)
  - [The unintended consequences of team-building activities - a UPenn study](https://knowledge.wharton.upenn.edu/article/is-the-party-over-the-unintended-consequences-of-office-social-events/)


- Popularity of short social quizzes, playlist sharing, and personality tests shows user appetite for light, gamified self-disclosure.
  - [Common social quizzes](https://www.truity.com/)
  - [16Personalities MBTI Quiz - 4.9 million shares](https://www.16personalities.com/free-personality-test)
  - [SongShift - transfer music playlists across streaming platforms](https://www.songshift.com/)
  - [Spotify Blend - combines the music you and other people in the Blend listen to](https://support.spotify.com/us/article/social-recommendations-in-playlists/)
  - [Blog post: popular personality tests](https://www.reddit.com/r/mbti/comments/5imgp9/what_are_some_other_goodfunaccuratelegit/)

- Rising use of group games and apps (e.g., casual party apps, music-sharing social features) demonstrates demand for fast, playful group interaction tools.
  - [Crowd Party](https://crowdparty.app/quick)
  - [Blog - popular party games](https://www.realsimple.com/holidays-entertaining/entertaining/party-games-ideas)

## Comparables

### 1. Personality & Quiz Platforms
- **Examples**: 16Personalities, BuzzFeed Quizzes, Truity
- **Strengths**:
  - High user engagement through gamification
  - Established frameworks for personality assessment
  - Strong visual presentation of results for sharing
- **Limitations**:
  - Primarily individual-focused, lacking group dynamics analysis
  - Limited privacy controls for sensitive personal data
  - Static results without real-time interaction
  - No facilitation of actual social connections

### 2. Social Party Games
- **Examples**: Jackbox Games, Heads Up!, Psych!
- **Strengths**:
  - Excellent at breaking the ice in group settings
  - Simple, accessible gameplay mechanics
  - Strong entertainment value
- **Limitations**:
  - Focused on entertainment rather than meaningful connection
  - Limited personalization based on group dynamics
  - No lasting value or relationship-building components
  - Often requires a shared screen or physical presence

### 3. Music-Based Social Platforms
- **Examples**: Spotify Group Session, JQBX, Rave
- **Strengths**:
  - Music as a universal conversation starter
  - Real-time synchronization features
  - Strong emotional connection through shared experiences
- **Limitations**:
  - Limited to music as the primary interaction medium
  - Less effective for non-musical connections
  - Privacy concerns with music taste data
  - Limited structured interaction beyond listening
  - Cannot create any generalizable conclusions about compatibility

### 4. Professional Networking Tools
- **Examples**: LinkedIn Icebreakers, Donut for Slack
- **Strengths**:
  - Purpose-built for professional contexts
  - Integration with workplace tools
  - Focus on meaningful professional connections
- **Limitations**:
  - Often feels transactional
  - Limited personal expression
  - Can feel forced or inauthentic

### Our Unique Value Proposition
Our solution focuses on hierarchy or role-aware automation and trustworthy synthesis:
- Org-graph aware solicitation engine: import org chart/roster and auto-build reviewer sets by hierarchy.
- Anonymity by design: k-anonymity thresholds and degradations for small teams.
- Optional LLM-assisted, human-in-the-loop synthesis with quote-level provenance.
- Action plans with follow-through reminders and team-level themes.

## Features 
The core functionality is a web app that imports or lets users input an org chart/roster and auto-builds reviewer sets by hierarchy, then prompting users to complete reviews and assembling insightful reports.

1. Org chart/roster import: CSV, manual, or HRIS; role mapping (manager, report, peer).

2. Cycle setup: templates and question bank for competencies; optional self-review.

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

- Participants (friends, coworkers) — provide inputs and receive insights.

- Hosts/organizers — create sessions, invite participants, choose templates.

- App moderators / content reviewers — manage reports, content quality.

- Developers / product team — design features and privacy controls.

**Indirect stakeholders:**

- Non-participating observers (people in photos/mentions) — Concern: being described or profiled without consent if referenced in free text or photos.

- Employers / HR (if used in work settings) — Concern: inadvertent profiling could influence hiring/promotion or workplace dynamics.

- Minors / parents — Concern: children’s data or personality summaries could be stored or shared without appropriate safeguards.

- Public figures / acquaintances — Concern: their name or content used in group prompts could lead to reputation issues.

**One person, multiple roles**

A team lead organizes an offsite and creates the session (direct stakeholder as Host). Later, she joins another company-wide "fun" session created by someone else and fills out prompts as a participant (direct stakeholder as Participant). Separately, HR reads exported group summaries after the event (she becomes an indirect stakeholder whose profile influences decisions she did not control).

**Non-targeted / nefarious use**

- Coordinated profiling for harassment: bad actors create groups to produce targeted summaries used to manipulate or ostracize an individual.

- Social engineering: group insights could be mined to craft persuasive scams (e.g., personalized phishing).

- Surveillance / workplace monitoring: managers use the app as a covert assessment tool to evaluate employees’ traits.

**Variation in human ability & breakdowns**

- Vision: users with low vision may fail to read personality charts or color-coded group maps. If visual cues are primary, they miss nuance.

- Hearing: audio snippets (music) without captions exclude deaf users; voice prompts must have text alternatives.

- Motor control: small drag-and-drop or timed games create barriers; rapid tap interactions can be infeasible.

Design must include screen-reader labels, text transcripts for audio, large-target controls, and alternative input modes.

**Changing hands (account transfer)**

Accounts may be passed between people (e.g., a party organizer hands a recurring session to a friend). Challenges: ownership of stored group data, ambiguous consent for previously collected inputs. Features to smooth transfer: clear ownership metadata, a one-click "transfer ownership" with consent notifications to participants, and configurable data retention/export policies.

**Consider children (seven-year-old scenario)**

A seven-year-old creates a "class sleepover" game and asks classmates to add favorite songs and draw emojis. The app produces a playful "friendship map." Influence: it may shape how the child categorizes peers (in-group/out-group), teach labeling behaviors, and introduce privacy concepts early. The app should limit data retention for minors, require parental consent, and present results in age-appropriate, non-evaluative language. For this, the templates they'll be able to access will be restricted based on the user's reported age.

**Ethics Insights (each: observation + design response)**

1. 
    - **Observation (Non-targeted use / Features)**: The app’s group synthesis feature could be repurposed to single out and shame an individual by aggregating negative prompts.
    - **Design response**: Limit per-session visibility controls and require explicit consent before publishing individual-level summaries. Add a "no single-target" rule enforced by automated detection that prevents sessions whose inputs focus adversarially on one person.
2. 
    - **Observation (Privacy / Stakeholders)**: Participants may not understand downstream uses of their inputs (exports, integration with music services), leading to unexpected sharing.
    - **Design response**: Implement clear, inline consent dialogs per input type, a privacy dashboard showing where data went, and granular export controls; default to minimal sharing and require opt-in for integrations and exports.
3. 
    - **Observation (Variation in Ability / Features)**: Relying on music or audio as primary signals excludes deaf users and disadvantages those with limited bandwidth.
    - **Design response**: Provide equivalent text-based inputs (song title text, mood tags) and automatic transcript generation; ensure group reports synthesize non-audio signals equally and include an explicit "audio optional" mode.
4. 
    - **Observation (Changing Hands / Data lifecycle)**: When ownership transfers, previous participants may not want older data accessible under new ownership, causing privacy harm.
    - **Design response**: Introduce transfer workflows that notify all prior participants and offer a 14-day window to revoke or anonymize their past inputs before ownership changes take effect.
5. 
    - **Observation (Children / Ethical framing)**: Presenting personality labels to children risks fixed-mindset formation and peer categorization.
    - **Design response**: For under-13 users, use playful, growth-focused language (e.g., "things you like to try"), avoid deterministic labels, and require parental controls that limit sharing outside the immediate group.
6. 
    - **Observation (Indirect stakeholders / Employers)**: Exports or screenshots could be used by managers to make HR decisions based on informal group content.
    - **Design response**: Watermark exported summaries with context (session date, "non-clinical, non-validated") and offer an enterprise setting that disables export/printing for workplace templates to reduce misuse.