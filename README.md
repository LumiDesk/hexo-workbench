# Hexo Workbench

Hexo Workbench is a focused VS Code authoring environment for Hexo blogs.

The project is intentionally small and Hexo-focused. It aims to make local blog writing comfortable while keeping Markdown files, article assets, and Git as the source of truth.

## Project status

This repository currently contains the extension scaffold only. The `Hello World` command is a placeholder used to verify activation and packaging; it does not provide the final authoring features yet.

## Development requirements

- Node.js 20 or newer
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
```

Start an incremental build:

```bash
pnpm run watch
```

Press `F5` in VS Code to launch an Extension Development Host. The scaffold contributes `Hexo Workbench: Hello World` to the Command Palette so the extension can be verified before feature work begins.

Create a VSIX package:

```bash
pnpm run package
```

## Initial direction

The first feature set is planned around a comfortable Hexo writing workflow:

- create posts and drafts with Hexo-aware front matter;
- paste or drop images into the correct article asset folder;
- generate links that work with Hexo post asset folders;
- preview the current site locally;
- keep publishing and version history Git-friendly.

The extension will remain independent of any particular Hexo theme, including Tessera.

## License

Hexo Workbench is distributed under the GNU General Public License v3.0. See [LICENSE](LICENSE) for the full text.
