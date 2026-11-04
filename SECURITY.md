# Security policy

## Reporting a vulnerability

**Don't open a public issue.** Report it privately through GitHub:
[Report a vulnerability](https://github.com/bohdaq/lit-material/security/advisories/new) (the repository's
Security tab → "Report a vulnerability"). Only the maintainers see the report.

Please include:

- the package and version, and the browser or Node version;
- what an attacker can do, and what they need first (e.g. control of an attribute value or of pasted HTML);
- the smallest reproduction you have.

## What to expect

| | Target |
| --- | --- |
| Acknowledgement | within 3 working days |
| First assessment (accepted or not, and a severity) | within 10 working days |
| Fix released, for high or critical severity | within 30 days of the assessment |

We'll keep you updated in the advisory, agree a disclosure date with you, and credit you in the advisory
unless you'd rather not be named. Fixes are published as a patch release of every package (see
[VERSIONING.md](VERSIONING.md)), with a GitHub security advisory and a CVE where one applies.

## Supported versions

| Version | Security fixes |
| --- | --- |
| 1.x (current) | Yes |
| previous major | For 12 months after the next major is released |
| 0.x | No. Upgrade to 1.x |

## Scope

In scope: code in this repository's published packages, e.g. cross-site scripting through a component
property, attribute, slot, pasted content or markdown; a sanitizer bypass in `@lit-material/rich-text`; a
Content-Security-Policy or Trusted Types violation by a component; prototype pollution in a store or form
helper; path traversal in `@lit-material/vite`'s static file serving.

Out of scope: vulnerabilities in your own app's use of the components (e.g. putting untrusted HTML into
`unsafeHTML` yourself), in dependencies that are already publicly disclosed (open a regular issue to bump
them), and in the docs website.

## How releases are protected

Packages are published from GitHub Actions with npm trusted publishing and provenance. No npm token is stored
in the repository, and `npm audit signatures` verifies each package was built from this source. Every package
carries a CycloneDX SBOM at `dist/sbom.cdx.json`. See the
[security guide](https://lit.rws8.tech/guides/security/).
