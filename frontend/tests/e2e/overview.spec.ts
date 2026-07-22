import { test, expect } from "@playwright/test";

test.describe("Overview TS page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/overview");
  });

  test("summary cards tampil", async ({ page }) => {
    const pageContent = await page.textContent("body");
    expect(pageContent).toContain("Armada");
  });

  test("grid tampil di /overview", async ({ page }) => {
    const body = await page.textContent("body");
    expect(body).toContain("Overview TS");
    const firstBox = page.locator(".ts-status-box").first();
    await expect(firstBox).toBeVisible();
  });

  test("klik box trainset pindah ke halaman /overview/cart", async ({ page }) => {
    await page.locator(".ts-status-box").first().click();
    await page.waitForURL("**/overview/cart**");
    await expect(page).toHaveURL(/overview\/cart\?trainset=/);
    await expect(page.getByText("Insight Aktif")).toBeVisible();
  });
});

test.describe("Overview Cart page", () => {
  test("bisa dibuka langsung lewat URL dengan query trainset", async ({ page }) => {
    await page.goto("/overview/cart?trainset=TS-001");
    await expect(page.getByText("Insight Aktif")).toBeVisible();
  });

  test("tombol back kembali ke /overview", async ({ page }) => {
    await page.goto("/overview/cart?trainset=TS-001");
    const backLink = page.getByRole("link", { name: /Overview TS/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await page.waitForURL("**/overview");
    await expect(page.locator(".ts-status-box").first()).toBeVisible();
  });

  test("tombol Tinjau Bukti navigasi ke /car-detail", async ({ page }) => {
    await page.goto("/overview/cart?trainset=TS-001");
    const button = page.getByRole("link", { name: /Tinjau Bukti/i });
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForURL("**/car-detail**");
    await expect(page).toHaveURL(/car-detail/);
  });
});