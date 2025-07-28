import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    client: 'src/client/main.ts',
  },
  format: ['esm', 'cjs'],
  bundle: true,
  dts: true,
  splitting: false,
  clean: false,
  outDir: 'build',
  treeshake: 'smallest',
  target: 'esnext',
  platform: 'browser',
  name: 'client',
})
