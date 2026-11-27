import { T } from '@start9labs/start-sdk'
import type { Store } from './fileModels/store.json'
import { rm } from 'node:fs/promises'
import { sdk } from './sdk'

export const stratumPort = 3333
// P2Pool's p2p server. We pin it (rather than let --mini shift the default to
// 37888) so the StartOS interface port is stable across the mini/main toggle.
export const p2pPort = 37889

export const mount = sdk.Mounts.of().mountVolume({
  volumeId: 'main',
  subpath: null,
  mountpoint: '/data',
  readonly: false,
})

export function removeLegacyLog() {
  return rm(sdk.volumes.main.subpath('p2pool.log'), { force: true })
}

export const p2pHostId = 'p2p'
export const p2pInterfaceId = 'p2p'
// Upstream's DEFAULT_P2P_PORT_ONION: peers dial every advertised .onion on this
// port, whatever the sidechain, so the p2p binding's onions answer on it.
export const p2pOnionPort = 28722
// Tor forwards the p2p binding's onions here (setupOnionTarget). Unexported, so
// only the bridge reaches it (Tor and other services); the relay passes each connection to p2pool from 127.0.0.1.
export const p2pOnionRelayPort = 28723

/** The .onions Tor serves on the P2P interface, with the port each answers on, sorted. */
export function torOnions(effects: T.Effects) {
  return sdk.host.getOwn(effects, p2pHostId, (host) =>
    (
      host?.bindings[p2pPort]?.interfaces[p2pInterfaceId]?.addressInfo
        .filter({ pluginId: 'tor' })
        .hostnames.map((h) => ({ hostname: h.hostname, port: h.port })) ?? []
    ).sort((a, b) => a.hostname.localeCompare(b.hostname)),
  )
}

/** Which Monero node P2Pool uses; an install that predates the choice keeps the host it was given. */
export const monerodSource = (store: Store) =>
  store.monerodSource ?? (store.monerodHost ? 'external' : 'startos')

// Monero's `public` volume, mounted read-only into the P2Pool subcontainer.
export const monerodMountpoint = '/mnt/monerod'
