import addButtons from './addButtons'
import addColors from './addColors'
import addFluidHelper from './addFluidHelper'
import addSizing, { addBorderRadius, addResponsizeSpacing } from './addSizing'
import addTypography, {
  configOverrides as addTypographyConfigOverrides,
} from './addTypography'
import { ManifestKeys } from './enums'
import type {
  ExtendedConfig,
  FontFamilyMapping,
  FontWeightMapping,
} from './types'
import { consoleError } from './utils'
import { existsSync } from 'node:fs'
import plugin from 'tailwindcss/plugin'
import type { PluginAPI } from 'tailwindcss/types/config'

export type DomainTWOptions = {
  manifestFilePath: string
  typography?: boolean
  colors?: boolean
  sizing?: boolean
  /**
   * Font family mapping for each font family in the manifest, the fontName should match the font family in the manifest and the value one of the keys from FontFamilyKey
   *
   * @type {object}
   * @property {string} fontName - The font family name from the manifest
   * @example
   * {
   *   "PP Editorial New": "Primary",
   *   "Maison Neue": "Secondary",
   *   "NB Akademie Std": "Tertiary",
   * }
   */
  fontMapping?: FontFamilyMapping
  /**
   * Font weight mapping for each font family
   *
   * Provide the font family and the font weight mapping for each font family
   *
   * @example
   * {
   *  "Primary": {
   *    "Light Italic": 300,
   *    "Regular": 400,
   *    "Bold": 700,
   *    "Mono": 450
   *   }
   * }
   */
  fontWeightMapping?: FontWeightMapping
  fluidTypography?: boolean | 'LIMITED_DESKTOP'
  buttons?: boolean
  buttonTypename?: 'body' | 'utility'
}

const checkManifestFileExists = (manifestFilePath: string) => {
  if (!manifestFilePath || !existsSync(manifestFilePath)) {
    consoleError(
      `Manifest file path is missing ${manifestFilePath}`,
      'Manifest File Error'
    )
  }
}

// Add Typegraphy
// Add Spacing / Marging / Padding / Gap / Space / Inset

const handler = function ({
  manifestFilePath,
  typography = true,
  fluidTypography = true,
  fontMapping,
  fontWeightMapping,
  buttons = true,
  buttonTypename = 'body',
}: DomainTWOptions) {
  buttons = false;
  checkManifestFileExists(manifestFilePath)
  return (pluginAPI: PluginAPI) => {
    checkManifestFileExists(manifestFilePath)
    const manifest = require(manifestFilePath)
    // Fluid Helper
    addFluidHelper(pluginAPI, fluidTypography)

    // Add Typography
    typography &&
      addTypography(
        pluginAPI,
        manifest[ManifestKeys.Typography],
        fontMapping,
        fontWeightMapping,
        fluidTypography
      )

    buttons &&
      addButtons(
        pluginAPI,
        manifest,
        fontMapping,
        buttonTypename,
        fluidTypography
      )
    addBorderRadius(pluginAPI, manifest[ManifestKeys.Sizing])
    !fluidTypography &&
      addResponsizeSpacing(pluginAPI, manifest[ManifestKeys.Sizing])
  }
}

const domainTWPlugin = plugin.withOptions<DomainTWOptions>(
  handler,
  function ({
    manifestFilePath,
    typography = true,
    colors = true,
    sizing = true,
    fluidTypography = true,
  }: DomainTWOptions) {
    checkManifestFileExists(manifestFilePath)
    const manifest = require(manifestFilePath)

    if (!manifest) {
      return {}
    }
    const config: ExtendedConfig = {}
    colors && addColors(config, manifest[ManifestKeys.Colors])
    sizing && addSizing(config, manifest[ManifestKeys.Sizing], fluidTypography)
    typography && addTypographyConfigOverrides(config)
    return config satisfies ExtendedConfig
  }
)

export default domainTWPlugin
