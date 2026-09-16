---
name: Workspace production install
description: Static artifact publishing resolves the full pnpm workspace before its artifact-specific build.
---

Unused workspace development tools can block an otherwise independent static artifact during publishing because the full workspace dependency graph is installed first.

**Why:** A registry/firewall failure in an unused codegen package prevented the calculator production build before Vite ran.

**How to apply:** Keep artifact-specific production dependencies separate from optional tooling, and remove or isolate unused workspace tools when they are not required by the published artifact.