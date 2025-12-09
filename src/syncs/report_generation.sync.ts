/**
 * Synchronizations for report generation.
 * These syncs coordinate FormTemplate, AccessCode, and ReportSynthesis concepts
 * to generate privacy-preserving feedback reports without violating concept independence.
 */

import {
  AccessCode,
  FormTemplate,
  OrgGraph,
  ReportSynthesis,
  Requesting,
} from "@concepts";
import { actions, Frames, Sync, Vars } from "@engine";
import { ID } from "@utils/types.ts";

/**
 * sync GenerateFormTemplateReportRequest
 *
 * When a request comes in to generate a report for a form template:
 * 1. Query FormTemplate for the template details
 * 2. Query AccessCode for all responses to that form
 * 3. Transform the responses into the format needed by ReportSynthesis
 * 4. Call ReportSynthesis.generateCompleteReport
 * 5. Respond with the generated report
 *
 * This sync replaces the violating ReportSynthesis.generateFormTemplateReport method
 * that was directly importing and calling other concepts.
 */
export const GenerateFormTemplateReportRequest: Sync = (
  {
    request,
    formTemplateId,
    createdBy,
    anonymityFlag,
    kThreshold,
    transformedResponses,
    report,
    teamName,
  }: Vars,
) => ({
  when: actions([
    Requesting.request,
    {
      path: "/ReportSynthesis/generateFormTemplateReport",
      formTemplateId,
      createdBy,
      anonymityFlag,
      kThreshold,
    },
    { request },
  ]),
  where: async (frames) => {
    // Manually call concept actions and transform data
    // This is necessary because we need to coordinate multiple concepts
    // and transform their data before passing to ReportSynthesis

    // frames is a Frames object which extends Array - iterate to get the first frame
    let frame;
    for (const f of frames) {
      frame = f;
      break;
    }

    if (!frame) {
      throw new Error("No frame found in sync where clause");
    }

    const formId = frame[formTemplateId] as ID;
    const creator = frame[createdBy] as ID;
    const anon = frame[anonymityFlag] ?? true;
    const kThresh = frame[kThreshold] ?? 3;

    // Step 1: Get the form template
    const { template: templateData } = await FormTemplate.getTemplate({
      templateId: formId,
    });

    // Step 2: Get all form responses for this template
    const { responses: accessCodeResponsesData } = await AccessCode
      .getFormResponses({
        formId,
        createdBy: creator,
      });

    // Step 3: Get team information for context
    let actualTeamName;
    if (templateData.teamId) {
      try {
        // Get team info from OrgGraph to provide context
        const { teams } = await OrgGraph.getAllTeams({ owner: creator });
        const team = teams.find((t: { _id: ID }) =>
          t._id === templateData.teamId
        );
        actualTeamName = team?.name;
      } catch (error) {
        console.log("Could not fetch team info:", error);
        // Continue without team name if fetch fails
      }
    }

    // Step 4: Transform responses into the format needed by ReportSynthesis
    const transformed = [];
    for (const response of accessCodeResponsesData) {
      const responsesMap = response.responses as Record<string, string>;
      for (
        const [questionIndex, responseText] of Object.entries(responsesMap)
      ) {
        const question = templateData.questions[parseInt(questionIndex)];
        transformed.push({
          questionIndex: parseInt(questionIndex),
          questionText: question?.prompt ||
            `Question ${parseInt(questionIndex) + 1}`,
          response: responseText,
          respondent: response.memberId || response.memberEmail,
          respondentRole: response.memberRole,
        });
      }
    }

    // Return a single frame with all the necessary bindings
    // Frames constructor takes individual frames as spread arguments
    return new Frames(
      {
        ...frame,
        [formTemplateId]: formId,
        [anonymityFlag]: anon,
        [kThreshold]: kThresh,
        [transformedResponses]: transformed,
        [teamName]: actualTeamName,
      },
    );
  },
  then: actions([
    ReportSynthesis.generateCompleteReport,
    {
      formTemplateId,
      responses: transformedResponses,
      anonymityFlag,
      kThreshold,
      teamName,
    },
    { report },
  ]),
});

/**
 * sync GenerateFormTemplateReportResponse
 *
 * After ReportSynthesis.generateCompleteReport completes successfully,
 * respond to the original request with the generated report.
 */
export const GenerateFormTemplateReportResponse: Sync = (
  { request, report }: Vars,
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/ReportSynthesis/generateFormTemplateReport" },
      { request },
    ],
    [ReportSynthesis.generateCompleteReport, {}, { report }],
  ),
  then: actions([
    Requesting.respond,
    { request, report },
  ]),
});

/**
 * sync GenerateFormTemplateReportError
 *
 * If ReportSynthesis.generateCompleteReport fails,
 * respond to the original request with the error.
 */
export const GenerateFormTemplateReportError: Sync = (
  { request, error }: Vars,
) => ({
  when: actions(
    [
      Requesting.request,
      { path: "/ReportSynthesis/generateFormTemplateReport" },
      { request },
    ],
    [ReportSynthesis.generateCompleteReport, {}, { error }],
  ),
  then: actions([
    Requesting.respond,
    { request, error },
  ]),
});
