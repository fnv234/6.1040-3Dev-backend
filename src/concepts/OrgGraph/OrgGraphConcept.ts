import { Collection, Db } from "npm:mongodb";
import { freshID } from "@utils/database.ts";
import { ID } from "@utils/types.ts";

const PREFIX = "OrgGraph" + ".";

// --- Type Definitions ---
type Employee = ID;
type TeamID = ID;

interface EmployeeDoc {
  _id: Employee;
  manager?: Employee;
  team: TeamID;
}

interface TeamDoc {
  _id: TeamID;
  name: string;
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
        manager?: Employee;
        teamName: string;
      }>;
    };
  }): Promise<{}> {
    // First, create or update teams
    const teamNames = [...new Set(sourceData.employees.map(emp => emp.teamName))];
    const teamMap = new Map<string, TeamID>();

    for (const teamName of teamNames) {
      let team = await this.teams.findOne({ name: teamName });
      if (!team) {
        const teamId = freshID() as TeamID;
        const teamDoc: TeamDoc = {
          _id: teamId,
          name: teamName,
        };
        await this.teams.insertOne(teamDoc);
        teamMap.set(teamName, teamId);
      } else {
        teamMap.set(teamName, team._id);
      }
    }

    // Then, create or update employees
    for (const empData of sourceData.employees) {
      const teamId = teamMap.get(empData.teamName);
      if (!teamId) {
        throw new Error(`Team not found: ${empData.teamName}`);
      }

      // Check for circular reporting (manager cannot be a direct report)
      if (empData.manager) {
        const managerEmployee = await this.employees.findOne({ _id: empData.manager });
        if (managerEmployee && managerEmployee.manager === empData.id) {
          throw new Error(`Circular reporting detected: ${empData.id} and ${empData.manager}`);
        }
      }

      const employeeDoc: EmployeeDoc = {
        _id: empData.id,
        manager: empData.manager,
        team: teamId,
      };

      await this.employees.replaceOne(
        { _id: empData.id },
        employeeDoc,
        { upsert: true }
      );
    }

    return {};
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
      { $set: { manager: newManager } }
    );

    return {};
  }

  /**
   * updateTeam (employee: Employee, newTeam: Team)
   * **requires** employee and newTeam exist
   * **effects** move employee to newTeam's members and remove from old team
   */
  async updateTeam({
    employee,
    newTeamName,
  }: {
    employee: Employee;
    newTeamName: string;
  }): Promise<{}> {
    const emp = await this.employees.findOne({ _id: employee });
    if (!emp) {
      throw new Error("Employee not found");
    }

    let team = await this.teams.findOne({ name: newTeamName });
    if (!team) {
      // Create new team if it doesn't exist
      const teamId = freshID() as TeamID;
      const teamDoc: TeamDoc = {
        _id: teamId,
        name: newTeamName,
      };
      await this.teams.insertOne(teamDoc);
      team = teamDoc;
    }

    await this.employees.updateOne(
      { _id: employee },
      { $set: { team: team._id } }
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

    // Peers are defined as employees who share the same manager,
    // excluding the employee themselves.
    if (!emp.manager) {
      return { peers: [] };
    }

    const peers = await this.employees
      .find({
        manager: emp.manager,
        _id: { $ne: employee },
      })
      .toArray();

    return { peers: peers.map((p: EmployeeDoc) => p._id) };
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
    const members = await this.employees
      .find({ team: teamId })
      .toArray();

    return { members: members.map((m: EmployeeDoc) => m._id) };
  }
}