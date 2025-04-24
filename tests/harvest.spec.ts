import { test, expect } from "@playwright/test";

test.describe("Game Grid Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game page before each test
    await page.goto("/");
  });

  test("should plant carrot seeds", async ({ page }) => {
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
  });

  test("should harvest all the carrots", async ({ page }) => {
    // Get the grid element
    const grid = await page.locator("#fields-grid");

    // Verify grid exists
    await expect(grid).toBeVisible();

    // harvest all the carrots
    const harvestCells = await grid.locator(".grid-cell").all();
    for (const cellH of harvestCells) {
      // Verify the crop type is carrot
      const cropType = await cellH.getAttribute("data-crop-type");
      console.log("harvestCells", cellH, "cropType", cropType);
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
  });

  test("should buy a carrot seed from the market", async ({ page }) => {
    // Get the grid element
    const marketButton = await page.locator("#market-toolbar-btn");
    await marketButton.click();

    // Verify the market is visible
    const marketBuyButton = await page.locator("#market-buy");
    await expect(marketBuyButton).toBeVisible();

    // click on the market buy button
    await marketBuyButton.click();

    // get all the items that have text "Owned:"
    const ownedItems = await page.locator("text=Owned:");
    // Get the first owned item (carrot seeds)
    const ownedCarrotSeed = await ownedItems.first();
    // Extract the number from the inner span
    const ownedCount = await ownedCarrotSeed
      .locator("span.text-white\\/90")
      .textContent();
    console.log("Number of owned carrot seeds:", ownedCount);

    // Verify the carrot seed is visible
    const carrotSeed = await page.locator(
      '[data-testid="market-buy-item-carrot-seeds-1"]'
    );
    await expect(carrotSeed).toBeVisible();

    // click on the carrot seed
    await carrotSeed.click();

    // Verify the carrot seed is planted
    const plantedCarrotSeed = await page.locator("#carrot-seeds");
    await expect(plantedCarrotSeed).toBeVisible();

    // wait 2 seconds
    await page.waitForTimeout(2000);

    // get all the items that have text "Owned:"
    const newOwnedItems = await page.locator("text=Owned:");
    // Get the first owned item (carrot seeds)
    const newOwnedCarrotSeed = await newOwnedItems.first();
    // Extract the number from the inner span
    const newOwnedCount = await newOwnedCarrotSeed
      .locator("span.text-white\\/90")
      .textContent();
    console.log("Number of owned carrot seeds:", newOwnedCount);

    // Verify the number of owned carrot seeds has increased by 1
    if (ownedCount && !isNaN(Number(ownedCount)) && Number(ownedCount) > 0) {
      expect(newOwnedCount).toBe((Number(ownedCount) + 1).toString());
    } else {
      throw new Error("No owned carrot seeds found");
    }
  });
});
