---
description: Manage Capiis data, including clearing data, importing demo templates, and guided setup
agent: build
---

# /capiis-data

Manage data for the Capiis dashboard from OpenCode.

All paths are relative to the project root. Keep replies concise.

## Routing

Handle `$ARGUMENTS` like this:

- `clear`: follow the clear flow.
- `template`: follow the template import flow.
- `setup`: load the `onboarding` skill with the native `skill` tool and follow
  it.
- Empty arguments: use the `question` tool to ask what the user wants to do,
  then route to the matching flow.

When asking the menu question:

- Header: `Data`
- Question: `What would you like to do with your Capiis data?`
- Options:
  - `Clear all data`
  - `Import demo template`
  - `Guided setup`

## Clear Flow

1. Use the `question` tool to confirm deletion.
   - Header: `Confirm`
   - Question: `This clears profile, holdings, liabilities, tax, feed, signals, and watchlist data. categories.json and empty Excel shells are preserved. Proceed?`
   - Options:
     - `Cancel`
     - `Clear everything`
2. If the user cancels, say no changes were made.
3. If confirmed, run `node scripts/clear-data.js`.
4. Confirm that data was cleared and remind the user about `/capiis-data template`
   and `/capiis-data setup`.

## Template Import Flow

1. Check whether `data/profile.json` already contains `personal.name`.
2. If existing data is present, use the `question` tool to confirm overwrite.
   - Header: `Overwrite`
   - Question: `Existing data detected. Importing a template will overwrite current dashboard data. Continue?`
   - Options:
     - `Cancel`
     - `Overwrite and import`
3. If confirmed, ask which persona to import.
   - Header: `Template`
   - Question: `Which demo persona would you like to load?`
   - Options:
     - `Alex` -> Google L7, married, 2 kids, Cupertino, Taiwanese immigrant, about $5.5M net worth.
     - `Sophia` -> Anthropic staff, single, SF renter, British expat, about $4.3M net worth.
4. Run the matching seed command:
   - Alex: `node scripts/seed-data.js alex`
   - Sophia: `node scripts/seed-data.js sophia`
5. Confirm the imported persona and ask whether the user wants to run `/capiis`
   next.
