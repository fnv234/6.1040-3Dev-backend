import { testDb } from "@utils/database.ts";
import RequestingConcept from "./RequestingConcept.ts";
import { ID } from "@utils/types.ts";
import { assert, assertEquals } from "jsr:@std/assert";

Deno.test("Requesting: request stores request and returns id", async () => {
  const [db, client] = await testDb();
  try {
    const requesting = new RequestingConcept(db);

    const input = { path: "/Test/route", foo: "bar" } as {
      path: string;
      [key: string]: unknown;
    };

    const { request } = await requesting.request(input);
    assert(request);

    // Verify it can be retrieved via internal collection query
    const collection = (db as any).collection("Requesting.requests");
    const doc = await collection.findOne({ _id: request as ID });
    assert(doc);
+    assertEquals(doc.input.path, "/Test/route");
  } finally {
    await client.close();
  }
});
