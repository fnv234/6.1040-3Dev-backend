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
  targetRoles?: string[]; // Optional: if specified, only members with these roles will see this question
}

interface FeedbackFormDoc {
  _id: FeedbackFormID;
  name: string;
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
    name,
    creator,
    reviewer,
    target,
    questions,
  }: {
    name: string;
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
      name,
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
      creator: creator,
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

  /**
   * getQuestionsForRole (feedbackForm: FeedbackForm, memberRole: string): (questions: FeedbackQuestion[])
   * **requires** feedbackForm exists
   * **effects** returns questions that should be shown to a member with the given role
   */
  async getQuestionsForRole({
    feedbackForm,
    memberRole,
  }: {
    feedbackForm: FeedbackFormID;
    memberRole: string | null;
  }): Promise<{ questions: FeedbackQuestion[] }> {
    const form = await this.feedbackForms.findOne({ _id: feedbackForm });
    if (!form) {
      throw new Error("Feedback form not found");
    }

    // Filter questions based on role targeting
    const filteredQuestions = form.questions.filter((question) => {
      // If no target roles specified, show to everyone
      if (!question.targetRoles || question.targetRoles.length === 0) {
        return true;
      }

      // If member has no role, don't show role-targeted questions
      if (!memberRole) {
        return false;
      }

      // Show question if member's role is in the target roles
      return question.targetRoles.includes(memberRole);
    });

    return { questions: filteredQuestions };
  }

  /**
   * createFeedbackFormForTeam (name: string, creator: User, teamId: TeamID, questions: FeedbackQuestion[]): (feedbackForms: FeedbackFormID[])
   * **requires** questions are valid, team exists
   * **effects** creates feedback forms for all reviewer-target pairs in the team
   */
  async createFeedbackFormForTeam({
    name,
    creator,
    teamId,
    questions,
    orgGraph,
  }: {
    name: string;
    creator: User;
    teamId: string; // TeamID but accepting string for flexibility
    questions: FeedbackQuestion[];
    orgGraph: any; // OrgGraphConcept instance - using any for simplicity
  }): Promise<{ feedbackForms: FeedbackFormID[] }> {
    if (!questions || questions.length === 0) {
      throw new Error("Questions are required");
    }

    // Get team members
    const { members } = await orgGraph.getTeamMembers({ teamId });

    const createdForms: FeedbackFormID[] = [];

    // Create forms for each reviewer-target pair (excluding self-reviews)
    for (const reviewer of members) {
      for (const target of members) {
        if (reviewer !== target) {
          const { feedbackForm } = await this.createFeedbackForm({
            name: `${name} - ${reviewer} → ${target}`,
            creator,
            reviewer,
            target,
            questions,
          });
          createdForms.push(feedbackForm);
        }
      }
    }

    return { feedbackForms: createdForms };
  }

  /**
   * updateFeedbackForm (formId: FeedbackFormID, updates: Partial<FeedbackForm>): (updatedForm: FeedbackFormDoc)
   * **requires** form exists and is in "Created" status
   * **effects** updates the specified fields of the feedback form
   */
  async updateFeedbackForm({ 
    formId, 
    updates 
  }: { 
    formId: FeedbackFormID; 
    updates: Partial<Omit<FeedbackFormDoc, '_id' | 'creator' | 'createdDate'>>;
  }): Promise<{ updatedForm: FeedbackFormDoc }> {
    // Ensure the form exists and is in "Created" status
    const existingForm = await this.feedbackForms.findOne({ _id: formId });
    if (!existingForm) {
      throw new Error("Feedback form not found");
    }

    if (existingForm.status !== "Created") {
      throw new Error("Only forms in 'Created' status can be updated");
    }

    // Prevent updating certain fields
    const { _id, creator, createdDate, ...allowedUpdates } = updates as any;
    
    const result = await this.feedbackForms.findOneAndUpdate(
      { _id: formId },
      { $set: allowedUpdates },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      throw new Error("Failed to update feedback form");
    }

    return { updatedForm: result.value };
  }

  /**
   * deleteFeedbackForm (formId: FeedbackFormID): ()
   * **requires** form exists and is in "Created" status
   * **effects** deletes the specified feedback form
   */
  async deleteFeedbackForm({ formId }: { formId: FeedbackFormID }): Promise<void> {
    // Ensure the form exists and is in "Created" status
    const existingForm = await this.feedbackForms.findOne({ _id: formId });
    if (!existingForm) {
      throw new Error("Feedback form not found");
    }

    if (existingForm.status !== "Created") {
      throw new Error("Only forms in 'Created' status can be deleted");
    }

    const result = await this.feedbackForms.deleteOne({ _id: formId });
    
    if (result.deletedCount === 0) {
      throw new Error("Failed to delete feedback form");
    }
  }
}
