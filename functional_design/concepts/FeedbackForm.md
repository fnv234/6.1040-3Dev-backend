# concept: FeedbackForm

* **concept**: FeedbackForm[Employee]

* **purpose**: collect employees' feedback on an assigned target employee

* **principle**: HR users format and create these forms, sending them out for employees to fill out and later aggregate into insightful reports

* **state**:
 * A set of `FeedbackForm` with:
   * an `_id` of type `ID`
   * a `reviewer` of type `Employee`
   * a `target` of type `Employee`
   * a `status` of type `String` (in "Created", "Sent", "Completed")
   * a `createdDate` of type `Date`
   * a `completedDate` of type `Date`
   * a set of `FeedbackQuestion` with:
     * a `prompt` of type `String`
     * a `type` of type `String` (in "Multiple Choice", "Free", "Scale")
     * an optional `response` of type `String` 

* **actions**:

 * `createFeedbackForm(reviewer: Employee, target: Employee, questions: List<FeedbackQuestion>): (feedbackForm: FeedbackForm)`
  * **requires**: questions are valid, target is not reviewer and both are valid Employees
  * **effect**: creates a new feedback form in the "Created" status with the given questions and createdDate set to the current time

* `sendFeedbackForm(feedbackForm: FeedbackForm): (link: String)`
 * **requires**: feedbackForm is in "Created" status
 * **effect**: returns a link to the feedback form, updates the status to "Sent"

* `submitFeedbackForm(feedbackForm: FeedbackForm): ()`
 * **requires**: feedbackForm is in "Sent" status, all FeedbackQuestions have non-empty responses
 * **effect**: updates the status to "Completed" and completedDate to the current time

* `getFeedbackForm(id: ID): (feedbackForm: FeedbackForm)`
 * **requires**: id is a valid ID for an existing FeedbackForm
 * **effect**: returns the feedback form

* `getFeedbackFormsByTarget(target: Employee, startDate: Date, endDate: Date): (feedbackForms: List<FeedbackForm>)`
 * **requires**: target is a valid Employee, startDate and endDate are valid dates
 * **effect**: returns a list of feedback forms for the target created and completed between the given dates

* **notes**:
 * This concept is the main component that structures the data that we'll be presenting in our 360 degree feedback web app. It specifies reviewer-reviewed relationship using the generic Employee type and dates for tracking when the form was created and completed to support review cycles.
 * We define two enums, status for Forms and type for Questions, which may be extended later