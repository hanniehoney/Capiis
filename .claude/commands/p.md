---
allowed-tools: Bash(git *)
---

Quick commit and push the current changes.

## Instructions

1. Run `git status` to check for changes
2. If there are no changes, tell the user "Nothing to commit" and stop
3. Run `git diff --stat` to summarize what changed
4. Stage all changes: `git add -A`
5. Generate a concise commit message based on the diff (1-2 sentences, focus on "why" not "what")
6. Commit with the generated message (include Co-Authored-By trailer)
7. Push to the current branch: `git push`
8. Report: commit hash, branch, and summary
