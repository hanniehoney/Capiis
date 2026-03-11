# Capiis -- Claude Code Guide

Shared project context lives in `AGENTS.md`. Use that file as the canonical
source for product framing, repo layout, data files, API endpoints, and shared
runtime conventions. User-facing overview and setup live in `README.md`.

## Claude Code Specific Files

- `.claude/commands/capiis.md`
- `.claude/commands/capiis-data.md`
- `.claude/agents/tax-analyst.md`
- `.claude/agents/price-tracker.md`
- `.claude/agents/feed-analyst.md`
- `.claude/hooks/session-check.sh`
- `.claude/settings.json`
- `.claude/settings.local.json`

## Working Rules

- Preserve the public command names `/capiis` and `/capiis-data`.
- Preserve the local server flow on `127.0.0.1:3333`.
- Treat `data/*.xlsx`, `data/*.json`, and `data/profile.md` as user-owned data.
  Read before writing and never overwrite unrelated fields.
- Shared skills now live under `.claude/skills/`.
- Claude subagents remain Claude-specific. OpenCode support is handled through
  `AGENTS.md`, `.opencode/commands/`, and shared skills.

## Optional MCP

Claude Code users can add Perplexity MCP for faster live fact-checking:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@anthropic/perplexity-mcp"],
      "env": {
        "PERPLEXITY_API_KEY": "pplx-..."
      }
    }
  }
}
```
