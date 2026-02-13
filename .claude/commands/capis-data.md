---
description: Manage Capis data — clear, import template, or guided setup
allowed-tools: Bash(node:*), Bash(npm:*), Bash(curl:*), Bash(ls:*), Bash(rm:*), Bash(lsof:*)
---

# /capis-data — Data Management

Manage data for the Capis wealth & asset management dashboard.

The Capis project lives at `~/Desktop/Capis`. Data files are in `~/Desktop/Capis/data/`.

## Routing

Based on $ARGUMENTS:

- **clear**: Go to [Clear Data](#clear-data)
- **template**: Go to [Import Template](#import-template)
- **setup**: Invoke the `capis-onboarding` skill, then follow its instructions
- **No arguments**: Use AskUserQuestion to show a menu:
  - "What would you like to do with your Capis data?"
  - Options:
    1. "Clear all data" — wipe everything and start fresh
    2. "Import template" — load demo data (choose from multiple personas)
    3. "Guided setup" — enter your own data step by step
  - Then route to the appropriate section based on the user's choice.

---

## Clear Data

1. Use AskUserQuestion to confirm:
   - Question: "This will delete ALL data in data/ (profile, assets, liabilities, tax, signals, feed, watchlist). categories.json (schema) and empty xlsx shells will be preserved. Please back up to iCloud / Google Drive first. Proceed?"
   - Options: "Cancel — keep my data" (first/default) / "Confirm — clear everything"

2. If user cancels, stop and say "No changes made."

3. If confirmed, run:
   ```
   node ~/Desktop/Capis/scripts/clear-data.js
   ```

4. Report:
   - "Data cleared. Empty xlsx templates preserved in data/ with column headers."
   - Suggest: "Use `/capis-data template` to load demo data, or `/capis-data setup` to enter your own."

---

## Import Template

1. Check if data/ already has user data:
   - Check if `~/Desktop/Capis/data/profile.json` exists and has a `personal.name` value
   - If existing data found, use AskUserQuestion:
     - "Existing data detected. Importing a template will OVERWRITE all current data. Continue?"
     - Options: "Cancel" / "Overwrite and import"

2. If confirmed (or no existing data), use AskUserQuestion to choose a persona:
   - Question: "Which template persona is closest to your situation?"
   - Options:
     1. "Alex — Google L7, married, 2 kids, Cupertino, Taiwanese immigrant, NW ~$5.5M" — Bay Area family, dual-income, META stock concentration, homeowner, cross-border tax (Taiwan)
     2. "Sophia — Anthropic Staff, single, SF renter, British expat, NW ~$4.3M" — Early AI startup, private stock concentration, O-1A visa, UK pension/accounts, AMT complexity

3. Run the appropriate seed command:
   - Alex: `node ~/Desktop/Capis/scripts/seed-data.js alex`
   - Sophia: `node ~/Desktop/Capis/scripts/seed-data.js sophia`

4. Report based on selection:
   - Alex: "Template imported — Alex, Staff Engineer (L7) @ Google, Taiwanese immigrant, Cupertino CA. Net worth ~$5.5M."
   - Sophia: "Template imported — Sophia, Staff Research Engineer @ Anthropic, British expat, SF. Net worth ~$4.3M."
5. Ask: "Want to open the dashboard? (`/capis`)"
