# Contributing

Thanks for contributing to Capiis.

## Development Setup

1. Clone the repository.
2. Run `npm install`.
3. Start the local app with `npm start`, or open `claude` / `opencode` and use
   `/capiis`.

## Project Conventions

- Keep the public command names `/capiis` and `/capiis-data`.
- Preserve the local-first data model in `data/`.
- Treat user data as sensitive. Avoid committing generated user files from
  `data/` other than tracked schema files.
- Keep Claude Code and OpenCode entry points in sync when changing commands or
  shared skills.

## Pull Requests

- Explain the user-facing change and why it is needed.
- Include verification steps for docs, runtime behavior, or CLI flows.
- Update README or instruction files when the setup or command flow changes.

## Reporting Issues

Use GitHub Issues for bugs, documentation gaps, and feature requests.
