# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **P2Pool needs an external, dedicated monerod with _unrestricted_ RPC and ZMQ.** The `monerod` package here exports only the restricted RPC, which cannot submit the blocks the pool finds — don't add it as a dependency or suggest it in docs.
- **`--p2p 0.0.0.0:37889` is pinned deliberately.** `--mini` would otherwise shift the default to 37888 and the exported interface would point at a dead port.
- **`--no-upnp` stays.** StartOS provisions its own port mappings, and the container can't reach the router; leaving UPnP on only produces failed retries.
- **The wallet pattern rejects subaddresses and integrated addresses** (95 chars, leading `4`) because P2Pool cannot pay to them.
- **Everything is argv, not a config file** — every setting change restarts the daemon. That is inherent to P2Pool, not a packaging choice.
- **Default branch is `main`, not `master`.** Its CI workflows reference `main`; leave them.
