# Contributing

Thanks for helping improve LabhSetu. The most valuable contributions are **accurate scheme data** — a wrong rule can send someone to the wrong office, or hide a benefit they are entitled to.

## Development setup

```bash
nvm use            # Node 22 (see .nvmrc)
npm install
npm run dev        # http://localhost:3000, restarts on change
```

Before opening a pull request, run everything CI runs:

```bash
npm run check      # lint + format check + typecheck + unit/API tests
npm run test:e2e   # browser tests (first time: npx playwright install chromium)
```

`npm run format` fixes formatting automatically.

## Adding or updating a scheme

All scheme data lives in [`frontend/scripts/data/schemes.js`](frontend/scripts/data/schemes.js). The browser and the API both read from it, so one edit updates both.

1. **Use an official source.** Link the scheme's government portal in `applyUrl` (https only). Prefer the scheme guidelines over news articles.
2. **Write both languages.** Every `name`, `ministry`, `summary`, `benefit.label` and `note` needs `en` and `hi` text. Keep the language plain — many users are reading on a phone and may be new to these schemes.
3. **Express the rules with the questions the app already asks.** Available rules:

   | Rule         | Example                                        | Meaning                                  |
   | ------------ | ---------------------------------------------- | ---------------------------------------- |
   | `minAge`     | `18`                                           | Age is at least this                     |
   | `maxAge`     | `50`                                           | Age is at most this                      |
   | `maxIncome`  | `250000`                                       | Annual family income is at most this (₹) |
   | `gender`     | `['female']`                                   | One of these genders                     |
   | `occupation` | `['farmer', 'artisan']`                        | One of these occupations                 |
   | `caste`      | `['sc', 'st']`                                 | One of these categories                  |
   | `area`       | `'rural'`                                      | Lives in this kind of area               |
   | `flags`      | `{ hasBankAccount: true }`                     | Yes/no answers that must match           |
   | `anyOf`      | `[{ caste: ['sc', 'st'] }, { gender: [...] }]` | At least one alternative must fully hold |

   All listed rules must hold. If a scheme depends on something the app doesn't ask (for example, “not an income-tax payer”), put it in `note` instead of inventing a rule.

4. **Only set `benefit.amount` for fixed rupee values.** It feeds the summary totals: `cash`/`pension` add to “direct cash in the first year”, `insurance` to “insurance cover”, and `loan` to “loans available up to”. Leave it out when the value varies.
5. **Bump `CATALOG_VERSION`** (format `YYYY.MM`) so API consumers can tell the data changed.
6. Run `npm test`. The catalog tests check ids, rule keys, document keys, links and translations; add a test in `tests/unit/eligibility.test.js` for any rule that is easy to get wrong.

Adding a new question to the form is a bigger change: it touches `core/profile.js`, the form, the translations and the API contract. Please open an issue to discuss it first.

## Code style

- Plain JavaScript (ES modules) with JSDoc types, checked by `tsc --checkJs`. No build step.
- Code in `frontend/scripts/core/` and `frontend/scripts/data/` must stay free of DOM and Node APIs — it runs in both.
- Build DOM with `textContent` and `createElement`, never `innerHTML` with data.
- Never log or store profile data.

## Commit messages

Use the imperative mood and describe the change, e.g. `Add PM Surya Ghar scheme` or `Fix income limit for PMAY-Urban`.
