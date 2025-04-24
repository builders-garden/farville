import { test, expect } from "@playwright/test";

test.describe.serial("Market Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the game page before each test
    await page.goto("/");
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

    // Verify the number of owned carrot seeds has increased by 1
    if (ownedCount && !isNaN(Number(ownedCount)) && Number(ownedCount) > 0) {
      expect(newOwnedCount).toBe((Number(ownedCount) + 1).toString());
    } else {
      throw new Error("No owned carrot seeds found");
    }
  });
});
