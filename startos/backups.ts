import { sdk } from './sdk'

export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main').setOptions({
    exclude: [
      // P2Pool's own log file. The service runs with --no-log-file now, so
      // this only matters for installs that still carry one from before; it
      // duplicates the console log StartOS already keeps and grows without bound.
      '/p2pool.log',
      // The sidechain cache: rebuilt from the network after a restore.
      '/p2pool.cache',
    ],
  }),
)
