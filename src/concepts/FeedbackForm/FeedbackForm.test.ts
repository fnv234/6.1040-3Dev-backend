import { testDb } from "@utils/database.ts";
import FeedbackFormConcept from "./FeedbackFormConcept.ts";
import { ID } from "@utils/types.ts";
import { beforeAll, afterAll, test, expect } from "@jest/globals";

let db: any;
let client: any;
let feedbackForm: FeedbackFormConcept;

beforeAll(async () => {
  [db, client] = await testDb();
  feedbackForm = new FeedbackFormConcept(db);
});

afterAll(async () => {
  await client.close();
});

describe("FeedbackForm Concept", () => {
  const reviewer = "reviewer-123" as ID;
  const target = "target-456" as ID;
  const questions = [
    { prompt: "How is their communication?", type: "Free" as const },
    { prompt: "Rate their leadership skills", type: "Scale" as const },
    { prompt: "Choose their best quality", type: "Multiple Choice" as const },
  ];

  test("should create a feedback form", async () => {
    const result = await feedbackForm.createFeedbackForm({
      reviewer,
      target,
      questions,
    });

    expect(result.feedbackForm).toBeDefined();
    expect(typeof result.feedbackForm).toBe("string");
  });

  test("should not allow reviewer to be same as target", async () => {
    await expect(
      feedbackForm.createFeedbackForm({
        reviewer: target,
        target,
        questions,
      })
    ).rejects.toThrow("Target cannot be the same as reviewer");
  });

  test("should require questions", async () => {
    await expect(
      feedbackForm.createFeedbackForm({
        reviewer,
        target,
        questions: [],
      })
    ).rejects.toThrow("Questions are required");
  });

  test("should validate question types", async () => {
    const invalidQuestions = [
      { prompt: "Test question", type: "Invalid Type" as any },
    ];

    await expect(
      feedbackForm.createFeedbackForm({
        reviewer,
        target,
        questions: invalidQuestions,
      })
    ).rejects.toThrow("Invalid question type");
  });

  test("should send feedback form", async () => {
    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
      reviewer,
      target,
      questions,
    });

    const result = await feedbackForm.sendFeedbackForm({
      feedbackForm: formId,
    });

    expect(result.link).toBe(`/feedback/${formId}`);
  });

  test("should not send form that is not in Created status", async () => {
    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
      reviewer,
      target,
      questions,
    });

    // Send it first
    await feedbackForm.sendFeedbackForm({ feedbackForm: formId });

    // Try to send again
    await expect(
      feedbackForm.sendFeedbackForm({ feedbackForm: formId })
    ).rejects.toThrow("Feedback form must be in 'Created' status to send");
  });

  test("should submit feedback form with responses", async () => {
    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
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

    expect(result).toEqual({});
  });

  test("should require all questions to be answered", async () => {
    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
      reviewer,
      target,
      questions,
    });

    await feedbackForm.sendFeedbackForm({ feedbackForm: formId });

    const incompleteResponses = {
      0: "Great communication skills",
      // Missing responses for questions 1 and 2
    };

    await expect(
      feedbackForm.submitFeedbackForm({
        feedbackForm: formId,
        responses: incompleteResponses,
      })
    ).rejects.toThrow("Response required for question");
  });

  test("should get feedback form by id", async () => {
    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
      reviewer,
      target,
      questions,
    });

    const result = await feedbackForm.getFeedbackForm({ id: formId });

    expect(result.feedbackForm._id).toBe(formId);
    expect(result.feedbackForm.reviewer).toBe(reviewer);
    expect(result.feedbackForm.target).toBe(target);
    expect(result.feedbackForm.status).toBe("Created");
  });

  test("should get feedback forms by target", async () => {
    const startDate = new Date().toISOString();
    
    await feedbackForm.createFeedbackForm({
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

    expect(result.feedbackForms.length).toBeGreaterThan(0);
    expect(result.feedbackForms[0].target).toBe(target);
  });

  test("should get feedback forms by reviewer", async () => {
    const result = await feedbackForm.getFeedbackFormsByReviewer({
      reviewer,
    });

    expect(result.feedbackForms.length).toBeGreaterThan(0);
    expect(result.feedbackForms[0].reviewer).toBe(reviewer);
  });

  test("should update feedback form response", async () => {
    const { feedbackForm: formId } = await feedbackForm.createFeedbackForm({
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

    expect(result).toEqual({});
  });
});