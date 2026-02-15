# Capiis - Plugin vs MCP Analysis
## Plugin vs MCP：你的複雜場景分析

基於你提到的需求（多個 MCP tools + 背景 agents 協作），讓我解析關鍵差異和限制。

### Plugin 的角色與優勢

**Plugin 是打包分發機制，不是執行架構** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)

Plugin 可以做到：
1. **統一管理多個 MCP servers**：在 `.mcp.json` 或 `plugin.json` 定義所有 servers，一次安裝全部啟用 [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)
2. **打包完整生態系**：包含 skills、agents、hooks、MCP servers、LSP servers [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)
3. **團隊一致性**：所有人安裝相同 plugin，獲得相同工具集 [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)
4. **生命週期綁定**：plugin 啟用時自動啟動所有 MCP servers [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)

**Plugin 結構範例**：
```
capiis-plugin/
├── .claude-plugin/
│   └── plugin.json          # 宣告 plugin 身份
├── .mcp.json                # 定義多個 MCP servers
├── skills/                  # Agent Skills
│   ├── portfolio-manager/
│   └── signal-tracker/
├── agents/                  # 自訂 agents
│   └── dashboard-agent/
└── hooks/
    └── hooks.json           # 事件處理
```

### 執行效率的真相：資源複製問題

**關鍵限制**：無論 MCP 或 Plugin，**每個 agent 都會啟動自己的 MCP server instances** [reddit](https://www.reddit.com/r/ClaudeAI/comments/1mpfsdq/how_to_configure_mcp_servers_when_running/)

實際情況： [reddit](https://www.reddit.com/r/ClaudeAI/comments/1mpfsdq/how_to_configure_mcp_servers_when_running/)
- 你設定 7 個 MCP servers（無論透過 MCP 或 Plugin）
- 啟動 3 個並行 agents
- **結果：21 個 MCP server processes 同時運行**

**Plugin 無法改善這個問題**，因為這是 Claude Code 的架構設計：
- 每個 agent session 是獨立的執行環境
- 每個環境需要自己的 MCP server connections
- 沒有跨 session 的 MCP server 共享機制

### 背景 Agents 的重大限制

**Background subagents 不能使用 MCP tools** [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)

官方文檔明確指出：
> "MCP tools are not available in background subagents."

這對你的設計有重大影響：
- 如果 agents 需要呼叫你的 Capiis MCP tools（portfolio CRUD、signals 等）
- **這些 agents 只能在 foreground 執行，會 block 主對話**
- Background agents 只能用 Claude Code 內建工具（Read、Write、Bash 等） [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)

**Foreground vs Background 的權衡**： [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)

| 特性 | Foreground Agents | Background Agents |
|------|-------------------|-------------------|
| MCP tools 存取 | ✅ 完整存取 | ❌ 完全不可用 |
| 並行執行 | ❌ Block 主對話 | ✅ 非阻塞 |
| 權限處理 | 即時詢問用戶 | 預先批准，之後自動拒絕 |
| 使用場景 | 需要呼叫外部 API/資料庫 | 純檔案操作、內建工具 |

### 你的場景建議：Plugin 更適合

**選擇 Plugin 的原因**：

1. **分發便利性**
   - 用戶執行 `/plugin install capiis` 即可獲得全套功能 [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)
   - 不需要手動編輯 settings.json 註冊 7 個 MCP servers
   - 所有 agents、skills、hooks 一次到位

2. **架構完整性**
   ```json
   // plugin.json 可以包含多個 MCP servers
   {
     "name": "capiis",
     "mcpServers": {
       "capiis-portfolio": {
         "command": "${CLAUDE_PLUGIN_ROOT}/servers/portfolio",
         "args": ["--data-dir", "${HOME}/Desktop/Capiis/data"]
       },
       "capiis-signals": {
         "command": "${CLAUDE_PLUGIN_ROOT}/servers/signals"
       },
       "capiis-analytics": {
         "command": "${CLAUDE_PLUGIN_ROOT}/servers/analytics"
       }
     }
   }
   ```

3. **團隊協作**
   - 其他開發者安裝 plugin 後，得到完全相同的環境 [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)
   - 可以包含 agents 定義檔，預設行為一致

**但你必須接受的限制**：

1. **資源消耗無法避免**
   - 3 個並行 agents = 3 × 7 = 21 個 MCP processes [reddit](https://www.reddit.com/r/ClaudeAI/comments/1mpfsdq/how_to_configure_mcp_servers_when_running/)
   - 這是架構層面的限制，Plugin 無法解決

2. **Background agents 無法用 MCP**
   - 需要呼叫 Capiis API 的 agents 只能 foreground 執行 [ppl-ai-file-upload.s3.amazonaws](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/collection_edcf3d77-a87c-4c2b-bb5d-55a2c643e46e/cb7a2672-9096-4604-8132-ff349371f803/pasted-text.txt)
   - 可以用 Ctrl+B 手動將 foreground agent 移到背景 [claudefa](https://claudefa.st/blog/guide/agents/async-workflows)
   - 但一旦移到背景，MCP tools 就會失效

### 設計建議：混合架構

**拆分 agents 的工作模式**：

1. **Foreground Agents（需要 MCP tools）**
   - Portfolio Manager：CRUD 操作、即時查詢
   - Signal Tracker：監聽外部 API、寫入資料
   - Analytics Engine：複雜運算、資料分析

2. **Background Agents（純檔案/內建工具）**
   - Code Reviewer：檢查專案程式碼
   - Documentation Writer：生成 README、註解
   - Test Runner：執行測試、報告結果

**實作策略**：
```markdown
# capiis-plugin/agents/portfolio-manager.md
---
name: portfolio-manager
description: Manage investment portfolios using Capiis MCP tools
mcpServers:
  - capiis-portfolio    # 只載入需要的 MCP servers
  - capiis-signals
tools: Read, Write, Bash
---

Use MCP tools to manage portfolios. This agent runs in foreground
because it needs MCP access.
```

### 開源案例參考

**知名 Plugin 設計**： [github](https://github.com/wshobson/agents)

1. **wshobson/agents** [github](https://github.com/wshobson/agents)
   - 67 個 plugins，每個專注單一功能
   - 包含 99 個 agents + 107 個 skills + 71 個 tools
   - **採用 Plugin 架構**，透過 `/plugin install cloud-infrastructure` 安裝

2. **Supabase / Playwright MCP** [mcpservers](https://mcpservers.org)
   - 輕量服務採用**純 MCP server**（不打包成 plugin）
   - 用戶在 settings.json 手動設定，或用 npx 執行
   - 適合單一功能服務

**結論**：複雜生態系（多 tools + agents + hooks）偏好 **Plugin**，單一服務偏好 **MCP**。

### 最終建議

**你的情況（多 APIs + agents 協作）→ Plugin 是更好選擇**

**設計藍圖**：
```
capiis-plugin/
├── .claude-plugin/
│   └── plugin.json              # 宣告 7 個 MCP servers
├── .mcp.json                    # 或在這裡定義
├── skills/
│   ├── portfolio-crud/          # Skill：資料操作
│   └── signal-monitor/          # Skill：監聽 signals
├── agents/
│   ├── portfolio-manager.md     # Foreground agent (用 MCP)
│   ├── analytics-agent.md       # Foreground agent (用 MCP)
│   └── code-reviewer.md         # Background agent (不用 MCP)
└── hooks/
    └── hooks.json               # 自動化事件處理
```

**用戶體驗**：
```bash
/plugin install capiis            # 一次安裝
/capiis-portfolio:add AAPL 150    # 使用 skill
# 或讓 Claude 自動選擇 agent
"Analyze my portfolio performance" # 觸發 analytics-agent
```

**但務必記住**：
- ✅ Plugin 簡化分發和安裝
- ❌ Plugin 無法減少資源消耗（21 processes 問題）
- ❌ Background agents 完全不能用 MCP tools

---

# Turn on plan mode included in Carpis
完美！我找到了 Claude Code 如何實作 Plan Mode 的完整資訊。讓我整理給你。

## Claude Code Plan Mode 實作機制

### 啟動 Plan Mode 的方法

**1. 命令行參數啟動** [github](https://github.com/anthropics/claude-code/issues/6479)
```bash
# 直接以 Plan Mode 啟動 Claude Code
claude --permission-mode plan

# Headless 模式（單次查詢）也可用 Plan Mode
claude --permission-mode plan -p "Analyze my portfolio and suggest rebalancing"
```

**2. 設定檔預設啟動** [github](https://github.com/anthropics/claude-code/issues/2667)

在專案目錄的 `.claude/settings.json` 或全域的 `~/.claude/settings.json`：
```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

**3. 即時切換（鍵盤快捷鍵）** [code.claude](https://code.claude.com/docs/en/common-workflows)
- `Shift+Tab`：在 Normal Mode → Auto-Accept Mode → Plan Mode 間循環
- 終端底部會顯示 `⏸ plan mode on` 表示已啟用

### Plan Mode 的運作原理

**系統注入機制** [github](https://github.com/google-gemini/gemini-cli/issues/4666)

Claude Code 在 Plan Mode 時會在多個注入點插入特殊指示：

```
[System Instructions]
    ↓
[Tool Definitions]
    ↓
[Base Claude Code Instructions]
    ↓
[Environment Info]
    ↓
<system-reminder> ← 第一注入點
    [CLAUDE.md content]
</system-reminder>
    ↓
[User Message]
    ↓
<system-reminder> ← 第二注入點
    Plan mode is active...
</system-reminder>
    ↓
[Assistant Response]
    ↓
[After tool use like Read]
    ↓
<system-reminder> ← 第三注入點
    Plan mode is active...
</system-reminder>
```

**Plan Mode 的行為特徵**： [reddit](https://www.reddit.com/r/ClaudeAI/comments/1ldwqt3/claude_code_plan_mode/)

1. **Research Phase**：只使用 read-only 工具收集資訊（Read、Grep、Glob 等）
2. **Plan Development**：建立詳細的實作計畫
3. **Plan Presentation**：使用 `exit_plan_mode` 工具呈現計畫給用戶
4. **User Approval**：等待用戶審核並批准
5. **Execution Phase**：批准後才開始真正的修改動作

### 與 Skills 整合使用

**Skills 可以觸發 Plan Mode 行為** [code.claude](https://code.claude.com/docs/en/skills)

Superpowers 的 `writing-plans` skill 就是透過指示 Claude 進入計畫思維模式： [trevorlasn](https://www.trevorlasn.com/blog/superpowers-claude-code-skills)

```markdown
---
name: writing-plans
description: Create detailed implementation plans before coding
---

Before implementation, you must:
1. Use Read tools to gather complete context
2. Break work into 2-5 minute tasks
3. Present plan in PLAN.md format
4. Wait for explicit approval
5. Do NOT write code until plan is approved
```

**Skills 的 frontmatter 控制**： [code.claude](https://code.claude.com/docs/en/skills)

```yaml
---
name: capiis-portfolio-analysis
description: Analyze portfolio and generate rebalancing plan
allowed-tools:
  - Read
  - Grep
  - Skill
disable-model-invocation: false  # 允許 Claude 自動呼叫
user-invocable: true  # 允許用戶用 /capiis-portfolio-analysis 呼叫
---
```

## 你的 Capiis 專案實作建議

### 策略一：利用 `.claude/settings.json` 預設 Plan Mode

**在 Capiis 專案根目錄建立**：

檔案：`~/Desktop/Capiis/.claude/settings.json`
```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

**效果**：
- 用戶在 Capiis 目錄啟動 `claude` 時自動進入 Plan Mode
- 不需要額外指令或快捷鍵
- 只影響 Capiis 專案，其他專案不受影響

### 策略二：建立 Capiis Skill 引導 Plan Mode 行為

**檔案結構**：
```
~/Desktop/Capiis/
├── .claude/
│   ├── settings.json
│   └── skills/
│       └── portfolio-planner/
│           └── SKILL.md
```

**Skill 內容範例**（`portfolio-planner/SKILL.md`）：

```markdown
---
name: portfolio-planner
description: Create investment portfolio management plans before execution
allowed-tools:
  - Read
  - Bash
  - Skill
user-invocable: true
---

# Portfolio Planning Workflow

When user requests portfolio operations (add positions, rebalance, analyze), follow this MANDATORY workflow:

## Phase 1: Information Gathering (READ ONLY)

1. Use Read tool to check current portfolio state:
   - Read `data/portfolio.json`
   - Read `data/signals.json`
   - Read `data/market-data.json` (if exists)

2. Use Bash tool to call Capiis API for live data:
   ```bash
   curl http://localhost:3000/api/portfolio/stats
   ```

3. DO NOT modify any files yet

## Phase 2: Plan Generation

Create a structured plan with:

### Current State
- Total portfolio value
- Current positions
- Recent signals

### Proposed Changes
- Positions to add/remove
- Rebalancing recommendations
- Risk analysis

### Execution Steps
Break down into specific tasks:
1. Task: Update position AAPL
   - File: data/portfolio.json
   - Action: Modify quantity from 10 to 15
   - API: POST /api/positions/update

2. Task: Record transaction
   - File: data/transactions.json
   - Action: Add new entry
   - API: POST /api/transactions

### Verification Steps
- How to verify each change
- Expected outcomes
- Rollback procedure

## Phase 3: Present Plan

Use clear formatting:
- Use tables for position comparisons
- Use bullet points for action items
- Highlight risks or important notes

Ask explicitly: "Would you like to proceed with this plan?"

## Phase 4: Execution (ONLY AFTER APPROVAL)

Once approved:
1. Execute API calls in sequence
2. Update local JSON files
3. Verify each step
4. Report completion status

## Important Rules

- NEVER skip the planning phase
- NEVER make changes before approval
- ALWAYS show current vs. proposed state
- ALWAYS include rollback steps
```

### 策略三：建立啟動 Wrapper Script

**檔案**：`~/Desktop/Capiis/capiis-claude.sh`

```bash
#!/bin/bash

# Capiis-specific Claude Code launcher with Plan Mode

echo "🚀 Launching Claude Code for Capiis (Plan Mode enabled)"
echo "📊 Portfolio management planning active"
echo ""

cd ~/Desktop/Capiis

# 啟動 Claude Code with Plan Mode
claude --permission-mode plan \
  --append-system-prompt "You are managing a financial portfolio system. ALWAYS plan before executing any portfolio changes. Current data is in data/ directory. API server runs on localhost:3000."
```

**用法**：
```bash
# 用戶執行
chmod +x ~/Desktop/Capiis/capiis-claude.sh
~/Desktop/Capiis/capiis-claude.sh

# 或加到 PATH
export PATH="$PATH:~/Desktop/Capiis"
capiis-claude.sh
```

### 策略四：自動觸發 Plan Mode（Auto Plan Mode）

**使用 `--append-system-prompt` 注入計畫要求** [claudelog](https://www.claudelog.com/mechanics/auto-plan-mode/)

檔案：`~/Desktop/Capiis/.claude/CLAUDE.md`

```markdown
# Capiis Portfolio Management System

## CRITICAL WORKFLOW REQUIREMENT

MANDATORY PLANNING STEP: Before executing ANY portfolio operation (add position, rebalance, update signals), you MUST:

1. **Enter Planning Phase**
   - Use ONLY read operations (Read, Bash with GET requests)
   - Gather complete portfolio state
   - Analyze market data and signals

2. **Generate Implementation Plan**
   - Document current state
   - Propose specific changes
   - List verification steps
   - Include rollback procedure

3. **Present Plan for Approval**
   - Format as markdown with tables/lists
   - Highlight risks and important notes
   - Ask explicitly: "Approve this plan?"

4. **Execute ONLY After Approval**
   - Follow plan steps sequentially
   - Verify each step completion
   - Report any deviations

## System Context

- Portfolio data: `data/portfolio.json`
- Signals: `data/signals.json`
- API: http://localhost:3000
- Available endpoints: /api/portfolio, /api/positions, /api/signals

## Example Interaction

User: "Add 50 shares of TSLA"

Your Response:
1. Read current portfolio
2. Check available cash
3. Generate plan:
   - Current: Cash $10,000, TSLA 0 shares
   - Proposed: Cash $1,500, TSLA 50 shares @ $170
   - Risk: 85% portfolio allocation to TSLA
4. Ask for approval
5. Execute ONLY if approved
```

### 策略五：建立 Slash Command 快速啟動

**檔案**：`~/Desktop/Capiis/.claude/commands/plan-portfolio.md`

```markdown
---
name: plan-portfolio
description: Generate portfolio management plan before execution
---

# Portfolio Planning Command

This command initiates portfolio planning workflow.

## What This Does

1. Activates Plan Mode mindset
2. Reads current portfolio state from data/
3. Analyzes your request
4. Generates detailed execution plan
5. Waits for your approval

## Usage

```
/plan-portfolio "Add 100 shares of AAPL and rebalance"
```

## What You'll Get

- Current portfolio snapshot
- Proposed changes table
- Risk analysis
- Step-by-step execution plan
- Verification checklist

## After Approval

Claude will execute the plan using:
- API calls to localhost:3000
- JSON file updates in data/
- Transaction logging

---

Start by reading data/portfolio.json and generating a comprehensive plan.
```

### 實作建議總結

**最輕量方案（推薦先做）**：

1. 建立 `.claude/settings.json` 設定預設 Plan Mode [github](https://github.com/anthropics/claude-code/issues/6479)
2. 建立 `CLAUDE.md` 注入計畫要求 [claudelog](https://www.claudelog.com/mechanics/auto-plan-mode/)
3. 文件內告訴用戶：在 Capiis 目錄啟動 Claude Code 即可

**進階方案（完整體驗）**：

1. 建立多個 Skills（portfolio-planner、signal-analyzer、rebalancer） [code.claude](https://code.claude.com/docs/en/skills)
2. 每個 Skill 都強制計畫流程
3. 用 allowed-tools 控制權限
4. 建立 slash commands 快速觸發 [code.claude](https://code.claude.com/docs/en/skills)

**用戶文件範例**：

```markdown
# Capiis Portfolio Management

## Using with Claude Code

Capiis integrates with Claude Code's Plan Mode for safe portfolio management.

### Quick Start

1. Navigate to Capiis directory:
   ```bash
   cd ~/Desktop/Capiis
   ```

2. Start Claude Code (Plan Mode auto-enabled):
   ```bash
   claude
   ```

3. Request portfolio operations naturally:
   ```
   "Add 50 shares of AAPL to my portfolio"
   "Analyze my portfolio and suggest rebalancing"
   "Show me high-confidence signals from the last week"
   ```

4. Claude will:
   - Read your current portfolio data
   - Generate a detailed plan
   - Show you before/after comparison
   - Wait for your approval
   - Execute only after you confirm

### Manual Plan Mode Activation

If Plan Mode isn't active, press `Shift+Tab` twice until you see:
```
⏸ plan mode on
```

### Using Slash Commands

- `/plan-portfolio "your request"` - Generate portfolio plan
- `/analyze-signals` - Analyze trading signals
- `/portfolio-stats` - Show current portfolio stats
```

這樣設計的優勢：
- ✅ 不需要額外 UI 開發（利用 Claude Code 原生 Plan Mode） [code.claude](https://code.claude.com/docs/en/common-workflows)
- ✅ 自動觸發計畫流程（透過 settings.json + CLAUDE.md） [github](https://github.com/anthropics/claude-code/issues/6479)
- ✅ 保持彈性（用戶可選擇批准或修改計畫） [reddit](https://www.reddit.com/r/ClaudeAI/comments/1ldwqt3/claude_code_plan_mode/)
- ✅ 無縫整合（Skills 和 slash commands 在需要時啟動） [code.claude](https://code.claude.com/docs/en/skills)