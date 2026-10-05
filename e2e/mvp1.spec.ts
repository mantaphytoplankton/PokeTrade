import { test, expect } from "@playwright/test";

// Critical MVP-1 journey: register -> search -> add -> browse the grid ->
// open details -> remove. Hits the live TCGdex API (no key required, same
// as scripts/smoke.mjs) — see common-test-strategy's allowance for
// no-secret public sandboxes in default CI.

const uniqueEmail = `ash+${Date.now()}@example.com`;

test.describe("MVP-1: build & browse a collection", () => {
  test("unauthenticated users are redirected to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("register, search, add, browse, view details, remove", async ({ page }) => {
    // --- Register ---
    await page.goto("/register");
    await page.getByLabel("Name").fill("Ash");
    await page.getByLabel("Email").fill(uniqueEmail);
    await page.getByLabel("Password").fill("correct-horse-battery");
    await page.getByRole("button", { name: "New Trainer" }).click();
    await page.getByRole("button", { name: "Create my account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText("Your binder")).toBeVisible();

    // --- Search ---
    await page.getByRole("tab", { name: /Search/ }).click();
    await expect(page).toHaveURL(/\/search$/);
    const searchInput = page.getByLabel("Search the catalog");
    await searchInput.waitFor({ state: "visible" });
    // Wait past hydration: the Search button starts disabled (empty input)
    // and only becomes enabled once client JS has attached — filling before
    // that point is a real race, not a flake to paper over with a sleep.
    await expect(page.getByRole("button", { name: "Search", exact: true })).toBeDisabled();
    await searchInput.fill("Charizard");
    await expect(page.getByRole("button", { name: "Search", exact: true })).toBeEnabled();
    await page.getByRole("button", { name: "Search", exact: true }).click();
    const firstResult = page.getByRole("listitem").first();
    await expect(firstResult).toBeVisible({ timeout: 15_000 });

    // --- Add to collection ---
    await firstResult.getByRole("button", { name: "Add" }).click();
    const modal = page.getByRole("dialog", { name: "Add to collection" });
    await expect(modal).toBeVisible();
    await modal.getByRole("button", { name: "Add to collection", exact: true }).click();

    // --- Back on the grid, the card is there ---
    // The `?flash=` query param is intentionally transient — FlashToast
    // strips it via replaceState as soon as it mounts (see
    // components/ui/Toast.tsx) — so assert the toast text, not the URL shape.
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Added .* to your collection/)).toBeVisible();
    const cardLink = page.getByRole("link", { name: /Charizard/ }).first();
    await expect(cardLink).toBeVisible();

    // --- Open Card Details via real navigation ---
    await cardLink.click();
    await expect(page).toHaveURL(/\/cards\/.+/);
    await expect(page.getByRole("heading", { name: "Charizard", level: 1 })).toBeVisible();

    // --- Escape returns to the collection ---
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/dashboard$/);

    // --- Remove it, with confirm, and see the flash toast ---
    await cardLink.click();
    page.once("dialog", (d) => d.accept());
    await page.getByRole("button", { name: /Remove from collection/ }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText(/Removed Charizard/)).toBeVisible();
  });

  test("logout returns to login and re-guards the dashboard", async ({ page }) => {
    const email = `logout-${Date.now()}@example.com`;
    await page.goto("/register");
    await page.getByLabel("Name").fill("Misty");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill("correct-horse-battery");
    await page.getByRole("button", { name: "Create my account" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
  });
});
