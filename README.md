# @adapty/core

Platform-agnostic core for Adapty SDKs.

This package contains shared TypeScript/JavaScript code used by Adapty React Native and Capacitor SDKs.

## Installation

```bash
yarn install
```

## Development

### Build

```bash
yarn build
```

Builds the library to `dist/` folder with:
- ESM format (`index.mjs`)
- CommonJS format (`index.cjs`)
- TypeScript declarations (`.d.mts`, `.d.cts`)
- Source maps

### Type Checking

```bash
yarn tsc
```

### Linting

```bash
yarn lint
```

### Formatting

```bash
# Check formatting
yarn format-check

# Fix formatting
yarn format
```

### Testing

```bash
yarn test
```

## Project Structure

```
.
├── src/           # Source TypeScript files
├── dist/          # Build output (gitignored)
├── package.json   # Package configuration
├── tsconfig.json  # TypeScript configuration
├── tsdown.config.ts  # Build tool configuration
├── .eslintrc.cjs  # ESLint configuration
├── .prettierrc.json  # Prettier configuration
└── jest.config.cjs   # Jest configuration
```

## Publishing

This package is published to npm as `@adapty/core`:

- **Dev builds**: `0.0.0-dev.<full-sha>` with `dev` dist-tag
- **Production releases**: Semantic versioning with `latest` dist-tag

See `AGENTS.md` for detailed publishing policy.

## License

MIT