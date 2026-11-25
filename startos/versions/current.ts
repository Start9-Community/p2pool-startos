import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.1:5',
  releaseNotes: {
    en_US:
      'Other P2Pool nodes can now reach yours over Tor: add a new .onion address to the P2P interface, and P2Pool announces it in the shares you mine. Each Tor peer gets a connection of its own. The address is published together with your wallet address, so create a new one rather than reusing one you have. Requires Tor 0.4.9.17:4 or later.',
    es_ES:
      'Otros nodos P2Pool ya pueden alcanzar el tuyo a través de Tor: añade una nueva dirección .onion a la interfaz P2P, y P2Pool la anuncia en los shares que minas. Cada par de Tor obtiene su propia conexión. La dirección se publica junto con tu dirección de monedero, así que crea una nueva en lugar de reutilizar una que ya tengas. Requiere Tor 0.4.9.17:4 o posterior.',
    de_DE:
      'Andere P2Pool-Nodes können deinen Node jetzt über Tor erreichen: Füge der P2P-Schnittstelle eine neue .onion-Adresse hinzu, und P2Pool kündigt sie in den Shares an, die du minst. Jeder Tor-Peer erhält eine eigene Verbindung. Die Adresse wird zusammen mit deiner Wallet-Adresse veröffentlicht, also erstelle eine neue, statt eine vorhandene wiederzuverwenden. Erfordert Tor 0.4.9.17:4 oder neuer.',
    pl_PL:
      'Inne węzły P2Pool mogą teraz łączyć się z twoim przez Tor: dodaj nowy adres .onion do interfejsu P2P, a P2Pool ogłosi go w wydobywanych przez ciebie share’ach. Każdy węzeł z Tora dostaje własne połączenie. Adres jest publikowany razem z adresem twojego portfela, więc utwórz nowy zamiast używać istniejącego. Wymaga Tor 0.4.9.17:4 lub nowszego.',
    fr_FR:
      "D'autres nœuds P2Pool peuvent désormais joindre le vôtre via Tor : ajoutez une nouvelle adresse .onion à l'interface P2P, et P2Pool l'annonce dans les shares que vous minez. Chaque pair Tor obtient sa propre connexion. L'adresse est publiée avec votre adresse de portefeuille : créez-en une nouvelle plutôt que de réutiliser une adresse existante. Nécessite Tor 0.4.9.17:4 ou une version ultérieure.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
