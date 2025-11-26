/**
 * The Requesting concept exposes passthrough routes by default,
 * which allow POSTs to the route:
 *
 * /{REQUESTING_BASE_URL}/{Concept name}/{action or query}
 *
 * to passthrough directly to the concept action or query.
 * This is a convenient and natural way to expose concepts to
 * the world, but should only be done intentionally for public
 * actions and queries.
 *
 * This file allows you to explicitly set inclusions and exclusions
 * for passthrough routes:
 * - inclusions: those that you can justify their inclusion
 * - exclusions: those to exclude, using Requesting routes instead
 */

/**
 * INCLUSIONS
 *
 * Each inclusion must include a justification for why you think
 * the passthrough is appropriate (e.g. public query).
 *
 * inclusions = {"route": "justification"}
 */

export const inclusions: Record<string, string> = {
  // HR Admin authentication - needed for login functionality
  "/api/HRAdmin/registerHRAdmin":
    "public action to allow HR admin registration",
  "/api/HRAdmin/authenticateHRAdmin": "public action to allow HR admin login",
  "/api/HRAdmin/getHRAdmin":
    "public query to get HR admin data after authentication",

  // Public queries for organizational data
  "/api/OrgGraph/getAllEmployees":
    "public query to get all employees for UI dropdowns",
  "/api/OrgGraph/getAllTeams": "public query to get all teams for UI dropdowns",
  "/api/OrgGraph/getTeamMembers": "public query to display team membership",

  // Public feedback form queries
  "/api/FeedbackForm/getFeedbackForm":
    "public query to display feedback forms to reviewers",
  "/api/FeedbackForm/getFeedbackFormsByReviewer":
    "public query for reviewers to see their assigned forms",

  // Public review cycle queries
  "/api/ReviewCycle/getActiveCycles":
    "public query to display active review cycles",
  "/api/ReviewCycle/getReviewerTasks":
    "public query for reviewers to see their pending tasks",

  // Public report queries
  "/api/ReportSynthesis/getReportsByTarget":
    "public query for employees to view their reports",
  "/api/ReportSynthesis/getFinalReport":
    "public query to display completed reports",
};

/**
 * EXCLUSIONS
 *
 * Excluded routes fall back to the Requesting concept, and will
 * instead trigger the normal Requesting.request action. As this
 * is the intended behavior, no justification is necessary.
 *
 * exclusions = ["route"]
 */

export const exclusions: Array<string> = [
  // Administrative actions that require authentication
  "/api/FeedbackForm/createFeedbackForm",
  "/api/FeedbackForm/sendFeedbackForm",
  "/api/FeedbackForm/submitFeedbackForm",
  "/api/FeedbackForm/updateFeedbackFormResponse",

  // Organizational management actions
  "/api/OrgGraph/importRoster",
  "/api/OrgGraph/updateManager",
  "/api/OrgGraph/updateTeam",

  // Review cycle management actions
  "/api/ReviewCycle/createCycle",
  "/api/ReviewCycle/configureAssignments",
  "/api/ReviewCycle/addReviewers",
  "/api/ReviewCycle/activate",
  "/api/ReviewCycle/submitFeedback",
  "/api/ReviewCycle/close",

  // Report synthesis actions
  "/api/ReportSynthesis/ingestResponses",
  "/api/ReportSynthesis/applyKAnonymity",
  "/api/ReportSynthesis/extractThemes",
  "/api/ReportSynthesis/draftSummaryLLM",
  "/api/ReportSynthesis/approveSummary",
];
