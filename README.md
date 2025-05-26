# Farville 🌾 

A farming simulation game built with Next.js where you can grow crops, expand your land, and unlock perks!

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/farville.git
cd farville
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to start playing!

## How to Play

1. **Plant Crops** 🌱

   - Click on a tilled soil to plant the selected crop
   - Different crops have different growth times and rewards
   - Watch your crops grow through various stages

2. **Harvest & Sell** 💰

   - Harvest crops when they're ready (sparkles will appear)
   - Sell your harvested crops in the marketplace
   - Earn coins to expand your farm and buy perks

3. **Expand Your Farm** 🏡

   - Use your coins to buy more land
   - Unlock larger expansions as you level up
   - More land means more crops!

4. **Manage Your Inventory** 📦

   - Keep track of your seeds and harvested crops
   - Buy more seeds from the marketplace
   - Watch your storage capacity

5. **Unlock Perks** ⭐
   - Buy and activate special perks
   - Boost your crop growth and yields
   - Combine different perks for maximum efficiency

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion

## Testing
Testing is done using Playwright for end-to-end tests [./e2e/market.spec.ts](./e2e/market.spec.ts) and Artillery for load/stress testing [./tests/artillery-load.yml](./tests/artillery-load.yml).

### Playwright end-to-end tests

Launch playwright tests with the UI

```bash
yarn test:ui
```

or in headless mode

```bash
yarn test
```

### Artillery load tests

Have your test environment ready and running on your infrastructure.

1. Install artillery globally

    ```bash
    npm install -g artillery@latest
    ```

2. Save the API key in the environment variable `ARTILLERY_CLOUD_API_KEY`

    ```bash
    export ARTILLERY_CLOUD_API_KEY=...
    ```

3. Run the load test using artillery

    ```bash
    yarn test:load
    ```

    or

    ```bash
    npx artillery run tests/artillery/playwright/load-test-playwright.yml
    ```

### Artillery x Playwright

In artillery you can also run playwright tests combining both playwright and artillery.

```bash
yarn test:load:playwright
```
