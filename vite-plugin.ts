import { readdirSync, unlinkSync } from 'fs'
import { globSync } from 'glob'
import { basename, extname, resolve } from 'path'
import path from 'path'
import { UserConfig, mergeConfig } from 'vite'

const patternsToDelete = ['chunk-', '-component-', '-']
const cssPatternsToDelete = ['-']

function deleteChunkFilesPlugin(dir: string) {
  const directory = path.resolve(dir, 'assets')
  try {
    const files = readdirSync(directory)
    files.forEach((file) => {
      if (
        patternsToDelete.some((pattern) => file.startsWith(pattern)) &&
        file.endsWith('.js')
      ) {
        unlinkSync(path.join(directory, file))
      }

      if (
        cssPatternsToDelete.some((pattern) => file.startsWith(pattern)) &&
        file.endsWith('.css')
      ) {
        unlinkSync(path.join(directory, file))
      }
    })
  } catch (err) {
    console.error('Error while deleting chunk files:', err)
  }
}

/**
 * Dynamically generates input entries for each JavaScript and TypeScript file in the specified directory.
 * @param {string} dir The directory path.
 * @returns {Object} The input entries object.
 */
function getInputFiles(dir: string) {
  const input: Record<string, string> = {}
  // Normalize the directory path
  const normalizedDir = path.normalize(dir)
  // Ensure the glob pattern uses forward slashes
  const files = globSync(
    `${normalizedDir.replace(/\\/g, '/')}/entry/**/*.{js,ts}`
  )

  files.forEach((file) => {
    const filePath = resolve(dir, file)
    const ext = extname(file)
    const fileName = basename(file, ext)

    if (ext === '.js' || ext === '.ts') {
      if (input[fileName]) {
        throw new Error(`Duplicate entry found: ${fileName}`)
      }
      input[fileName] = filePath
    }
  })
  return input
}

type ViteConfigArgs = {
  cwd: string
}

function rollupOptionsPlugin({ cwd }: ViteConfigArgs) {
  let firstRun = false
  let config: UserConfig
  return {
    name: 'Rollup Options',
    config: async (
      config: UserConfig,
      env: { mode: string; command: string }
    ) => {
      return mergeConfig(config, {
        root: './',
        build: {
          outDir: './assets',
          assetsDir: './',
          emptyOutDir: false,
          watch: config.build?.watch && {
            include: [
              './{layout,sections,snippets,templates,src,blocks}/**/*.{ts,js,jsx,tsx,json,liquid,css}',
              './design.manifest.json',
            ],
            buildDelay: 300,
            clearScreen: true,
          },
          rollupOptions: {
            input: {
              ...getInputFiles(resolve(cwd, 'src')), // Generate inputs for JavaScript and TypeScript files
            },
            output: {
              entryFileNames: `-[name].js`,
              assetFileNames: `-[name][extname]`,
              chunkFileNames: `chunk-[name]-[hash].js`,
              ...config.build?.rollupOptions?.output,
            },
          },
        },
        resolve: {
          alias: {
            '@/': resolve(cwd, 'src') + '/',
          },
        },
        css: {
          postcss: {
            plugins: [
              require('tailwindcss'), // Add Tailwind CSS support
            ],
          },
        },
      })
    },
    configResolved: async (finalConfig: UserConfig) => {
      config = finalConfig
      if (firstRun) {
        return
      }
      firstRun = true
      await deleteChunkFilesPlugin(cwd)
    },
  }
}

export default rollupOptionsPlugin
