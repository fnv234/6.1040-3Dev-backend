/**
 * Synchronizations for authenticated routes.
 * These routes require user authentication before executing.
 *
 * TODO: Add Authenticating/Sessioning concept for proper authentication.
 * For now, these syncs simply pass through the requests.
 *
 * NOTE: These syncs use the instrumented concept instances from @concepts,
 * which are already connected to the database and the sync engine.
 */

import { FeedbackForm, OrgGraph, ReviewCycle, ReportSynthesis, Requesting } from "@concepts";
import { actions, Frames, Sync, Vars } from "@engine";

// Sync for building reviewers automatically based on org graph
export const buildReviewers: Sync = ({ cycle, target }: Vars) => ({
  when: actions([
    ReviewCycle.autoBuildReviewers,
    { cycle, target },
    {}
  ]),
  then: actions(
    // Get manager
    [OrgGraph.getManager, { employee: target }, { manager: "manager" }],
    // Get peers
    [OrgGraph.getPeers, { employee: target }, { peers: "peers" }],
    // Get direct reports
    [OrgGraph.getDirectReports, { employee: target }, { reports: "reports" }],
    // Add all as reviewers
    [ReviewCycle.addReviewers, {
      cycle,
      target,
      reviewers: ({ manager, peers, reports }: Frames) => [
        manager,
        ...peers,
        ...reports,
      ],
    }],
  )
});

// Sync for ingesting and sanitizing feedback responses
export const ingestAndSanitize: Sync = (
  { cycle, target, reviewer, responses }: Vars,
) => ({
  when: actions([
    ReviewCycle.submitFeedback,
    { cycle, target, reviewer, responses },
    {}
  ]),
  // This would typically ingest into ReportSynthesis and apply k-anonymity
  // For now, we'll just pass through the submission with no follow-up actions
  then: [],
});

// Sync for preparing response sets for summary generation
export const prepareForSummary: Sync = ({ cycle }: Vars) => ({
  when: actions([
    ReviewCycle.close,
    { cycle },
    {}
  ]),
  then: actions([
    // Export response sets from the closed cycle
    ReviewCycle.exportForSynthesis,
    { cycle },
    { responseSets: "responseSets" },
  ]),
});

// Sync for generating draft summaries using LLM
export const generateDrafts: Sync = ({ responseSet, themes }: Vars) => ({
  when: actions([
    ReportSynthesis.extractThemes,
    { responseSet },
    { themes }
  ]),
  then: actions([
    ReportSynthesis.draftSummaryLLM,
    { responseSet, themes },
  ]),
});

// Sync for finalizing reports after approval
export const finalizeReports: Sync = (
  { responseSet, finalText, keyQuotes }: Vars,
) => ({
  when: actions([
    ReportSynthesis.approveSummary,
    { responseSet, finalText, keyQuotes },
    {}
  ]),
  then: actions([
    ReportSynthesis.getFinalReport,
    { responseSet },
  ]),
});

// Authentication passthrough syncs (placeholder until proper auth is implemented)
export const authenticatedFeedbackFormRoutes: Sync = (
  { request, path, ...params }: Vars,
) => ({
  when: actions([
    Requesting.request,
    { path, ...params },
    { request },
  ]),
  where: (frames: Frames) => {
    // Check if path is a FeedbackForm route
    const pathStr = frames.path as string;
    return pathStr.startsWith('/FeedbackForm/') ? frames : {};
  },
  then: actions([
    Requesting.respond,
    { request, success: true },
  ]),
});

export const authenticatedOrgGraphRoutes: Sync = (
  { request, path, ...params }: Vars,
) => ({
  when: actions([
    Requesting.request,
    { path, ...params },
    { request },
  ]),
  where: (frames: Frames) => {
    const pathStr = frames.path as string;
    return pathStr.startsWith('/OrgGraph/') ? frames : {};
  },
  then: actions([
    Requesting.respond,
    { request, success: true },
  ]),
});

export const authenticatedReviewCycleRoutes: Sync = (
  { request, path, ...params }: Vars,
) => ({
  when: actions([
    Requesting.request,
    { path, ...params },
    { request },
  ]),
  where: (frames: Frames) => {
    const pathStr = frames.path as string;
    return pathStr.startsWith('/ReviewCycle/') ? frames : {};
  },
  then: actions([
    Requesting.respond,
    { request, success: true },
  ]),
});

export const authenticatedReportSynthesisRoutes: Sync = (
  { request, path, ...params }: Vars,
) => ({
  when: actions([
    Requesting.request,
    { path, ...params },
    { request }
  ]),
  where: (frames: Frames) => {
    const pathStr = frames.path as string;
    return pathStr.startsWith('/ReportSynthesis/') ? frames : {};
  },
  then: actions([
    Requesting.respond,
    { request, success: true },
  ]),
});
