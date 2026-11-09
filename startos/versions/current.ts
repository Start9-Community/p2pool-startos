import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.1:2',
  releaseNotes: {
    en_US: `- Miners and peers can now connect to P2Pool over the server's IPv6 addresses.`,
    es_ES: `- Los mineros y los pares ahora pueden conectarse a P2Pool a través de las direcciones IPv6 del servidor.`,
    de_DE: `- Miner und Peers können sich jetzt über die IPv6-Adressen des Servers mit P2Pool verbinden.`,
    pl_PL: `- Górnicy i peery mogą teraz łączyć się z P2Pool przez adresy IPv6 serwera.`,
    fr_FR: `- Les mineurs et les pairs peuvent désormais se connecter à P2Pool via les adresses IPv6 du serveur.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
