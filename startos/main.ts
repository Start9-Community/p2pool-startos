import { FileHelper, T } from '@start9labs/start-sdk'
import { manifest as monerodManifest } from 'monerod-startos/startos/manifest'
import {
  rpcUnrestrictedHostId,
  rpcUnrestrictedLoginFileName,
  rpcUnrestrictedPort,
  rpcVolumeId,
  zmqPubsubHostId,
  zmqPubsubPort,
} from 'monerod-startos/startos/utils'
import { configure } from './actions/configure'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
  monerodMountpoint,
  monerodSource,
  mount,
  p2pOnionPort,
  p2pOnionRelayPort,
  p2pPort,
  removeLegacyLog,
  stratumPort,
  torOnions,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting P2Pool!'))

  // Reintroduced logs need cleanup without a data-version transition.
  await removeLegacyLog()

  const store = await storeJson.read().const(effects)

  if (!store) {
    throw new Error(i18n('Store not found'))
  }

  const {
    walletAddress,
    miniSidechain,
    monerodHost,
    monerodRpcPort,
    monerodZmqPort,
    logLevel,
  } = store

  // If not yet configured, prompt the user and refuse to start. Launching with a
  // placeholder wallet would mine to an invalid address and spin on failed startup;
  // throwing leaves the service cleanly in error-state with the config task visible.
  const source = monerodSource(store)
  if (!walletAddress || (source === 'external' && !monerodHost)) {
    await sdk.action.createOwnTask(effects, configure, 'important', {
      reason: i18n('Configuration required'),
    })
    throw new Error(
      i18n('P2Pool is not configured. Run the Configure action first.'),
    )
  }

  if (source === 'startos') {
    // Missing Monero volumes remain unmounted until the manifest watch detects one.
    const hasPublicVolume = await sdk
      .getServiceManifest(
        effects,
        'monerod',
        (manifest) => manifest?.volumes.includes(rpcVolumeId) ?? false,
      )
      .const()
    if (!hasPublicVolume) {
      return sdk.Daemons.of(effects).addHealthCheck('primary', {
        ready: {
          display: i18n('Monero on this server'),
          fn: () => ({
            result: 'failure',
            message: i18n(
              'Install or update Monero to 0.18.5.4:7 or later to use Monero on this server.',
            ),
          }),
        },
        requires: [],
      })
    }
  }

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'p2pool' },
    source === 'startos'
      ? mount.mountDependency<typeof monerodManifest>({
          dependencyId: 'monerod',
          volumeId: rpcVolumeId,
          subpath: null,
          mountpoint: monerodMountpoint,
          readonly: true,
        })
      : mount,
    'p2pool-sub',
  )

  const node =
    source === 'startos'
      ? await localMonero(effects, await subcontainer.rootfs)
      : {
          host: monerodHost,
          rpcPort: monerodRpcPort,
          zmqPort: monerodZmqPort,
          login: null,
        }

  // Build p2pool argv
  const argsList: string[] = [
    'p2pool',
    '--host',
    node.host,
    '--rpc-port',
    String(node.rpcPort),
    '--zmq-port',
    String(node.zmqPort),
    ...(node.login ? ['--rpc-login', node.login] : []),
    '--wallet',
    walletAddress,
    '--stratum',
    `[::]:${stratumPort},0.0.0.0:${stratumPort}`,
    // Pin the p2p listen port so it matches the exported StartOS interface
    // regardless of the --mini default (which would otherwise shift it to 37888).
    '--p2p',
    `[::]:${p2pPort},0.0.0.0:${p2pPort}`,
    '--loglevel',
    String(logLevel),
    // Persist cache and peer data on the mounted /data volume.
    '--data-dir',
    '/data',
    // StartOS already captures the console log; the file copy would only
    // duplicate it and grow without bound.
    '--no-log-file',
    // StartOS provisions every port mapping itself; UPnP/IGD can't reach a router
    // from inside the container, so disable it to avoid pointless retries.
    '--no-upnp',
  ]

  if (miniSidechain) {
    argsList.push('--mini')
  }

  // Advertised in the shares this node mines. Peers dial it on 28722 only, so
  // pass it once Tor answers there (a Tor without Set Onion Target leaves it on
  // 37889). It also gives loopback peers (the onion relay's) the Tor peer id.
  const onion = (await torOnions(effects).const()).find(
    (o) => o.port === p2pOnionPort,
  )
  if (onion) {
    argsList.push('--onion-address', onion.hostname)
  }

  const args = argsList as [string, ...string[]]

  return (
    sdk.Daemons.of(effects)
      .addDaemon('primary', {
        subcontainer,
        exec: {
          command: args,
        },
        ready: {
          display: i18n('Stratum Port'),
          gracePeriod: 180000,
          fn: () =>
            sdk.healthCheck.checkPortListening(effects, stratumPort, {
              successMessage: i18n('P2Pool stratum is ready for miners'),
              errorMessage: i18n(
                'P2Pool stratum is not yet listening. Check monerod connection and logs.',
              ),
            }),
        },
        requires: [],
      })
      // Tor peers reach p2pool from 127.0.0.1, which p2pool never bans and lets hold
      // up to 10 connections (--in-peers-localhost) where any other address gets one.
      .addDaemon('onion-relay', {
        subcontainer,
        exec: {
          command: [
            'socat',
            `TCP6-LISTEN:${p2pOnionRelayPort},ipv6only=0,fork,reuseaddr`,
            `TCP4:127.0.0.1:${p2pPort}`,
          ],
        },
        ready: {
          display: null,
          fn: () =>
            sdk.healthCheck.checkPortListening(effects, p2pOnionRelayPort, {
              successMessage: 'Onion relay is listening',
              errorMessage: 'Onion relay is not listening',
            }),
        },
        requires: [],
      })
  )
})

async function localMonero(effects: T.Effects, rootfs: string) {
  const bridge = (hostId: string, internalPort: number) =>
    sdk.host
      .getBridgeAddress(effects, {
        packageId: 'monerod',
        hostId,
        internalPort,
        ssl: false,
      })
      .const()
  const rpc = await bridge(rpcUnrestrictedHostId, rpcUnrestrictedPort)
  const zmq = await bridge(zmqPubsubHostId, zmqPubsubPort)
  const login = await FileHelper.string(
    `${rootfs}${monerodMountpoint}/${rpcUnrestrictedLoginFileName}`,
  )
    .read((s) => s.trim() || null)
    .const(effects)
  if (!rpc || !zmq || !login) {
    throw new Error(
      'Monero on this server is not ready: turn on ZMQ in Monero (its task from P2Pool does it)',
    )
  }
  const [host, rpcPort] = splitHostPort(rpc)
  const [zmqHost, zmqPort] = splitHostPort(zmq)
  // p2pool takes one --host for both connections.
  if (zmqHost !== host) {
    throw new Error(
      `Monero's RPC (${rpc}) and ZMQ (${zmq}) resolve to different hosts`,
    )
  }
  return { host, rpcPort, zmqPort, login }
}

function splitHostPort(address: string): [string, number] {
  const colon = address.lastIndexOf(':')
  return [address.slice(0, colon), Number(address.slice(colon + 1))]
}
