import { defineConfig } from 'tsdown';
import { config } from 'dotenv';
import { copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

// Load environment variables from .env file
config();

const outDir = process.env['BUILD_OUT_DIR'] || 'dist';

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  outDir,
  fixedExtension: true,
  platform: 'neutral',
  target: 'es2020',
  clean: true,
  skipNodeModulesBundle: true,
  treeshake: true,
  hooks: {
    // When building into a downstream SDK's node_modules/@adapty/core/dist,
    // also refresh the package.json one level up so that exports/version
    // stay in sync with the freshly built dist. Skipped for normal builds
    // into ./dist (there the source package.json is already the target).
    'build:done': async () => {
      if (!process.env['BUILD_OUT_DIR']) return;
      const target = resolve(dirname(outDir), 'package.json');
      await copyFile('package.json', target);
    },
  },
});
