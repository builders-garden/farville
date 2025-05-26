/* eslint-disable @typescript-eslint/no-require-imports */
const { expect } = require("@playwright/test");

/**
 * Buys a carrot seed from the market
 */
async function buyCarrotSeed(page, context, events, test) {
  const { step } = test;
  await step("go_to_page", async () => {
    await page.goto(context.vars.target);
    // Verify grid exists
    const grid = await page.locator("#fields-grid");
    await expect(grid).toBeVisible();
  });

  await step("open_market", async () => {
    const marketButton = await page.locator("#market-toolbar-btn");
    await marketButton.click();
  });

  await step("buy_carrot_seed", async () => {
    // Verify the market is visible
    const marketBuyButton = await page.locator("#market-buy");
    await expect(marketBuyButton).toBeVisible();
    await marketBuyButton.click();

    // get number of owned carrot seeds
    const ownedItems = await page.locator("text=Owned:");
    const ownedCarrotSeed = await ownedItems.first();
    const ownedCount = await ownedCarrotSeed
      .locator("span.text-white\\/90")
      .textContent();

    // buy 1 carrot seed
    const carrotSeed = await page.locator(
      '[data-testid="market-buy-sell-item-carrot-seeds-1"]'
    );
    await expect(carrotSeed).toBeVisible();

    await carrotSeed.click();

    // Verify the carrot seed can be planted
    const plantedCarrotSeed = await page.locator("#carrot-seeds");
    await expect(plantedCarrotSeed).toBeVisible();

    // wait 2 seconds
    await page.waitForTimeout(2000);

    // get updated number of owned carrot seeds
    const newOwnedItems = await page.locator("text=Owned:");
    const newOwnedCarrotSeed = await newOwnedItems.first();
    const newOwnedCount = await newOwnedCarrotSeed
      .locator("span.text-white\\/90")
      .textContent();

    // Verify the number of owned carrot seeds has increased by 1
    if (
      ownedCount &&
      !Number.isNaN(Number(ownedCount)) &&
      Number(ownedCount) > 0
    ) {
      expect(newOwnedCount).toBe((Number(ownedCount) + 1).toString());
    } else {
      throw new Error("No owned carrot seeds found");
    }
  });
}

/**
 * Plants a carrot seed on each cell in the grid
 */
async function plantCarrotSeed(page, context, events, test) {
  const { step } = test;
  await step("go_to_page", async () => {
    await page.goto(context.vars.target);
    // Verify grid exists
    const grid = await page.locator("#fields-grid");
    await expect(grid).toBeVisible();
  });

  await step("plant_carrot_seed", async () => {
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
}

/**
 * Harvests all the carrots in the grid
 */
async function harvestCarrotSeed(page, context, events, test) {
  const { step } = test;
  await step("go_to_page", async () => {
    await page.goto(context.vars.target);
    // Verify grid exists
    const grid = await page.locator("#fields-grid");
    await expect(grid).toBeVisible();
  });

  await step("harvest_carrot_seed", async () => {
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
  });
}

/**
 * Sells an harvested carrot in the market
 */
async function sellCarrot(page, context, events, test) {
  const { step } = test;
  await step("go_to_page", async () => {
    await page.goto(context.vars.target);
    // Verify grid exists
    const grid = await page.locator("#fields-grid");
    await expect(grid).toBeVisible();
  });

  await step("open_market", async () => {
    const marketButton = await page.locator("#market-toolbar-btn");
    await marketButton.click();
  });

  await step("sell_carrot", async () => {
    // Verify the market is visible
    const marketSellButton = await page.locator("#market-sell");
    await expect(marketSellButton).toBeVisible();
    await marketSellButton.click();

    // get number of owned carrots
    const ownedItems = await page.locator("text=Owned:");
    const ownedCarrotSeed = await ownedItems.first();
    const ownedCount = await ownedCarrotSeed
      .locator("span.text-white\\/90")
      .textContent();

    // sell 1 carrot seed
    const carrotSeed = await page.locator(
      '[data-testid="market-buy-sell-item-carrot-seeds-1"]'
    );
    await expect(carrotSeed).toBeVisible();
    await carrotSeed.click();

    // wait 2 seconds
    await page.waitForTimeout(2000);

    // get updated number of owned carrots
    const newOwnedItems = await page.locator("text=Owned:");
    const newOwnedCarrot = await newOwnedItems.first();
    const newOwnedCount = await newOwnedCarrot
      .locator("span.text-white\\/90")
      .textContent();

    // Verify the number of owned carrots has decreased by 1
    if (
      ownedCount &&
      !Number.isNaN(Number(ownedCount)) &&
      Number(ownedCount) > 0
    ) {
      expect(newOwnedCount).toBe((Number(ownedCount) - 1).toString());
    } else {
      throw new Error("No owned carrots found");
    }
  });
}

/**
 * Buys a carrot seed, plants it on each cell in the grid, and harvests all the carrots
 */
async function buyPlantHarvestCarrots(page, context, events, test) {
  await buyCarrotSeed(page, context, events, test);
  await plantCarrotSeed(page, context, events, test);
  await harvestCarrotSeed(page, context, events, test);
  await sellCarrot(page, context, events, test);
}

module.exports = {
  buyPlantHarvestCarrots,
};
