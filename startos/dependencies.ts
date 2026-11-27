import { autoconfig } from 'monerod-startos/startos/actions/config/autoconfig'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { monerodDescription, torDescription } from './manifest/i18n'
import { sdk } from './sdk'
import { monerodSource, torOnions } from './utils'

const tor = sdk.Dependency.optional('tor', {
  description: torDescription,
  metadata: {
    title: 'Tor',
    icon: 'https://raw.githubusercontent.com/Start9Labs/tor-startos/65faea17febc739d910e8c26ff4e61f6333487a8/icon.svg',
  },
  kind: 'running',
  // 0.4.9.17:4 is the first Tor with Set Onion Target, which moves the P2P
  // onions to 28722 and through the relay; an older one leaves them on 37889,
  // where no P2Pool peer dials.
  versionRange: '>=0.4.9.17:4',
  healthChecks: [],
  enabled: async ({ effects }) => (await torOnions(effects).const()).length > 0,
})

const monerod = sdk.Dependency.optional('monerod', {
  description: monerodDescription,
  metadata: {
    title: 'Monero',
    icon: 'https://raw.githubusercontent.com/Start9-Community/monerod-startos/c05c4f08f915b61d282b7d11258fe12e89e26fc8/icon.svg',
  },
  kind: 'running',
  // 0.18.5.4:7 is the first Monero that serves its unrestricted RPC to other services, with a published login.
  versionRange: '>=0.18.5.4:7',
  healthChecks: ['monerod', 'unrestricted-rpc'],
  enabled: async ({ effects }) => {
    const store = await storeJson.read().const(effects)
    return !!store && monerodSource(store) === 'startos'
  },
}).withInit(async (effects) => {
  const needs = { zmq: true }
  await sdk.action.createTask(effects, 'monerod', autoconfig, 'critical', {
    input: { kind: 'partial', accept: [needs], set: needs },
    when: { condition: 'input-not-matches', once: false },
    reason: i18n('P2Pool needs ZMQ turned on to mine with this node'),
  })
})

export const dependencies = sdk.Dependencies.of()
  .addDependency(tor)
  .addDependency(monerod)
