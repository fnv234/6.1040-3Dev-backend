import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

const PREFIX = "AccessCode" + ".";

// --- Type Definitions ---
type AccessCodeID = ID;
type FormTemplateID = ID;
type TeamID = ID;
type User = ID;

interface AccessCodeDoc {
  _id: AccessCodeID;
  accessCode: string;
  formId: FormTemplateID;
  teamId: TeamID;
  memberId: string;
  memberEmail: string;
  memberRole?: string;
  createdBy: User;
  createdDate: string;
  used: boolean;
  usedDate?: string;
}

interface FormResponseDoc {
  _id: ID;
  accessCode: string;
  formId: FormTemplateID;
  teamId: TeamID;
  memberId: string;
  memberEmail: string;
  memberRole?: string;
  responses: Record<number, string>;
  submittedDate: string;
}

/**
 * AccessCode concept for managing unique access codes for forms and storing responses
 */
export default class AccessCodeConcept {
  private readonly accessCodes: Collection<AccessCodeDoc>;
  private readonly formResponses: Collection<FormResponseDoc>;

  constructor(private readonly db: Db) {
    this.accessCodes = this.db.collection(PREFIX + "accessCodes");
    this.formResponses = this.db.collection(PREFIX + "formResponses");
  }

  /**
   * createAccessCode (accessCode: string, formId: FormTemplateID, teamId: TeamID, memberId: string, memberEmail: string, memberRole?: string, createdBy: User): (accessCodeId: AccessCodeID)
   * **requires** accessCode is unique, formId, teamId, and memberId are valid
   * **effects** creates a new access code mapping
   */
  async createAccessCode({
    accessCode,
    formId,
    teamId,
    memberId,
    memberEmail,
    memberRole,
    createdBy,
  }: {
    accessCode: string;
    formId: FormTemplateID;
    teamId: TeamID;
    memberId: string;
    memberEmail: string;
    memberRole?: string;
    createdBy: User;
  }): Promise<{ accessCodeId: AccessCodeID }> {
    // Check if access code already exists
    const existing = await this.accessCodes.findOne({ accessCode });
    if (existing) {
      throw new Error("Access code already exists");
    }

    const accessCodeId = freshID() as AccessCodeID;
    const accessCodeDoc: AccessCodeDoc = {
      _id: accessCodeId,
      accessCode,
      formId,
      teamId,
      memberId,
      memberEmail,
      memberRole,
      createdBy,
      createdDate: new Date().toISOString(),
      used: false,
    };

    await this.accessCodes.insertOne(accessCodeDoc);
    return { accessCodeId };
  }

  /**
   * getAccessCodeInfo (accessCode: string): (accessCodeInfo: AccessCodeDoc)
   * **requires** accessCode exists
   * **effects** returns the access code information
   */
  async getAccessCodeInfo({
    accessCode,
  }: {
    accessCode: string;
  }): Promise<{ accessCodeInfo: AccessCodeDoc }> {
    const accessCodeDoc = await this.accessCodes.findOne({ accessCode });
    if (!accessCodeDoc) {
      throw new Error("Invalid access code");
    }

    return { accessCodeInfo: accessCodeDoc };
  }

  /**
   * submitFormResponse (accessCode: string, responses: Record<number, string>): (responseId: ID)
   * **requires** accessCode is valid and not already used
   * **effects** stores the form response and marks access code as used
   */
  async submitFormResponse({
    accessCode,
    responses,
  }: {
    accessCode: string;
    responses: Record<number, string>;
  }): Promise<{ responseId: ID }> {
    const accessCodeDoc = await this.accessCodes.findOne({ accessCode });
    if (!accessCodeDoc) {
      throw new Error("Invalid access code");
    }

    if (accessCodeDoc.used) {
      throw new Error("Access code has already been used");
    }

    // Validate responses are not empty
    for (const [questionIndex, response] of Object.entries(responses)) {
      if (!response || response.trim() === "") {
        throw new Error(
          `Response required for question ${parseInt(questionIndex) + 1}`,
        );
      }
    }

    const responseId = freshID();
    const responseDoc: FormResponseDoc = {
      _id: responseId,
      accessCode,
      formId: accessCodeDoc.formId,
      teamId: accessCodeDoc.teamId,
      memberId: accessCodeDoc.memberId,
      memberEmail: accessCodeDoc.memberEmail,
      memberRole: accessCodeDoc.memberRole,
      responses,
      submittedDate: new Date().toISOString(),
    };

    // Store the response
    await this.formResponses.insertOne(responseDoc);

    // Mark access code as used
    await this.accessCodes.updateOne(
      { accessCode },
      {
        $set: {
          used: true,
          usedDate: new Date().toISOString(),
        },
      },
    );

    return { responseId };
  }

  /**
   * getFormResponses (formId: FormTemplateID, createdBy: User): (responses: FormResponseDoc[])
   * **requires** user is the creator of the form
   * **effects** returns all responses for the specified form
   */
  async getFormResponses({
    formId,
    createdBy,
  }: {
    formId: FormTemplateID;
    createdBy: User;
  }): Promise<{ responses: FormResponseDoc[] }> {
    // Check if the user created any access codes for this form
    // If they did, they have permission to view responses
    // If no access codes exist yet, that's fine - just return empty array
    const accessCodeExists = await this.accessCodes.findOne({
      formId,
      createdBy,
    });

    // If user hasn't created any access codes for this form, return empty responses
    // This allows form creators to navigate the app without errors
    if (!accessCodeExists) {
      return { responses: [] };
    }

    const responses = await this.formResponses
      .find({ formId })
      .sort({ submittedDate: -1 })
      .toArray();

    return { responses };
  }

  /**
   * getAccessCodesByForm (formId: FormTemplateID, createdBy: User): (accessCodes: AccessCodeDoc[])
   * **requires** user is the creator of the form
   * **effects** returns all access codes for the specified form
   */
  async getAccessCodesByForm({
    formId,
    createdBy,
  }: {
    formId: FormTemplateID;
    createdBy: User;
  }): Promise<{ accessCodes: AccessCodeDoc[] }> {
    const accessCodes = await this.accessCodes
      .find({ formId, createdBy })
      .sort({ createdDate: -1 })
      .toArray();

    return { accessCodes };
  }

  /**
   * createBulkAccessCodes (formId: FormTemplateID, teamId: TeamID, members: Array<{memberId: string, memberEmail: string, memberRole?: string, accessCode: string}>, createdBy: User): (accessCodeIds: AccessCodeID[])
   * **requires** formId and teamId are valid, members array is not empty
   * **effects** creates multiple access codes for team members
   */
  async createBulkAccessCodes({
    formId,
    teamId,
    members,
    createdBy,
  }: {
    formId: FormTemplateID;
    teamId: TeamID;
    members: Array<{
      memberId: string;
      memberEmail: string;
      memberRole?: string;
      accessCode: string;
    }>;
    createdBy: User;
  }): Promise<{ accessCodeIds: AccessCodeID[] }> {
    if (!members || members.length === 0) {
      throw new Error("Members array cannot be empty");
    }

    // Check for duplicate access codes
    const accessCodeValues = members.map((m) => m.accessCode);
    const existingCodes = await this.accessCodes
      .find({ accessCode: { $in: accessCodeValues } })
      .toArray();

    if (existingCodes.length > 0) {
      throw new Error(
        `Access codes already exist: ${
          existingCodes.map((c) => c.accessCode).join(", ")
        }`,
      );
    }

    const accessCodeIds: AccessCodeID[] = [];
    const accessCodeDocs: AccessCodeDoc[] = [];

    for (const member of members) {
      const accessCodeId = freshID() as AccessCodeID;
      accessCodeIds.push(accessCodeId);

      accessCodeDocs.push({
        _id: accessCodeId,
        accessCode: member.accessCode,
        formId,
        teamId,
        memberId: member.memberId,
        memberEmail: member.memberEmail,
        memberRole: member.memberRole,
        createdBy,
        createdDate: new Date().toISOString(),
        used: false,
      });
    }

    await this.accessCodes.insertMany(accessCodeDocs);
    return { accessCodeIds };
  }
}
