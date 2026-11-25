import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_4_18_1_4 } from './v4.18.1_4'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_4_18_1_4],
})
