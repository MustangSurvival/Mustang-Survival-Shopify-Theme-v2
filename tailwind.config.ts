import twExtend from './tailwind-manifest'
import path from 'node:path'
import type { Config } from 'tailwindcss'

export default {
  content: [
    './{layout,sections,snippets,templates,src}/**/*.{ts,js,jsx,tsx,json,liquid,css}',
    '!./{layout,sections,snippets,templates,src}/**/*styleguide.{liquid,css}',
  ],
  plugins: [
    require('tailwind-scrollbar'),
    require('@tailwindcss/container-queries'), // Support for container queries https://github.com/tailwindlabs/tailwindcss-container-queries
    twExtend({
      manifestFilePath: path.resolve('./design.manifest.json'),
      fontMapping: {
        'Gotham Narrow': 'Primary',
        Tungsten: 'Heading',
      },
      fontWeightMapping: {
        Primary: {
          Regular: 400,
        },
        Heading: {
          Regular: 600,
        },
      },
      fluidTypography: false,
      /*
      Provide custom font weight mapping if needed, the value is matched fontName.style from design manifest
        fontWeightMapping: {
          Primary: {
            'Light Italic': 300,
            Regular: 700,
          },
        },
      */
      // fontWeightMapping: {
      //   Primary: {
      //     Regular: 700,
      //   },
      // },
    }),
  ],
} satisfies Config
