import { testDb } from "@utils/database.ts";
import AccessCodeConcept from "./AccessCodeConcept.ts";
import { assert, assertEquals, assertRejects } from "jsr:@std/assert";
import type { ID } from "@utils/types.ts";

const testAccessCode = "TEST-CODE-123";
const testFormId = "form123" as ID;
const testTeamId = "team456" as ID;
const testMemberId = "member789";
const testMemberEmail = "member@example.com";
const testMemberRole = "developer";
const testCreator = "creator123" as ID;

const sampleResponses = {
  0: "Excellent communication",
  1: "Strong technical skills",
  2: "Very helpful and collaborative",
};

Deno.test("AccessCode: should create an access code", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    const result = await accessCode.createAccessCode({
      accessCode: testAccessCode,
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      memberRole: testMemberRole,
      createdBy: testCreator,
    });

    assert(result.accessCodeId);
    assertEquals(typeof result.accessCodeId, "string");
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should create access code without role", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    const result = await accessCode.createAccessCode({
      accessCode: "CODE-NO-ROLE",
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      createdBy: testCreator,
    });

    assert(result.accessCodeId);
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should not create duplicate access code", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await accessCode.createAccessCode({
      accessCode: testAccessCode,
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      createdBy: testCreator,
    });

    await assertRejects(
      () =>
        accessCode.createAccessCode({
          accessCode: testAccessCode,
          formId: "differentForm" as ID,
          teamId: testTeamId,
          memberId: "differentMember",
          memberEmail: "different@example.com",
          createdBy: testCreator,
        }),
      Error,
      "Access code already exists",
    );
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should get access code info", async () => {
  const [db, client] = await testDb();
  try {
    const accessCodeConcept = new AccessCodeConcept(db);

    await accessCodeConcept.createAccessCode({
      accessCode: testAccessCode,
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      memberRole: testMemberRole,
      createdBy: testCreator,
    });

    const result = await accessCodeConcept.getAccessCodeInfo({
      accessCode: testAccessCode,
    });

    assertEquals(result.accessCodeInfo.accessCode, testAccessCode);
    assertEquals(result.accessCodeInfo.formId, testFormId);
    assertEquals(result.accessCodeInfo.teamId, testTeamId);
    assertEquals(result.accessCodeInfo.memberId, testMemberId);
    assertEquals(result.accessCodeInfo.memberEmail, testMemberEmail);
    assertEquals(result.accessCodeInfo.memberRole, testMemberRole);
    assertEquals(result.accessCodeInfo.used, false);
    assert(result.accessCodeInfo.createdDate);
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should throw error for invalid access code", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await assertRejects(
      () =>
        accessCode.getAccessCodeInfo({
          accessCode: "INVALID-CODE",
        }),
      Error,
      "Invalid access code",
    );
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should submit form response", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await accessCode.createAccessCode({
      accessCode: testAccessCode,
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      createdBy: testCreator,
    });

    const result = await accessCode.submitFormResponse({
      accessCode: testAccessCode,
      responses: sampleResponses,
    });

    assert(result.responseId);
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should mark access code as used after submission", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await accessCode.createAccessCode({
      accessCode: testAccessCode,
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      createdBy: testCreator,
    });

    await accessCode.submitFormResponse({
      accessCode: testAccessCode,
      responses: sampleResponses,
    });

    const info = await accessCode.getAccessCodeInfo({
      accessCode: testAccessCode,
    });

    assertEquals(info.accessCodeInfo.used, true);
    assert(info.accessCodeInfo.usedDate);
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should not allow resubmission with used access code", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await accessCode.createAccessCode({
      accessCode: testAccessCode,
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      createdBy: testCreator,
    });

    await accessCode.submitFormResponse({
      accessCode: testAccessCode,
      responses: sampleResponses,
    });

    await assertRejects(
      () =>
        accessCode.submitFormResponse({
          accessCode: testAccessCode,
          responses: sampleResponses,
        }),
      Error,
      "Access code has already been used",
    );
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should not submit with invalid access code", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await assertRejects(
      () =>
        accessCode.submitFormResponse({
          accessCode: "INVALID-CODE",
          responses: sampleResponses,
        }),
      Error,
      "Invalid access code",
    );
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should not submit with empty response", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await accessCode.createAccessCode({
      accessCode: testAccessCode,
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      createdBy: testCreator,
    });

    await assertRejects(
      () =>
        accessCode.submitFormResponse({
          accessCode: testAccessCode,
          responses: { 0: "Good answer", 1: "" },
        }),
      Error,
      "Response required for question 2",
    );
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should get form responses by form ID", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    // Create multiple access codes and responses
    await accessCode.createAccessCode({
      accessCode: "CODE-1",
      formId: testFormId,
      teamId: testTeamId,
      memberId: "member1",
      memberEmail: "member1@example.com",
      createdBy: testCreator,
    });

    await accessCode.createAccessCode({
      accessCode: "CODE-2",
      formId: testFormId,
      teamId: testTeamId,
      memberId: "member2",
      memberEmail: "member2@example.com",
      createdBy: testCreator,
    });

    await accessCode.submitFormResponse({
      accessCode: "CODE-1",
      responses: sampleResponses,
    });

    await accessCode.submitFormResponse({
      accessCode: "CODE-2",
      responses: sampleResponses,
    });

    const result = await accessCode.getFormResponses({
      formId: testFormId,
      createdBy: testCreator,
    });

    assertEquals(result.responses.length, 2);
    assertEquals(result.responses[0].formId, testFormId);
    assertEquals(result.responses[1].formId, testFormId);
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should not get responses if user is not creator", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await accessCode.createAccessCode({
      accessCode: testAccessCode,
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      createdBy: testCreator,
    });

    await assertRejects(
      () =>
        accessCode.getFormResponses({
          formId: testFormId,
          createdBy: "different-creator" as ID,
        }),
      Error,
      "No access found to form responses",
    );
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should get access codes by form ID", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await accessCode.createAccessCode({
      accessCode: "CODE-1",
      formId: testFormId,
      teamId: testTeamId,
      memberId: "member1",
      memberEmail: "member1@example.com",
      createdBy: testCreator,
    });

    await accessCode.createAccessCode({
      accessCode: "CODE-2",
      formId: testFormId,
      teamId: testTeamId,
      memberId: "member2",
      memberEmail: "member2@example.com",
      createdBy: testCreator,
    });

    const result = await accessCode.getAccessCodesByForm({
      formId: testFormId,
      createdBy: testCreator,
    });

    assertEquals(result.accessCodes.length, 2);
    assertEquals(result.accessCodes[0].accessCode, "CODE-2"); // Sorted by date descending
    assertEquals(result.accessCodes[1].accessCode, "CODE-1");
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should create bulk access codes", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    const members = [
      {
        memberId: "member1",
        memberEmail: "member1@example.com",
        memberRole: "developer",
        accessCode: "BULK-CODE-1",
      },
      {
        memberId: "member2",
        memberEmail: "member2@example.com",
        memberRole: "manager",
        accessCode: "BULK-CODE-2",
      },
      {
        memberId: "member3",
        memberEmail: "member3@example.com",
        accessCode: "BULK-CODE-3",
      },
    ];

    const result = await accessCode.createBulkAccessCodes({
      formId: testFormId,
      teamId: testTeamId,
      members,
      createdBy: testCreator,
    });

    assertEquals(result.accessCodeIds.length, 3);

    // Verify all codes were created
    const info1 = await accessCode.getAccessCodeInfo({
      accessCode: "BULK-CODE-1",
    });
    assertEquals(info1.accessCodeInfo.memberId, "member1");

    const info2 = await accessCode.getAccessCodeInfo({
      accessCode: "BULK-CODE-2",
    });
    assertEquals(info2.accessCodeInfo.memberRole, "manager");
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should not create bulk codes with empty members", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await assertRejects(
      () =>
        accessCode.createBulkAccessCodes({
          formId: testFormId,
          teamId: testTeamId,
          members: [],
          createdBy: testCreator,
        }),
      Error,
      "Members array cannot be empty",
    );
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should not create bulk codes with duplicate codes", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    // First, create one access code
    await accessCode.createAccessCode({
      accessCode: "DUPLICATE-CODE",
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      createdBy: testCreator,
    });

    // Try to create bulk with the same code
    await assertRejects(
      () =>
        accessCode.createBulkAccessCodes({
          formId: testFormId,
          teamId: testTeamId,
          members: [
            {
              memberId: "member1",
              memberEmail: "member1@example.com",
              accessCode: "DUPLICATE-CODE",
            },
          ],
          createdBy: testCreator,
        }),
      Error,
      "Access codes already exist",
    );
  } finally {
    await client.close();
  }
});

Deno.test("AccessCode: should preserve member information in form response", async () => {
  const [db, client] = await testDb();
  try {
    const accessCode = new AccessCodeConcept(db);

    await accessCode.createAccessCode({
      accessCode: testAccessCode,
      formId: testFormId,
      teamId: testTeamId,
      memberId: testMemberId,
      memberEmail: testMemberEmail,
      memberRole: testMemberRole,
      createdBy: testCreator,
    });

    await accessCode.submitFormResponse({
      accessCode: testAccessCode,
      responses: sampleResponses,
    });

    const result = await accessCode.getFormResponses({
      formId: testFormId,
      createdBy: testCreator,
    });

    assertEquals(result.responses[0].memberId, testMemberId);
    assertEquals(result.responses[0].memberEmail, testMemberEmail);
    assertEquals(result.responses[0].memberRole, testMemberRole);
    assertEquals(result.responses[0].teamId, testTeamId);
    assert(result.responses[0].submittedDate);
  } finally {
    await client.close();
  }
});
