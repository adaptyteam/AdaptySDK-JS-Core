# AGENTS.md

## Project Overview
This repo contains `@adapty/core`, platform-agnostic JS/TS code shared by Adapty
React Native and Capacitor SDKs. The package is public on npm but treated as an
internal dependency (dev builds are mainly for SDK CI).

## Build Output
- Publish compiled JS only: ESM + CJS + `.d.ts`.
- Do not publish raw TypeScript as the only artifact (no build-on-install).

## Versioning
- Dev builds use `0.0.0-dev.<full-sha>` (full commit SHA).
- Downstream SDKs should pin the exact dev version when testing CI.

## CI Publishing Policy
- Registry: npmjs.com (public).
- `dev` branch: publish after merge, using dist-tag `dev`.
- `master` branch: publish only on git tag (release), default dist-tag `latest`.

## Tooling
- Use Yarn for install/build scripts.
- Use npm for publish.
- Build tool: `tsdown`.
