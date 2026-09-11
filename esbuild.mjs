import { context } from 'esbuild'

const watch = process.argv.includes('--watch')

const buildOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  external: ['vscode'],
  outfile: 'dist/extension.js',
  sourcemap: true,
  logLevel: 'info'
}

const buildContext = await context(buildOptions)

if (watch) {
  await buildContext.watch()
  console.log('Watching for changes...')
} else {
  await buildContext.rebuild()
  await buildContext.dispose()
}
