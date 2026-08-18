import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18:0',
  releaseNotes: {
    en_US:
      'Updated P2Pool to 4.18. Major Stratum server performance work (up to 100,000 simultaneous Stratum connections) and a faster crypto cache (~10% less CPU spent on block verification), plus bugfixes: a potential double free when shutting down the Stratum server, inconsistent accounting when submit_sidechain_block fails, a crash when initializing the dataset on systems with 256+ threads, and the SOCKS5 proxy is no longer used to reach private/LAN-hosted Monero nodes. Internal dependencies updated (glibc 2.44, BoringSSL, RandomX). Release notes: https://github.com/SChernykh/p2pool/releases/tag/v4.18',
    es_ES:
      'P2Pool actualizado a 4.18. Gran mejora de rendimiento del servidor Stratum (hasta 100 000 conexiones Stratum simultáneas) y una caché criptográfica más rápida (~10 % menos de CPU en la verificación de bloques), además de correcciones: un posible double free al apagar el servidor Stratum, contabilidad inconsistente cuando submit_sidechain_block falla, un fallo al inicializar el dataset en sistemas con 256+ hilos, y ya no se usa el proxy SOCKS5 para conectar con nodos de Monero privados/alojados en LAN. Dependencias internas actualizadas (glibc 2.44, BoringSSL, RandomX). Notas de la versión: https://github.com/SChernykh/p2pool/releases/tag/v4.18',
    de_DE:
      'P2Pool auf 4.18 aktualisiert. Deutliche Leistungsverbesserungen des Stratum-Servers (bis zu 100.000 gleichzeitige Stratum-Verbindungen) und ein schnellerer Krypto-Cache (~10 % weniger CPU bei der Blockverifizierung), dazu Fehlerbehebungen: ein potenzielles Double-Free beim Herunterfahren des Stratum-Servers, inkonsistente Abrechnung wenn submit_sidechain_block fehlschlägt, ein Absturz beim Initialisieren des Datasets auf Systemen mit 256+ Threads, und der SOCKS5-Proxy wird nicht mehr für private/im LAN gehostete Monero-Nodes verwendet. Interne Abhängigkeiten aktualisiert (glibc 2.44, BoringSSL, RandomX). Release Notes: https://github.com/SChernykh/p2pool/releases/tag/v4.18',
    pl_PL:
      'Zaktualizowano P2Pool do 4.18. Znaczna poprawa wydajności serwera Stratum (obsługa do 100 000 równoczesnych połączeń Stratum) i szybsza pamięć podręczna kryptografii (~10% mniej CPU przy weryfikacji bloków), a także poprawki: potencjalne podwójne zwolnienie pamięci przy zamykaniu serwera Stratum, niespójna księgowość gdy submit_sidechain_block zawiedzie, awaria przy inicjalizacji datasetu na systemach z 256+ wątkami oraz proxy SOCKS5 nie jest już używane do łączenia z prywatnymi/hostowanymi w LAN węzłami Monero. Zaktualizowane zależności wewnętrzne (glibc 2.44, BoringSSL, RandomX). Informacje o wydaniu: https://github.com/SChernykh/p2pool/releases/tag/v4.18',
    fr_FR:
      "P2Pool mis à jour vers 4.18. Améliorations majeures des performances du serveur Stratum (jusqu'à 100 000 connexions Stratum simultanées) et cache cryptographique plus rapide (~10 % de CPU en moins pour la vérification des blocs), ainsi que des correctifs : un double free potentiel à l'arrêt du serveur Stratum, une comptabilité incohérente lorsque submit_sidechain_block échoue, un plantage à l'initialisation du dataset sur les systèmes de 256 threads ou plus, et le proxy SOCKS5 n'est plus utilisé pour joindre les nœuds Monero privés/hébergés sur le LAN. Dépendances internes mises à jour (glibc 2.44, BoringSSL, RandomX). Notes de version : https://github.com/SChernykh/p2pool/releases/tag/v4.18",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
