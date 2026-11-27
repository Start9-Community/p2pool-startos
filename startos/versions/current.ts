import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.1:6',
  releaseNotes: {
    en_US:
      "P2Pool can now use the Monero service on this server: choose **Monero on this server** in **Configure**. P2Pool asks Monero to turn on ZMQ and connects with the login Monero gives it. If you had pointed P2Pool at this server's Monero by its address, it stopped connecting after Monero 0.18.5.4:6; choosing Monero on this server restores it. A Monero node elsewhere still works as before under **External Monero node**.",
    es_ES:
      'P2Pool ahora puede usar el servicio Monero de este servidor: elige **Monero en este servidor** en **Configurar**. P2Pool pide a Monero que active ZMQ y se conecta con el inicio de sesión que Monero le da. Si habías apuntado P2Pool al Monero de este servidor por su dirección, dejó de conectarse tras Monero 0.18.5.4:6; elegir Monero en este servidor lo restablece. Un nodo Monero en otro lugar sigue funcionando como antes en **Nodo Monero externo**.',
    de_DE:
      'P2Pool kann jetzt den Monero-Dienst auf diesem Server nutzen: Wähle **Monero auf diesem Server** unter **Konfigurieren**. P2Pool bittet Monero, ZMQ einzuschalten, und verbindet sich mit der Anmeldung, die Monero ihm gibt. Falls du P2Pool über die Adresse des Monero auf diesem Server verbunden hattest, verband es sich seit Monero 0.18.5.4:6 nicht mehr; Monero auf diesem Server zu wählen stellt das wieder her. Ein Monero-Knoten anderswo funktioniert weiterhin wie bisher unter **Externer Monero-Knoten**.',
    pl_PL:
      'P2Pool może teraz korzystać z usługi Monero na tym serwerze: wybierz **Monero na tym serwerze** w **Konfiguruj**. P2Pool prosi Monero o włączenie ZMQ i łączy się z użyciem loginu, który daje mu Monero. Jeśli P2Pool był skierowany na Monero na tym serwerze przez jego adres, przestał się łączyć po Monero 0.18.5.4:6; wybranie Monero na tym serwerze to przywraca. Węzeł Monero gdzie indziej działa jak dotąd w opcji **Zewnętrzny węzeł Monero**.',
    fr_FR:
      "P2Pool peut désormais utiliser le service Monero de ce serveur : choisissez **Monero sur ce serveur** dans **Configurer**. P2Pool demande à Monero d'activer ZMQ et se connecte avec l'identifiant que Monero lui fournit. Si vous aviez pointé P2Pool vers le Monero de ce serveur par son adresse, il ne se connectait plus depuis Monero 0.18.5.4:6 ; choisir Monero sur ce serveur le rétablit. Un nœud Monero ailleurs fonctionne toujours comme avant avec **Nœud Monero externe**.",
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
