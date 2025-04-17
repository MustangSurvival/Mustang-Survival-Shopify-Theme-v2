/// <reference types="vitest" />
import vitePlugin from './vite-plugin'
import VitePluginSvgSpritemap from '@spiriit/vite-plugin-svg-spritemap'
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    passWithNoTests: true,
    environment: 'jsdom',
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.test.js',
      'src/**/*.test.jsx',
    ],
    coverage: {
      include: ['src/**/*'],
    },
  },
  plugins: [
    vitePlugin({
      cwd: __dirname,
    }),
    VitePluginSvgSpritemap('./src/icons/*.svg', {
      prefix: false,
      output: {
        filename: 'icons.svg',
        use: false,
        view: false,
      },
    }),
  ],
})
