/**
 * Email synchronizations for sending feedback form notifications
 *
 * Note: FeedbackForm.sendFeedbackForm sync removed - now using AccessCode concept
 * for form distribution. Email sending is handled manually via frontend.
 */

import { Email, OrgGraph, Requesting } from "@concepts";
import { actions, Frames, Sync, Vars } from "@engine";

/**
 * Automatically send queued emails
 */
export const autoSendEmails: Sync = ({ email }: Vars) => ({
  when: actions([
    Email.queueEmail,
    {},
    { email },
  ]),
  then: actions([
    Email.sendEmail,
    { email },
  ]),
});

/**
 * Handle email send requests from the frontend
 */
export const handleEmailRequest: Sync = (
  { request, to, subject, body, formLink, email, success }: Vars,
) => ({
  when: actions([
    Requesting.request,
    { path: "/email/send", to, subject, body, formLink },
    { request },
  ]),
  then: actions(
    [Email.queueEmail, { to, subject, body, formLink }, { email }],
    [Email.sendEmail, { email }, { success }],
    [Requesting.respond, { request, success, emailId: email }],
  ),
});
