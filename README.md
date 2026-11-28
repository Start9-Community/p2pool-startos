<p align="center">
  <img src="icon.svg" alt="P2Pool Logo" width="21%">
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
| Verification  | Signed `sha256sums.txt.asc`, pinned key    |
| Architectures | x86_64, aarch64                            |
| Command       | `p2pool`, with arguments composed at start |

| Subcontainer | Purpose                                                      |
| ------------ | ------------------------------------------------------------ |
| `p2pool-sub` | Both daemons: `primary` (p2pool) and `onion-relay` (`socat`) |

**Everything is command-line arguments, not a config file.** P2Pool takes its whole configuration on the command line, so the package composes the arguments from the stored settings at each start — which is why every change restarts the service.

These arguments are set by the package rather than the user:

- **UPnP is disabled.** StartOS provisions its own port mappings, and a container cannot reach the router anyway, so leaving it on would just produce failed retries in the log.
- **The peer port is pinned.** Left alone, switching to the mini sidechain would shift the default peer port, and the exported interface would then point at a port nothing was listening on.
- **The onion address is fed in.** When Tor serves a .onion on the **P2P** interface on port 28722, it is passed as `--onion-address` (the first, sorted, if there are several), and a change to it restarts the service. See [Inbound Tor](#inbound-tor).
- **File logging is disabled.** StartOS captures the console output in the service's Logs; `--no-log-file` prevents an unbounded duplicate in `/data/p2pool.log`. The package removes existing logs on upgrade and every service start, including copies introduced without a version transition.

## Volume and Data Layout

One volume.

| Volume | Mount Point | Purpose                          |
| ------ | ----------- | -------------------------------- |
| `main` | `/data`     | The sidechain cache and settings |

| Path               | Written by | Holds                                           |
| ------------------ | ---------- | ----------------------------------------------- |
| `store.json`       | The action | The wallet address and node connection          |
| _cache, peer list_ | P2Pool     | Sidechain state it can rebuild from the network |

**Nothing here is irreplaceable except the settings.** Your shares and your payouts live on the P2Pool sidechain and in the Monero blockchain, not on this volume — losing it costs a resync of the sidechain, not money.

## File Models

One model, and it is the whole configuration surface.

| File         | Format | Modelled                | Written by |
| ------------ | ------ | ----------------------- | ---------- |
| `store.json` | JSON   | Yes — `FileHelper.json` | The action |

Seven fields: the payout wallet address, whether to use the mini sidechain, which Monero node to use (`monerodSource`), an external node's host and its two ports, and the log level. `monerodSource` is unset on installs from before the choice existed; `monerodSource()` in `startos/utils.ts` reads such an install as `external` when it has a host, so it keeps the node it was given.

The model is read reactively, so any change restarts the node with new arguments. It is also merged on every init, so a field added by a later version arrives with its default rather than missing.

## Dependencies

Two optional dependencies.

| Dependency | Kind      | Version        | Health checks                 | Enabled while                                |
| ---------- | --------- | -------------- | ----------------------------- | -------------------------------------------- |
| Tor        | `running` | `>=0.4.9.17:4` | —                             | Tor serves a .onion on the P2P interface     |
| Monero     | `running` | `>=0.18.5.4:7` | `monerod`, `unrestricted-rpc` | the Monero node is **Monero on this server** |

Tor 0.4.9.17:4 is the first with Set Onion Target, which the [inbound Tor](#inbound-tor) path needs; an older Tor leaves the onion on 37889 and forwards its peers to the binding itself.

**P2Pool cannot run without a Monero node with the unrestricted RPC and ZMQ.** It needs the _unrestricted_ RPC to submit the blocks your pool finds, and ZMQ because it watches the node for new blocks rather than polling. The configure action offers two sources:

- **Monero on this server** (`monerodSource: startos`, the default for a new install). While it is selected, the Monero dependency is enabled, and its init raises a `critical` task on Monero's hidden `autoconfig` action asking for `zmq: true`; it re-raises whenever Monero drifts from it. Monero 0.18.5.4:7 is the first to serve its loopback unrestricted RPC to other services, on its bridge-only `rpc-unrestricted` host and always behind a login. `main` resolves that host's and Monero's `zmq-pubsub` bridge addresses with `getBridgeAddress`, mounts Monero's `public` volume read-only at `/mnt/monerod` in the P2Pool subcontainer, and reads `rpc-unrestricted-login` from it with `.const()`. It passes the address's host as `--host`, both ports, and the login as `--rpc-login`; p2pool authenticates with HTTP Digest, which is what Monero accepts. A changed login or address restarts P2Pool. If Monero is absent or lacks the `public` volume, `main` mounts nothing and reports a failing health check asking for Monero 0.18.5.4:7 or later; its manifest watch retries after installation or an update adds the volume. If either address or the login is missing, `main` fails with a message pointing at Monero's ZMQ setting.
- **External Monero node** (`monerodSource: external`). The host and two ports from the form, with no login, exactly as before the choice existed.

## Network Access and Interfaces

Two interfaces, both raw TCP with the external port preserved, and one unexported binding.

| Interface | Id        | Type | Port  | Description                                                                |
| --------- | --------- | ---- | ----- | -------------------------------------------------------------------------- |
| Stratum   | `stratum` | api  | 3333  | What miners connect to                                                     |
| P2P       | `p2p`     | p2p  | 37889 | The P2Pool sidechain peer network; its .onion on 28722                     |
| _(none)_  | —         | —    | 28723 | The onion relay, on the `p2p` host; off the LAN, reachable over the bridge |

**The stratum port has no authentication.** That is how stratum works, and the consequence here is benign but worth being clear about: anyone who can reach it contributes hashrate toward _your_ configured wallet address. It is not a way for someone else to be paid, but it is a way for someone else to load your node.

**Forwarding the peer port is optional but useful.** Outbound peering works without it; accepting inbound connections improves how well your node stays in sync with the sidechain.

### Inbound Tor

**P2Pool peers dial every advertised .onion on port 28722**, whatever the sidechain (upstream's `DEFAULT_P2P_PORT_ONION`; only its own seed onions are dialled on the sidechain port). Tor would publish an onion on its binding's external port, 37889, where no peer looks.

**An init step moves the P2P interface's onions to 28722 and sends them through a relay.** It calls `tor-startos`'s `setupOnionTarget` for the 37889 binding with `externalPort: 28722` and `target: 28723`, and repeats the call whenever Tor is installed or updated. The package clears the target on uninstall, and Tor uses it only while it is bound, so a version without the relay gets the old forward back. Tor then answers each of the binding's onions on 28722, moving existing ones there with their hostnames, and forwards them to the unexported port 28723. The `onion-relay` daemon (`socat`, dual-stack) passes each connection to `127.0.0.1:37889`. LAN and clearnet addresses stay on 37889, unchanged.

**Tor peers reach p2pool from loopback.** Otherwise every onion peer would arrive from the bridge address `10.0.3.1`, and p2pool allows one connection per non-loopback IP and bans by IP. From loopback, p2pool never bans and accepts up to 10 connections (`--in-peers-localhost`, upstream default), and with `--onion-address` set it answers them with its separate Tor peer id. Like any unexported binding, 28723 sits on the LXC bridge, so another service on the server could also reach it and be taken for a Tor peer.

**The onion is advertised only once Tor answers it on 28722.** P2Pool puts `--onion-address` in each share it mines, and peers learn it from there, so an onion is announced only once the node mines a share. A Tor older than `0.4.9.17:4` cannot move the onion or set the target, so it stays on 37889 and the package leaves `--onion-address` unset. Announcing the onion also ties it to the payout wallet in public sidechain data, which is why upstream says to use an onion created for mining.

**Outbound connections stay on clearnet.** Upstream's `--socks5` would carry P2Pool's outbound onion peering, but it also routes its RPC and ZMQ connections to monerod through the proxy, which a LAN monerod cannot be reached through; the package does not set it, so this node never dials onion peers itself.

## Installation and First-Run Flow

Install seeds an empty configuration. There is no wizard and no credential.

**The service will not start until it is configured**, and it enforces that itself rather than through an install-time task: on a start with no wallet address, or with an external node and no host, it raises the configuration task and then fails deliberately. The result is a service in an error state with the task visible, which is better than a node quietly mining to nothing.

Once configured, it connects to your Monero node, downloads the sidechain, and opens the stratum port. **That first sync is slow** — the daemon carries a three-minute grace period because the stratum port does not open until P2Pool has caught up enough to serve work.

Point your miner at the stratum address and it starts contributing immediately. Payouts arrive in the coinbase of blocks the sidechain finds, directly to your address; there is no balance held anywhere.

## Actions

One action.

### Configure P2Pool

Sets everything: the payout address, the sidechain choice, the Monero node, and the log level.

- **What it changes:** the fields in the configuration. Choosing **External Monero node** writes its host and ports; choosing **Monero on this server** leaves the stored external values alone, so switching back restores them.
- **Cost:** the service restarts, since the values are command-line arguments.
- **Repeat safety:** idempotent, pre-filled with the current values.
- **The address must be a primary Monero address** — 95 characters beginning with `4`; the form rejects subaddresses and integrated addresses. P2Pool's `--wallet` takes the main address only. Upstream can also mine to a subaddress of that wallet through a separate `--subaddress` option ([command-line docs](https://github.com/SChernykh/p2pool/blob/master/docs/COMMAND_LINE.MD)), but this package does not offer it.
- **The mini sidechain is on by default.**

**Switching between mini and main is a different sidechain**, not a setting: your position in the payout window does not carry across, and the node resyncs.

## Tasks

One, raised by the service itself.

| Task             | Severity    | Raised when                        | Cleared when    |
| ---------------- | ----------- | ---------------------------------- | --------------- |
| Configure P2Pool | `important` | A start finds no wallet or no host | The action runs |

**It is raised from the start-up path rather than at install**, which is why it reappears if the configuration is ever emptied. The start that raises it also fails, so the service does not run unconfigured despite the task being advisory rather than blocking.

## Health Checks

One displayed check, on the `primary` daemon.

| Check     | Displayed as   | Method                 | Grace |
| --------- | -------------- | ---------------------- | ----- |
| `primary` | "Stratum Port" | Port 3333 is listening | 180s  |

The `onion-relay` daemon's readiness (port 28723 listening) is not displayed.

**A green check means miners can connect** — which is a real statement about P2Pool, because the stratum port only opens once the node has a working connection to Monero and enough of the sidechain to hand out work.

It does not report on shares, hashrate, or payouts. Those are in the node's own log and on the P2Pool observer sites.

**A check that never goes green usually means the Monero node.** With Monero on this server: Monero still syncing, or its task from P2Pool not done. With an external node: unreachable, restricted RPC rather than unrestricted, or ZMQ not enabled.

## Backups and Restore

This version backs up the `main` volume with `sdk.Backups.ofVolumes('main')`. The sidechain cache (`p2pool.cache`) is neither copied into backups nor restored; P2Pool rebuilds it from the network. A cache already on a backup target remains there but is not restored. In practice the only thing worth restoring is the configuration.

Restoring a backup reinstalls the package version saved with it. An older release's backup can therefore restore the cache and resume writing `p2pool.log`; the log cleanup and cache exclusion apply after updating the restored package.

**There is no wallet here and nothing at risk.** P2Pool never holds funds: it pays directly to the address you configure, in the coinbase of blocks the sidechain finds. The backup contains that address, not any key to it.

A restored instance comes back configured, resyncs the sidechain, and resumes.

## Limitations and Differences

1. **It needs a Monero node with unrestricted RPC and ZMQ.** The Monero service on this server provides both once its task from P2Pool has turned ZMQ on; an external node has to be set up by hand.
2. **The service refuses to start unconfigured**, by design.
3. **Primary addresses only** — upstream's `--subaddress` option is not offered, and integrated addresses are rejected.
4. **Switching sidechains resyncs** and does not carry your share position over.
5. **The stratum port is unauthenticated**, so anyone who can reach it can mine toward your address.
6. **All configuration is command-line**, so every change is a restart.
7. **Mainnet only.**
8. **Tor is inbound only**, and only the first .onion on **P2P** is announced, once a share is mined. P2Pool's own connections go over clearnet; see [Inbound Tor](#inbound-tor).

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
  main: /data # --data-dir; sidechain cache, peer list, plus store.json
file_models:
  - store.json # wallet address, mini toggle, monerodSource, external monerod host + rpc/zmq ports, log level
startos_managed_env_vars: [] # p2pool is configured entirely by argv
dependencies:
  - tor # optional, >=0.4.9.17:4, running; enabled while a P2P interface has a .onion
  - monerod # optional, >=0.18.5.4:7, running; enabled for Monero on this server; public volume at /mnt/monerod (rpc-unrestricted-login)
interfaces:
  stratum: { type: api, port: 3333 } # raw TCP, unauthenticated by design
  p2p: { type: p2p, port: 37889 } # pinned so --mini doesn't shift it to 37888; its .onion answers on 28722
  # 28723: unexported onion relay (socat -> 127.0.0.1:37889), Tor's target for the p2p onions
actions:
  - configure
tasks:
  - { action: configure, severity: important } # raised from main.ts, not at install
  - { action: autoconfig, severity: critical } # on monerod, for Monero on this server: zmq
health_checks:
  - primary # displayed "Stratum Port"; opens only once monerod is reachable, 180s grace
  - onion-relay # not displayed; port 28723 listening
```
