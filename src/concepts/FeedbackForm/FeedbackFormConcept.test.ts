import { testDb } from "@utils/database.ts";
import FeedbackFormConcept from "./FeedbackFormConcept.ts";
import { ID } from "@utils/types.ts";
import { assert, assertEquals, assertRejects } from "jsr:@std/assert";

const creator = "creator-123" as ID;
const reviewer = "reviewer-123" as ID;
const target = "target-456" as ID;
const formName = "Q3 2023 Performance Review";
const questions = [
  { prompt: "How is their communication?", type: "Free" as const },
  { prompt: "Rate their leadership skills", type: "Scale" as const },
  { prompt: "Choose their best quality", type: "Multiple Choice" as const },
];

Deno.test({
  name: "FeedbackForm: should create a feedback form",
  sanitizeResources: false, // Disable resource sanitization to handle cleanup manually
  sanitizeOps: false, // Disable op sanitization to handle cleanup manually
  fn: async () => {
    const [db, client] = await testDb();
    try {
      const feedbackForm = new FeedbackFormConcept(db);

      const result = await feedbackForm.createFeedbackForm({
        name: formName,
        creator,
        reviewer,
        target,
        questions,
      });

      assert(result.feedbackForm);
      assertEquals(typeof result.feedbackForm, "string");
    } finally {
      // Ensure all pending operations complete before closing
      await new Promise(resolve => setTimeout(resolve, 100));
      await client.close();
    }
  },
});

Deno.test("FeedbackForm: should not allow reviewer to be same as target", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    await assertRejects(
      () =>
        feedbackForm.createFeedbackForm({
          name: formName,
          creator,
          reviewer: target,
          target,
          questions,
        }),
      Error,
      "Target cannot be the same as reviewer",
    );
  } finally {
    await client.close();
  }
});

Deno.test("FeedbackForm: should require questions", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    await assertRejects(
      () =>
        feedbackForm.createFeedbackForm({
          name: formName,
          creator,
          reviewer,
          target,
          questions: [],
        }),
      Error,
      "Questions are required",
    );
  } finally {
    await client.close();
  }
});

Deno.test("FeedbackForm: should validate question types", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    const invalidQuestions = [
      { prompt: "Test question", type: "Invalid Type" as any },
    ];

    await assertRejects(
      () =>
        feedbackForm.createFeedbackForm({
          name: formName,
          creator,
          reviewer,
          target,
          questions: invalidQuestions,
        }),
      Error,
      "Invalid question type",
    );
  } finally {
    await client.close();
  }
});

Deno.test("FeedbackForm: should send feedback form", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
      name: formName,
      creator,
      reviewer,
      target,
      questions,
    });

    const result = await feedbackForm.sendFeedbackForm({
      feedbackForm: formId,
    });

    assertEquals(result.link, `/feedback/${formId}`);
  } finally {
    await client.close();
  }
});

Deno.test(
  "FeedbackForm: should not send form that is not in Created status",
  async () => {
    const [db, client] = await testDb();
    try {
      const feedbackForm = new FeedbackFormConcept(db);

      const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
        name: formName,
        creator,
        reviewer: target,
        target: reviewer,
        questions,
      });

      await feedbackForm.sendFeedbackForm({ feedbackForm: formId });

      await assertRejects(
        () => feedbackForm.sendFeedbackForm({ feedbackForm: formId }),
        Error,
        "Feedback form must be in 'Created' status to send",
      );
    } finally {
      await client.close();
    }
  },
);

Deno.test("FeedbackForm: should submit feedback form with responses", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
      name: formName,
      creator,
      reviewer,
      target,
      questions,
    });

    await feedbackForm.sendFeedbackForm({ feedbackForm: formId });

    const responses = {
      0: "Great communication skills",
      1: "8/10",
      2: "Leadership",
    };

    const result = await feedbackForm.submitFeedbackForm({
      feedbackForm: formId,
      responses,
    });

    assertEquals(result, {});
  } finally {
    await client.close();
  }
});

Deno.test("FeedbackForm: should require all questions to be answered", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
      name: formName,
      creator,
      reviewer,
      target,
      questions,
    });

    await feedbackForm.sendFeedbackForm({ feedbackForm: formId });

    const incompleteResponses = {
      0: "Great communication skills",
    };

    await assertRejects(
      () =>
        feedbackForm.submitFeedbackForm({
          feedbackForm: formId,
          responses: incompleteResponses,
        }),
      Error,
      "Response required for question",
    );
  } finally {
    await client.close();
  }
});

Deno.test("FeedbackForm: should get feedback form by id", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
      name: formName,
      creator,
      reviewer,
      target,
      questions,
    });

    const result = await feedbackForm.getFeedbackForm({ id: formId });

    assertEquals(result.feedbackForm._id, formId);
    assertEquals(result.feedbackForm.reviewer, reviewer);
    assertEquals(result.feedbackForm.target, target);
    assertEquals(result.feedbackForm.status, "Created");
  } finally {
    await client.close();
  }
});

Deno.test("FeedbackForm: should get feedback forms by target", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    const startDate = new Date().toISOString();

    await feedbackForm.createFeedbackForm({
      name: formName,
      creator,
      reviewer,
      target,
      questions,
    });

    const endDate = new Date().toISOString();

    const result = await feedbackForm.getFeedbackFormsByTarget({
      target,
      startDate,
      endDate,
    });

    assert(result.feedbackForms.length > 0);
    assertEquals(result.feedbackForms[0].target, target);
  } finally {
    await client.close();
  }
});

Deno.test("FeedbackForm: should get feedback forms by reviewer", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    await feedbackForm.createFeedbackForm({
      name: formName,
      creator,
      reviewer,
      target,
      questions,
    });

    const result = await feedbackForm.getFeedbackFormsByReviewer({
      reviewer,
    });

    assert(result.feedbackForms.length > 0);
    assertEquals(result.feedbackForms[0].reviewer, reviewer);
  } finally {
    await client.close();
  }
});

Deno.test({
  name: "FeedbackForm: should get feedback forms by creator",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: async () => {
    const [db, client] = await testDb();
    try {
      const feedbackForm = new FeedbackFormConcept(db);

      await feedbackForm.createFeedbackForm({
        name: formName,
        creator,
        reviewer,
        target,
        questions,
      });

      const result = await feedbackForm.getFeedbackFormsByCreator({
        creator: creator,
      });

      assert(result.feedbackForms.length > 0);
      assertEquals(result.feedbackForms[0].reviewer, reviewer);
    } finally {
      // Ensure all pending operations complete before closing
      await new Promise(resolve => setTimeout(resolve, 100));
      await client.close();
    }
  },
});

Deno.test("FeedbackForm: should update feedback form response", async () => {
  const [db, client] = await testDb();
  try {
    const feedbackForm = new FeedbackFormConcept(db);

    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
      name: formName,
      creator,
      reviewer,
      target,
      questions,
    });

    await feedbackForm.sendFeedbackForm({ feedbackForm: formId });

    const result = await feedbackForm.updateFeedbackFormResponse({
      feedbackForm: formId,
      questionIndex: 0,
      response: "Updated response",
    });

    assertEquals(result, {});
  } finally {
    await client.close();
  }
});
