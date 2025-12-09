# concept: AccessCode[FormTemplate, OrgGraph]

  **purpose**

    manage unique access codes for forms that enable secure, one-time form submissions
    and store the corresponding responses while tracking usage status and metadata.

  **principle**

    HR administrators generate unique access codes for specific forms and teams;
    each code maps to a member with email and optional role information;
    respondents use their code to submit form responses exactly once;
    the system tracks code usage, stores responses with metadata, and provides
    access control based on form creator permissions.

  **state**

    a set of AccessCodes with
      an id AccessCodeID
      an accessCode String
      a formId FormTemplateID
      a teamId TeamID
      a memberId String
      a memberEmail String
      an optional memberRole String
      a createdBy User
      a createdDate String
      a used Boolean
      an optional usedDate String

    a set of FormResponses with
      an id ID
      an accessCode String
      a formId FormTemplateID
      a teamId TeamID
      a memberId String
      a memberEmail String
      an optional memberRole String
      a responses Record<number, String>
      a submittedDate String

  **actions**

    createAccessCode (accessCode: String, formId: FormTemplateID, teamId: TeamID, memberId: String, memberEmail: String, memberRole?: String, createdBy: User): (accessCodeId: AccessCodeID)
      **requires** accessCode is unique, formId, teamId, and memberId are valid
      **effects** creates a new access code mapping with the provided metadata

    getAccessCodeInfo (accessCode: String): (accessCodeInfo: AccessCode)
      **requires** accessCode exists
      **effects** returns the access code information including metadata

    submitFormResponse (accessCode: String, responses: Record<number, String>): (responseId: ID)
      **requires** accessCode is valid and not already used, responses are not empty
      **effects** stores the form response and marks access code as used with timestamp

    getFormResponses (formId: FormTemplateID, createdBy: User): (responses: FormResponse[])
      **requires** user is the creator of the form
      **effects** returns all responses for the specified form sorted by submission date

    getAccessCodesByForm (formId: FormTemplateID, createdBy: User): (accessCodes: AccessCode[])
      **requires** user is the creator of the form
      **effects** returns all access codes for the specified form sorted by creation date

    createBulkAccessCodes (formId: FormTemplateID, teamId: TeamID, members: Array<{memberId: String, memberEmail: String, memberRole?: String, accessCode: String}>, createdBy: User): (accessCodeIds: AccessCodeID[])
      **requires** formId and teamId are valid, members array is not empty, access codes are unique
      **effects** creates multiple access codes for team members in a single operation
