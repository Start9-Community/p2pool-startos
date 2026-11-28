# P2Pool

P2Pool needs a Monero node with the **unrestricted RPC** and **ZMQ** turned on: a restricted node can't submit the blocks your pool finds. Use the Monero service on this server, or a `monerod` you run elsewhere.

## Documentation

- [P2Pool README](https://github.com/SChernykh/p2pool/blob/master/README.md) — the upstream setup and usage reference, including the full list of monerod requirements.
- [Running P2Pool with Tor](https://github.com/SChernykh/p2pool/blob/master/docs/TOR.MD) — upstream's Tor guide, including the privacy caveat for onion addresses.

## What you get on StartOS

- **Your own P2Pool node** — a decentralized, 0%-fee Monero pool with no operator and no registration.
- **A Stratum interface** your miners connect to directly.
- **A P2P interface** for connecting to the rest of the P2Pool sidechain.
- **A Configure action** to set your wallet and choose your Monero node.

## Getting set up

1. **Run the Configure P2Pool action.** Set your Monero **primary** wallet address
   (it starts with `4`). **Use P2Pool Mini** picks the sidechain you mine on; it is
   on by default. Under **Monero Node**, choose one:
   - **Monero on this server** — the Monero service on this StartOS server. Install
     Monero 0.18.5.4:7 or later first and let it sync. If Monero is missing or
     too old to publish its login volume, P2Pool shows an install/update health
     check and retries automatically when that volume becomes available.
     P2Pool then raises a task on Monero to turn on **ZMQ**; approve it there.
     P2Pool finds the node and its login by itself.
   - **External Monero node** — a `monerod` you run elsewhere. Enter its **host**
     and, if you changed them, the RPC and ZMQ ports. On that machine, enable
     unrestricted RPC and ZMQ and bind them where your StartOS box can reach
     them, for example:

     ```
     monerod --zmq-pub tcp://0.0.0.0:18083 \
             --rpc-bind-ip 0.0.0.0 --confirm-external-bind \
             --out-peers 32 --in-peers 64 \
             --disable-dns-checkpoints --enable-dns-blocklist
     ```

     Keep that node on a trusted LAN or firewall its RPC port to your StartOS box:
     an unrestricted RPC should never be open to the internet.

2. **Start the service.** P2Pool connects to Monero first, then opens its stratum
   port; the **Stratum Port** health check turns green once it is ready for miners.
   With Monero on this server, check that Monero is synced and its task is done.
   With an external node, recheck its host, ports, RPC/ZMQ flags, and that it is
   reachable from your StartOS box.

3. **Point your miners at the Stratum interface.** Copy its address from the
   service's interfaces, and use it as your pool URL.

## Using P2Pool

### Connecting miners

P2Pool uses your configured wallet address — miners need no username or password.
For XMRig, set the pool to your Stratum interface address (port `3333`):

```json
"pool": { "url": "your-startos-box.local:3333", "user": "", "pass": "" }
```

### Letting other nodes reach you over Tor

Other P2Pool nodes can connect to yours through a .onion address. This needs the
Tor service, version 0.4.9.17:4 or later.

1. Open the **P2P** interface and add a **new** .onion address. P2Pool restarts
   and starts announcing it.
2. Leave it running. P2Pool announces the address inside the shares it mines, so
   other nodes learn it only after your node has mined a share.

**Your .onion address is published together with your wallet address**, in the
shares anyone can read on the sidechain. Create a new address for P2Pool rather
than reusing one you have given out elsewhere.

The .onion address answers on port 28722, the port other P2Pool nodes use for
Tor, rather than the P2P interface's usual port.

This is for nodes reaching you. P2Pool's own connections to other nodes, and to
your Monero node, still go over your regular network.

### Re-configuring

Run **Configure P2Pool** again any time to change your wallet, switch between the
Mini and main sidechain, or change which Monero node it uses. A running service
restarts with the new settings on its own.

### Checking your shares

P2Pool has no built-in dashboard. Track your shares and estimated payouts on the
public observer by searching your wallet address:

- Mini sidechain: <https://mini.p2pool.observer>
- Main sidechain: <https://p2pool.observer>
