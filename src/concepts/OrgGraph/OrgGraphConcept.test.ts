import { testDb } from "@utils/database.ts";
import OrgGraphConcept from "./OrgGraphConcept.ts";
import { ID } from "@utils/types.ts";
import { assert, assertEquals } from "jsr:@std/assert";

const alice = "alice" as ID;
const bob = "bob" as ID;
const carol = "carol" as ID;

Deno.test("OrgGraph: importRoster creates teams and employees", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);

    await org.importRoster({
      sourceData: {
        employees: [
          { id: alice, email: "alice@example.com", teamNames: ["Engineering"] },
          {
            id: bob,
            email: "bob@example.com",
            manager: alice,
            teamNames: ["Engineering"],
          },
          {
            id: carol,
            email: "carol@example.com",
            manager: alice,
            teamNames: ["Engineering"],
          },
        ],
      },
    });

    const { employeeData } = await org.getEmployee({ employee: alice });
    assertEquals(employeeData._id, alice);
    assertEquals(employeeData.email, "alice@example.com");

    const { team } = await org.getTeamByName({ teamName: "Engineering" });
    assertEquals(team.name, "Engineering");
    assertEquals(team.members.sort(), [alice, bob, carol].sort());
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: getManager, getPeers, and getDirectReports", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);

    await org.importRoster({
      sourceData: {
        employees: [
          { id: alice, email: "alice@example.com", teamNames: ["Engineering"] },
          {
            id: bob,
            email: "bob@example.com",
            manager: alice,
            teamNames: ["Engineering"],
          },
          {
            id: carol,
            email: "carol@example.com",
            manager: alice,
            teamNames: ["Engineering"],
          },
        ],
      },
    });

    const { manager } = await org.getManager({ employee: bob });
    assertEquals(manager, alice);

    const { peers } = await org.getPeers({ employee: bob });
    assertEquals(peers.sort(), [alice, carol].sort());

    const { reports } = await org.getDirectReports({ employee: alice });
    assertEquals(reports.sort(), [bob, carol].sort());
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: checkKAnonymity", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);

    const { ok: okSmall } = await org.checkKAnonymity({
      group: [alice],
      k: 2,
    });
    assertEquals(okSmall, false);

    const { ok: okLarge } = await org.checkKAnonymity({
      group: [alice, bob, carol],
      k: 2,
    });
    assertEquals(okLarge, true);
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: createEmployee and createTeam", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);

    // Create a team
    const { team: teamId } = await org.createTeam({
      name: "Product",
      members: [],
    });

    // Create an employee
    const { employee: empId } = await org.createEmployee({
      email: "newperson@example.com",
      teamId,
    });

    // Verify employee was created
    const { employeeData } = await org.getEmployee({ employee: empId });
    assertEquals(employeeData.email, "newperson@example.com");

    // Verify employee is in team
    const { members } = await org.getTeamMembers({ teamId });
    assertEquals(members, [empId]);
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: getTeamsByEmployee", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);

    await org.importRoster({
      sourceData: {
        employees: [
          {
            id: alice,
            email: "alice@example.com",
            teamNames: ["Engineering", "Leadership"],
          },
          { id: bob, email: "bob@example.com", teamNames: ["Engineering"] },
        ],
      },
    });

    const { teams } = await org.getTeamsByEmployee({ employee: alice });
    assertEquals(teams.length, 2);
    assertEquals(
      teams.map((t) => t.name).sort(),
      ["Engineering", "Leadership"].sort(),
    );

    const { teams: bobTeams } = await org.getTeamsByEmployee({ employee: bob });
    assertEquals(bobTeams.length, 1);
    assertEquals(bobTeams[0].name, "Engineering");
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: createTeam with owner scoping", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);
    const owner1 = "admin1" as ID;
    const owner2 = "admin2" as ID;

    // Create teams with same name but different owners
    const { team: team1Id } = await org.createTeam({
      name: "Sales",
      members: [alice],
      owner: owner1,
    });

    const { team: team2Id } = await org.createTeam({
      name: "Sales",
      members: [bob],
      owner: owner2,
    });

    // Both teams should exist with same name but different IDs
    assert(team1Id !== team2Id);

    // Verify teams are scoped by owner
    const { teams: owner1Teams } = await org.getAllTeams({ owner: owner1 });
    assertEquals(owner1Teams.length, 1);
    assertEquals(owner1Teams[0].name, "Sales");
    assertEquals(owner1Teams[0].owner, owner1);

    const { teams: owner2Teams } = await org.getAllTeams({ owner: owner2 });
    assertEquals(owner2Teams.length, 1);
    assertEquals(owner2Teams[0].name, "Sales");
    assertEquals(owner2Teams[0].owner, owner2);

    // Verify duplicate team name check is scoped by owner
    try {
      await org.createTeam({
        name: "Sales",
        members: [],
        owner: owner1,
      });
      assert(false, "Should have thrown error for duplicate team name");
    } catch (e) {
      assertEquals((e as Error).message, "Team with this name already exists");
    }
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: createTeamWithRoles with owner scoping", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);
    const owner = "admin1" as ID;

    // Create team with roles
    const { team: teamId } = await org.createTeamWithRoles({
      name: "Marketing",
      members: [alice, bob],
      membersWithRoles: [
        { memberId: alice, role: "manager" },
        { memberId: bob, role: "contributor" },
      ],
      owner,
    });

    // Verify team was created with roles
    const { team } = await org.getTeam({ teamId });
    assertEquals(team.name, "Marketing");
    assertEquals(team.owner, owner);
    assertEquals(team.members.sort(), [alice, bob].sort());
    assertEquals(team.membersWithRoles?.length, 2);
    assert(
      team.membersWithRoles?.some((m) =>
        m.memberId === alice && m.role === "manager"
      ),
    );
    assert(
      team.membersWithRoles?.some((m) =>
        m.memberId === bob && m.role === "contributor"
      ),
    );
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: updateTeamInfo", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);
    const owner = "admin1" as ID;

    // Create initial team
    const { team: teamId } = await org.createTeamWithRoles({
      name: "Engineering",
      members: [alice],
      membersWithRoles: [{ memberId: alice, role: "engineer" }],
      owner,
    });

    // Update team name
    await org.updateTeamInfo({
      teamId,
      updates: { name: "Software Engineering" },
      owner,
    });

    let { team } = await org.getTeam({ teamId });
    assertEquals(team.name, "Software Engineering");

    // Update team members
    await org.updateTeamInfo({
      teamId,
      updates: {
        members: [alice, bob, carol],
        membersWithRoles: [
          { memberId: alice, role: "lead" },
          { memberId: bob, role: "engineer" },
          { memberId: carol, role: "engineer" },
        ],
      },
      owner,
    });

    ({ team } = await org.getTeam({ teamId }));
    assertEquals(team.members.sort(), [alice, bob, carol].sort());
    assertEquals(team.membersWithRoles?.length, 3);
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: updateTeamInfo enforces owner scoping", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);
    const owner1 = "admin1" as ID;
    const owner2 = "admin2" as ID;

    // Create team owned by admin1
    const { team: teamId } = await org.createTeam({
      name: "Finance",
      members: [alice],
      owner: owner1,
    });

    // Try to update team as admin2 (should fail)
    try {
      await org.updateTeamInfo({
        teamId,
        updates: { name: "Updated Finance" },
        owner: owner2,
      });
      assert(false, "Should have thrown error for unauthorized update");
    } catch (e) {
      assertEquals(
        (e as Error).message,
        "Team not found or not owned by this admin",
      );
    }

    // Verify team was not updated
    const { team } = await org.getTeam({ teamId });
    assertEquals(team.name, "Finance");
    assertEquals(team.owner, owner1);
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: updateTeamInfo prevents duplicate names within owner scope", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);
    const owner = "admin1" as ID;

    // Create two teams
    await org.createTeam({
      name: "Team A",
      members: [],
      owner,
    });

    const { team: team2Id } = await org.createTeam({
      name: "Team B",
      members: [],
      owner,
    });

    // Try to rename Team B to Team A (should fail)
    try {
      await org.updateTeamInfo({
        teamId: team2Id,
        updates: { name: "Team A" },
        owner,
      });
      assert(false, "Should have thrown error for duplicate team name");
    } catch (e) {
      assertEquals(
        (e as Error).message,
        "A team with this name already exists",
      );
    }

    // Verify Team B was not renamed
    const { team } = await org.getTeam({ teamId: team2Id });
    assertEquals(team.name, "Team B");
  } finally {
    await client.close();
  }
});

Deno.test("OrgGraph: deleteTeam with owner scoping", async () => {
  const [db, client] = await testDb();
  try {
    const org = new OrgGraphConcept(db);
    const owner1 = "admin1" as ID;
    const owner2 = "admin2" as ID;

    // Create team owned by admin1
    const { team: teamId } = await org.createTeam({
      name: "Operations",
      members: [alice],
      owner: owner1,
    });

    // Try to delete as admin2 (should fail)
    try {
      await org.deleteTeam({ teamId, owner: owner2 });
      assert(false, "Should have thrown error for unauthorized deletion");
    } catch (e) {
      assertEquals(
        (e as Error).message,
        "Team not found or not owned by this admin",
      );
    }

    // Verify team still exists
    const { team } = await org.getTeam({ teamId });
    assertEquals(team.name, "Operations");

    // Delete as admin1 (should succeed)
    await org.deleteTeam({ teamId, owner: owner1 });

    // Verify team is deleted
    try {
      await org.getTeam({ teamId });
      assert(false, "Should have thrown error for deleted team");
    } catch (e) {
      assertEquals((e as Error).message, "Team not found");
    }
  } finally {
    await client.close();
  }
});
