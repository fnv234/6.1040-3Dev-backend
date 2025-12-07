import { testDb } from "@utils/database.ts";
import ReportSynthesisConcept from "./ReportSynthesisConcept.ts";
import { ID } from "@utils/types.ts";
import { assert, assertEquals } from "jsr:@std/assert";

const formTemplate = "template-1" as ID;

Deno.test("ReportSynthesis: ingestResponses and getResponseSet", async () => {
  const [db, client] = await testDb();
  try {
    const synthesis = new ReportSynthesisConcept(db);

    const responses = [
      {
        questionIndex: 0,
        questionText: "How is the team communication?",
        response: "Great communication across the team",
        respondent: "respondent-1" as ID,
        respondentRole: "Manager",
      },
    ];

    const { responseSet } = await synthesis.ingestResponses({
      formTemplate,
      responses,
    });

    const { responseSetData } = await synthesis.getResponseSet({ responseSet });
    assertEquals(responseSetData.formTemplate, formTemplate);
    assertEquals(responseSetData.responses.length, 1);
  } finally {
    await client.close();
  }
});

Deno.test("ReportSynthesis: applyKAnonymity no-op when anonymityFlag is false", async () => {
  const [db, client] = await testDb();
  try {
    const synthesis = new ReportSynthesisConcept(db);

    const responses = [
      {
        questionIndex: 0,
        questionText: "How is the team communication?",
        response: "Great communication",
        respondent: "respondent-1" as ID,
        respondentRole: "Developer",
      },
    ];

    const { responseSet } = await synthesis.ingestResponses({
      formTemplate,
      responses,
      anonymityFlag: false,
    });

    await synthesis.applyKAnonymity({ responseSet });

    const { responseSetData } = await synthesis.getResponseSet({ responseSet });
    assertEquals(responseSetData.responses.length, 1);
  } finally {
    await client.close();
  }
});

Deno.test("ReportSynthesis: extractThemes from responses", async () => {
  const [db, client] = await testDb();
  try {
    const synthesis = new ReportSynthesisConcept(db);

    const responses = [
      {
        questionIndex: 0,
        questionText: "How is the communication?",
        response: "Great communication skills and clear messaging",
        respondent: "respondent-1" as ID,
        respondentRole: "Manager",
      },
      {
        questionIndex: 1,
        questionText: "How is the teamwork?",
        response: "Excellent collaboration and teamwork",
        respondent: "respondent-2" as ID,
        respondentRole: "Developer",
      },
    ];

    const { responseSet } = await synthesis.ingestResponses({
      formTemplate,
      responses,
    });

    const { themes } = await synthesis.extractThemes({ responseSet });
    assert(themes.includes("Communication"));
    assert(themes.includes("Collaboration"));
  } finally {
    await client.close();
  }
});

Deno.test("ReportSynthesis: generateTemplateSummary and approveSummary", async () => {
  const [db, client] = await testDb();
  try {
    const synthesis = new ReportSynthesisConcept(db);

    const responses = [
      {
        questionIndex: 0,
        questionText: "How is the communication?",
        response: "Great communication",
        respondent: "respondent-1" as ID,
        respondentRole: "Manager",
      },
      {
        questionIndex: 1,
        questionText: "How is the leadership?",
        response: "Strong leadership skills",
        respondent: "respondent-2" as ID,
        respondentRole: "Developer",
      },
    ];

    const { responseSet } = await synthesis.ingestResponses({
      formTemplate,
      responses,
    });

    const { themes } = await synthesis.extractThemes({ responseSet });
    const { draft } = await synthesis.draftSummaryLLM({ responseSet, themes });

    assert(draft.length > 0, "Draft summary should not be empty");

    await synthesis.approveSummary({
      responseSet,
      finalText: draft,
      keyQuotes: ["Great communication", "Strong leadership skills"],
    });

    const { report } = await synthesis.getFinalReport({ responseSet });
    assertEquals(report.formTemplate, formTemplate);
    assert(report.keyThemes.length > 0);
    assertEquals(report.keyQuotes.length, 2);
  } finally {
    await client.close();
  }
});
