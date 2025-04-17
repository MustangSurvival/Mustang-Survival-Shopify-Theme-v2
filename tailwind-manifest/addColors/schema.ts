import ColorInstance from 'color'
import createDebugger from 'debug'
import { kebabCase, set } from 'lodash'
import { CSSRuleObject } from 'tailwindcss/types/config'
import { z } from 'zod'

const debug = createDebugger('tailwind:colors')

const RGB = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
})

const RGBA = RGB.extend({
  a: z.number().min(0).max(1).default(1),
})
  .transform((data) => ({
    r: data.r,
    g: data.g,
    b: data.b,
    alpha: data.a,
  }))
  .pipe(
    RGB.extend({
      alpha: z.number().min(0).max(1),
    }).transform((value) => ({
      r: Math.round(value.r * 255),
      g: Math.round(value.g * 255),
      b: Math.round(value.b * 255),
      alpha: value.alpha,
    }))
  )

const HEX = z.string()
const Color = z.union([RGBA, HEX]).refine((value) => {
  try {
    // validate color
    ColorInstance(value)
    return true
  } catch (error) {
    return false
  }
})

const sanitizeColorName = (name: string) =>
  name.startsWith('_') ? name.slice(1) : name

export const schema = z.record(z.string(), Color).transform((data) => {
  const colorsConfig: CSSRuleObject = {}
  Object.entries(data).forEach(([key, value]) => {
    const [colorGroup, _colorName, subGroup]: string[] = key
      .split('/')
      .map(kebabCase)
    const colorName = subGroup || _colorName
    if (!colorGroup || !colorName) return

    const sanitiziedGroupName = sanitizeColorName(colorGroup)
    const sanitizedColorName = sanitizeColorName(colorName)
    const colorValue = ColorInstance(value)

    set(
      colorsConfig,
      `${sanitiziedGroupName[0]}-${sanitizedColorName}`,
      colorValue.alpha() === 1 ? colorValue.hex() : colorValue.string()
    )
  })
  debug('colorsConfig', colorsConfig)
  return colorsConfig
})
