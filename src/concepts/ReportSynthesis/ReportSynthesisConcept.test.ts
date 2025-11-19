import { testDb } from "@utils/database.ts";
import ReportSynthesisConcept from "./ReportSynthesisConcept.ts";
import { ID } from "@utils/types.ts";
import {
  assert,
  assertEquals,
} from "jsr:@std/assert";

const target = "target-1" as ID;
const form = "form-1" as ID;

Deno.test("ReportSynthesis: ingestResponses and getResponseSet", async () => {
  const [db, client] = await testDb();
  try {
    const synthesis = new ReportSynthesisConcept(db);

    const responses = [
      {
        questionIndex: 0,
        questionText: "How is their communication?",
        response: "Great",
        reviewer: "rev-1" as ID,
      },
    ];

    const { responseSet } = await synthesis.ingestResponses({
      target,
      form,
      responses,
    });

    const { responseSetData } = await synthesis.getResponseSet({ responseSet });
    assertEquals(responseSetData.target, target);
    assertEquals(responseSetData.form, form);
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
        questionText: "How is their communication?",
        response: "Great",
        reviewer: "rev-1" as ID,
      },
    ];

    const { responseSet } = await synthesis.ingestResponses({
      target,
      form,
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

