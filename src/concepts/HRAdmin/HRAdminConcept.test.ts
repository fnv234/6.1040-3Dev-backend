import { testDb } from "@utils/database.ts";
import HRAdminConcept from "./HRAdminConcept.ts";
import { assert, assertEquals, assertRejects } from "jsr:@std/assert";

const testEmail1 = "admin1@example.com";
const testEmail2 = "admin2@example.com";
const testPassword = "securePassword123";
const wrongPassword = "wrongPassword";

Deno.test("HRAdmin: should register a new HRAdmin", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    const result = await hrAdmin.registerHRAdmin({
      email: testEmail1,
      password: testPassword,
    });

    assert(result.hrAdmin);
    assertEquals(typeof result.hrAdmin, "string");
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should not register with empty email", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    await assertRejects(
      () =>
        hrAdmin.registerHRAdmin({
          email: "",
          password: testPassword,
        }),
      Error,
      "Email cannot be empty",
    );
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should not register with empty password", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    await assertRejects(
      () =>
        hrAdmin.registerHRAdmin({
          email: testEmail1,
          password: "",
        }),
      Error,
      "Password cannot be empty",
    );
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should not register duplicate email", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    await hrAdmin.registerHRAdmin({
      email: testEmail1,
      password: testPassword,
    });

    await assertRejects(
      () =>
        hrAdmin.registerHRAdmin({
          email: testEmail1,
          password: "differentPassword",
        }),
      Error,
      "HR Admin with email already exists",
    );
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should authenticate with correct credentials", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    const { hrAdmin: adminId } = await hrAdmin.registerHRAdmin({
      email: testEmail1,
      password: testPassword,
    });

    const result = await hrAdmin.authenticateHRAdmin({
      email: testEmail1,
      password: testPassword,
    });

    assertEquals(result.hrAdmin, adminId);
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should not authenticate with wrong password", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    await hrAdmin.registerHRAdmin({
      email: testEmail1,
      password: testPassword,
    });

    await assertRejects(
      () =>
        hrAdmin.authenticateHRAdmin({
          email: testEmail1,
          password: wrongPassword,
        }),
      Error,
      "Invalid email or password",
    );
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should not authenticate with non-existent email", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    await assertRejects(
      () =>
        hrAdmin.authenticateHRAdmin({
          email: "nonexistent@example.com",
          password: testPassword,
        }),
      Error,
      "Invalid email or password",
    );
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should not authenticate with empty email", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    await assertRejects(
      () =>
        hrAdmin.authenticateHRAdmin({
          email: "",
          password: testPassword,
        }),
      Error,
      "Email cannot be empty",
    );
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should not authenticate with empty password", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    await assertRejects(
      () =>
        hrAdmin.authenticateHRAdmin({
          email: testEmail1,
          password: "",
        }),
      Error,
      "Password cannot be empty",
    );
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should get HRAdmin data by ID", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    const { hrAdmin: adminId } = await hrAdmin.registerHRAdmin({
      email: testEmail1,
      password: testPassword,
    });

    const result = await hrAdmin.getHRAdmin({ hrAdminId: adminId });

    assertEquals(result.hrAdminData._id, adminId);
    assertEquals(result.hrAdminData.email, testEmail1);
    // Password should not be included in the returned data
    assertEquals("password" in result.hrAdminData, false);
  } finally {
    await client.close();
  }
});

Deno.test("HRAdmin: should handle multiple HRAdmins", async () => {
  const [db, client] = await testDb();
  try {
    const hrAdmin = new HRAdminConcept(db);

    const { hrAdmin: admin1Id } = await hrAdmin.registerHRAdmin({
      email: testEmail1,
      password: testPassword,
    });

    const { hrAdmin: admin2Id } = await hrAdmin.registerHRAdmin({
      email: testEmail2,
      password: testPassword,
    });

    assert(admin1Id !== admin2Id);

    // Authenticate both
    const auth1 = await hrAdmin.authenticateHRAdmin({
      email: testEmail1,
      password: testPassword,
    });

    const auth2 = await hrAdmin.authenticateHRAdmin({
      email: testEmail2,
      password: testPassword,
    });

    assertEquals(auth1.hrAdmin, admin1Id);
    assertEquals(auth2.hrAdmin, admin2Id);
  } finally {
    await client.close();
  }
});
