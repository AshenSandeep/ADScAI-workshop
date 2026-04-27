---
description: Create a PR with mandatory review and convention checks. The only allowed way to push.
---

You are creating a pull request against `main`. Run the chain in order. Each step pauses for user confirmation.

## Steps

1. **Detect state** — `git branch --show-current`, `git status --porcelain`, `git fetch origin main`.
2. **Branch handling** — if on `main` with uncommitted changes, ask for a branch name and create it.
3. **Capture learnings** — invoke the `capture-learnings` skill (high-bar; default is skip).
4. **Simplify** — invoke `/simplify` if the diff has obviously redundant code.
5. **Review** — run a comprehensive review (auth wrappers, service-layer delegation, query patterns, error handling). If `pr-review-toolkit:review-pr` is available, use it.
6. **FEATURES.md** — if user-facing behaviour changed, update `docs/FEATURES.md`.
7. **Title** — generate a P3 naming-convention title: `P3_<XXS|XS|S|M|L|XL|XXL>_<Short description>`.
8. **Description** — generate from `git log origin/main..HEAD --oneline`.
9. **User approval** — present title + body, wait for go.
10. **Push + create** — `git push -u origin <branch>` then `gh pr create --base main`.

**This is the ONLY allowed way to create PRs in this project.** Never use `gh pr create` directly.
