# Problem Framing 
**Authors**: Diego Peon, Francesca Venditti, Grace Zhou

## Domain

Our application operates at the intersection of social networking, behavioral psychology, and gamification. It's designed to enhance social interactions in small to medium-sized groups (3-20 people) across various settings including:
1. *Social gatherings* (parties, meetups, reunions)
2. *Professional settings* (team building, networking events, conferences)
3. *Educational environments* (classroom icebreaker, student orientation)
4. *Online communities* (virtual meetups, gaming groups, interest-based forums)

## Problem 

Social gatherings often suffer from several key issues that our application aims to address:

1. **Initial Awkwardness**: 72% of adults who experience anxiety say it interferes with their lives, leading to difficulty forming meaningful connections and affects their workplace performance ([Source: ADAA](https://adaa.org/workplace-stress-anxiety-disorders-survey)).

2. **Ineffective Icebreakers**: Traditional icebreakers often fail because they:
   - Force participation in ways that can embarrass introverts
   - Don't account for different personality types
   - Feel artificial and don't lead to natural conversations
   - Are often forgotten once completed

3. **Digital Distraction**: In our increasingly digital world, people have fewer opportunities to practice and develop in-person social skills, making face-to-face interactions more challenging.

4. **Missed Connections**: At events, people tend to stick with those they already know, missing opportunities to connect with new people who might share their interests or complement their personalities.

Our solution addresses these pain points by providing a structured yet flexible framework that makes social interactions more engaging, personalized, and effective at building genuine connections.

## Evidence 

- Common social friction at meetups, parties, and other types of events is widely reported: attendees skip introductions or stick to small cliques, and some have anxiety related to the event. The following links describe the frequent feelings of social anxiety, social friction, and the negative consequences of uncomfortable social situations from research and blog standpoints. 
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
  - Strong visual presentation of results
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
Our solution synthesizes the best elements of these platforms while addressing their limitations:
- Combines the psychological depth of personality tests with the engagement of party games
- Creates meaningful, personalized connections like networking tools but in a more natural, social context
- Uses multiple input methods (not just music) to accommodate different personalities and preferences
- Focuses on both immediate icebreaking and ongoing relationship building
- Prioritizes privacy and user control while enabling rich social interactions

## Features 

The core functionality involves collecting lightweight, engaging inputs from participants through various interactive formats, then using this data to generate meaningful social insights, conversation starters, and group dynamics analysis that help break the ice and foster deeper connections.

1. Multiple input modes: quiz-style prompts, "what song are you listening to" lists, playlists from music streaming platforms, short free-text prompts, reaction emojis, etc.

2. Automated personality summaries for each participant (short, shareable).

3. Group dynamic report: role archetypes, dominant traits, conversational hooks, predicted conflicts/compatibilities.

4. Icebreaker generator: tailored questions and game suggestions based on group profile.

5. Privacy controls: per-item visibility (private, group, anonymous), deletion, export.

6. Onboarding templates for different settings (party, networking, team offsite).

7. Accessibility options: screen-reader friendly, high-contrast UI, captioned audio clips for music inputs.

8. Moderation tools and reporting for abusive or manipulative content.

9. Optional integrations: music services, calendar invites, messaging platforms.

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

A seven-year-old creates a "class sleepover" game and asks classmates to add favorite songs and draw emojis. The app produces a playful "friendship map." Influence: it may shape how the child categorizes peers (in-group/out-group), teach labeling behaviors, and introduce privacy concepts early. The app should limit data retention for minors, require parental consent, and present results in age-appropriate, non-evaluative language.

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