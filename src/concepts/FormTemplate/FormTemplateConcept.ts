import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

const PREFIX = "FormTemplate" + ".";

// --- Type Definitions ---
type User = ID;

type FormTemplateID = ID;

interface FeedbackQuestion {
  prompt: string;
  type: "Multiple Choice" | "Free" | "Scale";
  response?: string;
  targetRoles?: string[];
}

interface FormTemplateDoc {
  _id: FormTemplateID;
  name: string;
  creator: User;
  teamId?: string;
  status: "Created" | "Sent" | "Completed";
  createdDate: string;
  questions: FeedbackQuestion[];
}

/**
 * FormTemplate concept for storing HR-admin-created form templates
 * that can be reused across sessions and browsers.
 */
export default class FormTemplateConcept {
  private readonly formTemplates: Collection<FormTemplateDoc>;

  constructor(private readonly db: Db) {
    this.formTemplates = this.db.collection(PREFIX + "formTemplates");
  }

  /**
   * createTemplate (creator: User, name: Text, questions: List<FeedbackQuestion>, teamId?: Text): (template: FormTemplateID)
   * **requires** questions are valid
   * **effects** creates a new form template for the given creator
   */
  async createTemplate({
    name,
    creator,
    teamId,
    questions,
  }: {
    name: string;
    creator: User;
    teamId?: string;
    questions: FeedbackQuestion[];
  }): Promise<{ template: FormTemplateID }> {
    if (!questions || questions.length === 0) {
      throw new Error("Questions are required");
    }

    const validTypes = ["Multiple Choice", "Free", "Scale"];
    for (const question of questions) {
      if (!validTypes.includes(question.type)) {
        throw new Error(`Invalid question type: ${question.type}`);
      }
      if (!question.prompt || question.prompt.trim() === "") {
        throw new Error("Question prompt cannot be empty");
      }
    }

    const templateId = freshID() as FormTemplateID;
    const templateDoc: FormTemplateDoc = {
      _id: templateId,
      name,
      creator,
      teamId,
      status: "Created",
      createdDate: new Date().toISOString(),
      questions: questions.map((q: FeedbackQuestion) => ({
        ...q,
        response: undefined,
      })),
    };

    await this.formTemplates.insertOne(templateDoc);
    return { template: templateId };
  }

  /**
   * getTemplatesByCreator (creator: User): (templates: List<FormTemplate>)
   * **requires** creator is a valid User
   * **effects** returns all templates created by the given creator
   */
  async getTemplatesByCreator({
    creator,
  }: {
    creator: User;
  }): Promise<{ templates: FormTemplateDoc[] }> {
    const templates = await this.formTemplates
      .find({ creator })
      .sort({ createdDate: -1 })
      .toArray();

    return { templates };
  }

  /**
   * getTemplate (templateId: FormTemplateID): (template: FormTemplate)
   * **requires** templateId is a valid FormTemplateID
   * **effects** returns the template with the given ID
   */
  async getTemplate({
    templateId,
  }: {
    templateId: FormTemplateID;
  }): Promise<{ template: FormTemplateDoc }> {
    const template = await this.formTemplates.findOne({ _id: templateId });
    if (!template) {
      throw new Error("Template not found");
    }

    return { template };
  }
}
