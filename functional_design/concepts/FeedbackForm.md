# concept: FeedbackForm[Employee, User]
  
  **purpose**
  
    collect employees' feedback on an assigned target employee

  **principle**

    HR users format and create these forms, sending them out for employees to fill out and later aggregate into insightful reports

  **state**

    a set of FeedbackForm with
      an _id of type Identifier
      a name of type Text
      a creator of type User
      a reviewer of type Employee
      a target of type Employee
      a status of type Text (in "Created", "Sent", "Completed")
      a createdDate of type Text
      a completedDate of type Text
      a set of FeedbackQuestion with
        a prompt of type Text
        a type of type Text (in "Multiple Choice", "Free", "Scale")
        an response of type optional Text

  **actions**

    createFeedbackForm (name: Text, creator: User, reviewer: Employee, target: Employee, questions: List<FeedbackQuestion>): (feedbackForm: FeedbackForm)
      **requires** questions are valid, target is not reviewer and both are valid Employees
      **effects** creates a new feedback form in the "Created" status with the given questions and createdDate set to the current time

    sendFeedbackForm (feedbackForm: FeedbackForm): (link: Text)
      **requires** feedbackForm is in "Created" status
      **effects** returns a link to the feedback form, updates the status to "Sent"

    submitFeedbackForm (feedbackForm: FeedbackForm): ()
      **requires** feedbackForm is in "Sent" status, all FeedbackQuestions have non-empty responses
      **effects** updates the status to "Completed" and completedDate to the current time

    getFeedbackForm (id: Identifier): (feedbackForm: FeedbackForm)
      **requires** id is a valid Identifier for an existing FeedbackForm
      **effects** returns the feedback form

    getFeedbackFormsByTarget (target: Employee, startDate: Text, endDate: Text): (feedbackForms: List<FeedbackForm>)
      **requires** target is a valid Employee, startDate and endDate are valid Text
      **effects** returns a list of feedback forms for the target created and completed between the given dates
    
    getFeedbackFormsByReviewer (reviewer: Employee, startDate: Text, endDate: Text): (feedbackForms: List<FeedbackForm>)
      **requires** reviewer is a valid Employee, startDate and endDate are valid Text
      **effects** returns a list of feedback forms reviewed by the reviewer between the given dates

    getFeedbackFormsByCreator (creator: User, startDate?: Text, endDate?: Text): (feedbackForms: List<FeedbackForm>)
      **requires** creator is a valid User, startDate and endDate are valid Text
      **effects** returns a list of feedback forms created by the creator between the given dates

  **notes**

    This concept is the main component that structures the data that we'll be presenting in our 360 degree feedback web app. It specifies reviewer-reviewed relationship using the generic Employee type and dates for tracking when the form was created and completed to support review cycles.
    We define two enums, status for Forms and type for Questions, which may be extended later