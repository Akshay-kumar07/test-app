---
name: jira-story
description: >-
  Fetch a Jira story by key, summarize its acceptance criteria, and create a
  matching git branch in this repo. Use when starting work on a ticket (e.g.
  "pick up PROJ-123", "start the story about X").
---

# Jira Story Pickup

Given a Jira issue key or a description of a ticket, do the following:

1. **Fetch the ticket** via the Atlassian MCP tools (Jira). Pull the summary,
   description, and acceptance criteria. If given a vague reference instead of
   a key ("the cart bug", "that filter story"), search for the matching open
   issue first and confirm the match before proceeding.
2. **Summarize back to the user** in a few bullet points: what the ticket asks
   for, and what "done" looks like per its acceptance criteria. If the ticket
   is ambiguous or missing acceptance criteria, say so — don't invent criteria.
3. **Map the ticket to this codebase** before touching anything. This repo
   (react-shopping-cart) has a small number of well-defined places most
   changes land:
   - UI/component change → `src/components/<Name>/` (each component owns its
     `.tsx`, `style.ts`, `.test.tsx`, `__snapshots__/`, `index.ts`)
   - Cart behavior (add/remove/quantity/totals) → `src/contexts/cart-context/`
     (`useCartProducts.ts`, `useCartTotal.ts`), tests in `__tests__/`
   - Product filtering/listing behavior → `src/contexts/products-context/`
   - Product/cart data shape → `src/models/index.ts`, `src/services/products.ts`,
     `src/static/json/products.json`
     State which of these the ticket most likely touches, and flag if it spans
     more than one.
4. **Create a branch** named `<type>/<TICKET-KEY>-<short-kebab-summary>`, where
   `<type>` is `feature`, `fix`, or `chore` inferred from the ticket type/intent
   (matches this repo's commitlint conventional-commit types). Example:
   `feature/PROJ-123-add-quantity-stepper`. Confirm the branch name with the
   user only if the ticket type is ambiguous; otherwise just create it and say
   what you did.
5. Stop there — implementation is a separate step. Do not start editing code
   until the user confirms the plan or asks you to proceed.
