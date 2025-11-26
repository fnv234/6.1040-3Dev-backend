/**
 * Email synchronizations for sending feedback form notifications
 */

import { Email, FeedbackForm, OrgGraph, Requesting } from "@concepts";
import { actions, Frames, Sync, Vars } from "@engine";

/**
 * When a feedback form is sent, queue emails to all reviewers
 */
export const sendFormEmails: Sync = ({ feedbackForm, email }: Vars) => ({
  when: actions([
    FeedbackForm.sendFeedbackForm,
    { feedbackForm },
    { link: "link" }
  ]),
  where: async (frames: Frames) => {
    // Get form details
    const formFrames = await frames.queryAsync(
      FeedbackForm.getFeedbackForm,
      { id: feedbackForm },
      { feedbackForm: "formData" }
    );
    
    return formFrames;
  },
  then: actions([
    Email.queueEmail,
    {
      to: ({ formData }: Frames) => {
        // Get reviewer email from the form
        // In production, you'd lookup the employee email from OrgGraph
        return (formData as any).reviewer; // This should be an email address
      },
      subject: ({ formData }: Frames) => `New Feedback Request: ${(formData as any).name}`,
      body: ({ formData, link }: Frames) => 
        `You have been requested to provide feedback.\n\nForm: ${(formData as any).name}\n\nPlease complete the form at: ${window.location.origin}${link}`,
      formLink: ({ link }: Frames) => `${window.location.origin}${link}`
    }
  ]),
});

/**
 * Automatically send queued emails
 */
export const autoSendEmails: Sync = ({ email }: Vars) => ({
  when: actions([
    Email.queueEmail,
    {},
    { email }
  ]),
  then: actions([
    Email.sendEmail,
    { email }
  ]),
});

/**
 * Handle email send requests from the frontend
 */
export const handleEmailRequest: Sync = (
  { request, to, subject, body, formLink, email, success }: Vars
) => ({
  when: actions([
    Requesting.request,
    { path: "/email/send", to, subject, body, formLink },
    { request }
  ]),
  then: actions(
    [Email.queueEmail, { to, subject, body, formLink }, { email }],
    [Email.sendEmail, { email }, { success }],
    [Requesting.respond, { request, success, emailId: email }]
  ),
});