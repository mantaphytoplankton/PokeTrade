import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { atomicWriteJson, readJson, deleteFileIfExists } from "./atomicWrite";

describe("atomicWriteJson / readJson", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "poketrade-persist-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns null when the file does not exist", async () => {
    const result = await readJson(path.join(dir, "missing.json"));
    expect(result).toBeNull();
  });

  it("round-trips a written value, creating parent directories", async () => {
    const target = path.join(dir, "nested", "entry.json");
    await atomicWriteJson(target, { hello: "world" });
    const result = await readJson<{ hello: string }>(target);
    expect(result).toEqual({ hello: "world" });
  });

  it("overwrites an existing file rather than merging", async () => {
    const target = path.join(dir, "entry.json");
    await atomicWriteJson(target, { a: 1 });
    await atomicWriteJson(target, { b: 2 });
    const result = await readJson(target);
    expect(result).toEqual({ b: 2 });
  });

  it("leaves no .tmp- files behind after a successful write", async () => {
    const target = path.join(dir, "entry.json");
    await atomicWriteJson(target, { a: 1 });
    const { readdir } = await import("node:fs/promises");
    const files = await readdir(dir);
    expect(files.every((f) => !f.includes(".tmp-"))).toBe(true);
  });

  it("deleteFileIfExists is a no-op for a missing file", async () => {
    await expect(deleteFileIfExists(path.join(dir, "missing.json"))).resolves.toBeUndefined();
  });

  it("deleteFileIfExists removes an existing file", async () => {
    const target = path.join(dir, "entry.json");
    await atomicWriteJson(target, { a: 1 });
    await deleteFileIfExists(target);
    expect(await readJson(target)).toBeNull();
  });
});
