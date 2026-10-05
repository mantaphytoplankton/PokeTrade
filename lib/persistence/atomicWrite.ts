import { randomBytes } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Local JSON persistence (no database, per tech-spec.md). Every write goes
// through here: write to a temp file, then rename over the target. rename()
// is atomic on the same filesystem, so a crash mid-write never leaves a
// reader looking at a half-written file.
export async function atomicWriteJson(filePath: string, data: unknown): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.tmp-${randomBytes(6).toString("hex")}`;
  await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await rename(tmpPath, filePath);
}

export async function readJson<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    if (isNotFoundError(err)) return null;
    throw err;
  }
}

export async function deleteFileIfExists(filePath: string): Promise<void> {
  try {
    await unlink(filePath);
  } catch (err) {
    if (!isNotFoundError(err)) throw err;
  }
}

function isNotFoundError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code: unknown }).code === "ENOENT";
}
