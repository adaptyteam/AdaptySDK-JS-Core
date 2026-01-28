import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  outDir: 'dist',
  fixedExtension: true,
  platform: 'neutral',
  target: 'es2020',
  clean: true,
  skipNodeModulesBundle: true,
  treeshake: true,
});
