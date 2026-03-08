# Security Policy

## Scope

Capiis handles local financial data, so privacy and safe defaults matter.
However, it is an informational tool only:

- no brokerage integration
- no trade execution
- no tax filing
- no legal or investment advice

## Reporting a Vulnerability

Please report security issues privately to `hanniehoneycode@gmail.com` with:

- a short description of the issue
- affected files or flows
- reproduction steps
- potential impact

Please avoid opening public issues for undisclosed vulnerabilities.

## Sensitive Data Handling

- User portfolio and profile data should remain local in `data/`.
- Do not add telemetry or cloud sync that uploads user financial records by
  default.
- Any new feature that touches secrets, file access, or external services should
  default to the least privilege needed.
