# User Testing Report - 360 Feedback Web Application

**Date:** December 7, 2024  
**Testing Session Duration:** ~60 minutes
**Number of Participants:** 3, members of Diego's team at his workplace
**Participant Roles:**
- Participant 1 (P1): HR Admin/Form Creator
- Participant 2 (P2): Team Member/Respondent
- Participant 3 (P3): Team Member/Respondent

---

## Task List

| Task # | Task Title                                         | User Instruction                                                                                                                                      | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1      | Register and Login                                 | Create an account as an HR Admin and log into the system. Then log out, and log back in.                                                              | Tests the initial onboarding flow and whether authentication is intuitive. Want to attempt registration as well as valid and invalid login to cover all authentication cases                                                                                                                                                                                                                                                                           |
| 2      | Create Organization Teams                          | Navigate to the team management section and create 3 new teams with all least 3 members, assigning different roles for each, for each team.           | Tests whether users can successfully navigate the team creation interface and understand the role assignment mechanism. This is critical because teams are fundamental to organizing feedback forms, and the roles they assign will come back to relevance later during form creaiton.                                                                                                                                                                 |
| 3      | Create Feedback Forms with Role-Specific Questions | Create new feedback forms with questions of all 3 types, where at least one question is targeted to a specific role.                                  | Tests the core form creation functionality and whether users understand the role-targeting feature (a unique aspect of our design). We want to observe whether users discover the role-specific question option and if it's presented clearly in the interface.                                                                                                                                                                                        |
| 4      | Send Access Codes to Team Members                  | From the "My Forms" view, send access codes via email to other team members so they can submit responses.                                             | Tests whether the access code distribution system is discoverable and intuitive. This is a critical workflow step to go from form creation to response collection. Specifically, testing the email service in sending the access codes to each member and verifying on their end if the email itself is informative.                                                                                                                                   |
| 5      | Submit Form Responses                              | As a team member (using access code), locate and access the feedback forms, then complete and submit responses to all applicable questions.           | Tests the respondent experience from receiving an access code to submitting feedback. This reveals whether the access code redemption flow is clear and if the form interface is intuitive for respondents. "Is the option to use an access code for authentication in the login page clear enough?", or "Is the form response interface functional and intuitive for all types of form questions?" are the kinds of questions we want to answer here. |
| 6      | View Form Analytics Dashboard                      | Navigate to the forms dashboard and view the analytics for the submitted form responses, including response rate and responses across multiple teams. | Tests whether users can find and interpret the analytics features. This helps us understand if the dashboard provides adequate feedback about form status and if key metrics are presented clearly. We want to see if users understand what information is available and how to access it, and also get feedback on metrics' usefulness.                                                                                                               |
| 7      | Generate AI Summary Report                         | From the form responses view, generate an AI-powered summary report for the completed feedback forms and teams.                                       | Tests the discoverability and usability of the LLM summary feature. Here, we want to observe whether users can find the report generation button for the teams in the Dashboard and the forms in the form responses view, understand what it does, and whether the generated report appears useful and informative.                                                                                                                                    |


---

## Lesson Summary

### Participant 1 (HR Admin / Form Creator, Responder)

P1 moved through the basic auth tasks (Task 1) pretty smoothly. They were able to register, log out, and log back in without confusion. They did comment that they would have liked clearer feedback when a login failed (e.g. wrong password) versus when an account simply didn’t exist instead of a generic "invalid" message.

For team creation (Task 2), P1 understood the idea of teams and roles, but got stuck on the workflow. They expected some way to paste or upload a list of people instead of adding everyone one by one. I noted the ability to import, but I didn't prepare a file for them to try to import nor did we explore this further. They also didn’t immediately realize the point for roles (since it's not evident they would matter later for forms), but they understood after explaining it to them.

Form creation (Task 3) went okay for the basic questions and the interface for role selection was "clear enough". They did express it might be good to have role targeting to live at a higher level (section or whole form) in case they wanted to make a specific form for a given role, which comes down to differences in the nomenclatures between team and role which aren't really clear. They also wanted a way to “preview as Manager vs Developer” to sanity check the questions each role would see, like they saw when they tested the form responding.

Sending access codes (Task 4) mostly worked as intended. P1 liked that the emails were generated for them, but they didn’t feel comfortable with how plain the email looked. They mentioned they’d want company branding and maybe some boilerplate text they could customize. They did successfully send codes to the other participants.

Finally, when they generated AI summaries (Task 7), they liked the idea a lot (“this is what I’d actually use”), but the content felt a bit generic. They said they would want more concrete callouts or trends rather than just a re-phrasing of what people wrote, or a more visual export that they could share with their team or upper management.

---

### Participant 2 (Team Member / Respondent)

P2’s main path was Tasks 4, 5, 6, and 7 as a respondent. They got the access code email, clicked the link, and then got confused when they hit a login page instead of being dropped directly into the form. Their mental model was “the code *is* the access,” not “log in, then use the code.” Once we prompted them to look for the access-code option, they were able to proceed, but they likely wouldn’t have discovered it alone.

While filling out the form (Task 5), they liked that there was an indicator for questions that applied to their role. They did, however, ask whether their responses were anonymous and whether their manager or HR would see individual answers, something the UI didn’t answer.

We also tested interruption and recovery: they partially filled out the form, navigated away, then came back with the same code expecting to resume. They were surprised and frustrated that their previous answers were gone.

On the analytics side (Task 6), P2 didn’t have direct access to the dashboard in our current design, but we asked them what they expected. They said they’d like to see at least some aggregated view (e.g. overall sentiment or a few high-level numbers) after submitting/a receipt.

---

### Participant 3 (Team Member / Respondent)

P3’s run was identical to P2's, also focused on Tasks 4, 5, 6, and 7. Their first reaction was to the access code email itself. They expressed similar distaste for the plainness of the invite email.

Once in the app, P3 found where to enter the access code and got to the form without too much trouble, but they did note it was a bit strange how the login page and the form answering page are very similar and they found that unappealing.

In the debrief, P3, like P2, said they would want some kind of follow-up after the forms are submitted, like a receipt or confirmation. This lines up with the idea of a feedback loop feature. They also noted it would be useful to provide a way to give feedback to forms themselves in order to provide admins with constructive feedback on their creation, which could then be presented to them through the Dashboard or something similar.

---

## Key Findings and Opportunities

1. **Progress Saving and Repeat Uploads** (*to be fixed*)
   P2 ran into problems when they left the form and came back. They expected their answers to still be there after re-entering the access code, but the form had reset. This felt like “lost work” and was the most frustrating part of the flow. Right now there’s no clear model of when things are saved, and no warning before someone navigates away. P3 also observed it was possible to submit a form more than once.

2. **Privacy and Anonymity Messaging** (*to be fixed*)
   Respondents asked who would see their answers and whether their manager could tie responses back to them. The current UI doesn’t clearly explain what level of anonymity or privacy they should expect, which can impact how honest people are.

3. **Role-Based Question Filtering**  
   Once in the form, respondents appreciated that they saw indicators for questions that were matched their role.

4. **Core Admin Flow Works End-to-End**  
   P1 was able to go from logging in (Task 1) to creating teams (Task 2), creating forms (Task 3), sending access codes (Task 4), and viewing results (Tasks 6–7). There were rough edges, but the overall flow is coherent and doesn’t dead-end.

5. **Dashboard and Analytics**  
   When looking at the dashboard, P1 understood the basic metrics (response counts, status, etc.) and found the team division useful. They saw it as a good overview of the key throughlines without having to dive into each form.

6. **AI Summary Value Proposition**  
   Even though the content sometimes felt generic, P1 liked the idea of pressing a button and getting a summary instead of manually reading through every response. They saw this as one of the features they would actually use in a real cycle.

7. **Form Feedback**
   P3 expressed interest in letting respondents provide a simple text feedback on the form after submitting it, which we could tie back into Dashboard and the metrics we show to Admins and through which they can evaluate forms or teams by.

---