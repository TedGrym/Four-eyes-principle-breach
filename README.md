# Four-eyes-principle-breach

Test repo for showcasing the solution to a security problem of breaching the four-eyes principle in this time of AI and bot PRs.

## The problem

With classic branch protection, a PR opened by a bot (Dependabot, an AI agent, a CI machine user) plus a single human approval satisfies "require 1 approval" — but only **one** human ever looked at the change. The four-eyes principle is silently breached.

## The solution

The workflow [`.github/workflows/bot-pr-two-approvals.yml`](.github/workflows/bot-pr-two-approvals.yml) publishes a commit status `bot-pr/two-human-approvals`:

- **Human-authored PR** → status is `success` immediately; native branch protection rules apply as usual.
- **Bot-authored PR** → status stays `pending` until **2 humans** approve the current head commit, where neither approver authored or committed any commit in the PR.

The status is marked as **required** in branch protection, so bot PRs cannot merge without two independent human reviews.

## Required branch protection settings (on `main`)

The workflow is only half of the mechanism — without these settings the demo does not protect anything:

1. **Require status checks to pass before merging** and add `bot-pr/two-human-approvals` as a required check.
2. **Require a pull request before merging** with at least 1 approval (covers human PRs).
3. **Dismiss stale pull request approvals when new commits are pushed.**
4. **Require review from Code Owners** — together with [`.github/CODEOWNERS`](.github/CODEOWNERS) this guards the workflow file itself: the `pull_request_review` trigger runs the workflow version from the PR merge commit, so an unreviewed workflow edit could otherwise fake the required status.
5. **Do not allow bypassing the above settings** (include administrators).
6. Recommended: **Require signed commits** — the contributor detection maps commit author emails to GitHub accounts, and unsigned commits with spoofed emails could otherwise let a contributor approve their own commit.

## Test checklist

| # | Scenario | Expected status |
|---|----------|-----------------|
| 1 | Bot opens a PR | `pending` |
| 2 | First human approves | still `pending` |
| 3 | Second human approves | `success` |
| 4 | New commit pushed to the PR | back to `pending` (stale approvals don't count) |
| 5 | A human who pushed a commit to the PR approves | their approval is **not** counted |
| 6 | Human opens a PR | `success` immediately, standard rules apply |

The intentionally outdated `lodash` pin in [`package.json`](package.json) plus [`.github/dependabot.yml`](.github/dependabot.yml) generate real bot PRs to test with; [`src/index.js`](src/index.js) gives bot PRs actual code to modify.

## Known limitations

- Bot PRs **from forks** are not supported: on `pull_request_review` events the run would get a read-only token and fail to write the status. Dependabot and GitHub Apps push branches to this repo, so this does not affect them.
- Machine-user accounts (regular accounts used as bots) are not auto-detected — add their logins to `MACHINE_USER_BOTS` in the workflow.
- Any workflow in this repo running with `statuses: write` could set the same status context; for maximum robustness publish the status from a GitHub App with its own token instead of `GITHUB_TOKEN`.
