import { configure } from './actions/configure'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import {
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
  if (!walletAddress || !monerodHost) {
    await sdk.action.createOwnTask(effects, configure, 'important', {
      reason: i18n('Configuration required'),
    })
    throw new Error(
      i18n('P2Pool is not configured. Run the Configure action first.'),
    )
  }

  // Build p2pool argv
  const argsList: string[] = [
    'p2pool',
    '--host',
    monerodHost,
    '--rpc-port',
    String(monerodRpcPort),
    '--zmq-port',
    String(monerodZmqPort),
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

  const subcontainer = sdk.SubContainer.of(
    effects,
    { imageId: 'p2pool' },
    mount,
    'p2pool-sub',
  )

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
