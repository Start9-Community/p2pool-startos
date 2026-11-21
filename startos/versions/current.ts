import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'
import { rm } from 'node:fs/promises'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '4.18.1:4',
  releaseNotes: {
    en_US: `- P2Pool no longer writes its own log file, and this update deletes the one earlier versions wrote, which could grow to several gigabytes; the console log StartOS keeps is the same output. Backups leave out the sidechain cache, which is rebuilt from the network.`,
    es_ES: `- P2Pool ya no escribe su propio archivo de registro, y esta actualización elimina el que escribían las versiones anteriores, que podía crecer hasta varios gigabytes; el registro de consola que guarda StartOS es la misma salida. Las copias de seguridad omiten la caché de la sidechain, que se reconstruye desde la red.`,
    de_DE: `- P2Pool schreibt keine eigene Logdatei mehr, und dieses Update löscht die Logdatei früherer Versionen, die auf mehrere Gigabyte anwachsen konnte; das Konsolenprotokoll, das StartOS führt, ist dieselbe Ausgabe. Backups lassen den Sidechain-Cache aus, der aus dem Netzwerk neu aufgebaut wird.`,
    pl_PL: `- P2Pool nie zapisuje już własnego pliku dziennika, a ta aktualizacja usuwa plik zapisywany przez wcześniejsze wersje, który mógł urosnąć do kilku gigabajtów; dziennik konsoli przechowywany przez StartOS to ta sama zawartość. Kopie zapasowe pomijają pamięć podręczną sidechaina, odbudowywaną z sieci.`,
    fr_FR: `- P2Pool n'écrit plus son propre fichier journal, et cette mise à jour supprime celui qu'écrivaient les versions précédentes, qui pouvait atteindre plusieurs gigaoctets ; le journal de console conservé par StartOS est la même sortie. Les sauvegardes laissent de côté le cache de la sidechain, reconstruit depuis le réseau.`,
  },
  migrations: {
    up: async () => {
      await rm(sdk.volumes.main.subpath('p2pool.log'), { force: true })
    },
    down: IMPOSSIBLE,
  },
})
