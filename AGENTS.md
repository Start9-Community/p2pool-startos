# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **P2Pool needs an external, dedicated monerod with _unrestricted_ RPC and ZMQ.** The `monerod` package here exports only the restricted RPC, which cannot submit the blocks the pool finds — don't add it as a dependency or suggest it in docs.
- **`--p2p 0.0.0.0:37889` is pinned deliberately.** `--mini` would otherwise shift the default to 37888 and the exported interface would point at a dead port.
- **`--no-upnp` stays.** StartOS provisions its own port mappings, and the container can't reach the router; leaving UPnP on only produces failed retries.
- **The wallet pattern rejects subaddresses and integrated addresses** (95 chars, leading `4`) because P2Pool cannot pay to them.
- **Everything is argv, not a config file** — every setting change restarts the daemon. That is inherent to P2Pool, not a packaging choice.
- **Default branch is `main`, not `master`.** Its CI workflows reference `main`; leave them.
