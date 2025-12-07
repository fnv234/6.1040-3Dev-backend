import { testDb } from "@utils/database.ts";
import FormTemplateConcept from "./FormTemplateConcept.ts";
import { assert, assertEquals, assertRejects } from "jsr:@std/assert";
import type { ID } from "@utils/types.ts";

const testCreator = "creator123" as ID;
const testTeamId = "team456" as ID;

const sampleQuestions = [
  {
    prompt: "How would you rate the team's communication?",
    type: "Scale" as const,
    targetRoles: ["manager", "team lead"],
  },
  {
    prompt: "What are the team's strengths?",
    type: "Free" as const,
  },
  {
    prompt: "Rate overall performance",
    type: "Multiple Choice" as const,
  },
];

Deno.test("FormTemplate: should create a form template", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    const result = await formTemplate.createTemplate({
      name: "Q3 2025 Peer Feedback",
      creator: testCreator,
      teamId: testTeamId,
      questions: sampleQuestions,
    });

    assert(result.template);
    assertEquals(typeof result.template, "string");
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should create template without teamId", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    const result = await formTemplate.createTemplate({
      name: "General Feedback Form",
      creator: testCreator,
      questions: sampleQuestions,
    });

    assert(result.template);
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should not create template with empty questions", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    await assertRejects(
      () =>
        formTemplate.createTemplate({
          name: "Empty Form",
          creator: testCreator,
          questions: [],
        }),
      Error,
      "Questions are required",
    );
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should not create template with invalid question type", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    await assertRejects(
      () =>
        formTemplate.createTemplate({
          name: "Invalid Form",
          creator: testCreator,
          questions: [
            {
              prompt: "Test question",
              type: "Invalid Type" as unknown as "Free",
            },
          ],
        }),
      Error,
      "Invalid question type",
    );
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should not create template with empty question prompt", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    await assertRejects(
      () =>
        formTemplate.createTemplate({
          name: "Invalid Form",
          creator: testCreator,
          questions: [
            {
              prompt: "",
              type: "Free",
            },
          ],
        }),
      Error,
      "Question prompt cannot be empty",
    );
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should get templates by creator", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    // Create multiple templates
    await formTemplate.createTemplate({
      name: "Form 1",
      creator: testCreator,
      questions: sampleQuestions,
    });

    await formTemplate.createTemplate({
      name: "Form 2",
      creator: testCreator,
      teamId: testTeamId,
      questions: sampleQuestions,
    });

    const result = await formTemplate.getTemplatesByCreator({
      creator: testCreator,
    });

    assertEquals(result.templates.length, 2);
    assertEquals(result.templates[0].name, "Form 2"); // Should be sorted by date descending
    assertEquals(result.templates[1].name, "Form 1");
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should return empty array for creator with no templates", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    const result = await formTemplate.getTemplatesByCreator({
      creator: "nonexistent-creator" as ID,
    });

    assertEquals(result.templates.length, 0);
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should get template by ID", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    const { template: templateId } = await formTemplate.createTemplate({
      name: "Test Form",
      creator: testCreator,
      teamId: testTeamId,
      questions: sampleQuestions,
    });

    const result = await formTemplate.getTemplate({
      templateId,
    });

    assertEquals(result.template._id, templateId);
    assertEquals(result.template.name, "Test Form");
    assertEquals(result.template.creator, testCreator);
    assertEquals(result.template.teamId, testTeamId);
    assertEquals(result.template.status, "Created");
    assertEquals(result.template.questions.length, 3);
    assertEquals(
      result.template.questions[0].prompt,
      sampleQuestions[0].prompt,
    );
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should throw error for non-existent template ID", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    await assertRejects(
      () =>
        formTemplate.getTemplate({
          templateId: "nonexistent-id" as ID,
        }),
      Error,
      "Template not found",
    );
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should preserve targetRoles in questions", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    const questionsWithRoles = [
      {
        prompt: "Manager question",
        type: "Free" as const,
        targetRoles: ["manager"],
      },
      {
        prompt: "Everyone question",
        type: "Scale" as const,
      },
    ];

    const { template: templateId } = await formTemplate.createTemplate({
      name: "Role-based Form",
      creator: testCreator,
      questions: questionsWithRoles,
    });

    const result = await formTemplate.getTemplate({ templateId });

    assertEquals(result.template.questions[0].targetRoles, ["manager"]);
    assertEquals(result.template.questions[1].targetRoles, undefined);
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should set status to 'Created' by default", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    const { template: templateId } = await formTemplate.createTemplate({
      name: "New Form",
      creator: testCreator,
      questions: sampleQuestions,
    });

    const result = await formTemplate.getTemplate({ templateId });

    assertEquals(result.template.status, "Created");
    assert(result.template.createdDate);
  } finally {
    await client.close();
  }
});

Deno.test("FormTemplate: should handle all question types", async () => {
  const [db, client] = await testDb();
  try {
    const formTemplate = new FormTemplateConcept(db);

    const allTypeQuestions = [
      { prompt: "Free response question", type: "Free" as const },
      { prompt: "Scale question", type: "Scale" as const },
      { prompt: "Multiple choice question", type: "Multiple Choice" as const },
    ];

    const { template: templateId } = await formTemplate.createTemplate({
      name: "All Types Form",
      creator: testCreator,
      questions: allTypeQuestions,
    });

    const result = await formTemplate.getTemplate({ templateId });

    assertEquals(result.template.questions[0].type, "Free");
    assertEquals(result.template.questions[1].type, "Scale");
    assertEquals(result.template.questions[2].type, "Multiple Choice");
  } finally {
    await client.close();
  }
});
