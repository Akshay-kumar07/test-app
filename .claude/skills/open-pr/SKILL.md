---
name: open-pr
description: >-
  Commit finished work in this repo with a conventional-commit message, push
  the branch, and open a GitHub PR with a filled-in template. Use once a
  change is implemented and tested, when the user says things like "open a
  PR", "push this up", or "ship this".
---

# Open PR

This repo enforces two things that make a naive `git commit && git push`
fail: **husky commit-msg hook via commitlint** (Conventional Commits format,
`type: subject`) and a CI workflow (`.github/workflows/ci.yml`) that runs
tests with coverage thresholds and a build. Follow this sequence so the demo
doesn't stall on either.

1. **Check state first.** Run `git status` and `git diff` to see what's
   actually changed. Never `git add -A` blindly — review the file list for
   anything unexpected (secrets, build artifacts, unrelated changes).
2. **Verify locally before committing:**
   - `npm run test -- --coverage --watchAll=false` — must exit 0. If coverage
     thresholds in `package.json` (`jest.coverageThreshold`) are newly broken
     by this change, that's a real signal to add tests, not to lower the
     threshold again.
   - `npm run build` — must complete with `Compiled successfully`.
3. **Commit with a Conventional Commit message**: `<type>: <short summary>`,
   where `type` is one of `feat`, `fix`, `chore`, `docs`, `refactor`, `test`,
   `ci` — match the type to what actually changed. A bare subject-less
   message or a non-conventional type will be rejected by the commit-msg
   hook — if that happens, fix the message and recommit, don't bypass with
   `--no-verify`.
4. **Push** the branch (`git push -u origin <branch>` for a new branch).
5. **Open the PR.** If `gh` is available, use
   `gh pr create --title "..." --body "..."`. Otherwise, tell the user the
   branch is pushed and give them the compare URL
   (`https://github.com/<owner>/<repo>/compare/main...<branch>`) so they can
   open it manually. PR body template:

   ```
   ## Summary
   - <what changed, 1-3 bullets>

   ## Jira
   <link to the ticket this closes, if there is one>

   ## Test plan
   - [ ] `npm run test` passes
   - [ ] `npm run build` passes
   - [ ] Manually verified in the browser: <what to check>
   ```

6. **Report back** the PR URL (or compare URL) and a one-line summary of what
   was shipped. Don't merge — that's a separate, explicit user decision.
