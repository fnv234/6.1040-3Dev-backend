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
