---
name: ship-confluence-summary
description: >-
  Publish a "what changed and why" Confluence page for a finished change,
  and link it back to the originating Jira ticket. Use after a PR is open
  (or merged) and reviewed, when the user says things like "write up
  Confluence for this", "document what we shipped", or "publish the
  summary".
---

# Ship Confluence Summary

Requires the Atlassian MCP connector to be authorized (Jira + Confluence
tools available). If those tools aren't showing up, tell the user to check
`claude mcp list` for `claude.ai Atlassian Rovo` — connector status can lag
a session restart.

1. **Find the space.** Call `getConfluenceSpaces` — don't assume a space
   exists or guess an ID. If none are visible, tell the user no space is
   accessible and stop; a space has to be created in the Confluence web UI
   first (there's no tool to create one). If more than one space is
   visible, ask the user which to use rather than guessing — a personal
   space and a shared team space imply different audiences.
2. **Gather the facts before writing**, don't invent them:
   - The Jira ticket key and its acceptance criteria (re-fetch with
     `getJiraIssue` if not already in context)
   - The actual PR URL, and its state (open/merged) and CI status
   - The actual files changed and why, from the real diff/commits — not a
     generic description
3. **Write the page** using `createConfluencePage` with `contentFormat: "html"`. Structure:
   - Header line: status macro (`<span data-type="status" data-color="...">`), Jira link, PR link, repo link
   - `## What changed` — plain-language summary of the behavior change
   - `## Why` — the motivating context (from the ticket, not invented)
   - `## Where it lives in the code` — a table of file → what changed
   - `## Testing` — what was actually run and its result (test counts,
     build status)
   - `## Review notes` — findings a code review caught and fixed, if any
     Use standard HTML tags for structure (`<h2>`, `<ul>`, `<table>`, `<code>`).
     Do not use Confluence wiki markup (`[text|url]`) anywhere — links in HTML
     body content are plain `<a href="...">`.
4. **Link it back to Jira.** There is no working "create remote issue
   link" tool in this toolset — use `addCommentToJiraIssue` instead, with
   `contentFormat: "markdown"` and a standard Markdown link
   `[label](url)` (not the `[label|url]` wiki-link syntax — that renders as
   literal text under markdown mode, not a hyperlink).
5. **Update the Jira status**, but check with the user first if the PR
   hasn't merged yet — don't assume "Done" just because a summary was
   written. Call `getTransitionsForJiraIssue` to see what's actually
   available on this ticket's workflow (varies by project), and match the
   transition to reality: still-open PR → usually "In Review"; merged and
   deployed → "Done".
6. **Report back** the Confluence page URL and the new Jira status.
