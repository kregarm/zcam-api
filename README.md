# zcam-api

API tests for the [Swagger Petstore](https://petstore.swagger.io/) (v2), written with [Playwright Test](https://playwright.dev/docs/api-testing).

Covers the `pet`, `store` and `user` endpoints. Each test creates its own data with unique ids and deletes it afterwards, so tests are independent and run in parallel.

## Requirements

- Node.js (LTS)
- npm

No browsers are needed — these are API-only tests.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local env file:

   ```bash
   cp .env.example .env
   ```

3. Fill in `.env`:

   | Variable | Example | Purpose |
   |---|---|---|
   | `PETSTORE_BASE_URL` | `https://petstore.swagger.io/v2/` | Base URL all requests resolve against (keep the trailing `/`) |
   | `PETSTORE_API_KEY` | `special-key` | Sent as the `api_key` header on the routes the spec secures with it |

   `.env` is git-ignored. Variables already set in your shell take precedence over `.env`. If either is missing, the run stops with a clear error.

## Running the tests

Run everything:

```bash
npm test
```

Run one area:

```bash
npx playwright test tests/pet
```

Run a single test by name:

```bash
npx playwright test -g "deletes a pet"
```

Open the HTML report from the last run:

```bash
npx playwright show-report
```

## Project structure

```
tests/
  pet/pet.spec.ts       pet CRUD, form update, image upload, findByStatus
  store/store.spec.ts   orders and inventory
  user/user.spec.ts     user CRUD, bulk create, login/logout
utils.ts                payload builders, create helpers, api_key header
playwright.config.ts    base URL, env validation, retries, reporter
```

## API key

Only the routes the Petstore spec secures with `api_key` send the key: `GET`/`DELETE pet/{petId}` and `GET store/inventory`. All other requests go without it, so the suite also shows the public routes work without a key.

Note: the public demo server doesn't actually enforce the key.

## CI

[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml) runs the suite:

- on every pull request (opened, reopened, new commits)
- when the `run-api` label is added to a PR (handy for re-running)

The HTML report is uploaded as the `playwright-report` artifact. On CI, failed tests retry up to 2 times.
