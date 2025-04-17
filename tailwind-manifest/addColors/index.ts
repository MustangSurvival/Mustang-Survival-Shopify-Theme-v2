import { ExtendedConfig } from '../types'
import { consoleError } from '../utils'
import { schema } from './schema'
import createDebugger from 'debug'
import { set } from 'lodash'

const debug = createDebugger('tailwind:colors')

const handler = (config: ExtendedConfig, manifest: unknown) => {
  const colors = schema.safeParse(manifest)

  if (colors.success) {
    set(config, 'theme.colors', colors.data)
    debug('theme.colors', colors.data)
  } else {
    consoleError(colors.error.message, 'Manifest Colors are Invalid')
  }
}

export default handler
