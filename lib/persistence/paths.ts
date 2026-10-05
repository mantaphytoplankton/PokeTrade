import path from "node:path";

// DATA_ROOT is overridable so integration tests point at an isolated temp
// directory instead of the real data/ folder (common-test-strategy: "test DB
// or isolated data dir over silent no-op mocks for persistence").
export function dataRoot(): string {
  return process.env.POKETRADE_DATA_ROOT ?? path.join(process.cwd(), "data");
}

export function userDir(userId: string): string {
  return path.join(dataRoot(), "users", userId);
}

export function userProfilePath(userId: string): string {
  return path.join(userDir(userId), "profile.json");
}

export function userCollectionPath(userId: string): string {
  return path.join(userDir(userId), "collection.json");
}

export function userUploadDir(userId: string): string {
  return path.join(userDir(userId), "uploads");
}

export function emailIndexPath(): string {
  return path.join(dataRoot(), "users", "_index", "email-to-id.json");
}

export function cacheDir(...segments: string[]): string {
  return path.join(dataRoot(), "cache", ...segments);
}
