import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

const PREFIX = "ReviewCycle" + ".";

// --- Type Definitions ---
type Employee = ID;
type FeedbackFormID = ID;
type CycleID = ID;
type ResponseSetID = ID;

interface ReviewAssignmentDoc {
  target: Employee;
  reviewers: Employee[];
  status: "pending" | "completed" | "late";
  responseSet?: ResponseSetID;
}

interface CycleDoc {
  _id: CycleID;
  createdBy: Employee;
  form: FeedbackFormID;
  startDate: string;
  endDate: string;
  isActive: boolean;
  assignments: ReviewAssignmentDoc[];
  createdAt: string;
}

interface ResponseDoc {
  reviewer: Employee;
  target: Employee;
  cycle: CycleID;
  responses: Record<number, string>;
  submittedAt: string;
}

/**
 * ReviewCycle concept for coordinating feedback cycles across an organization
 */
export default class ReviewCycleConcept {
  private readonly cycles: Collection<CycleDoc>;
  private readonly responses: Collection<ResponseDoc>;

  constructor(private readonly db: Db) {
    this.cycles = this.db.collection(PREFIX + "cycles");
    this.responses = this.db.collection(PREFIX + "responses");
  }

  /**
   * createCycle (creator: Employee, form: FeedbackForm, start: Date, end: Date): (cycle: Cycle)
   * **requires** creator exists, form exists, and start < end
   * **effects** create a new inactive cycle with no assignments
   */
  async createCycle({
    creator,
    form,
    startDate,
    endDate,
  }: {
    creator: Employee;
    form: FeedbackFormID;
    startDate: string;
    endDate: string;
  }): Promise<{ cycle: CycleID }> {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new Error("Start date must be before end date");
    }

    const cycleId = freshID() as CycleID;
    const cycleDoc: CycleDoc = {
      _id: cycleId,
      createdBy: creator,
      form,
      startDate,
      endDate,
      isActive: false,
      assignments: [],
      createdAt: new Date().toISOString(),
    };

    await this.cycles.insertOne(cycleDoc);
    return { cycle: cycleId };
  }

  /**
   * configureAssignments (cycle: Cycle, targets: Set<Employee>)
   * **requires** cycle exists and is not active
   * **effects** for each target, create a ReviewAssignment with empty reviewer set and status = pending
   */
  async configureAssignments({
    cycle,
    targets,
  }: {
    cycle: CycleID;
    targets: Employee[];
  }): Promise<{}> {
    const cycleDoc = await this.cycles.findOne({ _id: cycle });
    if (!cycleDoc) {
      throw new Error("Cycle not found");
    }

    if (cycleDoc.isActive) {
      throw new Error("Cannot configure assignments for active cycle");
    }

    const assignments: ReviewAssignmentDoc[] = targets.map(
      (target: Employee) => ({
        target,
        reviewers: [],
        status: "pending" as const,
      }),
    );

    await this.cycles.updateOne(
      { _id: cycle },
      { $set: { assignments } }
    );

    return {};
  }

  /**
   * addReviewers (cycle: Cycle, target: Employee, reviewers: Set<Employee>)
   * **requires** cycle exists and has an assignment for target
   * **effects** add reviewers to the target's assignment
   */
  async addReviewers({
    cycle,
    target,
    reviewers,
  }: {
    cycle: CycleID;
    target: Employee;
    reviewers: Employee[];
  }): Promise<{}> {
    const cycleDoc = await this.cycles.findOne({ _id: cycle });
    if (!cycleDoc) {
      throw new Error("Cycle not found");
    }

    const assignmentIndex = cycleDoc.assignments.findIndex(
      (a: ReviewAssignmentDoc) => a.target === target,
    );
    if (assignmentIndex === -1) {
      throw new Error("Assignment not found for target");
    }

    // Add new reviewers to existing ones (avoiding duplicates)
    const existingReviewers = new Set< Employee >(
      cycleDoc.assignments[assignmentIndex].reviewers,
    );
    const allReviewers = [
      ...existingReviewers,
      ...reviewers.filter((r: Employee) => !existingReviewers.has(r)),
    ];

    cycleDoc.assignments[assignmentIndex].reviewers = allReviewers;

    await this.cycles.updateOne(
      { _id: cycle },
      { $set: { assignments: cycleDoc.assignments } }
    );

    return {};
  }

  /**
   * autoBuildReviewers (cycle: Cycle, target: Employee)
   * **requires** cycle exists and has an assignment for target
   * **effects** populate reviewers for the target based on org-graph roles (manager, reports, peers)
   * Note: This is called by the buildReviewers sync
   */
  async autoBuildReviewers({
    cycle,
    target,
  }: {
    cycle: CycleID;
    target: Employee;
  }): Promise<{}> {
    const cycleDoc = await this.cycles.findOne({ _id: cycle });
    if (!cycleDoc) {
      throw new Error("Cycle not found");
    }

    const assignmentIndex = cycleDoc.assignments.findIndex((a: ReviewAssignmentDoc) => a.target === target);
    if (assignmentIndex === -1) {
      throw new Error("Assignment not found for target");
    }

    // This method is called by the sync, which will populate reviewers
    // The actual reviewer population happens in the sync using OrgGraph
    return {};
  }

  /**
   * activate (cycle: Cycle)
   * **requires** cycle exists, is not active, and has assignments configured
   * **effects** set isActive = true and notify reviewers of their feedback tasks
   */
  async activate({
    cycle,
  }: {
    cycle: CycleID;
  }): Promise<{}> {
    const cycleDoc = await this.cycles.findOne({ _id: cycle });
    if (!cycleDoc) {
      throw new Error("Cycle not found");
    }

    if (cycleDoc.isActive) {
      throw new Error("Cycle is already active");
    }

    if (cycleDoc.assignments.length === 0) {
      throw new Error("Cannot activate cycle without assignments");
    }

    // Check that all assignments have reviewers
    for (const assignment of cycleDoc.assignments) {
      if (assignment.reviewers.length === 0) {
        throw new Error(`Assignment for target ${assignment.target} has no reviewers`);
      }
    }

    await this.cycles.updateOne(
      { _id: cycle },
      { $set: { isActive: true } }
    );

    return {};
  }

  /**
   * submitFeedback (cycle: Cycle, target: Employee, reviewer: Employee, responses: Responses)
   * **requires** cycle is active and reviewer is assigned to target
   * **effects** attach responses to the assignment's responseSet; update status if all reviewers completed
   */
  async submitFeedback({
    cycle,
    target,
    reviewer,
    responses,
  }: {
    cycle: CycleID;
    target: Employee;
    reviewer: Employee;
    responses: Record<number, string>;
  }): Promise<{}> {
    const cycleDoc = await this.cycles.findOne({ _id: cycle });
    if (!cycleDoc) {
      throw new Error("Cycle not found");
    }

    if (!cycleDoc.isActive) {
      throw new Error("Cannot submit feedback for inactive cycle");
    }

    const assignment = cycleDoc.assignments.find(
      (a: ReviewAssignmentDoc) => a.target === target,
    );
    if (!assignment) {
      throw new Error("Assignment not found for target");
    }

    if (!assignment.reviewers.includes(reviewer)) {
      throw new Error("Reviewer is not assigned to this target");
    }

    // Store the response
    const responseDoc: ResponseDoc = {
      reviewer,
      target,
      cycle,
      responses,
      submittedAt: new Date().toISOString(),
    };

    await this.responses.insertOne(responseDoc);

    // Check if all reviewers have submitted
    const submittedReviewers = await this.responses
      .find({ cycle, target })
      .toArray();

    const submittedReviewerIds = new Set< Employee >(
      submittedReviewers.map((r: ResponseDoc) => r.reviewer),
    );
    const allReviewersSubmitted = assignment.reviewers.every(
      (r: Employee) => submittedReviewerIds.has(r),
    );

    if (allReviewersSubmitted) {
      // Update assignment status to completed
      const assignmentIndex = cycleDoc.assignments.findIndex(
        (a: ReviewAssignmentDoc) => a.target === target,
      );
      cycleDoc.assignments[assignmentIndex].status = "completed";

      await this.cycles.updateOne(
        { _id: cycle },
        { $set: { assignments: cycleDoc.assignments } }
      );
    }

    return {};
  }

  /**
   * close (cycle: Cycle)
   * **requires** cycle exists and is active
   * **effects** set isActive = false and freeze all assignments; incomplete responses are marked as missing
   */
  async close({
    cycle,
  }: {
    cycle: CycleID;
  }): Promise<{}> {
    const cycleDoc = await this.cycles.findOne({ _id: cycle });
    if (!cycleDoc) {
      throw new Error("Cycle not found");
    }

    if (!cycleDoc.isActive) {
      throw new Error("Cycle is not active");
    }

    // Mark incomplete assignments as late
    const updatedAssignments = [...cycleDoc.assignments];
    for (let i = 0; i < updatedAssignments.length; i++) {
      if (updatedAssignments[i].status === "pending") {
        updatedAssignments[i].status = "late";
      }
    }

    await this.cycles.updateOne(
      { _id: cycle },
      {
        $set: {
          isActive: false,
          assignments: updatedAssignments,
        },
      }
    );

    return {};
  }

  /**
   * exportForSynthesis (cycle: Cycle): (responseSets: Set<ResponseSet>)
   * **requires** cycle exists and is not active
   * **effects** return all responseSets from assignments for downstream ReportSynthesis
   */
  async exportForSynthesis({
    cycle,
  }: {
    cycle: CycleID;
  }): Promise<{ responseSets: any[] }> {
    const cycleDoc = await this.cycles.findOne({ _id: cycle });
    if (!cycleDoc) {
      throw new Error("Cycle not found");
    }

    if (cycleDoc.isActive) {
      throw new Error("Cannot export from active cycle");
    }

    const responseSets = [];

    // For each target, collect their responses
    for (const assignment of cycleDoc.assignments) {
      const responses = await this.responses
        .find({ cycle, target: assignment.target })
        .toArray();

      if (responses.length > 0) {
        responseSets.push({
          target: assignment.target,
          form: cycleDoc.form,
          responses: responses.map((r: ResponseDoc) => ({
            reviewer: r.reviewer,
            responses: r.responses,
            submittedAt: r.submittedAt,
          })),
        });
      }
    }

    return { responseSets };
  }

  /**
   * getCycle (cycle: CycleID): (cycleData: CycleDoc)
   * **requires** cycle exists
   * **effects** return the cycle data
   */
  async getCycle({
    cycle,
  }: {
    cycle: CycleID;
  }): Promise<{ cycleData: CycleDoc }> {
    const cycleDoc = await this.cycles.findOne({ _id: cycle });
    if (!cycleDoc) {
      throw new Error("Cycle not found");
    }

    return { cycleData: cycleDoc };
  }

  /**
   * getCyclesByCreator (creator: Employee): (cycles: CycleDoc[])
   * **requires** creator exists
   * **effects** return all cycles created by the employee
   */
  async getCyclesByCreator({
    creator,
  }: {
    creator: Employee;
  }): Promise<{ cycles: CycleDoc[] }> {
    const cycles = await this.cycles.find({ createdBy: creator }).toArray();
    return { cycles };
  }

  /**
   * getActiveCycles (): (cycles: CycleDoc[])
   * **effects** return all active cycles
   */
  async getActiveCycles(): Promise<{ cycles: CycleDoc[] }> {
    const cycles = await this.cycles.find({ isActive: true }).toArray();
    return { cycles };
  }

  /**
   * getReviewerTasks (reviewer: Employee): (tasks: any[])
   * **effects** return all pending feedback tasks for the reviewer
   */
  async getReviewerTasks({
    reviewer,
  }: {
    reviewer: Employee;
  }): Promise<{ tasks: any[] }> {
    const activeCycles = await this.cycles.find({ isActive: true }).toArray();
    const tasks = [];

    for (const cycle of activeCycles) {
      for (const assignment of cycle.assignments) {
        if (assignment.reviewers.includes(reviewer)) {
          // Check if reviewer has already submitted
          const existingResponse = await this.responses.findOne({
            cycle: cycle._id,
            target: assignment.target,
            reviewer,
          });

          if (!existingResponse) {
            tasks.push({
              cycle: cycle._id,
              target: assignment.target,
              form: cycle.form,
              endDate: cycle.endDate,
            });
          }
        }
      }
    }

    return { tasks };
  }

  /**
   * getResponsesByCycle (cycle: CycleID): (responses: ResponseDoc[])
   * **requires** cycle exists
   * **effects** return all responses for the cycle
   */
  async getResponsesByCycle({
    cycle,
  }: {
    cycle: CycleID;
  }): Promise<{ responses: ResponseDoc[] }> {
    const responses = await this.responses.find({ cycle }).toArray();
    return { responses };
  }
}