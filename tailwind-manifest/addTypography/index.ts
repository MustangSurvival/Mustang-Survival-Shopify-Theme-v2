import { ScreenSizeMapping } from '../enums'
import type {
  FlattenedManidestTypographySection,
  FontFamilyMapping,
  FontWeightMapping,
  ManifestTypographySection,
} from '../types'
import { consoleError } from '../utils'
import { TypographyBaseKeyToTag } from './enums'
import { schema } from './schemas'
import { flattenTypeSection, getCSSRuleObjectForVariant } from './utils'
import createDebugger from 'debug'
import { get, kebabCase, set } from 'lodash'
import { CSSRuleObject, Config, PluginAPI } from 'tailwindcss/types/config'

const debug = createDebugger('tailwind:typography')

const generateComponents = (
  typography: FlattenedManidestTypographySection,
  pluginAPI: PluginAPI,
  fontMapping?: FontFamilyMapping,
  fontWeightMapping?: FontWeightMapping,
  fluidTypography: boolean | 'LIMITED_DESKTOP' = true
) => {
  const baseStyleMapping: CSSRuleObject = {}
  const componentStyleMapping: CSSRuleObject = {}
  Object.entries(typography).forEach(
    ([kind, sizeMap]): void | [string, CSSRuleObject] => {
      const kindTag: string = kebabCase(kind)
      const targetTag: string | void | null = get(
        TypographyBaseKeyToTag,
        kindTag,
        null
      )
      const desktopConfig = sizeMap[ScreenSizeMapping.desktop]
      const mobileConfig = sizeMap[ScreenSizeMapping.mobile]

      // Override font mapping for headings to use "quaternary"
      const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(targetTag)
      const updatedFontMapping = isHeading
        ? { ...fontMapping, [mobileConfig.fontFamily]: 'Heading' }
        : fontMapping

      componentStyleMapping[`.${targetTag ?? kindTag}`] =
        getCSSRuleObjectForVariant(
          mobileConfig,
          desktopConfig,
          updatedFontMapping,
          fontWeightMapping,
          fluidTypography
        )

      componentStyleMapping[`.text-${kindTag}`] = getCSSRuleObjectForVariant(
        mobileConfig,
        desktopConfig,
        updatedFontMapping,
        fontWeightMapping,
        false
      )

      if (!targetTag) return
      baseStyleMapping[targetTag] =
        componentStyleMapping[`.${targetTag ?? kindTag}`]
    }
  )

  pluginAPI.addBase(baseStyleMapping)
  debug('Typography Base Styles', baseStyleMapping)
  pluginAPI.addComponents(componentStyleMapping)
  debug('Typography Components Styles', componentStyleMapping)
}

const handler = (
  pluginAPI: PluginAPI,
  manifest: ManifestTypographySection,
  fontMapping?: FontFamilyMapping,
  fontWeightMapping?: FontWeightMapping,
  fluidTypography: boolean | 'LIMITED_DESKTOP' = true
) => {
  const typeStyles = schema.safeParse(manifest)
  if (typeStyles.success) {
    const typography = flattenTypeSection(typeStyles.data)
    generateComponents(
      typography,
      pluginAPI,
      fontMapping,
      fontWeightMapping,
      fluidTypography
    )
  } else {
    consoleError(typeStyles.error.message, 'Manifest Typography Error')
  }
}

export const configOverrides = (config: Partial<Config>): void => {
  set(config, 'theme.extend.fontSize', {})
}

export default handler
