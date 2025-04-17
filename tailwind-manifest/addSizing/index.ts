import { ScreenSizeMapping } from '../enums'
import { ExtendedConfig } from '../types'
import { consoleError, getFluidSize, rem } from '../utils'
import {
  BaseSpacingSchema,
  BorderRadiusSchema,
  ContainerSpacingSchema,
  ResponsiveValuesNumberSchema,
  SpacingsSchema,
  SpacingsSchemaLimitedDesktop,
  StaticSpacingsSchema,
} from './schema'
import createDebugger from 'debug'
import { set } from 'lodash'
import { PluginAPI } from 'tailwindcss/types/config'

const debug = createDebugger('tailwind:sizing')

const addSpacingConfig = (
  config: ExtendedConfig,
  manifest: unknown,
  fluidTypography: boolean | 'LIMITED_DESKTOP' = true
) => {
  const spacings = (
    fluidTypography === 'LIMITED_DESKTOP'
      ? SpacingsSchemaLimitedDesktop
      : SpacingsSchema
  ).safeParse(manifest)
  const flatSpacing = StaticSpacingsSchema.safeParse(manifest)
  if (spacings.success) {
    fluidTypography &&
      set(config, 'theme.extend.spacing', {
        ...config.theme?.extend?.spacing,
        ...spacings.data,
      })
  } else {
    consoleError(spacings.error.message, 'Manifest Colors are Invalid')
  }

  if (flatSpacing.success) {
    set(config, 'theme.extend.spacing', {
      ...config.theme?.extend?.spacing,
      ...flatSpacing.data,
    })
  } else {
    consoleError(flatSpacing.error.message, 'Manifest Colors are Invalid')
  }

  const containerSpacings = ContainerSpacingSchema.safeParse(manifest)
  if (containerSpacings.success) {
    set(config, 'theme.container', {
      ...config.theme?.container,
      center: true,
      padding: getFluidSize(
        containerSpacings.data.pagemargin.mobile,
        containerSpacings.data.pagemargin.desktop,
        fluidTypography
      ),
    })
  } else {
    consoleError(containerSpacings.error.message, 'Manifest Colors are Invalid')
  }

  debug('theme.extend.spacing', config.theme?.extend?.spacing)
}

export const addBorderRadius = (pluginAPI: PluginAPI, manifest: unknown) => {
  const borderRadius = BorderRadiusSchema.safeParse(manifest)
  if (borderRadius.success) {
    debug('borderRadius', borderRadius.data)
    pluginAPI.matchUtilities(
      {
        rounded: (value) => {
          const validateValue = ResponsiveValuesNumberSchema.safeParse(value)
          if (validateValue.success) {
            return {
              borderRadius: rem(validateValue.data.mobile),

              [`@screen ${ScreenSizeMapping.desktop}`]: {
                borderRadius: rem(validateValue.data.desktop),
              },
            }
          }

          return null
        },
      },
      {
        values: borderRadius.data,
      }
    )
  } else {
    debug('borderRadius', borderRadius.error.message)
    consoleError(borderRadius.error.message, 'Manifest Colors are Invalid')
  }
}

const getSpacingForType = (types: string[]) => {
  return (value: unknown) => {
    const validateValue = ResponsiveValuesNumberSchema.safeParse(value)
    if (validateValue.success) {
      const mobileStyles = types.reduce((acc, type) => {
        return {
          ...acc,
          [type]: rem(validateValue.data.mobile),
        }
      }, {})

      const desktopStyles = types.reduce((acc, type) => {
        return {
          ...acc,
          [type]: rem(validateValue.data.desktop),
        }
      }, {})

      return {
        ...mobileStyles,
        [`@screen ${ScreenSizeMapping.desktop}`]: desktopStyles,
      }
    }

    return null
  }
}

export const addResponsizeSpacing = (
  pluginAPI: PluginAPI,
  manifest: unknown
) => {
  const mapping = BaseSpacingSchema.safeParse(manifest)

  if (mapping.success) {
    debug('mapping', mapping.data)
    pluginAPI.matchUtilities(
      {
        gap: getSpacingForType(['gap']),
        'row-gap': getSpacingForType(['row-gap']),
        'column-gap': getSpacingForType(['column-gap']),
        p: getSpacingForType(['padding']),
        px: getSpacingForType(['paddingLeft', 'paddingRight']),
        py: getSpacingForType(['paddingTop', 'paddingBottom']),
        pt: getSpacingForType(['paddingTop']),
        pb: getSpacingForType(['paddingBottom']),
        pl: getSpacingForType(['paddingLeft']),
        pr: getSpacingForType(['paddingRight']),
        m: getSpacingForType(['margin']),
        mt: getSpacingForType(['marginTop']),
        mb: getSpacingForType(['marginBottom']),
        ml: getSpacingForType(['marginLeft']),
        mr: getSpacingForType(['marginRight']),
        mx: getSpacingForType(['marginLeft', 'marginRight']),
        my: getSpacingForType(['marginTop', 'marginBottom']),
        inset: getSpacingForType(['top', 'right', 'bottom', 'left']),
        top: getSpacingForType(['top']),
        right: getSpacingForType(['right']),
        bottom: getSpacingForType(['bottom']),
        left: getSpacingForType(['left']),
        width: getSpacingForType(['width']),
        minWidth: getSpacingForType(['minWidth']),
        maxWidth: getSpacingForType(['maxWidth']),
        height: getSpacingForType(['height']),
        minHeight: getSpacingForType(['minHeight']),
        maxHeight: getSpacingForType(['maxHeight']),
        size: getSpacingForType(['width', 'height']),
      },
      {
        values: mapping.data,
      }
    )

    pluginAPI.matchComponents({
      st: (value) => {
        const [propertyKey, sizeToken] = value.split('|').filter(Boolean)

        const tokenValue = mapping.data[sizeToken]
        const responsiveValue =
          ResponsiveValuesNumberSchema.safeParse(tokenValue)
        if (
          !propertyKey ||
          !sizeToken ||
          !tokenValue ||
          !responsiveValue.success
        ) {
          return null
        }

        return {
          [propertyKey]: rem(responsiveValue.data.mobile),

          [`@screen ${ScreenSizeMapping.desktop}`]: {
            [propertyKey]: rem(responsiveValue.data.desktop),
          },
        }
      },
    })
  } else {
    debug('Sizing', mapping.error.message)
    consoleError(mapping.error.message, 'Manifest Colors are Invalid')
  }
}

const handler = (
  config: ExtendedConfig,
  manifest: unknown,
  withFluid = true
) => {
  addSpacingConfig(config, manifest, withFluid)
}

export default handler
