import { testDb } from "@utils/database.ts";
import OrgGraphConcept from "./OrgGraphConcept.ts";
import { ID } from "@utils/types.ts";
import {
  assert,
  assertEquals,
} from "jsr:@std/assert";

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
          { id: alice, teamName: "Engineering" },
          { id: bob, manager: alice, teamName: "Engineering" },
          { id: carol, manager: alice, teamName: "Engineering" },
        ],
      },
    });

    const { employeeData } = await org.getEmployee({ employee: alice });
    assertEquals(employeeData._id, alice);

    const { team } = await org.getTeamByName({ teamName: "Engineering" });
    assertEquals(team.name, "Engineering");
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
          { id: alice, teamName: "Engineering" },
          { id: bob, manager: alice, teamName: "Engineering" },
          { id: carol, manager: alice, teamName: "Engineering" },
        ],
      },
    });

    const { manager } = await org.getManager({ employee: bob });
    assertEquals(manager, alice);

    const { peers } = await org.getPeers({ employee: bob });
    assertEquals(peers.sort(), [carol].sort());

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

