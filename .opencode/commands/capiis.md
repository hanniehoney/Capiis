---
description: Launch the Capiis dashboard, start the local server if needed, and open the browser
agent: build
---

# /capiis

Launch or manage the Capiis dashboard from OpenCode.

Work from the project root.

## Output Style

- Keep terminal output minimal.
- Do not narrate each shell step with headings like "Starts server" or
  "Fetches stats JSON".
- Do not print raw JSON responses to the user.
- Execute commands quietly where possible and only respond after the launch flow
  is complete.
- Final user-facing output should be 2-4 short lines max unless the user asks
  for more detail.

## Routing

Handle `$ARGUMENTS` like this:

- `stop`: check whether port `3333` is in use. If it is, kill the server
  process and confirm shutdown. If it is not, say Capiis is already stopped.
- `status`: check whether the server is running on `127.0.0.1:3333`. If it is
  running, fetch stats and return a short portfolio summary. If it is not,
  tell the user to run `/capiis`.
- `reset`: run `node scripts/seed-data.js` to restore the default Alex template,
  then confirm the dashboard data was reset.
- Empty arguments: follow the launch flow below.

## Launch Flow

1. Check whether port `3333` is already in use.
2. If the server is not running:
   - If `node_modules/` is missing, run `npm install`.
   - Start the server quietly in the background, redirecting logs away from the
     chat transcript.
   - Wait until `http://localhost:3333/api/stats` responds, but do not print
     the polling output.
3. Open `http://localhost:3333` in the default browser.
4. Read `data/profile.json` and check whether `personal.name` exists.
5. If the profile is empty, use the `question` tool:
   - Header: `Setup`
   - Question: `Welcome to Capiis. How would you like to get started?`
   - Options:
     - `Import demo template` -> load Alex or Sophia so the dashboard is usable immediately.
     - `Guided setup` -> start conversational onboarding for profile, accounts, assets, and liabilities.
     - `Browse empty dashboard` -> skip setup for now.
6. Handle setup answers directly in this session:
   - `Import demo template`: ask which persona to use, run
     `node scripts/seed-data.js alex` or `node scripts/seed-data.js sophia`,
     then confirm the import.
   - `Guided setup`: load the `onboarding` skill with the native `skill` tool
     and follow it.
   - `Browse empty dashboard`: tell the user they can run `/capiis-data` later.
7. If profile data exists, do not fetch stats during launch. Just confirm that
   the dashboard is running.
8. Format the launch response like this:

```text
Capiis is live at http://localhost:3333
/capiis status for a quick portfolio snapshot
/capiis-data to manage data · /capiis stop to shut down
```

## Status Flow

When `$ARGUMENTS` is `status`:

1. Check whether port `3333` is in use.
2. If it is not running, say:

```text
Capiis is not running. Use /capiis to start it.
```

3. If it is running, fetch `http://localhost:3333/api/stats` without exposing
   the raw payload.
4. Parse the response and summarize only:
   - net worth
   - total assets
   - position count
   - top 2-3 allocation categories
5. Format the response in natural language, for example:

```text
Capiis is running at http://localhost:3333
Net worth $5.68M · Assets $7.54M · 34 positions
Top allocations: stocks 45.1%, real-estate 39.8%, employee-equity 5.4%
```

## Implementation Notes

- When you need dashboard stats, prefer a quiet fetch plus a local parse step
  that emits only the summary line.
- Example pattern:
  - save the API response to a temp file
  - parse it with `node -e`
  - print only the final summary
- Do not leave background server logs streaming into the chat transcript.
- During normal launch, do not fetch stats unless the user explicitly runs
  `/capiis status`.
