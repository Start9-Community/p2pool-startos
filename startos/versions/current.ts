import { VersionInfo, IMPOSSIBLE } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '4.18.1:1',
  releaseNotes: {
    en_US: `- The Use P2Pool Mini, Monero ZMQ Port and Log Level descriptions in Configure P2Pool explain what each choice does and which port to enter.`,
    es_ES: `- Las descripciones de Usar P2Pool Mini, Puerto ZMQ de Monero y Nivel de registro en Configurar P2Pool explican qué hace cada opción y qué puerto introducir.`,
    de_DE: `- Die Beschreibungen von „P2Pool Mini verwenden“, Monero-ZMQ-Port und Protokollstufe in „P2Pool konfigurieren“ erklären, was jede Wahl bewirkt und welcher Port einzutragen ist.`,
    pl_PL: `- Opisy pól Użyj P2Pool Mini, Port ZMQ Monero i Poziom logowania w akcji Skonfiguruj P2Pool wyjaśniają, co daje każdy wybór i jaki port wpisać.`,
    fr_FR: `- Les descriptions de Utiliser P2Pool Mini, Port ZMQ Monero et Niveau de journalisation dans Configurer P2Pool expliquent ce que fait chaque choix et quel port saisir.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
