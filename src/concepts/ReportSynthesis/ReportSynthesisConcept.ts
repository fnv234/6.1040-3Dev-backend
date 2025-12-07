import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import { GeminiLLM } from "../../../gemini-llm.ts";

const PREFIX = "ReportSynthesis" + ".";

// --- Type Definitions ---
type Respondent = ID;
type FormTemplateID = ID;
type ResponseSetID = ID;
type ReportID = ID;

interface Response {
  questionIndex: number;
  questionText: string;
  response: string;
  respondent: Respondent;
  respondentRole?: string;
}

interface ResponseSetDoc {
  _id: ResponseSetID;
  formTemplate: FormTemplateID;
  responses: Response[];
  anonymityFlag: boolean;
  kThreshold: number;
  synthesizedReport?: ReportID;
}

interface ReportDoc {
  _id: ReportID;
  formTemplate: FormTemplateID;
  textSummary: string;
  keyThemes: string[];
  keyQuotes: string[];
  metrics: Record<string, number | Record<string, number>>;
  createdAt: string;
}

interface Aggregate {
  metric: string;
  value: number | string;
  category?: string;
}

/**
 * ReportSynthesis concept for generating privacy-preserving feedback reports
 */
export default class ReportSynthesisConcept {
  private readonly responseSets: Collection<ResponseSetDoc>;
  private readonly reports: Collection<ReportDoc>;
  private readonly llm?: GeminiLLM;

  constructor(private readonly db: Db, llmConfig?: { apiKey: string }) {
    this.responseSets = this.db.collection(PREFIX + "responseSets");
    this.reports = this.db.collection(PREFIX + "reports");

    if (llmConfig) {
      this.llm = new GeminiLLM(llmConfig);
    }
  }

  /**
   * ingestResponses (formTemplate: FormTemplate, responses: Set<Response>): (responseSet: ResponseSet)
   * **requires** formTemplate exists and responses correspond to the form template
   * **effects** create a new ResponseSet with anonymityFlag and kThreshold for aggregating all form responses
   */
  async ingestResponses({
    formTemplate,
    responses,
    anonymityFlag = true,
    kThreshold = 3,
  }: {
    formTemplate: FormTemplateID;
    responses: Response[];
    anonymityFlag?: boolean;
    kThreshold?: number;
  }): Promise<{ responseSet: ResponseSetID }> {
    const responseSetId = freshID() as ResponseSetID;
    const responseSetDoc: ResponseSetDoc = {
      _id: responseSetId,
      formTemplate,
      responses,
      anonymityFlag,
      kThreshold,
    };

    await this.responseSets.insertOne(responseSetDoc);
    return { responseSet: responseSetId };
  }

  /**
   * applyKAnonymity (responseSet: ResponseSet)
   * **requires** responseSet exists
   * **effects** remove or degrade any response categories with fewer than kThreshold contributors
   */
  async applyKAnonymity({
    responseSet,
  }: {
    responseSet: ResponseSetID;
  }): Promise<Record<PropertyKey, never>> {
    const responseSetDoc = await this.responseSets.findOne({
      _id: responseSet,
    });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    if (!responseSetDoc.anonymityFlag) {
      return {}; // No anonymity required
    }

    // Group responses by question
    const responsesByQuestion = new Map<number, Response[]>();
    for (const response of responseSetDoc.responses) {
      if (!responsesByQuestion.has(response.questionIndex)) {
        responsesByQuestion.set(response.questionIndex, []);
      }
      responsesByQuestion.get(response.questionIndex)!.push(response);
    }

    // Filter out questions with fewer than kThreshold responses
    const filteredResponses: Response[] = [];
    for (const [_questionIndex, responses] of responsesByQuestion) {
      if (responses.length >= responseSetDoc.kThreshold) {
        filteredResponses.push(...responses);
      }
    }

    await this.responseSets.updateOne(
      { _id: responseSet },
      { $set: { responses: filteredResponses } },
    );

    return {};
  }

  /**
   * extractThemes (responseSet: ResponseSet): (themes: Set<Text>)
   * **requires** responseSet exists
   * **effects** analyze sanitized responses and return thematic clusters
   */
  async extractThemes({
    responseSet,
  }: {
    responseSet: ResponseSetID;
  }): Promise<{ themes: string[] }> {
    const responseSetDoc = await this.responseSets.findOne({
      _id: responseSet,
    });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    // Simple theme extraction based on common keywords and patterns
    const _themes = new Set<string>();
    const responseTexts = responseSetDoc.responses.map(
      (r: Response) => r.response.toLowerCase(),
    );

    // Define theme keywords
    const themeKeywords = {
      "Communication": [
        "communication",
        "communicate",
        "clear",
        "unclear",
        "explain",
        "listen",
      ],
      "Leadership": [
        "leadership",
        "lead",
        "guide",
        "direction",
        "vision",
        "inspire",
      ],
      "Collaboration": [
        "collaboration",
        "teamwork",
        "team",
        "work together",
        "cooperative",
      ],
      "Technical Skills": [
        "technical",
        "skill",
        "expertise",
        "knowledge",
        "proficient",
      ],
      "Problem Solving": [
        "problem",
        "solve",
        "solution",
        "analytical",
        "creative",
      ],
      "Time Management": [
        "time",
        "deadline",
        "punctual",
        "organized",
        "efficient",
      ],
      "Attitude": [
        "attitude",
        "positive",
        "negative",
        "motivated",
        "enthusiastic",
      ],
      "Growth": ["growth", "development", "learn", "improve", "progress"],
    };

    // Count theme occurrences
    const themeCounts = new Map<string, number>();
    for (
      const [theme, keywords] of Object.entries(themeKeywords) as [
        string,
        string[],
      ][]
    ) {
      let count = 0;
      for (const text of responseTexts) {
        for (const keyword of keywords) {
          if (text.includes(keyword)) {
            count++;
            break; // Count once per response
          }
        }
      }
      if (count > 0) {
        themeCounts.set(theme, count);
      }
    }

    // Return themes sorted by frequency
    const sortedThemes = Array.from(themeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([theme]) => theme);

    return { themes: sortedThemes };
  }

  /**
   * draftSummaryLLM (responseSet: ResponseSet, themes: Set<Text>): (draft: Text)
   * **requires** responseSet exists
   * **effects** generate an LLM-assisted narrative summary highlighting themes and metrics
   */
  async draftSummaryLLM({
    responseSet,
    themes,
  }: {
    responseSet: ResponseSetID;
    themes: string[];
  }): Promise<{ draft: string }> {
    const responseSetDoc = await this.responseSets.findOne({
      _id: responseSet,
    });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    if (!this.llm) {
      // Fallback to simple template-based summary
      const draft = this.generateTemplateSummary(responseSetDoc, themes);
      return { draft };
    }

    // Prepare prompt for LLM
    const responseTexts = responseSetDoc.responses
      .map((r: Response) => `Q: ${r.questionText}\nA: ${r.response}`)
      .join("\n\n");

    const prompt = `
You are an HR professional creating a feedback summary report. Based on the following feedback responses and identified themes, create a professional, constructive summary that synthesizes the collective feedback.

Identified Themes: ${themes.join(", ")}

Feedback Responses:
${responseTexts}

Please create a balanced, professional summary that:
1. Synthesizes common themes across all responses
2. Highlights key insights and patterns in the feedback
3. Identifies both strengths and areas for improvement mentioned
4. Maintains a professional, objective tone
5. Provides actionable insights based on the aggregated feedback
6. Respects the anonymity of individual respondents

Summary:`;

    try {
      const draft = await this.llm.executeLLM(prompt);
      return { draft: draft.trim() };
    } catch (error) {
      console.error(
        "LLM draft generation failed, falling back to template:",
        error,
      );
      const draft = this.generateTemplateSummary(responseSetDoc, themes);
      return { draft };
    }
  }

  private generateTemplateSummary(
    responseSetDoc: ResponseSetDoc,
    themes: string[],
  ): string {
    console.log(
      "generateTemplateSummary called with themes:",
      themes,
      "type:",
      typeof themes,
    );

    // Ensure themes is an array
    const themesArray = Array.isArray(themes) ? themes : [];

    const responseCount = responseSetDoc.responses.length;
    const uniqueRespondents = new Set(
      responseSetDoc.responses.map((r: Response) => r.respondent),
    ).size;
    const topThemes = themesArray.slice(0, 3);

    return `
Feedback Summary Report

This report synthesizes ${responseCount} feedback responses from ${uniqueRespondents} respondents.

Key Themes Identified:
${topThemes.map((theme) => `• ${theme}`).join("\n")}

Analysis:
The aggregated feedback reveals several consistent themes across responses. The most frequently mentioned themes suggest common patterns in how the team perceives and experiences the work environment.

Recommendations:
Based on the collected feedback, we recommend focusing attention on the identified themes. These insights can help inform decisions about team development, process improvements, and organizational culture.
    `.trim();
  }

  /**
   * approveSummary (responseSet: ResponseSet, finalText: Text, keyQuotes: Set<Text>)
   * **requires** responseSet exists
   * **effects** create or update a synthesizedReport for the responseSet with the approved summary and quotes
   */
  async approveSummary({
    responseSet,
    finalText,
    keyQuotes,
  }: {
    responseSet: ResponseSetID;
    finalText: string;
    keyQuotes: string[];
  }): Promise<Record<PropertyKey, never>> {
    const responseSetDoc = await this.responseSets.findOne({
      _id: responseSet,
    });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    // Calculate basic metrics
    const metrics = this.calculateMetrics(responseSetDoc);

    // Extract key themes from the response set
    const { themes } = await this.extractThemes({ responseSet });

    const reportId = freshID() as ReportID;
    const reportDoc: ReportDoc = {
      _id: reportId,
      formTemplate: responseSetDoc.formTemplate,
      textSummary: finalText,
      keyThemes: themes.slice(0, 5), // Top 5 themes
      keyQuotes,
      metrics,
      createdAt: new Date().toISOString(),
    };

    await this.reports.insertOne(reportDoc);

    // Update response set with report reference
    await this.responseSets.updateOne(
      { _id: responseSet },
      { $set: { synthesizedReport: reportId } },
    );

    return {};
  }

  private calculateMetrics(
    responseSetDoc: ResponseSetDoc,
  ): Record<string, number | Record<string, number>> {
    const metrics: Record<string, number | Record<string, number>> = {
      totalResponses: responseSetDoc.responses.length,
      uniqueRespondents: new Set(
        responseSetDoc.responses.map((r: Response) => r.respondent),
      ).size,
      questionsAnswered: new Set(
        responseSetDoc.responses.map((r: Response) => r.questionIndex),
      ).size,
    };

    // Calculate average response length
    const responseLengths = responseSetDoc.responses.map(
      (r: Response) => r.response.length,
    );
    metrics.averageResponseLength = responseLengths.length > 0
      ? responseLengths.reduce((a, b) => a + b, 0) / responseLengths.length
      : 0;

    // Calculate role distribution if available
    const roleCount = new Map<string, number>();
    for (const response of responseSetDoc.responses) {
      if (response.respondentRole) {
        roleCount.set(
          response.respondentRole,
          (roleCount.get(response.respondentRole) || 0) + 1,
        );
      }
    }
    if (roleCount.size > 0) {
      metrics.roleDistribution = Object.fromEntries(roleCount);
    }

    return metrics;
  }

  /**
   * getFinalReport (responseSet: ResponseSet): (report: Report)
   * **requires** responseSet exists and has synthesizedReport
   * **effects** return the synthesizedReport
   */
  async getFinalReport({
    responseSet,
  }: {
    responseSet: ResponseSetID;
  }): Promise<{ report: ReportDoc }> {
    const responseSetDoc = await this.responseSets.findOne({
      _id: responseSet,
    });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    if (!responseSetDoc.synthesizedReport) {
      throw new Error("No synthesized report available for this response set");
    }

    const report = await this.reports.findOne({
      _id: responseSetDoc.synthesizedReport,
    });
    if (!report) {
      throw new Error("Synthesized report not found");
    }

    return { report };
  }

  /**
   * getResponseSet (responseSet: ResponseSetID): (responseSetData: ResponseSetDoc)
   * **requires** responseSet exists
   * **effects** return the response set data
   */
  async getResponseSet({
    responseSet,
  }: {
    responseSet: ResponseSetID;
  }): Promise<{ responseSetData: ResponseSetDoc }> {
    const responseSetDoc = await this.responseSets.findOne({
      _id: responseSet,
    });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    return { responseSetData: responseSetDoc };
  }

  /**
   * getReportByFormTemplate (formTemplate: FormTemplate): (report: ReportDoc | null)
   * **requires** formTemplate exists
   * **effects** return the most recent report for the form template, or null if none exists
   */
  async getReportByFormTemplate({
    formTemplate,
  }: {
    formTemplate: FormTemplateID;
  }): Promise<{ report: ReportDoc | null }> {
    const reports = await this.reports
      .find({ formTemplate })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray();
    return { report: reports[0] || null };
  }

  /**
   * getAllReports (): (reports: ReportDoc[])
   * **effects** return all synthesized reports
   */
  async getAllReports(): Promise<{ reports: ReportDoc[] }> {
    const reports = await this.reports.find({}).sort({ createdAt: -1 })
      .toArray();
    return { reports };
  }

  /**
   * generateCompleteReport - generates a full synthesis report from form responses
   * **requires** user is the creator of the form template
   * **effects** creates response set, applies anonymity, extracts themes, generates summary, and returns complete report
   */
  async generateCompleteReport({
    formTemplateId,
    responses,
    anonymityFlag = true,
    kThreshold = 3,
  }: {
    formTemplateId: FormTemplateID;
    responses: Response[];
    anonymityFlag?: boolean;
    kThreshold?: number;
  }): Promise<{ report: ReportDoc }> {
    console.log(
      "generateCompleteReport called with",
      responses.length,
      "responses",
    );

    // 1. Ingest responses
    const { responseSet: responseSetId } = await this.ingestResponses({
      formTemplate: formTemplateId,
      responses,
      anonymityFlag,
      kThreshold,
    });

    // 2. Apply k-anonymity
    await this.applyKAnonymity({ responseSet: responseSetId });

    // 3. Extract themes
    const { themes } = await this.extractThemes({ responseSet: responseSetId });

    // 4. Generate draft summary with LLM
    const { draft } = await this.draftSummaryLLM({
      responseSet: responseSetId,
      themes,
    });

    // 5. Extract key quotes
    const { keyQuotes } = this.extractKeyQuotes({
      responses: responses as unknown[],
    });

    // 6. Approve and finalize summary
    await this.approveSummary({
      responseSet: responseSetId,
      finalText: draft,
      keyQuotes,
    });

    // 7. Get the final report
    const { report } = await this.getFinalReport({
      responseSet: responseSetId,
    });

    console.log("generateCompleteReport completed, returning report");
    return { report };
  }

  /**
   * generateFormTemplateReport (formTemplateId: FormTemplateID, createdBy: User): (report: ReportDoc)
   * **requires** user is the creator of the form template
   * **effects** generates synthesis report from all form responses
   */
  async generateFormTemplateReport({
    formTemplateId,
    createdBy,
    anonymityFlag = true,
    kThreshold = 3,
  }: {
    formTemplateId: FormTemplateID;
    createdBy: ID;
    anonymityFlag?: boolean;
    kThreshold?: number;
  }): Promise<{ report: ReportDoc }> {
    // Get form template
    const { FormTemplate, AccessCode } = await import("@concepts");
    const { template } = await FormTemplate.getTemplate({
      templateId: formTemplateId,
    });

    // Get form responses
    const { responses: accessCodeResponses } = await AccessCode
      .getFormResponses({ formId: formTemplateId, createdBy });

    // Transform responses to format needed by generateCompleteReport
    const transformedResponses: Response[] = [];
    for (const response of accessCodeResponses) {
      const responsesMap = response.responses as Record<string, string>;
      for (
        const [questionIndex, responseText] of Object.entries(responsesMap)
      ) {
        const question = template.questions[parseInt(questionIndex)];
        transformedResponses.push({
          questionIndex: parseInt(questionIndex),
          questionText: question?.prompt ||
            `Question ${parseInt(questionIndex) + 1}`,
          response: responseText,
          respondent: (response.memberId || response.memberEmail) as ID,
          respondentRole: response.memberRole as string,
        });
      }
    }

    // Generate the complete report
    return await this.generateCompleteReport({
      formTemplateId,
      responses: transformedResponses,
      anonymityFlag,
      kThreshold,
    });
  }

  /**
   * extractKeyQuotes (responses: FormResponseDoc[]): (keyQuotes: string[])
   * **effects** extracts meaningful quotes from responses
   */
  extractKeyQuotes({
    responses,
    maxQuotes = 5,
    minLength = 20,
  }: {
    responses: unknown[];
    maxQuotes?: number;
    minLength?: number;
  }): { keyQuotes: string[] } {
    const keyQuotes: string[] = [];
    for (const response of responses) {
      const responseObj = response as Record<string, unknown>;
      if (responseObj.responses && typeof responseObj.responses === "object") {
        for (const responseText of Object.values(responseObj.responses)) {
          if (
            typeof responseText === "string" &&
            responseText.length >= minLength && keyQuotes.length < maxQuotes
          ) {
            keyQuotes.push(responseText);
          }
        }
      }
    }
    return { keyQuotes };
  }

  /**
   * _extractKeyQuotesHelper (helper action for sync)
   */
  _extractKeyQuotesHelper({
    responses,
    maxQuotes = 5,
    minLength = 20,
  }: {
    responses: unknown[];
    maxQuotes?: number;
    minLength?: number;
  }): { keyQuotes: string[] } {
    return this.extractKeyQuotes({ responses, maxQuotes, minLength });
  }
}
