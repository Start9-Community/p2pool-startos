import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  walletAddress: Value.text({
    name: i18n('Monero Wallet Address'),
    description: i18n(
      'Your Monero primary address (starting with 4). Mining rewards will be sent here.',
    ),
    required: true,
    default: null,
    patterns: [
      {
        regex: '^4[1-9A-HJ-NP-Za-km-z]{94}$',
        description: i18n(
          'Must be a 95-character Monero primary address starting with 4 (not a subaddress or integrated address).',
        ),
      },
    ],
  }),
  miniSidechain: Value.toggle({
    name: i18n('Use P2Pool Mini'),
    description: i18n(
      "- On: mine on the P2Pool Mini sidechain.\n- Off: mine on the main P2Pool sidechain.\nThey are separate pools, and shares earned on one do not count on the other. mini.p2pool.observer and p2pool.observer show each one's current statistics.",
    ),
    default: true,
  }),
  monerodHost: Value.text({
    name: i18n('Monero Node Host'),
    description: i18n(
      'Hostname or IP address of your Monero node (monerod). Example: your-monero-node.local',
    ),
    warning: i18n(
      'P2Pool needs a Monero node with unrestricted RPC and ZMQ enabled, reachable from your StartOS server. The StartOS Monero service currently exposes only restricted RPC and will not work — you must run a separate, dedicated monerod.',
    ),
    required: true,
    default: null,
  }),
  monerodRpcPort: Value.number({
    name: i18n('Monero RPC Port'),
    description: i18n(
      "Your Monero node's unrestricted RPC port (default 18081). P2Pool requires the unrestricted RPC — a restricted node (typically 18089) cannot submit the blocks your pool finds.",
    ),
    required: false,
    default: 18081,
    min: 1,
    max: 65535,
    step: null,
    integer: true,
    units: null,
  }),
  monerodZmqPort: Value.number({
    name: i18n('Monero ZMQ Port'),
    description: i18n(
      "The port your Monero node publishes ZMQ notifications on: the port in monerod's --zmq-pub option, which P2Pool requires. Not the ZMQ RPC port.",
    ),
    required: false,
    default: 18083,
    min: 1,
    max: 65535,
    step: null,
    integer: true,
    units: null,
  }),
  logLevel: Value.number({
    name: i18n('Log Level'),
    description: i18n(
      'How much P2Pool writes to the service logs, from 0 (least) to 6 (most). The default of 3 is already verbose: lower it to quiet the logs, or raise it while troubleshooting.',
    ),
    required: false,
    default: 3,
    min: 0,
    max: 6,
    step: null,
    integer: true,
    units: null,
  }),
})

export const configure = sdk.Action.withInput(
  // id
  'configure',

  // metadata
  async ({ effects }) => ({
    name: i18n('Configure P2Pool'),
    description: i18n(
      'Set your Monero wallet address, monerod connection, and P2Pool options.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // optionally pre-fill the input form
  async ({ effects }) => {
    const store = await storeJson.read().once()
    if (!store) return {}
    return {
      walletAddress: store.walletAddress || undefined,
      miniSidechain: store.miniSidechain,
      monerodHost: store.monerodHost || undefined,
      monerodRpcPort: store.monerodRpcPort,
      monerodZmqPort: store.monerodZmqPort,
      logLevel: store.logLevel,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      walletAddress: input.walletAddress,
      miniSidechain: input.miniSidechain,
      monerodHost: input.monerodHost,
      monerodRpcPort: input.monerodRpcPort ?? 18081,
      monerodZmqPort: input.monerodZmqPort ?? 18083,
      logLevel: input.logLevel ?? 3,
    })

    return {
      version: '1',
      title: i18n('Configuration Saved'),
      message: i18n('P2Pool configuration saved.'),
      result: null,
    }
  },
)
