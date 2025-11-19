import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";
import { GeminiLLM } from "../../../gemini-llm.ts";

const PREFIX = "ReportSynthesis" + ".";

// --- Type Definitions ---
type Employee = ID;
type FeedbackFormID = ID;
type ResponseSetID = ID;
type ReportID = ID;

interface Response {
  questionIndex: number;
  questionText: string;
  response: string;
  reviewer: Employee;
}

interface ResponseSetDoc {
  _id: ResponseSetID;
  target: Employee;
  form: FeedbackFormID;
  responses: Response[];
  anonymityFlag: boolean;
  kThreshold: number;
  synthesizedReport?: ReportID;
}

interface ReportDoc {
  _id: ReportID;
  target: Employee;
  textSummary: string;
  keyQuotes: string[];
  metrics: Record<string, any>;
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
   * ingestResponses (target: Employee, form: FeedbackForm, responses: Set<Response>): (responseSet: ResponseSet)
   * **requires** target exists and responses correspond to the form
   * **effects** create a new ResponseSet with anonymityFlag and kThreshold inherited from the form
   */
  async ingestResponses({
    target,
    form,
    responses,
    anonymityFlag = true,
    kThreshold = 3,
  }: {
    target: Employee;
    form: FeedbackFormID;
    responses: Response[];
    anonymityFlag?: boolean;
    kThreshold?: number;
  }): Promise<{ responseSet: ResponseSetID }> {
    const responseSetId = freshID() as ResponseSetID;
    const responseSetDoc: ResponseSetDoc = {
      _id: responseSetId,
      target,
      form,
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
  }): Promise<{}> {
    const responseSetDoc = await this.responseSets.findOne({ _id: responseSet });
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
    for (const [questionIndex, responses] of responsesByQuestion) {
      if (responses.length >= responseSetDoc.kThreshold) {
        filteredResponses.push(...responses);
      }
    }

    await this.responseSets.updateOne(
      { _id: responseSet },
      { $set: { responses: filteredResponses } }
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
    const responseSetDoc = await this.responseSets.findOne({ _id: responseSet });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    // Simple theme extraction based on common keywords and patterns
    const themes = new Set<string>();
    const responseTexts = responseSetDoc.responses.map(
      (r: Response) => r.response.toLowerCase(),
    );
    
    // Define theme keywords
    const themeKeywords = {
      "Communication": ["communication", "communicate", "clear", "unclear", "explain", "listen"],
      "Leadership": ["leadership", "lead", "guide", "direction", "vision", "inspire"],
      "Collaboration": ["collaboration", "teamwork", "team", "work together", "cooperative"],
      "Technical Skills": ["technical", "skill", "expertise", "knowledge", "proficient"],
      "Problem Solving": ["problem", "solve", "solution", "analytical", "creative"],
      "Time Management": ["time", "deadline", "punctual", "organized", "efficient"],
      "Attitude": ["attitude", "positive", "negative", "motivated", "enthusiastic"],
      "Growth": ["growth", "development", "learn", "improve", "progress"],
    };

    // Count theme occurrences
    const themeCounts = new Map<string, number>();
    for (
      const [theme, keywords] of Object.entries(themeKeywords) as
        [string, string[]][]
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
    const responseSetDoc = await this.responseSets.findOne({ _id: responseSet });
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
You are an HR professional creating a 360-degree feedback summary report. Based on the following feedback responses and identified themes, create a professional, constructive summary that highlights key strengths and areas for development.

Identified Themes: ${themes.join(', ')}

Feedback Responses:
${responseTexts}

Please create a balanced, professional summary that:
1. Highlights key strengths mentioned in the feedback
2. Identifies areas for development constructively
3. Incorporates the identified themes
4. Maintains a professional, supportive tone
5. Provides actionable insights

Summary:`;

    try {
      const draft = await this.llm.executeLLM(prompt);
      return { draft: draft.trim() };
    } catch (error) {
      console.error("LLM draft generation failed, falling back to template:", error);
      const draft = this.generateTemplateSummary(responseSetDoc, themes);
      return { draft };
    }
  }

  private generateTemplateSummary(responseSetDoc: ResponseSetDoc, themes: string[]): string {
    const responseCount = responseSetDoc.responses.length;
    const topThemes = themes.slice(0, 3);
    
    return `
Feedback Summary

This report is based on ${responseCount} feedback responses collected for the review period.

Key Themes Identified:
${topThemes.map(theme => `• ${theme}`).join('\n')}

The feedback indicates several areas of strength and opportunities for development. The most frequently mentioned themes suggest focus areas for continued growth and professional development.

Based on the collected feedback, we recommend focusing on the identified themes to maximize professional growth and team effectiveness.
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
  }): Promise<{}> {
    const responseSetDoc = await this.responseSets.findOne({ _id: responseSet });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    // Calculate basic metrics
    const metrics = this.calculateMetrics(responseSetDoc);

    const reportId = freshID() as ReportID;
    const reportDoc: ReportDoc = {
      _id: reportId,
      target: responseSetDoc.target,
      textSummary: finalText,
      keyQuotes,
      metrics,
      createdAt: new Date().toISOString(),
    };

    await this.reports.insertOne(reportDoc);
    
    // Update response set with report reference
    await this.responseSets.updateOne(
      { _id: responseSet },
      { $set: { synthesizedReport: reportId } }
    );

    return {};
  }

  private calculateMetrics(responseSetDoc: ResponseSetDoc): Record<string, any> {
    const metrics: Record<string, any> = {
      totalResponses: responseSetDoc.responses.length,
      uniqueReviewers: new Set(
        responseSetDoc.responses.map((r: Response) => r.reviewer),
      ).size,
      questionsAnswered: new Set(
        responseSetDoc.responses.map((r: Response) => r.questionIndex),
      ).size,
    };

    // Calculate average response length
    const responseLengths = responseSetDoc.responses.map(
      (r: Response) => r.response.length,
    );
    metrics.averageResponseLength = responseLengths.reduce((a, b) => a + b, 0) / responseLengths.length;

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
    const responseSetDoc = await this.responseSets.findOne({ _id: responseSet });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    if (!responseSetDoc.synthesizedReport) {
      throw new Error("No synthesized report available for this response set");
    }

    const report = await this.reports.findOne({ _id: responseSetDoc.synthesizedReport });
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
    const responseSetDoc = await this.responseSets.findOne({ _id: responseSet });
    if (!responseSetDoc) {
      throw new Error("Response set not found");
    }

    return { responseSetData: responseSetDoc };
  }

  /**
   * getReportsByTarget (target: Employee): (reports: ReportDoc[])
   * **requires** target exists
   * **effects** return all reports for the target employee
   */
  async getReportsByTarget({
    target,
  }: {
    target: Employee;
  }): Promise<{ reports: ReportDoc[] }> {
    const reports = await this.reports.find({ target }).toArray();
    return { reports };
  }
}