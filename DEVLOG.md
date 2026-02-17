# Capiis — Build Log

**Built with Opus 4.6: A Claude Code Hackathon**
Hosted by Cerebral Valley x Anthropic | Feb 10–16, 2026 | Virtual

---

## 2026-02-10 (Day 1)

Joined the virtual kickoff at 12:00 PM EST (1:00 AM CST, Feb 11). 500 spots out of 15,000 applicants — felt good to make the cut. After the intro session (rules, prizes, judging, technical talks), hacking officially began at 12:30 PM EST.

Hit a snag right away: API credits weren't showing up for everyone. Some participants had theirs, others didn't. Since it was 1:30 AM my time in Taipei, I decided to just go to sleep and deal with it in the morning. Woke up, credits were there. Started building immediately.

### What I did

- Attended the virtual kickoff (12:00–12:30 PM EST)
- Scaffolded the full Capiis project end-to-end: Express server, vanilla JS frontend, JSON data layer, SSE real-time sync, Claude Code slash command + portfolio intelligence skill
- First working version live — dashboard renders portfolio, intelligence feed, and tax views

### What's next

- [ ] Different chart types per asset category (stocks vs crypto vs startups shouldn't look the same)
- [ ] Rethink how assets are categorized, added, and removed
- [ ] Automate the intelligence feed with real sources (kill the mock data)
- [ ] Tax planning agent

### Blockers

- Need to decide frontend evolution path: stay vanilla JS, adopt Web Components, or migrate to React/Next.js — deferred until scope is clearer
- `/capiis` slash command only works inside the project directory — want it to be a global plugin any Claude Code user can invoke from anywhere, need to rethink the command/skill hierarchy

### Time spent

| Task | Duration |
|------|----------|
| API setup, scope & planning, resource gathering (Perplexity space) | 1.5 hr |
| Learn Claude Code techniques & tricks | 0.5 hr |
| Pick & install skills, init project & naming, build MVP | 4 hr |
| Call with a startup founder re: YC application (VC life doesn't stop) | 1 hr |
| Total | **7.0 hr** |

---

## 2026-02-11 (Day 2)

Focused on restructuring the project's core architecture around real-world portfolio workflows and local-first deployment.

### What I did
- Completed config setup and stabilized the working environment.
- Researched MCP vs Plugin tradeoffs and made an implementation direction decision.
- Migrated Portfolio Assets data layer to Excel XLSX and restructured/imported asset data.
- Updated wealth management architecture and portfolio structure design.
- Performed UI and structure adjustments for portfolio-related flows.
- Worked primarily on architecture design across data, views, and flow consistency.
- Resolved key wealth-side implementation issues.
- Implemented tax-side updates (UI + logic alignment with wealth data model).
- Built the first tax-focused agent.

### What's next
- [ ] ~~Different chart types per asset category (stocks vs crypto vs startups shouldn't look the same)~~
- [ ] ~~Rethink how assets are categorized, added, and removed~~
- [ ] Automate the intelligence feed with real sources (kill the mock data)
- [ ] ~~Tax planning agent~~
- [ ] Evaluate moving `Hidden Liability: Unrealized Capital Gains Tax` and `Taxable Events` into the Wealth sidebar (or sidebar-linked navigation) to reduce Tax page length; decision now, code change tomorrow.

### Blockers
- Tax complexity and how to keep the hackathon project scope under control.
- Tax Agent reconciliation — agent's calculated numbers (realizedGains, netRealizedGainLoss, estimatedTaxLiability, unrealizedGains) don't fully match the taxable events and portfolio data. Need to audit the calculation logic and ensure agent output is consistent with source data before trusting the write-back.

### Time spent
| Task | Duration |
|------|----------|
| Config setup + MCP vs Plugin research & decision | 1.5 hr |
| Restructure + import XLSX as portfolio assets DB | 1.5 hr |
| Wealth management structure update + UI/structure adjustments | 1.5 hr |
| Tax UI work + first tax agent build | 1.5 hr |
| Total | **6.0 hr** |

---

## 2026-02-12 (Day 3)

Focused on onboarding realism and portfolio data usability: profile templates (two distinct personas), better asset classification, and real-time price tracking for public markets.

### What I did
- Adjusted UI and core structure across portfolio flows, especially around profile, clear-data, and template-driven onboarding.
- Added two Profile templates based on two very different real-world personas (inspired by friends in Silicon Valley) to make onboarding feel more relatable and to reduce friction around sensitive/complex wealth data entry.
- Refined asset classification and surfaced gaps that became obvious once template-driven portfolios started generating more diverse asset mixes.
- Implemented a Price Tracking agent and integrated Yahoo Finance APIs for near-real-time pricing (stocks + crypto), since web-search-only sources were not reliable enough for this use case.
- Fixed tax inconsistencies (logic/UI reconciliation) and added interaction hooks to make CLI flows smoother and improve user follow-up prompts.

### What's next
- [ ] ~~Evaluate moving `Hidden Liability: Unrealized Capital Gains Tax` and `Taxable Events` into the Wealth sidebar (or sidebar-linked navigation) to reduce Tax page length; decision now, code change tomorrow.~~
- [ ] ~~Evaluate real-time price lookup path (Yahoo Finance first, then MCP feasibility)~~
- [ ] ~~Upgrade profile depth for advanced tax/entity identity and optimization planning~~
- [ ] ~~Revisit information architecture as assets grow (whether Asset Management should remain under Wealth or be fully separated)~~
- [ ] Automate the intelligence feed with real sources (kill the mock data)

### Blockers
- Private equity / startup / angel investments often lack reliable public price feeds; valuation needs event-based updates (funding/secondary) or manual user input.
- Even when company-level valuation exists, user-specific details (grant dates, vesting status, cost basis, tax events) still require explicit user confirmation during assistant interactions.

### Time spent
| Task | Duration |
|------|----------|
| UI adjust + profile/clear data/template + structure adjustments | 1.5 hr |
| Add profile templates (Persona 1 + Persona 2) | 1.5 hr |
| Asset classification + pricing tracker agent (Yahoo Finance) | 1.5 hr |
| Fix tax inconsistency + interaction hooks | 1.0 hr |
| Total | **5.5 hr** |

---

## 2026-02-13 (Day 4)


### What I did
- Walked the end-to-end user journey to validate the core flow.
- Added a Text Fact Check agent and compared WebFetch vs. Perplexity-style reasoning search.
- Found WebFetch too slow for fact check due to direct crawling; reasoning search is faster and smoother for UX.
- Verified dashboard numbers match CLI report numbers.
- Updated Intelligence Feed design and data flow (UI + backend) to support RSS import.
- Positioned Intelligence Feed as a future knowledge base for Asset/Portfolio Management agents.

### What's next
- ~~[ ] Automate the intelligence feed with real sources (kill the mock data)~~

### Blockers
- App packaging not finalized yet: we still need a simple NPM package format and must decide between a plugin or MCP approach.

### Time spent
| Task | Duration |
|------|----------|
| User journey test | 1h |
| Text Fact Check agent | 1h |
| Search API comparison (WebFetch vs reasoning search) | 45m |
| Dashboard vs CLI number validation | 20m |
| Feed UI + RSS import update | 15m |
| Intelligence Feed as knowledge base design | 10m |
| Total | **3h 30m** |

---


## 2026-02-14 (Day 5)

Happy Vanlinetine's Day

---

## 2026-02-15 (Day 6)

Happy Wrap Up.

### What I did
- Wrapped up the project for demo day.
- Renamed the project from single “i” to double “i” (Capiis).
- Refined the logo and captured updated screenshots/terminal config.
- Built the demo slide structure.
- Spent the rest of the day editing the 3-minute demo video.

### What's next
- None (wrap-up day)

### Blockers
- None

### Time spent
| Task | Duration |
|------|----------|
| Change name to Capiis, logo/screenshot/terminal config, slide structure | 2h 30m |
| Demo video editing | 6h 30m |
| Total | **9h** |

---

## Thinking Out Loud (Consolidated)

### Frontend Stack Choice

- Options considered: Vanilla JS, Web Components, React/Next.js.
- Final decision: Vanilla JS for hackathon speed.
- Why: no build step, fastest Claude Code edit-to-refresh loop.

### Data Layer Choice (Database vs Excel)

- Options considered: external database service vs Excel files.
- Final decision: Excel files as the primary portfolio data layer.
- Why: spreadsheet-native user behavior + local-first privacy for sensitive personal wealth data.

### Asset Classification Hierarchy

- Options considered:
  - 3-tier hierarchy (market type + subtype + account/tax tags)
  - liquidity-first grouping
  - tax-treatment-first grouping
- Final decision: 3-tier hierarchy.
- Why: best balance between user readability and multi-dimensional agent analysis (risk, tax, liquidity).

### Employee Equity Tax Fields

- Options considered: basic equity fields vs full tax-aware fields.
- Final decision: full tax-aware model, implemented in phases.
- Why: enables proactive tax guidance (AMT risk, exercise-window timing, disposition timing), not only static reporting.

<!-- Template for new entries:

## YYYY-MM-DD (Day N)

(Diary — vibe, observations, anything notable from the day)

### What I did
-

### What's next
-

### Blockers
-

### Time spent
| Task | Duration |
|------|----------|
| | |

### Thinking out loud

-->
