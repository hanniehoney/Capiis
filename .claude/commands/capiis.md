---
description: Launch the Capiis wealth management dashboard
allowed-tools: Bash(node:*), Bash(npm:*), Bash(open:*), Bash(lsof:*), Bash(kill:*), Bash(curl:*)
---

# Capiis -- Capitalis Apis: Where Wealth Swarms

Launch the Capiis wealth & asset management dashboard.

All commands use relative paths from the project root (where this repo is cloned).

## Instructions

**Important: Keep output clean.** Do NOT run commands in parallel during startup — run them sequentially in a single chain to avoid "sibling error" noise. Minimize visible tool calls.

1. Run a single Bash command to check port AND start if needed:
   ```
   lsof -ti:3333 > /dev/null 2>&1 && echo "ALREADY_RUNNING" || (test -d node_modules || npm install; node server.js & sleep 2 && echo "STARTED")
   ```
   - If output is `ALREADY_RUNNING`, skip to step 2
   - If output is `STARTED`, continue to step 2
   - Do NOT show intermediate "checking port" or "checking dependencies" messages to the user

2. Open the dashboard:
   - Run `open http://localhost:3333`

3. Check if data is populated by running:
   ```
   node -e "try{const d=require('./data/profile.json');console.log(d.personal?.name||'EMPTY')}catch(e){console.log('EMPTY')}"
   ```
   - This command ALWAYS succeeds (exit code 0) — it prints the user's name or `EMPTY`

4. **If output is `EMPTY`** (new user / cleared data):
   - Show a welcome message and use AskUserQuestion:
     - Question: "Welcome to Capiis! Looks like you haven't set up your data yet. How would you like to get started?"
     - Header: "Setup"
     - Options:
       1. Label: "Import a demo template (Recommended)", Description: "Load a pre-built persona (Alex or Sophia) to explore the dashboard with realistic data"
       2. Label: "Enter my own data", Description: "Guided step-by-step setup — profile, accounts, assets, liabilities"
       3. Label: "Just browse the empty dashboard", Description: "Skip setup for now, you can always run /capiis-data later"
   - Route based on answer:
     - "Import a demo template" → invoke `/capiis-data template` (use the Skill tool)
     - "Enter my own data" → invoke `/capiis-data setup` (use the Skill tool)
     - "Just browse" → do nothing, show "You can run `/capiis-data` anytime to set up your data."

5. **If output is a name** (returning user):
   - Do NOT fetch or display portfolio stats during launch
   - Confirm launch with one short sentence
   - Then show this guide (copy exactly as-is):
     ```
     Capiis is live at http://localhost:3333
     `/capiis status` for a quick portfolio snapshot
     `/capiis-data` to manage data · `/capiis stop` to shut down
     ```

## Subcommands

If the user provides arguments ($ARGUMENTS), handle them:

- **stop**: Kill the running Capiis server by running `kill $(lsof -ti:3333)` and confirm it's stopped
- **status**:
  - Check if the server is running on port 3333
  - If it is not running, say "Capiis is not running. Use `/capiis` to start it."
  - If it is running, fetch `http://localhost:3333/api/stats` via `curl -s`
  - Summarize only:
    - Net worth
    - Total assets
    - Number of positions
    - Top 2-3 allocation categories
  - Never dump raw JSON
- **reset**: Run `node scripts/seed-data.js` to reset all data to mock defaults, then confirm
- **No arguments**: Default behavior -- launch the dashboard (steps 1-5 above)
