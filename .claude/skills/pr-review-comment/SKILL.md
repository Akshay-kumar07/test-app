---
name: pr-review-comment
description: >-
  Review an open GitHub PR (or the current diff) for correctness/simplification
  findings and reliably post them as inline review comments on that same PR,
  then reply-and-resolve each thread once addressed. Use when the user says
  things like "review this PR and comment", "post review findings on the PR",
  or "resolve those review comments" — and especially as a fallback when the
  built-in code-review skill's `--comment` flag appears to run but no comment
  shows up on GitHub.
---

# PR Review + Comment

The built-in `code-review` skill can _find_ issues, but its `--comment`
posting step has silently no-op'd before: it returns findings as data without
ever calling the GitHub API. Always verify a comment actually landed —
don't trust the skill's own "posted" claim.

## 1. Get findings

Run `code-review` (with whatever effort level fits) to get a findings list,
or do the review yourself. Each finding needs: `file`, a description, and a
concrete failure scenario.

## 2. Verify nothing posted yet, and get the PR's head SHA

```bash
gh api repos/<owner>/<repo>/pulls/<n>/comments --jq '.[] | {id, path, line}'
gh api repos/<owner>/<repo>/pulls/<n>/reviews   --jq '.[] | {id, state}'
head_sha=$(gh pr view <n> --repo <owner>/<repo> --json headRefOid --jq .headRefOid)
```

## 3. Find comment-eligible lines from the real diff

GitHub only accepts an inline review comment on a line that's inside a
**changed diff hunk** for the PR's head commit — not any line in the final
file. Get the diff and read the hunk headers before picking line numbers:

```bash
gh pr diff <n> --repo <owner>/<repo> > /tmp/.../pr.diff
grep -n '^@@' /tmp/.../pr.diff   # each "@@ -a,b +c,d @@" covers new-file lines c..c+d-1
```

Anchor each finding's `line` inside one of those new-file ranges (prefer the
line the finding is actually about; if that line is just outside a hunk,
pick the nearest in-range line in the same function/block — mention the
real target line in the comment body itself).

## 4. Build the payload as a JSON file — don't use `gh api -f` bracket syntax

`gh api -f "comments[0][path]=..."` does **not** build a JSON array; it
produces an object with string keys `"0"`, `"1"`, ... and GitHub rejects it
with `"is not an array"`. Always write a real JSON file instead:

```json
{
  "commit_id": "<head_sha>",
  "event": "COMMENT",
  "body": "Automated code review findings for this change.",
  "comments": [
    { "path": "src/foo.ts", "line": 42, "side": "RIGHT", "body": "..." }
  ]
}
```

```bash
gh api repos/<owner>/<repo>/pulls/<n>/reviews -X POST --input payload.json
```

If it 422s with `"Line could not be resolved"`, that comment's line is
outside every diff hunk — go back to step 3 and re-anchor just that entry
(other comments in the same payload may already have posted fine; check
before re-submitting the whole batch).

## 5. Confirm it actually landed

```bash
gh api repos/<owner>/<repo>/pulls/<n>/comments --jq '.[] | {path, line, body: .body[0:60]}'
```

Don't report success until this shows the new comments.

## 6. After fixes: reply and resolve each thread

Get thread IDs via GraphQL (REST doesn't expose thread resolution):

```bash
gh api graphql -f query='
query { repository(owner:"<owner>", name:"<repo>") {
  pullRequest(number: <n>) { reviewThreads(first: 20) { nodes {
    id isResolved comments(first: 1) { nodes { path line body } }
  } } }
} }'
```

For each thread you fixed, reply with what changed, then resolve:

```bash
gh api graphql -f query='
mutation($id: ID!, $body: String!) {
  addPullRequestReviewThreadReply(input: {pullRequestReviewThreadId: $id, body: $body}) {
    comment { id }
  }
}' -f id="$thread_id" -f body="Fixed — ..."

gh api graphql -f query='
mutation($id: ID!) {
  resolveReviewThread(input: {threadId: $id}) { thread { isResolved } }
}' -f id="$thread_id"
```

Only resolve threads you actually addressed — leave others open for the
commenter, and never re-resolve a thread that's already resolved (reply
into it instead).
