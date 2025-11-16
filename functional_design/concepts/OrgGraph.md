# concept: OrgGraph[Employee]
  
  **purpose**
  
    maintain an up-to-date organizational hierarchy that supports role-aware reviewer selection
    and enables privacy (k-anonymity) checks for feedback aggregation.

  **principle**

    HR imports or syncs an org chart containing employees and reporting lines;
    each employee has a manager (except top-level leadership) and belongs to a team;
    the system uses this graph to determine managers, direct reports, and peers;
    reviewer sets are constructed from these relationships;
    and privacy checks ensure groups are large enough before identified data is shown.

  **state**

    a set of Employees with
      an id Identifier
      a manager optional Employee
      a team Team
      a set of directReports Employees

    a set of Teams with
      a name Text
      a set of members Employees

  **actions**

    importRoster (sourceData: File)
      **requires** sourceData is a valid roster containing employee ids, managers, and teams
      **effects** create or update Employees and Teams so that reporting lines and membership reflect the sourceData

    updateManager (employee: Employee, newManager: Employee)
      **requires** both employees exist and newManager is not a direct report of employee (prevents cycles)
      **effects** set employee.manager = newManager and update corresponding directReports sets

    updateTeam (employee: Employee, newTeam: Team)
      **requires** employee and newTeam exist
      **effects** move employee to newTeam's members and remove from old team

    getManager (employee: Employee): (manager: Employee)
      **requires** employee exists and has a manager
      **effects** return employee.manager

    getDirectReports (employee: Employee): (reports: Set<Employee>)
      **requires** employee exists
      **effects** return employee.directReports

    getPeers (employee: Employee): (peers: Set<Employee>)
      **requires** employee exists
      **effects** return all members of employee.team except the employee

    checkKAnonymity (group: Set<Employee>, k: Number): (ok: Boolean)
      **requires** k > 0
      **effects** return true if size of group >= k, else false

