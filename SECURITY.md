# Security Policy

A contract or a signing flow ships once and can hold real money — this is the
org-wide default policy for handling that responsibly, and it applies to any
RedDuckTeam repository without its own `SECURITY.md`.

## Reporting a Vulnerability

Please report security issues privately through GitHub Security Advisories on
the specific repository, rather than opening a public issue. If advisories
aren't enabled yet on that repo, contact the maintainers privately before
publishing any details.

Note: enabling private vulnerability reporting is a separate, per-repository
setting (Settings → Security → Private vulnerability reporting) — this file
existing doesn't turn it on by itself.

## Scope

Security-sensitive areas across RedDuck repos typically include:

- Wallet connection and signing flows.
- Token approval, allowance, and spender logic.
- Contract interaction and calldata generation.
- Address, amount, and recipient parsing.
- Transaction simulation and gas-limit checks.
- Anything that could redirect funds, approvals, or private data.

## Important Notes

Most of these repos are actively developed applications, not versioned
libraries — treat `main` as the only supported branch. Templates and demos in
this org are not necessarily audited; check the specific repo's README before
using it with real funds or in production.
