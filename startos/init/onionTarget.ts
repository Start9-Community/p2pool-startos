import { setupOnionTarget } from 'tor-startos/startos/utils/target'
import { manifest } from '../manifest'
import { sdk } from '../sdk'
import { p2pHostId, p2pOnionPort, p2pOnionRelayPort, p2pPort } from '../utils'

// Onions on the P2P interface answer on 28722, the port P2Pool peers dial, and
// reach the relay rather than p2pool's clearnet listener.
export const onionTarget = setupOnionTarget(sdk, {
  packageId: manifest.id,
  hostId: p2pHostId,
  internalPort: p2pPort,
  target: p2pOnionRelayPort,
  externalPort: p2pOnionPort,
})
