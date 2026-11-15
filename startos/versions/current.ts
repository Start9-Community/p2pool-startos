import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.1:3',
  releaseNotes: {
    en_US: `- The build now verifies the GPG signature on P2Pool's release checksums against the P2Pool project's signing key before trusting them. No runtime changes.`,
    es_ES: `- La compilación ahora verifica la firma GPG de las sumas de comprobación de la versión de P2Pool con la clave de firma del proyecto antes de confiar en ellas. Sin cambios en tiempo de ejecución.`,
    de_DE: `- Der Build prüft jetzt die GPG-Signatur der P2Pool-Release-Prüfsummen gegen den Signaturschlüssel des Projekts, bevor er ihnen vertraut. Keine Änderungen zur Laufzeit.`,
    pl_PL: `- Kompilacja sprawdza teraz podpis GPG sum kontrolnych wydania P2Pool kluczem podpisującym projektu, zanim im zaufa. Bez zmian w czasie działania.`,
    fr_FR: `- La construction vérifie désormais la signature GPG des sommes de contrôle de la version de P2Pool avec la clé de signature du projet avant de s'y fier. Aucun changement à l'exécution.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
