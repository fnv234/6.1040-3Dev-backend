import { Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";
import { ReportSynthesis } from "@concepts";
import ReportSynthesisConcept from "@concepts/ReportSynthesis/ReportSynthesisConcept.ts";
import { ID } from "@utils/types.ts";

const router = new Router();

interface FeedbackResponse {
  questionIndex: number;
  questionText: string;
  response: string;
  respondent: string;
  respondentRole?: string;
}

interface GenerateReportRequest {
  formTemplateId: string;
  responses: FeedbackResponse[];
  anonymityFlag?: boolean;
  kThreshold?: number;
}

/**
 * POST /reportSynthesis/generateReport
 * Generates a synthesized report for a form template
 *
 * Request body:
 * {
 *   formTemplateId: string,
 *   responses: FeedbackResponse[],
 *   anonymityFlag?: boolean,
 *   kThreshold?: number
 * }
 */
router.post("/generateReport", async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: "Request body is required",
      };
      return;
    }

    const body = ctx.request.body();
    let requestData: GenerateReportRequest;

    if (body.type === "json") {
      requestData = await body.value;
    } else {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: "Request body must be JSON",
      };
      return;
    }

    const { formTemplateId, responses, anonymityFlag = true, kThreshold = 3 } =
      requestData;

    // Validate required fields
    if (!formTemplateId || !responses || !Array.isArray(responses)) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: "Missing required fields: formTemplateId and responses array",
      };
      return;
    }

    if (responses.length < kThreshold) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: `At least ${kThreshold} responses required to generate a report`,
      };
      return;
    }

    // Step 1: Transform responses to match concept interface
    const transformedResponses = responses.map((r) => ({
      questionIndex: r.questionIndex,
      questionText: r.questionText,
      response: r.response,
      respondent: r.respondent as ID,
      respondentRole: r.respondentRole,
    }));

    // Step 2: Ingest responses
    const { responseSet } = await ReportSynthesis.ingestResponses({
      formTemplate: formTemplateId as ID,
      responses: transformedResponses,
      anonymityFlag,
      kThreshold,
    });

    // Step 3: Apply k-anonymity
    await ReportSynthesis.applyKAnonymity({ responseSet });

    // Step 4: Extract themes
    const { themes } = await ReportSynthesis.extractThemes({ responseSet });

    // Step 5: Generate draft summary
    const { draft } = await ReportSynthesis.draftSummaryLLM({
      responseSet,
      themes,
    });

    // Step 6: Extract key quotes (simple approach: take first few meaningful responses)
    const keyQuotes: string[] = [];
    for (const response of responses) {
      if (response.response.length > 20 && keyQuotes.length < 5) {
        keyQuotes.push(response.response);
      }
    }

    // Step 7: Approve and finalize the summary
    await ReportSynthesis.approveSummary({
      responseSet,
      finalText: draft,
      keyQuotes,
    });

    // Step 8: Get the final report
    const { report } = await ReportSynthesis.getFinalReport({ responseSet });

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      report,
    };
  } catch (error) {
    console.error("Report generation error:", error);

    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: "Failed to generate report",
      details:
        Deno.env.get("DENO_ENV") === "development" && error instanceof Error
          ? error.message
          : undefined,
    };
  }
});

/**
 * GET /reportSynthesis/getReport/:formTemplateId
 * Gets the most recent report for a form template
 */
router.get("/getReport/:formTemplateId", async (ctx: any) => {
  try {
    const formTemplateId = ctx.params?.formTemplateId;

    if (!formTemplateId) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: "formTemplateId parameter is required",
      };
      return;
    }

    const { report } = await ReportSynthesis.getReportByFormTemplate({
      formTemplate: formTemplateId as ID,
    });

    if (!report) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        error: "No report found for this form template",
      };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      report,
    };
  } catch (error) {
    console.error("Error fetching report:", error);

    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: "Failed to fetch report",
      details:
        Deno.env.get("DENO_ENV") === "development" && error instanceof Error
          ? error.message
          : undefined,
    };
  }
});

/**
 * GET /reportSynthesis/getAllReports
 * Gets all synthesized reports
 */
router.get("/getAllReports", async (ctx: any) => {
  try {
    const { reports } = await ReportSynthesis.getAllReports();

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      reports,
    };
  } catch (error) {
    console.error("Error fetching all reports:", error);

    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: "Failed to fetch reports",
      details:
        Deno.env.get("DENO_ENV") === "development" && error instanceof Error
          ? error.message
          : undefined,
    };
  }
});

/**
 * POST /reportSynthesis/generateTeamSummary
 * Generates a summary of team member feedback responses using the existing ReportSynthesis LLM infrastructure
 *
 * Request body:
 * {
 *   teamId: string,
 *   teamName: string,
 *   members: Array<{name: string, role: string}>
 * }
 */
router.post("/generateTeamSummary", async (ctx: any) => {
  try {
    if (!ctx.request.hasBody) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: "Request body is required",
      };
      return;
    }

    const body = ctx.request.body();
    let requestData: { teamId: string; teamName: string; members: Array<{name: string; role: string}> };

    if (body.type === "json") {
      requestData = await body.value;
    } else {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: "Request body must be JSON",
      };
      return;
    }

    const { teamId, teamName, members } = requestData;

    if (!teamId || !teamName || !members) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        error: "teamId, teamName, and members are required",
      };
      return;
    }

    console.log('Generating feedback summary for team:', { teamName, teamId, membersCount: members.length });

    // Use the existing ReportSynthesis infrastructure to get team feedback
    const { summary } = await ReportSynthesisConcept.generateTeamFeedbackSummary({
      teamId,
      teamName,
      members,
    });

    console.log('Generated feedback summary:', summary);

    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      summary,
      teamId,
      teamName,
    };

  } catch (error) {
    console.error("Error generating team feedback summary:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    ctx.response.status = 500;
    ctx.response.body = {
      success: false,
      error: "Failed to generate team feedback summary",
      details: Deno.env.get("DENO_ENV") === "development" && error instanceof Error 
        ? error.message 
        : undefined,
    };
    
    if (
      Deno.env.get("DENO_ENV") === "development" && error instanceof Error
    ) {
      console.error(error.stack);
    }
  }
});

export default router;