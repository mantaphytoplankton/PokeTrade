import { describe, expect, it } from "vitest";
import { sortEntriesByName } from "./sortByName";

function entry(name: string) {
  return { name };
}

describe("sortEntriesByName", () => {
  it("returns the input unchanged (same order) when direction is null", () => {
    const input = [entry("Charizard"), entry("Bulbasaur"), entry("Pikachu")];
    expect(sortEntriesByName(input, null)).toEqual(input);
  });

  it("sorts ascending by name", () => {
    const input = [entry("Charizard"), entry("Bulbasaur"), entry("Pikachu")];
    const result = sortEntriesByName(input, "asc").map((e) => e.name);
    expect(result).toEqual(["Bulbasaur", "Charizard", "Pikachu"]);
  });

  it("sorts descending by name", () => {
    const input = [entry("Charizard"), entry("Bulbasaur"), entry("Pikachu")];
    const result = sortEntriesByName(input, "desc").map((e) => e.name);
    expect(result).toEqual(["Pikachu", "Charizard", "Bulbasaur"]);
  });

  it("is case-insensitive", () => {
    const input = [entry("pikachu"), entry("Bulbasaur"), entry("charizard")];
    const result = sortEntriesByName(input, "asc").map((e) => e.name);
    expect(result).toEqual(["Bulbasaur", "charizard", "pikachu"]);
  });

  it("is accent-insensitive", () => {
    const input = [entry("Zubat"), entry("Flabébé"), entry("Abra")];
    const result = sortEntriesByName(input, "asc").map((e) => e.name);
    expect(result).toEqual(["Abra", "Flabébé", "Zubat"]);
  });

  it("does not mutate the input array", () => {
    const input = [entry("Charizard"), entry("Bulbasaur")];
    const original = [...input];
    sortEntriesByName(input, "asc");
    expect(input).toEqual(original);
  });

  it("keeps the relative order of same-named entries stable in both directions", () => {
    const input = [
      { name: "Charizard", id: 1 },
      { name: "Charizard", id: 2 },
      { name: "Bulbasaur", id: 3 },
    ];
    const asc = sortEntriesByName(input, "asc");
    expect(asc.filter((e) => e.name === "Charizard").map((e) => e.id)).toEqual([1, 2]);

    const desc = sortEntriesByName(input, "desc");
    expect(desc.filter((e) => e.name === "Charizard").map((e) => e.id)).toEqual([1, 2]);
  });

  it("handles an empty list", () => {
    expect(sortEntriesByName([], "asc")).toEqual([]);
  });
});
