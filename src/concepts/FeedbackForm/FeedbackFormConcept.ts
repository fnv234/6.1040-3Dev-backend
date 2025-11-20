import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

const PREFIX = "FeedbackForm" + ".";

// --- Type Definitions ---
type Employee = ID;
type FeedbackFormID = ID;
type User = ID;

interface FeedbackQuestion {
  prompt: string;
  type: "Multiple Choice" | "Free" | "Scale";
  response?: string;
}

interface FeedbackFormDoc {
  _id: FeedbackFormID;
  creator: User;
  reviewer: Employee;
  target: Employee;
  status: "Created" | "Sent" | "Completed";
  createdDate: string;
  completedDate?: string;
  questions: FeedbackQuestion[];
}

/**
 * FeedbackForm concept for collecting employee feedback on target employees
 */
export default class FeedbackFormConcept {
  private readonly feedbackForms: Collection<FeedbackFormDoc>;

  constructor(private readonly db: Db) {
    this.feedbackForms = this.db.collection(PREFIX + "feedbackForms");
  }

  /**
   * createFeedbackForm (creator: User, reviewer: Employee, target: Employee, questions: List<FeedbackQuestion>): (feedbackForm: FeedbackForm)
   * **requires** questions are valid, target is not reviewer and both are valid Employees
   * **effects** creates a new feedback form in the "Created" status with the given questions and createdDate set to the current time
   */
  async createFeedbackForm({
    creator,
    reviewer,
    target,
    questions,
  }: {
    creator: User;
    reviewer: Employee;
    target: Employee;
    questions: FeedbackQuestion[];
  }): Promise<{ feedbackForm: FeedbackFormID }> {
    if (reviewer === target) {
      throw new Error("Target cannot be the same as reviewer");
    }

    if (!questions || questions.length === 0) {
      throw new Error("Questions are required");
    }

    // Validate question types
    const validTypes = ["Multiple Choice", "Free", "Scale"];
    for (const question of questions) {
      if (!validTypes.includes(question.type)) {
        throw new Error(`Invalid question type: ${question.type}`);
      }
      if (!question.prompt || question.prompt.trim() === "") {
        throw new Error("Question prompt cannot be empty");
      }
    }

    const feedbackFormId = freshID() as FeedbackFormID;
    const feedbackFormDoc: FeedbackFormDoc = {
      _id: feedbackFormId,
      creator,
      reviewer,
      target,
      status: "Created",
      createdDate: new Date().toISOString(),
      questions: questions.map((q: FeedbackQuestion) => ({
        ...q,
        response: undefined,
      })),
    };

    await this.feedbackForms.insertOne(feedbackFormDoc);
    return { feedbackForm: feedbackFormId };
  }

  /**
   * sendFeedbackForm (feedbackForm: FeedbackForm): (link: Text)
   * **requires** feedbackForm is in "Created" status
   * **effects** returns a link to the feedback form, updates the status to "Sent"
   */
  async sendFeedbackForm({
    feedbackForm,
  }: {
    feedbackForm: FeedbackFormID;
  }): Promise<{ link: string }> {
    const form = await this.feedbackForms.findOne({ _id: feedbackForm });
    if (!form) {
      throw new Error("Feedback form not found");
    }

    if (form.status !== "Created") {
      throw new Error("Feedback form must be in 'Created' status to send");
    }

    await this.feedbackForms.updateOne(
      { _id: feedbackForm },
      { $set: { status: "Sent" } },
    );

    const link = `/feedback/${feedbackForm}`;
    return { link };
  }

  /**
   * submitFeedbackForm (feedbackForm: FeedbackForm): ()
   * **requires** feedbackForm is in "Sent" status, all FeedbackQuestions have non-empty responses
   * **effects** updates the status to "Completed" and completedDate to the current time
   */
  async submitFeedbackForm({
    feedbackForm,
    responses,
  }: {
    feedbackForm: FeedbackFormID;
    responses: Record<number, string>;
  }): Promise<{}> {
    const form = await this.feedbackForms.findOne({ _id: feedbackForm });
    if (!form) {
      throw new Error("Feedback form not found");
    }

    if (form.status !== "Sent") {
      throw new Error("Feedback form must be in 'Sent' status to submit");
    }

    // Update questions with responses
    const updatedQuestions = form.questions.map(
      (question: FeedbackQuestion, index: number) => {
        const response = responses[index];
        if (!response || response.trim() === "") {
          throw new Error(`Response required for question ${index + 1}`);
        }
        return { ...question, response };
      },
    );

    await this.feedbackForms.updateOne(
      { _id: feedbackForm },
      {
        $set: {
          status: "Completed",
          completedDate: new Date().toISOString(),
          questions: updatedQuestions,
        },
      },
    );

    return {};
  }

  /**
   * getFeedbackForm (id: Identifier): (feedbackForm: FeedbackForm)
   * **requires** id is a valid Identifier for an existing FeedbackForm
   * **effects** returns the feedback form
   */
  async getFeedbackForm({
    id,
  }: {
    id: FeedbackFormID;
  }): Promise<{ feedbackForm: FeedbackFormDoc }> {
    const form = await this.feedbackForms.findOne({ _id: id });
    if (!form) {
      throw new Error("Feedback form not found");
    }

    return { feedbackForm: form };
  }

  /**
   * getFeedbackFormsByTarget (target: Employee, startDate: Text, endDate: Text): (feedbackForms: List<FeedbackForm>)
   * **requires** target is a valid Employee, startDate and endDate are valid Text
   * **effects** returns a list of feedback forms for the target created and completed between the given dates
   */
  async getFeedbackFormsByTarget({
    target,
    startDate,
    endDate,
  }: {
    target: Employee;
    startDate: string;
    endDate: string;
  }): Promise<{ feedbackForms: FeedbackFormDoc[] }> {
    const query: any = {
      target,
      createdDate: {
        $gte: startDate,
        $lte: endDate,
      },
    };

    const forms = await this.feedbackForms.find(query).toArray();
    return { feedbackForms: forms };
  }

  /**
   * getFeedbackFormsByReviewer (reviewer: Employee): (feedbackForms: List<FeedbackForm>)
   * **effects** returns a list of feedback forms assigned to the reviewer
   */
  async getFeedbackFormsByReviewer({
    reviewer,
  }: {
    reviewer: Employee;
  }): Promise<{ feedbackForms: FeedbackFormDoc[] }> {
    const forms = await this.feedbackForms.find({ reviewer }).toArray();
    return { feedbackForms: forms };
  }

  /**
   * getFeedbackFormsByCreator (creator: User, startDate?: Text, endDate?: Text): (feedbackForms: List<FeedbackForm>)
   * **requires** creator is a valid User, startDate and endDate are valid Text
   * **effects** returns a list of feedback forms created by the creator between the given dates
   */
  async getFeedbackFormsByCreator({
    creator,
    startDate,
    endDate,
  }: {
    creator: User;
    startDate?: string;
    endDate?: string;
  }): Promise<{ feedbackForms: FeedbackFormDoc[] }> {
    const query: any = {
      createdBy: creator,
    };
    if (startDate && endDate) {
      query.createdDate = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    const forms = await this.feedbackForms.find(query).toArray();
    return { feedbackForms: forms };
  }

  /**
   * updateFeedbackFormResponse (feedbackForm: FeedbackForm, questionIndex: number, response: string): ()
   * **requires** feedbackForm is in "Sent" status
   * **effects** updates the response for a specific question
   */
  async updateFeedbackFormResponse({
    feedbackForm,
    questionIndex,
    response,
  }: {
    feedbackForm: FeedbackFormID;
    questionIndex: number;
    response: string;
  }): Promise<{}> {
    const form = await this.feedbackForms.findOne({ _id: feedbackForm });
    if (!form) {
      throw new Error("Feedback form not found");
    }

    if (form.status !== "Sent") {
      throw new Error("Can only update responses for forms in 'Sent' status");
    }

    if (questionIndex < 0 || questionIndex >= form.questions.length) {
      throw new Error("Invalid question index");
    }

    const updatedQuestions = [...form.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      response,
    };

    await this.feedbackForms.updateOne(
      { _id: feedbackForm },
      { $set: { questions: updatedQuestions } },
    );

    return {};
  }
}
