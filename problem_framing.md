# Problem Framing 
Authors: Diego Peon, Francesca Venditti, Grace Zhou

## Domain

Social / social-gaming applications that generate personalized social insights and conversation starters for small groups (friends, coworkers, event attendees) by collecting lightweight inputs (quizzes, playlists, short prompts) and producing personality summaries, group-dynamic analyses, compatibility notes, and icebreaker content.

## Problem 

Awkward or shallow social interactions at gatherings and events make it hard for people to quickly connect. Host-run icebreakers can often be boring and time-consuming, as well as sometimes embarrassing. Our proposed app will address the need for a fun, low-friction way for groups to learn about each other, spark better conversation, and form these deeper connections quickly.

## Evidence 

- Common social friction at meetups, parties, and networking events is widely reported: attendees skip introductions or stick to small cliques.

- Popularity of short social quizzes, playlist sharing, and personality tests shows user appetite for light, gamified self-disclosure.

- Rising use of group games and apps (e.g., casual party apps, music-sharing social features) demonstrates demand for fast, playful group interaction tools.

## Comparables

- Casual quiz apps and personality tests (BuzzFeed quizzes, 16Personalities) — strong on engagement, weak on privacy and group analysis.

- Party/game apps (e.g., Heads Up!, Jackbox) — strong on gameplay, less on personalized insight.

- Social music features (Spotify group sessions, shared playlists) — good for shared context but limited to music signals.

This product blends elements: quiz/games + social insight + group synthesis.

## Features 

- Multiple input modes: quiz-style prompts, “what song are you listening to” lists, short free-text prompts, reaction emojis.

- Automated personality summaries for each participant (short, shareable).

- Group dynamic report: role archetypes, dominant traits, conversational hooks, predicted conflicts/compatibilities.

- Icebreaker generator: tailored questions and game suggestions based on group profile.

- Privacy controls: per-item visibility (private, group, anonymous), deletion, export.

- Onboarding templates for different settings (party, networking, team offsite).

- Accessibility options: screen-reader friendly, high-contrast UI, captioned audio clips for music inputs.

- Moderation tools and reporting for abusive or manipulative content.

- Optional integrations: music services, calendar invites, messaging platforms.

## Ethical analysis (Stakeholders)

**Direct stakeholders (key roles):**

- Participants (friends, coworkers) — provide inputs and receive insights.

- Hosts/organizers — create sessions, invite participants, choose templates.

- App moderators / content reviewers — manage reports, content quality.

- Developers / product team — design features and privacy controls.

**Indirect stakeholders (3–5, each with a concern):**

- Non-participating observers (people in photos/mentions) — Concern: being described or profiled without consent if referenced in free text or photos.

- Employers / HR (if used in work settings) — Concern: inadvertent profiling could influence hiring/promotion or workplace dynamics.

- Minors / parents — Concern: children’s data or personality summaries could be stored or shared without appropriate safeguards.

- Public figures / acquaintances — Concern: their name or content used in group prompts could lead to reputation issues.

**One person, multiple roles**

A team lead (Aisha) organizes an offsite and creates the session (direct stakeholder as Host). Later she joins another company-wide “fun” session created by someone else and fills out prompts as a participant (direct stakeholder as Participant). Separately, HR reads exported group summaries after the event (Aisha becomes an indirect stakeholder whose profile influences decisions she did not control).

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

Accounts may be passed between people (e.g., a party organizer hands a recurring session to a friend). Challenges: ownership of stored group data, ambiguous consent for previously collected inputs. Features to smooth transfer: clear ownership metadata, a one-click “transfer ownership” with consent notifications to participants, and configurable data retention/export policies.

**Consider children (seven-year-old scenario)**

A seven-year-old creates a “class sleepover” game and asks classmates to add favorite songs and draw emojis. The app produces a playful “friendship map.” Influence: it may shape how the child categorizes peers (in-group/out-group), teach labeling behaviors, and introduce privacy concepts early. The app should limit data retention for minors, require parental consent, and present results in age-appropriate, non-evaluative language.

**Ethics insights (each: observation + design response; 30–75 words each)**
1. 
- *Observation* (Non-targeted use / Features): The app’s group synthesis feature could be repurposed to single out and shame an individual by aggregating negative prompts.
- *Design response*: Limit per-session visibility controls and require explicit consent before publishing individual-level summaries. Add a “no single-target” rule enforced by automated detection that prevents sessions whose inputs focus adversarially on one person.
2. 
- *Observation* (Privacy / Stakeholders): Participants may not understand downstream uses of their inputs (exports, integration with music services), leading to unexpected sharing.
- Design response: Implement clear, inline consent dialogs per input type, a privacy dashboard showing where data went, and granular export controls; default to minimal sharing and require opt-in for integrations and exports.
3. 
- *Observation* (Variation in Ability / Features): Relying on music or audio as primary signals excludes deaf users and disadvantages those with limited bandwidth.
- *Design response*: Provide equivalent text-based inputs (song title text, mood tags) and automatic transcript generation; ensure group reports synthesize non-audio signals equally and include an explicit “audio optional” mode.
4. 
- *Observation* (Changing Hands / Data lifecycle): When ownership transfers, previous participants may not want older data accessible under new ownership, causing privacy harm.
- *Design response*: Introduce transfer workflows that notify all prior participants and offer a 14-day window to revoke or anonymize their past inputs before ownership changes take effect.
5. 
- *Observation* (Children / Ethical framing): Presenting personality labels to children risks fixed-mindset formation and peer categorization.
- *Design response*: For under-13 users, use playful, growth-focused language (e.g., “things you like to try”), avoid deterministic labels, and require parental controls that limit sharing outside the immediate group.
6. 
- *Observation* (Indirect stakeholders / Employers): Exports or screenshots could be used by managers to make HR decisions based on informal group content.
- *Design response*: Watermark exported summaries with context (session date, “non-clinical, non-validated”) and offer an enterprise setting that disables export/printing for workplace templates to reduce misuse.