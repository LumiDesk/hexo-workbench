# Hexo Workbench

Hexo Workbench is a focused VS Code authoring environment for Hexo blogs.

The project is intentionally small and Hexo-focused. It aims to make local blog writing comfortable while keeping Markdown files, article assets, and Git as the source of truth.

## Project status

The P0 authoring workflow is under active development on a feature branch. It currently includes workspace configuration parsing, post/draft creation, and the Hexo-aware image paste provider. Real-blog acceptance is still pending.

## Development requirements

- Node.js 20.19 or newer
- pnpm 11 or newer
- VS Code 1.100 or newer

Install dependencies:

```bash
pnpm install
```

Build the extension:

```bash
pnpm run build
```

Run the type checker and linter:

```bash
pnpm run check-types
pnpm run lint
pnpm run test
```

Start an incremental build:

```bash
pnpm run watch
```

Press `F5` in VS Code to launch an Extension Development Host. The Command Palette includes workspace initialization, post/draft creation, image paste, and the `Hello World` smoke-test command.

Create a VSIX package:

```bash
pnpm run package
```

## Current P0 direction

The first feature set is planned around a comfortable Hexo writing workflow:

- create posts and drafts with Hexo-aware front matter;
- paste or drop images into the correct article asset folder;
- generate links that work with Hexo post asset folders;
- initialize a `.hexo-workbench.yml` workspace configuration;
- customize image reference formats and workspace Front Matter templates.

Git management and publishing are outside the extension's scope; use your existing Git tools and hooks.

The extension will remain independent of any particular Hexo theme, including Tessera.

The P0 commands only support standard `source/_posts` and `source/_drafts` directories. Git operations and publishing are intentionally not included.

## Product and development documentation

Product scope, user flows, architecture notes, and confirmed design decisions are maintained in [`docs/`](docs/README.md).

## License

Hexo Workbench is distributed under the GNU General Public License v3.0. See [LICENSE](LICENSE) for the full text.
