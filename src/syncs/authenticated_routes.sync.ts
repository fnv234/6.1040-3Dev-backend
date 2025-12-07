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

import { OrgGraph, ReportSynthesis, Requesting, ReviewCycle } from "@concepts";
import { actions, Frames, Sync, Vars } from "@engine";

// Frame type definitions for the sync
interface IngestResponsesFrame {
  template: unknown;
  responses: unknown;
}
// Sync for building reviewers automatically based on org graph
export const buildReviewers: Sync = ({ cycle, target }: Vars) => ({
  when: actions([
    ReviewCycle.autoBuildReviewers,
    { cycle, target },
    {},
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
      reviewers: (frames: Frames) => {
        const frameData = frames as unknown as Record<string, unknown>;
        return [
          frameData.manager,
          ...(frameData.peers as unknown[]),
          ...(frameData.reports as unknown[]),
        ];
      },
    }],
  ),
});

// Sync for ingesting and sanitizing feedback responses
export const ingestAndSanitize: Sync = (
  { cycle, target, reviewer, responses }: Vars,
) => ({
  when: actions([
    ReviewCycle.submitFeedback,
    { cycle, target, reviewer, responses },
    {},
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
    {},
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
    { themes },
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
    {},
  ]),
  then: actions([
    ReportSynthesis.getFinalReport,
    { responseSet },
  ]),
});

// Authentication passthrough syncs (placeholder until proper auth is implemented)
// Note: FeedbackForm routes removed - now using FormTemplate and AccessCode concepts

export const authenticatedOrgGraphRoutes: Sync = (
  { request, path, ...params }: Vars,
) => ({
  when: actions([
    Requesting.request,
    { path, ...params },
    { request },
  ]),
  where: (frames: Frames) => {
    const pathStr = frames.path as string | undefined;
    if (typeof pathStr === "string" && pathStr.startsWith("/OrgGraph/")) {
      return frames;
    }
    return null as unknown as Frames;
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
    const pathStr = frames.path as string | undefined;
    if (typeof pathStr === "string" && pathStr.startsWith("/ReviewCycle/")) {
      return frames;
    }
    return null as unknown as Frames;
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
    { request },
  ]),
  where: (frames: Frames) => {
    const pathStr = (frames as unknown as Record<string, unknown>).path as
      | string
      | undefined;
    if (
      typeof pathStr === "string" &&
      pathStr.startsWith("/ReportSynthesis/") &&
      pathStr !== "/ReportSynthesis/generateFormTemplateReport"
    ) {
      return frames;
    }
    return null as unknown as Frames;
  },
  then: actions([
    Requesting.respond,
    { request, success: true },
  ]),
});
