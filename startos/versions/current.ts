import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.17.1:0',
  releaseNotes: {
    en_US:
      'Updated P2Pool to 4.17.1. Recommended for all nodes: adds significant hardening against spam/DoS attacks (early filtering of invalid incoming blocks, P2P block-broadcast DoS hardening, parallel PoW checking) and fixes the startup sequence for configs that require many Monero headers, plus smaller bugfixes and an updated internal curl. Release notes: https://github.com/SChernykh/p2pool/releases/tag/v4.17.1 — Also includes internal updates for start-sdk 2.0.',
    es_ES:
      'P2Pool actualizado a 4.17.1. Recomendado para todos los nodos: añade un refuerzo importante contra ataques de spam/DoS (filtrado temprano de bloques entrantes inválidos, protección DoS en la difusión de bloques P2P, verificación de PoW en paralelo) y corrige la secuencia de arranque en configuraciones que requieren muchas cabeceras de Monero, además de correcciones menores y una actualización interna de curl. Notas de la versión: https://github.com/SChernykh/p2pool/releases/tag/v4.17.1 — También incluye actualizaciones internas para start-sdk 2.0.',
    de_DE:
      'P2Pool auf 4.17.1 aktualisiert. Für alle Nodes empfohlen: bringt deutliche Härtung gegen Spam-/DoS-Angriffe (frühzeitiges Herausfiltern ungültiger eingehender Blöcke, DoS-Härtung beim P2P-Block-Broadcast, parallele PoW-Prüfung) und behebt die Startsequenz für Konfigurationen, die viele Monero-Header benötigen, dazu kleinere Fehlerbehebungen und ein aktualisiertes internes curl. Release Notes: https://github.com/SChernykh/p2pool/releases/tag/v4.17.1 — Enthält außerdem interne Aktualisierungen für start-sdk 2.0.',
    pl_PL:
      'Zaktualizowano P2Pool do 4.17.1. Zalecane dla wszystkich węzłów: znaczne wzmocnienie ochrony przed atakami spam/DoS (wczesne filtrowanie nieprawidłowych bloków przychodzących, wzmocnienie ochrony DoS przy rozgłaszaniu bloków P2P, równoległa weryfikacja PoW) oraz poprawka sekwencji startowej dla konfiguracji wymagających wielu nagłówków Monero, a także drobniejsze poprawki i zaktualizowany wewnętrzny curl. Informacje o wydaniu: https://github.com/SChernykh/p2pool/releases/tag/v4.17.1 — Zawiera również wewnętrzne aktualizacje dla start-sdk 2.0.',
    fr_FR:
      'P2Pool mis à jour vers 4.17.1. Recommandé pour tous les nœuds : renforcement important contre les attaques spam/DoS (filtrage précoce des blocs entrants invalides, durcissement DoS de la diffusion de blocs P2P, vérification PoW en parallèle) et correction de la séquence de démarrage pour les configurations nécessitant de nombreux en-têtes Monero, ainsi que des correctifs mineurs et une mise à jour interne de curl. Notes de version : https://github.com/SChernykh/p2pool/releases/tag/v4.17.1 — Inclut également des mises à jour internes pour start-sdk 2.0.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
