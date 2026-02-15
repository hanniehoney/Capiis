#!/bin/bash
# Capis Session Check Hook
# Runs on SessionStart — checks data freshness and upcoming deadlines
# Outputs context for Claude to decide which agents to auto-run

PROJECT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
DATA_DIR="$PROJECT_DIR/data"

# --- Price Staleness ---
LAST_UPDATED=""
if [ -f "$DATA_DIR/stocks.xlsx" ]; then
  LAST_UPDATED=$(node -e "
    const XLSX = require('$PROJECT_DIR/node_modules/xlsx');
    const wb = XLSX.readFile('$DATA_DIR/stocks.xlsx');
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(ws);
    const dates = data.map(r => r.lastUpdated).filter(Boolean).sort().reverse();
    if (dates.length) console.log(dates[0]);
  " 2>/dev/null)
fi

STALE_HOURS=0
if [ -n "$LAST_UPDATED" ]; then
  LAST_EPOCH=$(date -j -f "%Y-%m-%d" "$LAST_UPDATED" "+%s" 2>/dev/null || echo 0)
  NOW_EPOCH=$(date "+%s")
  if [ "$LAST_EPOCH" -gt 0 ]; then
    STALE_HOURS=$(( (NOW_EPOCH - LAST_EPOCH) / 3600 ))
  fi
fi

# --- Tax Deadlines ---
TODAY=$(date "+%Y-%m-%d")
YEAR=$(date "+%Y")
APR15="${YEAR}-04-15"
APR15_EPOCH=$(date -j -f "%Y-%m-%d" "$APR15" "+%s" 2>/dev/null || echo 0)
NOW_EPOCH=$(date "+%s")
DAYS_TO_APR15=0
if [ "$APR15_EPOCH" -gt 0 ]; then
  DAYS_TO_APR15=$(( (APR15_EPOCH - NOW_EPOCH) / 86400 ))
fi

# --- Intel Feed Staleness ---
INTEL_STALE_HOURS=999
if [ -f "$DATA_DIR/intel-digest.json" ]; then
  LAST_ANALYZED=$(node -e "
    const d = require('$DATA_DIR/intel-digest.json');
    console.log(d.lastAnalyzed || '');
  " 2>/dev/null)
  if [ -n "$LAST_ANALYZED" ]; then
    LAST_INTEL_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S" "${LAST_ANALYZED%%Z}" "+%s" 2>/dev/null || echo 0)
    if [ "$LAST_INTEL_EPOCH" -gt 0 ]; then
      INTEL_STALE_HOURS=$(( (NOW_EPOCH - LAST_INTEL_EPOCH) / 3600 ))
    fi
  fi
fi

# --- Active Signals ---
ACTIVE_SIGNALS=0
HIGH_SIGNALS=0
if [ -f "$DATA_DIR/signals.json" ]; then
  SIGNAL_INFO=$(node -e "
    const d = require('$DATA_DIR/signals.json');
    const sigs = d.signals || d;
    const active = sigs.filter(s => !s.dismissed);
    const high = active.filter(s => s.priority === 'high');
    console.log(active.length + '|' + high.length);
  " 2>/dev/null)
  ACTIVE_SIGNALS=$(echo "$SIGNAL_INFO" | cut -d'|' -f1)
  HIGH_SIGNALS=$(echo "$SIGNAL_INFO" | cut -d'|' -f2)
fi

# --- Profile Name ---
PROFILE_NAME=""
if [ -f "$DATA_DIR/profile.json" ]; then
  PROFILE_NAME=$(node -e "
    const p = require('$DATA_DIR/profile.json');
    console.log(p.personal?.name || 'User');
  " 2>/dev/null)
fi

# --- Output Context ---
TRIGGERS=""

if [ "$STALE_HOURS" -gt 24 ]; then
  TRIGGERS="${TRIGGERS}STALE_PRICES "
fi

if [ "$DAYS_TO_APR15" -gt 0 ] && [ "$DAYS_TO_APR15" -le 90 ]; then
  TRIGGERS="${TRIGGERS}TAX_SEASON "
fi

if [ "$INTEL_STALE_HOURS" -gt 12 ]; then
  TRIGGERS="${TRIGGERS}STALE_INTEL "
fi

# Always output status
echo "[capis-check] Profile: ${PROFILE_NAME:-Unknown} | Prices: ${STALE_HOURS}h old | Intel: ${INTEL_STALE_HOURS}h old | Apr 15: ${DAYS_TO_APR15} days | Signals: ${ACTIVE_SIGNALS} active (${HIGH_SIGNALS} high)"

if [ -n "$TRIGGERS" ]; then
  echo "[capis-auto] Triggers detected: ${TRIGGERS}"

  if echo "$TRIGGERS" | grep -q "STALE_PRICES"; then
    echo "[capis-auto] Prices are ${STALE_HOURS}h stale (>24h threshold). Run price-tracker agent to update."
  fi

  if echo "$TRIGGERS" | grep -q "TAX_SEASON"; then
    echo "[capis-auto] Tax filing deadline in ${DAYS_TO_APR15} days. Run tax-analyst agent for time-sensitive briefing."
  fi

  if echo "$TRIGGERS" | grep -q "STALE_INTEL"; then
    echo "[capis-auto] Intel feed is ${INTEL_STALE_HOURS}h stale (>12h threshold). Run feed-analyst agent to scan."
  fi

  if echo "$TRIGGERS" | grep -q "STALE_PRICES" && echo "$TRIGGERS" | grep -q "TAX_SEASON"; then
    echo "[capis-auto] Both agents can run in parallel. Merge results into a unified briefing."
  fi
fi

exit 0
