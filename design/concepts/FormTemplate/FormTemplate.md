# concept: FormTemplate[OrgGraph]

  **purpose**

    store HR-admin-created form templates that can be reused across sessions and browsers,
    enabling consistent feedback collection with structured questions and role-based targeting.

  **principle**

    HR administrators create form templates with names and sets of feedback questions;
    each question has a prompt, type (Multiple Choice, Free, Scale), and optional target roles;
    templates are associated with creators and optional team scopes;
    the system maintains template lifecycle states (Created, Sent, Completed) and provides
    access control based on creator permissions.

  **state**

    a set of FormTemplates with
      an id FormTemplateID
      a name String
      a creator User
      an optional teamId String
      a status "Created" | "Sent" | "Completed"
      a createdDate String
      a questions FeedbackQuestion[]

    a set of FeedbackQuestions with
      a prompt String
      a type "Multiple Choice" | "Free" | "Scale"
      an optional response String
      an optional targetRoles String[]

  **actions**

    createTemplate (creator: User, name: Text, questions: List<FeedbackQuestion>, teamId?: Text): (template: FormTemplateID)
      **requires** questions are valid, question types are supported, prompts are not empty
      **effects** creates a new form template for the given creator with "Created" status

    getTemplatesByCreator (creator: User): (templates: List<FormTemplate>)
      **requires** creator is a valid User
      **effects** returns all templates created by the given creator sorted by creation date

    getTemplate (templateId: FormTemplateID): (template: FormTemplate)
      **requires** templateId is a valid FormTemplateID
      **effects** returns the template with the given ID
