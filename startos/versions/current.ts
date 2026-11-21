import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.1:4',
  releaseNotes: {
    en_US: `- P2Pool no longer writes its own log file; the console log StartOS keeps is the same output. Backups leave out the sidechain cache, which is rebuilt from the network, and any old log file, which is not needed.`,
    es_ES: `- P2Pool ya no escribe su propio archivo de registro; el registro de consola que guarda StartOS es la misma salida. Las copias de seguridad omiten la caché de la sidechain, que se reconstruye desde la red, y cualquier archivo de registro antiguo, que no se necesita.`,
    de_DE: `- P2Pool schreibt keine eigene Logdatei mehr; das Konsolenprotokoll, das StartOS führt, ist dieselbe Ausgabe. Backups lassen den Sidechain-Cache aus, der aus dem Netzwerk neu aufgebaut wird, und eine etwaige alte Logdatei, die nicht benötigt wird.`,
    pl_PL: `- P2Pool nie zapisuje już własnego pliku dziennika; dziennik konsoli przechowywany przez StartOS to ta sama zawartość. Kopie zapasowe pomijają pamięć podręczną sidechaina, odbudowywaną z sieci, oraz ewentualny stary plik dziennika, który nie jest potrzebny.`,
    fr_FR: `- P2Pool n'écrit plus son propre fichier journal ; le journal de console conservé par StartOS est la même sortie. Les sauvegardes laissent de côté le cache de la sidechain, reconstruit depuis le réseau, et tout ancien fichier journal, qui n'est pas nécessaire.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
