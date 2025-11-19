import { testDb } from "@utils/database.ts";
import ReviewCycleConcept from "./ReviewCycleConcept.ts";
import { ID } from "@utils/types.ts";
import {
  assert,
  assertEquals,
  assertRejects,
} from "jsr:@std/assert";

const creator = "creator-1" as ID;
const form = "form-1" as ID;
const targetA = "target-A" as ID;
const targetB = "target-B" as ID;

Deno.test("ReviewCycle: createCycle happy path", async () => {
  const [db, client] = await testDb();
  try {
    const review = new ReviewCycleConcept(db);

    const startDate = new Date("2025-01-01").toISOString();
    const endDate = new Date("2025-02-01").toISOString();

    const { cycle } = await review.createCycle({
      creator,
      form,
      startDate,
      endDate,
    });

    assert(cycle);

    const { cycleData } = await review.getCycle({ cycle });
    assertEquals(cycleData.createdBy, creator);
    assertEquals(cycleData.form, form);
    assertEquals(cycleData.isActive, false);
  } finally {
    await client.close();
  }
});

Deno.test("ReviewCycle: createCycle validates dates", async () => {
  const [db, client] = await testDb();
  try {
    const review = new ReviewCycleConcept(db);

    const startDate = new Date("2025-02-01").toISOString();
    const endDate = new Date("2025-01-01").toISOString();

    await assertRejects(
      () =>
        review.createCycle({
          creator,
          form,
          startDate,
          endDate,
        }),
      Error,
      "Start date must be before end date",
    );
  } finally {
    await client.close();
  }
});

Deno.test("ReviewCycle: configureAssignments for targets", async () => {
  const [db, client] = await testDb();
  try {
    const review = new ReviewCycleConcept(db);

    const startDate = new Date("2025-01-01").toISOString();
    const endDate = new Date("2025-02-01").toISOString();

    const { cycle } = await review.createCycle({
      creator,
      form,
      startDate,
      endDate,
    });

    await review.configureAssignments({
      cycle,
      targets: [targetA, targetB],
    });

    const { cycleData } = await review.getCycle({ cycle });
    assertEquals(cycleData.assignments.length, 2);
    assertEquals(cycleData.assignments[0].status, "pending");
  } finally {
    await client.close();
  }
});

