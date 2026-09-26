# Rebase Roadmap

Rebase is a small, framework-agnostic JavaScript enhancement layer.

The roadmap describes direction, not guaranteed release dates.

## Beta

### Core
- [x] Public Rebase API
- [x] Plugin registration
- [x] Expressions, directives and blocks
- [x] Hooks
- [x] Browser mounting
- [x] Async source transformation
- [x] Host-aware syntax protection
- [ ] Nested block parser
- [ ] Diagnostics and useful parser errors
- [ ] Stable public API documentation
- [ ] TypeScript declarations

### Distribution
- [x] `@rebase/core`
- [x] `rebase`
- [x] `@rebase/adapters`
- [x] Consistent beta versions
- [ ] npm release workflow
- [ ] Browser/CDN build
- [ ] ESM/browser compatibility matrix

### Plugins
- [ ] Official plugin specification
- [ ] Plugin naming and compatibility rules
- [ ] Official example plugins
- [ ] Plugin author guide
- [ ] Plugin test utilities
- [ ] Plugin discovery page

### Frameworks
- [x] Svelte host protection
- [x] Svelte adapter entry point
- [x] Vue adapter entry point
- [x] React adapter entry point
- [ ] Build-time Svelte integration
- [ ] Build-time Vue integration
- [ ] Build-time React integration

### Documentation
- [ ] API reference
- [ ] Plugin guide
- [ ] Framework guides
- [ ] Examples
- [ ] Migration guide
- [ ] Versioned documentation

## 1.0

- [ ] Stable parser
- [ ] Stable plugin contract
- [ ] Stable adapter contract
- [ ] CDN/browser distribution
- [ ] TypeScript declarations
- [ ] Security model documentation
- [ ] Performance baseline
- [ ] Automated releases
- [ ] Versioned docs

## Possible future plugins

- icons
- dates and formatting
- i18n
- Markdown
- math
- accessibility helpers
- development diagnostics

These should normally remain plugins rather than becoming core features.

## Non-goals

Rebase is not intended to become:

- a replacement for Svelte, Vue or React
- a full templating language
- a dependency-heavy meta-framework
- a mandatory global syntax standard