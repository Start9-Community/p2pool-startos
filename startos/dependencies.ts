import { torDescription } from './manifest/i18n'
import { sdk } from './sdk'
import { torOnions } from './utils'

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

export const dependencies = sdk.Dependencies.of().addDependency(tor)
