---
description: Launch the Capis wealth management dashboard
allowed-tools: Bash(node:*), Bash(npm:*), Bash(open:*), Bash(lsof:*), Bash(kill:*)
---

# Capis -- Capitalis Apis: Where Wealth Swarms

Launch the Capis wealth & asset management dashboard.

## Instructions

1. Check if the Capis server is already running:
   - Run `lsof -ti:3333` to check if port 3333 is in use
   - If already running, skip to step 4

2. Ensure dependencies are installed:
   - Check if `node_modules` exists in the Capis project directory
   - If not, run `npm install` in the project root

3. Start the Express server in the background:
   - Run `node server.js &` from the project root
   - Wait 2 seconds for the server to initialize

4. Open the dashboard:
   - Run `open http://localhost:3333`

5. Confirm to the user:
   - Report that Capis dashboard is running at http://localhost:3333
   - If `data/portfolio.json` exists, read it and show a brief portfolio summary (total value, number of positions)

## Subcommands

If the user provides arguments ($ARGUMENTS), handle them:

- **stop**: Kill the running Capis server by running `kill $(lsof -ti:3333)` and confirm it's stopped
- **status**: Check if the server is running on port 3333 and report back
- **reset**: Run `node scripts/seed-data.js` to reset all data to mock defaults, then confirm
- **No arguments**: Default behavior -- launch the dashboard (steps 1-5 above)
