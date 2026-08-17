<p align="center">
  <img src="icon.png" alt="P2Pool Logo" width="21%">
</p>

# P2Pool on StartOS

> Everything not listed in this document should behave the same as upstream
> P2Pool. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[P2Pool](https://github.com/SChernykh/p2pool) is a decentralized mining pool for Monero: it runs a sidechain among its participants and pays out directly in the coinbase, so there is no pool operator holding your rewards. This package runs a P2Pool node and a stratum port for your miners to point at.

- **Upstream repo:** <https://github.com/SChernykh/p2pool>
- **Wrapper repo:** <https://github.com/Start9-Community/p2pool-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built here.

| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| Image         | Built from this repo's `Dockerfile`        |
| Architectures | x86_64, aarch64                            |
| Command       | `p2pool`, with arguments composed at start |

| Subcontainer | Purpose                                  |
| ------------ | ---------------------------------------- |
| `p2pool-sub` | The only daemon — the one to `attach` to |

**Everything is command-line arguments, not a config file.** P2Pool takes its whole configuration on the command line, so the package composes the arguments from the stored settings at each start — which is why every change restarts the service.

Two arguments are set by the package rather than the user:

- **UPnP is disabled.** StartOS provisions its own port mappings, and a container cannot reach the router anyway, so leaving it on would just produce failed retries in the log.
- **The peer port is pinned.** Left alone, switching to the mini sidechain would shift the default peer port, and the exported interface would then point at a port nothing was listening on.

## Volume and Data Layout

One volume.

| Volume | Mount Point | Purpose                          |
| ------ | ----------- | -------------------------------- |
| `main` | `/data`     | The sidechain cache and settings |

| Path                    | Written by | Holds                                           |
| ----------------------- | ---------- | ----------------------------------------------- |
| `store.json`            | The action | The wallet address and node connection          |
| _cache, peer list, log_ | P2Pool     | Sidechain state it can rebuild from the network |

**Nothing here is irreplaceable except the settings.** Your shares and your payouts live on the P2Pool sidechain and in the Monero blockchain, not on this volume — losing it costs a resync of the sidechain, not money.

## File Models

One model, and it is the whole configuration surface.

| File         | Format | Modelled                | Written by |
| ------------ | ------ | ----------------------- | ---------- |
| `store.json` | JSON   | Yes — `FileHelper.json` | The action |

Six fields: the payout wallet address, whether to use the mini sidechain, the Monero node's host and its two ports, and the log level.

The model is read reactively, so any change restarts the node with new arguments. It is also merged on every init, so a field added by a later version arrives with its default rather than missing.

## Dependencies

**None declared — but P2Pool cannot run without a Monero node**, and it has to be one you provide.

| Needs                       | Where it comes from                 |
| --------------------------- | ----------------------------------- |
| Monero **unrestricted** RPC | A monerod you run and point this at |
| Monero ZMQ                  | The same node                       |

**The Monero package on StartOS will not work for this**, and that is not an oversight in either package: P2Pool needs the _unrestricted_ RPC in order to submit the blocks your pool finds, and the Monero package deliberately publishes only the restricted RPC. Running P2Pool here means running a separate, dedicated monerod that this service can reach — on the LAN, or elsewhere.

That node must have ZMQ enabled as well, since P2Pool watches it for new blocks rather than polling.

## Network Access and Interfaces

Two interfaces, both raw TCP with the external port preserved.

| Interface | Id        | Type | Port  | Description                       |
| --------- | --------- | ---- | ----- | --------------------------------- |
| Stratum   | `stratum` | api  | 3333  | What miners connect to            |
| P2P       | `p2p`     | p2p  | 37889 | The P2Pool sidechain peer network |

**The stratum port has no authentication.** That is how stratum works, and the consequence here is benign but worth being clear about: anyone who can reach it contributes hashrate toward _your_ configured wallet address. It is not a way for someone else to be paid, but it is a way for someone else to load your node.

**Forwarding the peer port is optional but useful.** Outbound peering works without it; accepting inbound connections improves how well your node stays in sync with the sidechain.

## Installation and First-Run Flow

Install seeds an empty configuration. There is no wizard and no credential.

**The service will not start until it is configured**, and it enforces that itself rather than through an install-time task: on a start with no wallet address or no node host, it raises the configuration task and then fails deliberately. The result is a service in an error state with the task visible, which is better than a node quietly mining to nothing.

Once configured, it connects to your Monero node, downloads the sidechain, and opens the stratum port. **That first sync is slow** — the daemon carries a three-minute grace period because the stratum port does not open until P2Pool has caught up enough to serve work.

Point your miner at the stratum address and it starts contributing immediately. Payouts arrive in the coinbase of blocks the sidechain finds, directly to your address; there is no balance held anywhere.

## Actions

One action.

### Configure P2Pool

Sets everything: the payout address, the sidechain choice, the Monero node's host and ports, and the log level.

- **What it changes:** all six fields in the configuration.
- **Cost:** the service restarts, since the values are command-line arguments.
- **Repeat safety:** idempotent, pre-filled with the current values.
- **The address must be a primary Monero address** — 95 characters beginning with `4`. Subaddresses and integrated addresses are rejected by the form, because P2Pool cannot pay to them.
- **The mini sidechain is on by default**, which suits smaller miners: it has a lower share difficulty, so a modest hashrate still earns shares regularly. Larger operations should turn it off and join the main chain.

**Switching between mini and main is a different sidechain**, not a setting: your position in the payout window does not carry across, and the node resyncs.

## Tasks

One, raised by the service itself.

| Task             | Severity    | Raised when                        | Cleared when    |
| ---------------- | ----------- | ---------------------------------- | --------------- |
| Configure P2Pool | `important` | A start finds no wallet or no host | The action runs |

**It is raised from the start-up path rather than at install**, which is why it reappears if the configuration is ever emptied. The start that raises it also fails, so the service does not run unconfigured despite the task being advisory rather than blocking.

## Health Checks

One check, on the only daemon.

| Check     | Displayed as   | Method                 | Grace |
| --------- | -------------- | ---------------------- | ----- |
| `primary` | "Stratum Port" | Port 3333 is listening | 180s  |

**A green check means miners can connect** — which is a real statement about P2Pool, because the stratum port only opens once the node has a working connection to Monero and enough of the sidechain to hand out work.

It does not report on shares, hashrate, or payouts. Those are in the node's own log and on the P2Pool observer sites.

**A check that never goes green usually means the Monero node** — unreachable, restricted RPC rather than unrestricted, or ZMQ not enabled.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. In practice the only thing worth restoring is the configuration.

**There is no wallet here and nothing at risk.** P2Pool never holds funds: it pays directly to the address you configure, in the coinbase of blocks the sidechain finds. The backup contains that address, not any key to it.

A restored instance comes back configured, resyncs the sidechain, and resumes.

## Limitations and Differences

1. **It needs a separate Monero node with unrestricted RPC and ZMQ.** The Monero package on StartOS cannot serve this.
2. **The service refuses to start unconfigured**, by design.
3. **Primary addresses only** — no subaddresses, no integrated addresses.
4. **Switching sidechains resyncs** and does not carry your share position over.
5. **The stratum port is unauthenticated**, so anyone who can reach it can mine toward your address.
6. **All configuration is command-line**, so every change is a restart.
7. **Mainnet only.**

---

## Quick Reference for AI Consumers

```yaml
package_id: p2pool
image: built from ./Dockerfile
architectures:
  - x86_64
  - aarch64
subcontainers:
  - p2pool-sub
volumes:
  main: /data # --data-dir; sidechain cache, peer list, log, plus store.json
file_models:
  - store.json # wallet address, mini toggle, monerod host + rpc/zmq ports, log level
startos_managed_env_vars: [] # p2pool is configured entirely by argv
dependencies: [] # but requires an EXTERNAL monerod with unrestricted RPC + ZMQ
interfaces:
  stratum: { type: api, port: 3333 } # raw TCP, unauthenticated by design
  p2p: { type: p2p, port: 37889 } # pinned so --mini doesn't shift it to 37888
actions:
  - configure
tasks:
  - { action: configure, severity: important } # raised from main.ts, not at install
health_checks:
  - primary # displayed "Stratum Port"; opens only once monerod is reachable, 180s grace
```
