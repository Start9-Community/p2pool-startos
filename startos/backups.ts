import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main').setOptions({
    exclude: [
      // The sidechain cache: rebuilt from the network after a restore.
      // Exclusion retains existing target copies; restores skip them.
      '/p2pool.cache',
    ],
  }),
)
