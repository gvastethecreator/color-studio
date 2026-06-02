# Security

## Reporting a vulnerability

If you discover a security issue in OKLCH Prism Architect, please report it
privately rather than opening a public issue.

- Open a private report via GitHub Security Advisories:
  <https://github.com/gvastethecreator/oklch-prism-architect/security/advisories/new>
- Or email the maintainer through the address listed on their GitHub profile.

Please include:

- A clear description of the issue and its impact.
- Steps to reproduce, or a proof-of-concept.
- The affected version, commit, or commit range.

You can expect an acknowledgement within a reasonable window. We will work
with you on a fix and coordinated disclosure before any public announcement.

## Scope

This is a client-side React app with no server component, no backend storage,
and no remote API calls. The realistic risk surface is:

- Arbitrary JSON imported as a custom preset
  (`src/lib/custom-presets.ts`). Input is parsed and validated; do not
  evaluate it.
- Anything persisted in `localStorage` is local to the user's browser.
- The build pipeline pulls packages from npm and the Vite+ distribution.
  Keep dependencies up to date.

## Out of scope

- Bugs that require physical access to the user's machine.
- Best-practice recommendations that are not exploitable.
- Third-party dependency issues that are not yet patched upstream.
