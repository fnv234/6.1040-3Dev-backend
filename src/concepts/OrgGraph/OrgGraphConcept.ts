import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

const PREFIX = "OrgGraph" + ".";

// --- Type Definitions ---
type Employee = ID;
type TeamID = ID;

interface EmployeeDoc {
  _id: Employee;
  email: string;
  manager?: Employee;
}

interface TeamDoc {
  _id: TeamID;
  name: string;
  members: Employee[];
}

/**
 * OrgGraph concept for maintaining organizational hierarchy and supporting reviewer selection
 */
export default class OrgGraphConcept {
  private readonly employees: Collection<EmployeeDoc>;
  private readonly teams: Collection<TeamDoc>;

  constructor(private readonly db: Db) {
    this.employees = this.db.collection(PREFIX + "employees");
    this.teams = this.db.collection(PREFIX + "teams");
  }

  /**
   * importRoster (sourceData: File)
   * **requires** sourceData is a valid roster containing employee ids, managers, and teams
   * **effects** create or update Employees and Teams so that reporting lines and membership reflect the sourceData
   */
  async importRoster({
    sourceData,
  }: {
    sourceData: {
      employees: Array<{
        id: Employee;
        email: string;
        manager?: Employee;
        teamNames: string[];
      }>;
    };
  }): Promise<{}> {
    // First, collect all unique team names
    const allTeamNames = new Set<string>();
    for (const emp of sourceData.employees) {
      for (const teamName of emp.teamNames) {
        allTeamNames.add(teamName);
      }
    }

    // Create or get teams
    const teamMap = new Map<string, TeamID>();
    for (const teamName of allTeamNames) {
      let team = await this.teams.findOne({ name: teamName });
      if (!team) {
        const teamId = freshID() as TeamID;
        const teamDoc: TeamDoc = {
          _id: teamId,
          name: teamName,
          members: [],
        };
        await this.teams.insertOne(teamDoc);
        teamMap.set(teamName, teamId);
      } else {
        teamMap.set(teamName, team._id);
      }
    }

    // Create or update employees
    for (const empData of sourceData.employees) {
      // Check for circular reporting
      if (empData.manager) {
        const managerEmployee = await this.employees.findOne({
          _id: empData.manager,
        });
        if (managerEmployee && managerEmployee.manager === empData.id) {
          throw new Error(
            `Circular reporting detected: ${empData.id} and ${empData.manager}`,
          );
        }
      }

      const employeeDoc: EmployeeDoc = {
        _id: empData.id,
        email: empData.email,
        manager: empData.manager,
      };

      await this.employees.replaceOne(
        { _id: empData.id },
        employeeDoc,
        { upsert: true },
      );
    }

    // Update team memberships
    for (const empData of sourceData.employees) {
      for (const teamName of empData.teamNames) {
        const teamId = teamMap.get(teamName);
        if (teamId) {
          await this.teams.updateOne(
            { _id: teamId },
            { $addToSet: { members: empData.id } },
          );
        }
      }
    }

    return {};
  }

  /**
   * createEmployee (email: String, team: Team, directReport: Set<Employee>): (employee: Employee)
   * **requires** email is not empty, team exists
   * **effects** create a new Employee with the given email
   */
  async createEmployee({
    email,
    teamId,
    manager,
  }: {
    email: string;
    teamId?: TeamID;
    manager?: Employee;
  }): Promise<{ employee: Employee }> {
    if (!email || email.trim() === "") {
      throw new Error("Email cannot be empty");
    }

    const employeeId = freshID() as Employee;
    const employeeDoc: EmployeeDoc = {
      _id: employeeId,
      email,
      manager,
    };

    await this.employees.insertOne(employeeDoc);

    // Add to team if specified
    if (teamId) {
      const team = await this.teams.findOne({ _id: teamId });
      if (!team) {
        throw new Error("Team not found");
      }
      await this.teams.updateOne(
        { _id: teamId },
        { $addToSet: { members: employeeId } },
      );
    }

    return { employee: employeeId };
  }

  /**
   * createTeam (name: Text, members?: Set<Employee>): (team: Team)
   * **requires** name is not empty, no other team with same name exists
   * **effects** create a new Team with the given name and members, empty if none provided
   */
  async createTeam({
    name,
    members,
  }: {
    name: string;
    members?: Employee[];
  }): Promise<{ team: TeamID }> {
    if (!name || name.trim() === "") {
      throw new Error("Team name cannot be empty");
    }

    const existingTeam = await this.teams.findOne({ name });
    if (existingTeam) {
      throw new Error("Team with this name already exists");
    }

    const teamId = freshID() as TeamID;
    const teamDoc: TeamDoc = {
      _id: teamId,
      name,
      members: members || [],
    };

    await this.teams.insertOne(teamDoc);
    return { team: teamId };
  }

  /**
   * updateManager (employee: Employee, newManager: Employee)
   * **requires** both employees exist and newManager is not a direct report of employee (prevents cycles)
   * **effects** set employee.manager = newManager and update corresponding directReports sets
   */
  async updateManager({
    employee,
    newManager,
  }: {
    employee: Employee;
    newManager: Employee;
  }): Promise<{}> {
    const emp = await this.employees.findOne({ _id: employee });
    if (!emp) {
      throw new Error("Employee not found");
    }

    const manager = await this.employees.findOne({ _id: newManager });
    if (!manager) {
      throw new Error("New manager not found");
    }

    // Check for circular reporting
    if (manager.manager === employee) {
      throw new Error("Cannot create circular reporting relationship");
    }

    await this.employees.updateOne(
      { _id: employee },
      { $set: { manager: newManager } },
    );

    return {};
  }

  /**
   * updateTeam (employee: Employee, newTeam: Team): ()
   * **requires** employee and newTeam exist
   * **effects** move employee to newTeam's members and remove from old team
   */
  async updateTeam({
    employee,
    newTeamId,
  }: {
    employee: Employee;
    newTeamId: TeamID;
  }): Promise<{}> {
    const emp = await this.employees.findOne({ _id: employee });
    if (!emp) {
      throw new Error("Employee not found");
    }

    const newTeam = await this.teams.findOne({ _id: newTeamId });
    if (!newTeam) {
      throw new Error("Team not found");
    }

    // Remove employee from all current teams
    await this.teams.updateMany(
      { members: employee },
      { $pull: { members: employee } },
    );

    // Add employee to new team
    await this.teams.updateOne(
      { _id: newTeamId },
      { $addToSet: { members: employee } },
    );

    return {};
  }

  /**
   * getManager (employee: Employee): (manager: Employee)
   * **requires** employee exists and has a manager
   * **effects** return employee.manager
   */
  async getManager({
    employee,
  }: {
    employee: Employee;
  }): Promise<{ manager: Employee }> {
    const emp = await this.employees.findOne({ _id: employee });
    if (!emp) {
      throw new Error("Employee not found");
    }

    if (!emp.manager) {
      throw new Error("Employee has no manager");
    }

    return { manager: emp.manager };
  }

  /**
   * getDirectReports (employee: Employee): (reports: Set<Employee>)
   * **requires** employee exists
   * **effects** return employee.directReports
   */
  async getDirectReports({
    employee,
  }: {
    employee: Employee;
  }): Promise<{ reports: Employee[] }> {
    const emp = await this.employees.findOne({ _id: employee });
    if (!emp) {
      throw new Error("Employee not found");
    }

    const reports = await this.employees
      .find({ manager: employee })
      .toArray();

    return { reports: reports.map((r: EmployeeDoc) => r._id) };
  }

  /**
   * getPeers (employee: Employee): (peers: Set<Employee>)
   * **requires** employee exists
   * **effects** return all members of employee.team except the employee
   */
  async getPeers({
    employee,
  }: {
    employee: Employee;
  }): Promise<{ peers: Employee[] }> {
    const emp = await this.employees.findOne({ _id: employee });
    if (!emp) {
      throw new Error("Employee not found");
    }

    // Find all teams this employee is a member of
    const teams = await this.teams.find({ members: employee }).toArray();

    // Collect all unique peers from all teams
    const peersSet = new Set<Employee>();
    for (const team of teams) {
      for (const member of team.members) {
        if (member !== employee) {
          peersSet.add(member);
        }
      }
    }

    return { peers: Array.from(peersSet) };
  }

  /**
   * checkKAnonymity (group: Set<Employee>, k: Number): (ok: Boolean)
   * **requires** k > 0
   * **effects** return true if size of group >= k, else false
   */
  async checkKAnonymity({
    group,
    k,
  }: {
    group: Employee[];
    k: number;
  }): Promise<{ ok: boolean }> {
    if (k <= 0) {
      throw new Error("k must be greater than 0");
    }

    return { ok: group.length >= k };
  }

  /**
   * getEmployee (employee: Employee): (employeeData: EmployeeDoc)
   * **requires** employee exists
   * **effects** return employee data
   */
  async getEmployee({
    employee,
  }: {
    employee: Employee;
  }): Promise<{ employeeData: EmployeeDoc }> {
    const emp = await this.employees.findOne({ _id: employee });
    if (!emp) {
      throw new Error("Employee not found");
    }

    return { employeeData: emp };
  }

  /**
   * getAllEmployees (): (employees: Employee[])
   * **effects** return all employees
   */
  async getAllEmployees(): Promise<{ employees: Employee[] }> {
    const employees = await this.employees.find({}).toArray();
    return { employees: employees.map((e: EmployeeDoc) => e._id) };
  }

  /**
   * getTeam (teamId: TeamID): (team: TeamDoc)
   * **requires** team exists
   * **effects** return team data
   */
  async getTeam({
    teamId,
  }: {
    teamId: TeamID;
  }): Promise<{ team: TeamDoc }> {
    const team = await this.teams.findOne({ _id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }

    return { team };
  }

  /**
   * getTeamByName (teamName: string): (team: TeamDoc)
   * **requires** team exists
   * **effects** return team data by name
   */
  async getTeamByName({
    teamName,
  }: {
    teamName: string;
  }): Promise<{ team: TeamDoc }> {
    const team = await this.teams.findOne({ name: teamName });
    if (!team) {
      throw new Error("Team not found");
    }

    return { team };
  }

  /**
   * getTeamsByEmployee (employee: Employee): (teams: Set<Team>)
   * **requires** employee exists
   * **effects** return the teams that employee is a member of
   */
  async getTeamsByEmployee({
    employee,
  }: {
    employee: Employee;
  }): Promise<{ teams: TeamDoc[] }> {
    const emp = await this.employees.findOne({ _id: employee });
    if (!emp) {
      throw new Error("Employee not found");
    }

    const teams = await this.teams.find({ members: employee }).toArray();
    return { teams };
  }

  /**
   * getAllTeams (): (teams: TeamDoc[])
   * **effects** return all teams
   */
  async getAllTeams(): Promise<{ teams: TeamDoc[] }> {
    const teams = await this.teams.find({}).toArray();
    return { teams };
  }

  /**
   * getTeamMembers (teamId: TeamID): (members: Employee[])
   * **requires** team exists
   * **effects** return all members of the team
   */
  async getTeamMembers({
    teamId,
  }: {
    teamId: TeamID;
  }): Promise<{ members: Employee[] }> {
    const team = await this.teams.findOne({ _id: teamId });
    if (!team) {
      throw new Error("Team not found");
    }

    return { members: team.members };
  }
}
