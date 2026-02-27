import { defineConfig } from 'tsdown';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  outDir: process.env['BUILD_OUT_DIR'] || 'dist',
  fixedExtension: true,
  platform: 'neutral',
  target: 'es2020',
  clean: true,
  skipNodeModulesBundle: true,
  treeshake: true,
});
