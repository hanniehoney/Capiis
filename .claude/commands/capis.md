---
description: Launch the Capis wealth management dashboard
allowed-tools: Bash(node:*), Bash(npm:*), Bash(open:*), Bash(lsof:*), Bash(kill:*)
---

# Capis -- Capitalis Apis: Where Wealth Swarms

Launch the Capis wealth & asset management dashboard.

The Capis project lives at `~/Desktop/Capis`. All commands below use this absolute path.

## Instructions

1. Check if the Capis server is already running:
   - Run `lsof -ti:3333` to check if port 3333 is in use
   - If already running, skip to step 4

2. Ensure dependencies are installed:
   - Check if `~/Desktop/Capis/node_modules` exists
   - If not, run `npm install --prefix ~/Desktop/Capis`

3. Start the Express server in the background:
   - Run `node ~/Desktop/Capis/server.js &`
   - Wait 2 seconds for the server to initialize

4. Open the dashboard:
   - Run `open http://localhost:3333`

5. Confirm to the user:
   - Report that Capis dashboard is running at http://localhost:3333
   - Fetch `http://localhost:3333/api/stats` and show a brief portfolio summary (total value, number of positions, allocation)

## Subcommands

If the user provides arguments ($ARGUMENTS), handle them:

- **stop**: Kill the running Capis server by running `kill $(lsof -ti:3333)` and confirm it's stopped
- **status**: Check if the server is running on port 3333 and report back
- **reset**: Run `node ~/Desktop/Capis/scripts/seed-data.js` to reset all data to mock defaults, then confirm
- **No arguments**: Default behavior -- launch the dashboard (steps 1-5 above)
