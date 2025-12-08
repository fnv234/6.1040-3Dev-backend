# User Testing - 2

## Richard Montgomery High School Debate Team Club Session
**Number of Participants:** 3 debate team members  
**Participant Roles:**
- Participant 1 (P1): Debate Coach/Admin (simulating HR Admin role)
- Participant 2 (P2): Debate Team Captain (simulating Team Member/Respondent)
- Participant 3 (P3): Debate Team Member (simulating Team Member/Respondent)

## Task List

| Task # | Task Title | User Instruction | Rationale |
|--------|-----------|------------------|-----------|
| 1 | Account Registration and Authentication | Create a new account as a debate coach/admin, log out, and then log back in with your credentials. | Tests the initial onboarding experience and authentication flow clarity. We want to see if users understand the difference between admin and respondent roles from the start, and whether error messages (wrong password vs. non-existent account) are clear enough to guide recovery. |
| 2 | Create Multiple Debate Teams | Navigate to the Teams section and create three debate teams: "Varsity," "JV," and "Novice." Add at least 3 members to each team, assigning roles like "Captain," "Researcher," and "Speaker." | Tests the team creation workflow and role assignment mechanism. Since debate teams have clear hierarchies and specialized roles, this will reveal whether users understand how roles will matter later for feedback targeting. We want to observe if the one-by-one member addition feels tedious and whether users discover the import roster feature. |
| 3 | Build Role-Targeted Feedback Forms | Create a feedback form titled "Tournament Performance Review" with all three question types (Free Response, Scale, Multiple Choice). Include at least two questions targeted to specific roles (e.g., "How effective was the captain's leadership?" for Captain role only). | Tests the core form-building functionality and the discoverability of role-targeting features. We want to see if users naturally explore role-specific questions or if they need prompting, and whether they understand when/why to use this feature. This is unique to our design and critical to test. |
| 4 | Distribute Access Codes via Email | From the "My Forms" view, send access codes to team members via email so they can submit tournament feedback responses. | Tests the access code distribution system and email workflow. We want to observe whether users understand the access code model, whether they find the email generation interface intuitive, and whether they have concerns about the email appearance or content customization. This is a critical handoff point between admin and respondent experiences. |
| 5 | Submit Feedback as Team Member | As a team member (using an access code from Task 4), navigate to the form, complete all applicable questions including role-specific ones, and submit your responses. | Tests the complete respondent journey from receiving an access code to submitting feedback. We want to observe: Can users find where to enter their access code? Do they understand which questions apply to them? Is the submission flow clear? Do they have concerns about privacy or anonymity? |
| 6 | Review Dashboard Analytics | Navigate to the Dashboard and review response metrics across all three debate teams. Examine response rates, completion status, and team-specific statistics. | Tests whether users can interpret the dashboard's data visualization and find value in the metrics presented. We want to see if the information hierarchy makes sense, if users understand what they're looking at, and whether they feel they can make informed decisions based on the data shown. |
| 7 | Generate and Review AI Summary | From the Form Responses view, generate an AI-powered synthesis report for the "Tournament Performance Review" form and evaluate its usefulness. | Tests the discoverability and perceived value of the LLM summary feature. We want to observe: Can users find the report generation button? Do they understand what it will produce? Does the generated content feel useful and actionable? This is a premium feature we're highlighting, so understanding its reception is critical. |


## Participant 1 Summary (Debate Coach/Admin)

P1 moved through authentication (Task 1) smoothly and successfully registered, logged out, and logged back in without confusion. They appreciated the clean interface but noted the system felt somewhat generic, commenting it could benefit from more contextual guidance for first-time users. We don't have this on the login page, but have added a resource guide and FAQ section on the landing page after authentication to instruct admins on how to use the system. 

During team creation (Task 2), P1 understood the role assignment feature intuitively, immediately grasping how Captains, Speakers, and Researchers mapped to their actual team structure. They successfully created all three teams (Varsity, JV, Novice) and appreciated the clear organization. However, after adding members one-by-one to the first team, they asked about bulk import options, expressing they already maintain rosters in spreadsheets. They were pleased to learn the import feature exists but noted they didn't typically have rosters in JSON format.

Form creation (Task 3) went smoothly once P1 discovered the role-targeting feature. They didn't find it immediately on their own but once we prompted them to explore the question creation interface, they immediately understood the value. They successfully created a comprehensive form with all three question types and two role-targeted questions. They suggested a preview mode to "see the form as different roles would see it" would be helpful for validation.

The access code distribution (Task 4) workflow worked well functionally. P1 successfully generated and sent codes to all team members. They liked that the system automated email generation but expressed interest in customizing the email content with team-specific messaging like "Great job at the tournament yesterday!" to make it feel more personal and contextual.

When viewing the dashboard (Task 6) and generating the AI summary (Task 7), P1 was notably enthusiastic. They immediately understood the metrics displayed and said, "This is actually really cool - I could use this after every tournament to see patterns in what's working and what's not." The AI summary feature particularly impressed them, though they noted the generated content could be more action-oriented.


## Participant 2 Summary (Debate Team Captain/Respondent)

P2's experience began with Task 4 which is receiving the access code email. They opened it on their phone (which we hadn't anticipated testing) and clicked the link. They successfully found and used the access code entry option, though it took a moment of examining the login page. They noted the "Have an access code?" option could be more prominent for users arriving via email.

The form completion experience (Task 5) went well overall. P2 appreciated seeing clear indicators for which questions applied to their role as Captain versus general questions. They moved through the form methodically, testing all three question types without issues. The interface felt intuitive once they were in the form itself.

However, P2 raised an important question during completion: "Is this anonymous? Can my coach see that I wrote this specific response?" They expressed that knowing the privacy level would affect how candid they'd be with constructive criticism. When we asked what they'd want to see, they suggested a banner or small note somewhere explaining the anonymization policy would help them feel more comfortable being honest.

During debriefing, P2 expressed that receiving some kind of confirmation or receipt after submitting would be valuable, or that they wanted more closure on the submission endpoint.


## Participant 3 Summary (Debate Team Member/Respondent)

P3's journey through Tasks 4-5 was similar to P2's. They successfully navigated to and completed the form using their access code, though they also noted the access code entry point could be more discoverable on the login page. Once past that initial step, the form experience was smooth.

While completing the form, P3 appreciated the variety of question types but had a moment of confusion on a Scale question (1-5 rating). This was a brief moment but highlighted that label placement/clarity could affect confidence during completion.

P3 successfully submitted their form without issues. Interestingly, they had a unique insight during debriefing: "What if at the end it said 'Want to suggest a question for next time?' or 'Any feedback on this form itself?'" This meta-feedback concept emerged naturally from their experience since they had thoughts about the questions while answering but no direct outlet to share them with the coach.

During the mobile discussion, P3 asked if this website would work well on mobile phones since most people in their use case would probably do it on their phone between classes. They completed the form on laptop but accurately predicted their peers' likely usage pattern.


## Key Findings and Opportunities (includes analysis of flaws/opportunities for improvement)


### 1. **Role-Targeted Questions Resonate With Hierarchical Teams**

Once discovered, the role-targeting feature for questions (Task 3) was immediately understood and valued by all participants. P2, when completing the form as a Captain, appreciated seeing clear indicators for role-specific vs. general questions. This feature maps naturally to debate team structure (and likely other hierarchical organizations) where different positions have different responsibilities and perspectives. The concept is sound; discoverability during form creation could be enhanced with better visual prominence or an example during onboarding.

### 2. **AI Summary Feature Generates Authentic Excitement**

The AI-powered synthesis report (Task 7) created a "wow moment" for P1, who said it was "actually really cool" and something they "would actually use." Even though they provided constructive feedback on content quality (wanting more theme extraction than prose), the core value proposition resonated: getting insights automatically instead of manually reading through dozens of responses is compelling. This validates LLM integration as a differentiating feature worth emphasizing. The enthusiasm suggests users see this as a premium capability that elevates the platform beyond simple form collection.

### 3. **Access Code Distribution Needs Enhanced Trust and Context**

Multiple participants raised concerns about the access code email (Task 4). While the functionality worked, since all codes were successfully delivered and used, the presentation needs improvement. P3 called it "kinda suspicious" and compared it to phishing emails they're warned about at school. P1 wanted to customize it with team-specific context like "Great job at the tournament!" Both respondents wanted clearer sender identification and event context. Recommendations were as follows: Add coach name prominently, include team/organization branding, provide tournament/event context, and enhance trust signals (clear sender, privacy statement). These are presentation improvements that don't affect core functionality.

## Overall Assessment

The core workflows, team creation, form building, distribution, response collection, and analytics, all functioned as designed with participants successfully completing their tasks. The role-targeting feature and AI summary capabilities particularly resonated with users and represent genuine differentiators. Key opportunities for enhancement center on improving discoverability (access code entry, role-targeting during form creation), providing transparency (privacy/anonymity messaging), and elevating presentation quality (email templates, trust signals). The foundation is solid; refinements would primarily enhance confidence and reduce friction at key transition points in the user journey.