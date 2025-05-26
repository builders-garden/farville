import { expect, Page, test } from "@playwright/test";

test.describe.serial("Plant and Harvest ", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game page before each test
    await page.goto("/");
  });

  test("should plant carrot seeds", async ({ page }) => {
    await plantCarrotSeed(page);
  });

  test("should harvest all the carrots", async ({ page }) => {
    await harvestCarrotSeed(page);
  });
});

export async function plantCarrotSeed(page: Page) {
  // Get the grid element
  const grid = await page.locator("#fields-grid");
  // Verify grid exists
  await expect(grid).toBeVisible();
  // Get all cells
  const cells = await grid.locator(".grid-cell").all();

  // Select carrot seeds
  await page.click("#carrot-seeds");

  // plant a carrot seed on each cell
  for (const cell of cells) {
    // Verify the cell shows planting preview
    await expect(cell).toHaveClass(/border-green-400/);
    // plant a carrot seed
    await cell.click();
    // Verify the cell now has a carrot crop
    await expect(cell.locator(".crop-sprite")).toBeVisible();
  }

  // click on the button x to exit planting mode
  const closeButton = page
    .locator(
      '[class="py-2 px-4 bg-red-500 rounded-lg flex items-center justify-center text-white shadow-lg hover:bg-red-600"]'
    )
    .first();
  await closeButton.click();

  // wait 4 seconds
  await page.waitForTimeout(4000);
}

export async function harvestCarrotSeed(page: Page) {
  // Get the grid element
  const grid = await page.locator("#fields-grid");

  // Verify grid exists
  await expect(grid).toBeVisible();

  // harvest all the carrots
  const harvestCells = await grid.locator(".grid-cell").all();
  for (const cellH of harvestCells) {
    // Verify the crop type is carrot
    const cropType = await cellH.getAttribute("data-crop-type");
    await cellH.click();
    expect(cropType).toBe("carrot");
  }

  // Verify the carrots are harvested
  const grid2 = await page.locator("#fields-grid");
  const harvestedCells = await grid2.locator(".grid-cell").all();
  for (const cellC of harvestedCells) {
    await expect(cellC.locator(".crop-sprite")).not.toBeVisible();
  }

  // wait 4 seconds
  await page.waitForTimeout(4000);
}
