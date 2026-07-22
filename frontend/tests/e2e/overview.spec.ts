import { test, expect } from "@playwright/test";

test.describe("Overview Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/overview");
  });

  test("summary cards tampil", async ({ page }) => {
    const pageContent = await page.textContent("body");
    // Check for key summary metrics
    expect(pageContent).toContain("Armada");
  });

  test("overview TS grid tampil sebagai default", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("Overview TS");
    // At least one trainset status box should be clickable
    const firstBox = page.locator(".ts-status-box").first();
    await expect(firstBox).toBeVisible();
  });

  test("klik box trainset masuk ke overview cart, lalu bisa kembali ke grid", async ({ page }) => {
    const firstBox = page.locator(".ts-status-box").first();
    await firstBox.click();

    // Overview Cart view: composition + priority insight card
    await expect(page.getByText("Insight Aktif")).toBeVisible();

    const backLink = page.getByRole("button", { name: /Overview TS/i });
    await expect(backLink).toBeVisible();
    await backLink.click();

    await expect(page.locator(".ts-status-box").first()).toBeVisible();
  });

  test("tombol Tinjau Bukti navigasi ke /car-detail", async ({ page }) => {
    await page.locator(".ts-status-box").first().click();
    const button = page.getByRole("link", { name: /Tinjau Bukti/i });
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForURL("**/car-detail**");
    await expect(page).toHaveURL(/car-detail/);
  });
});