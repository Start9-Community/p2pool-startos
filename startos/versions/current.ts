import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.1:0',
  releaseNotes: {
    en_US:
      'Updated P2Pool to 4.18.1. Bugfixes: Tari merge mining is fixed and now requires a Tari node v6.0.0 or newer; sidechain blocks with a missing parent or uncle are no longer treated as invalid; peer lists no longer accept private IP addresses; and a crash when running --version against a libcurl built without SSL support is fixed. Release notes: https://github.com/SChernykh/p2pool/releases/tag/v4.18.1',
    es_ES:
      'P2Pool actualizado a 4.18.1. Correcciones: la minería combinada con Tari está arreglada y ahora requiere un nodo Tari v6.0.0 o posterior; los bloques de la sidechain con un padre o un tío ausente ya no se consideran inválidos; las listas de pares ya no aceptan direcciones IP privadas; y se corrigió un fallo al ejecutar --version con una libcurl compilada sin SSL. Notas de la versión: https://github.com/SChernykh/p2pool/releases/tag/v4.18.1',
    de_DE:
      'P2Pool auf 4.18.1 aktualisiert. Fehlerbehebungen: Das Tari-Merge-Mining wurde repariert und setzt jetzt einen Tari-Node ab v6.0.0 voraus; Sidechain-Blöcke mit fehlendem Parent oder Uncle gelten nicht mehr als ungültig; Peer-Listen akzeptieren keine privaten IP-Adressen mehr; und ein Absturz beim Aufruf von --version mit einer ohne SSL gebauten libcurl wurde behoben. Release Notes: https://github.com/SChernykh/p2pool/releases/tag/v4.18.1',
    pl_PL:
      'Zaktualizowano P2Pool do 4.18.1. Poprawki: naprawiono wydobycie łączone z Tari, które wymaga teraz węzła Tari v6.0.0 lub nowszego; bloki sidechainu z brakującym rodzicem lub wujem nie są już uznawane za nieprawidłowe; listy peerów nie przyjmują już prywatnych adresów IP; naprawiono awarię przy uruchomieniu --version z biblioteką libcurl zbudowaną bez SSL. Informacje o wydaniu: https://github.com/SChernykh/p2pool/releases/tag/v4.18.1',
    fr_FR:
      "P2Pool mis à jour vers 4.18.1. Correctifs : le minage fusionné Tari est réparé et nécessite désormais un nœud Tari v6.0.0 ou plus récent ; les blocs de sidechain dont le parent ou l'oncle est manquant ne sont plus considérés comme invalides ; les listes de pairs n'acceptent plus les adresses IP privées ; et un plantage lors de l'exécution de --version avec une libcurl compilée sans SSL a été corrigé. Notes de version : https://github.com/SChernykh/p2pool/releases/tag/v4.18.1",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
