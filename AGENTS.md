# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `p2pool`.** Exposes two raw-TCP interfaces: `stratum` (port 3333, for XMRig and other Monero miners) and `p2p` (port 37889, the P2Pool sidechain peer port). The p2p port is pinned to 37889 so it stays stable across the mini/main toggle rather than shifting to the `--mini` default of 37888.
- **Requires an external, dedicated monerod** with unrestricted RPC and ZMQ enabled — configured via the Configure action (host/RPC port/ZMQ port). The StartOS Monero service only exposes restricted RPC and will not work.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach p2pool -n p2pool-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `p2pool-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
