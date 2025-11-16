# concept: ReviewCycle[Employee, FeedbackForm, ResponseSet]

  **purpose**

    coordinate creation, distribution, completion, and closure of periodic or ad-hoc
    feedback cycles across an organization.

  **principle**

    HR creates a review cycle and configures its scope, form, anonymity settings, and deadlines;
    the system uses the org graph to propose reviewer sets for each employee;
    reviewers receive tasks to submit feedback using the assigned form;
    responses accumulate until the deadline or manual closure;
    after closure, response sets are passed to ReportSynthesis for anonymization and reporting.

  **state**

    a set of Cycles with
      an id Identifier
      a createdBy Employee
      a form FeedbackForm
      a startDate Date
      an endDate Date
      a isActive Flag
      a set of assignments ReviewAssignments

    a set of ReviewAssignments with
      a target Employee
      a set of reviewers Employees
      a status Status   // e.g., pending, completed, late
      a responseSet optional ResponseSet

  **actions**

    createCycle (creator: Employee, form: FeedbackForm, start: Date, end: Date): (cycle: Cycle)
      **requires** creator exists, form exists, and start < end
      **effects** create a new inactive cycle with no assignments

    configureAssignments (cycle: Cycle, targets: Set<Employee>)
      **requires** cycle exists and is not active
      **effects** for each target, create a ReviewAssignment with empty reviewer set and status = pending

    autoBuildReviewers (cycle: Cycle, target: Employee)
      **requires** cycle exists and has an assignment for target
      **effects** populate reviewers for the target based on org-graph roles (manager, reports, peers)

    activate (cycle: Cycle)
      **requires** cycle exists, is not active, and has assignments configured
      **effects** set isActive = true and notify reviewers of their feedback tasks

    submitFeedback (cycle: Cycle, target: Employee, reviewer: Employee, responses: Responses)
      **requires** cycle is active and reviewer is assigned to target
      **effects** attach responses to the assignment's responseSet; update status if all reviewers completed

    close (cycle: Cycle)
      **requires** cycle exists and is active
      **effects** set isActive = false and freeze all assignments; incomplete responses are marked as missing

    exportForSynthesis (cycle: Cycle): (responseSets: Set<ResponseSet>)
      **requires** cycle exists and is not active
      **effects** return all responseSets from assignments for downstream ReportSynthesis
