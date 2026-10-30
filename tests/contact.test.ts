import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { app } from "../server/src/app";
import { contactSchema } from "../shared/contact";
const valid = {
  name: "Test Visitor",
  email: "test@example.com",
  organization: "Test only",
  subject: "Product inquiry test",
  message: "This is an automated local test.",
  website: "",
};
test("shared validation rejects malformed inputs and honeypot spam", () => {
  for (const data of [
    { ...valid, email: "invalid" },
    { ...valid, message: "short" },
    { ...valid, website: "spam" },
    { ...valid, message: "a".repeat(5001) },
  ])
    assert.equal(contactSchema.safeParse(data).success, false);
  assert.equal(contactSchema.safeParse(valid).success, true);
});
test("API persists, rejects invalid requests, limits spam, and handles storage failures", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tsi-test-"));
  process.env.INQUIRY_DATA_DIR = dir;
  delete process.env.MONGODB_URI;
  delete process.env.SMTP_HOST;
  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address() as { port: number };
  const url = `http://127.0.0.1:${address.port}`;
  const post = (body: unknown) =>
    fetch(url + "/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  try {
    assert.equal((await fetch(url + "/api/health")).status, 200);
    assert.equal((await post({ ...valid, email: "bad" })).status, 400);
    assert.equal((await post({ ...valid, website: "bot" })).status, 400);
    const response = await post(valid);
    assert.equal(response.status, 201);
    const result = await response.json();
    const saved = JSON.parse(
      (await readFile(join(dir, "inquiries.jsonl"), "utf8")).trim(),
    );
    assert.equal(saved.reference, result.reference);
    assert.equal(saved.email, valid.email);
    assert.equal("website" in saved, false);
    process.env.INQUIRY_DATA_DIR = join(
      dir,
      "inquiries.jsonl",
      "not-a-directory",
    );
    assert.equal((await post(valid)).status, 503);
    assert.equal((await post({ ...valid, name: "" })).status, 400);
    assert.equal((await post(valid)).status, 429);
    assert.equal((await fetch(url + "/api/unknown")).status, 404);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(dir, { recursive: true, force: true });
    delete process.env.INQUIRY_DATA_DIR;
  }
});
