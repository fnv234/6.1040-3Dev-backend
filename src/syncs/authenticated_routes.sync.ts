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

import { OrgGraph, ReportSynthesis, Requesting } from "@concepts";
import { actions, Frames, Sync, Vars } from "@engine";

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
