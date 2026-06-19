# Issue tracker: GitHub

Issues and PRDs for this repo live as GitHub issues (`sangwopark19/icons-ip`). Use the `gh` CLI for all operations.

## Conventions

- **Create an issue**: `gh issue create --title "..." --body "..."`. Use a heredoc for multi-line bodies.
- **Read an issue**: `gh issue view <number> --comments`, filtering comments by `jq` and also fetching labels.
- **List issues**: `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'` with appropriate `--label` and `--state` filters.
- **Comment on an issue**: `gh issue comment <number> --body "..."`
- **Apply / remove labels**: `gh issue edit <number> --add-label "..."` / `--remove-label "..."`
- **Close**: `gh issue close <number> --comment "..."`

Infer the repo from `git remote -v` — `gh` does this automatically when run inside a clone. (`origin` → `git@github.com:sangwopark19/icons-ip.git`.)

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Project board

The active execution board is GitHub Project `ICONS v1 P0 Foundation` (`https://github.com/users/sangwopark19/projects/3`).

Use the issue body as the spec source, and use the Project fields as the scheduling source:

- `Status`: `Todo` → `In Progress` → `Done`.
- `Phase`: release slice such as `P0 Foundation`.
- `Track`: parallel work stream such as `Catalog and IP Hub`, `Auth and Onboarding`, `Community`, `Search`, or `Admin Ops`.
- `Dependency`: startability. Pick `Unblocked` work first.

Do not maintain a second dependency source with GitHub native parent/sub-issue or blocked-by relationships unless the user explicitly asks for that migration. If issue text and Project fields disagree, call out the conflict before acting.
