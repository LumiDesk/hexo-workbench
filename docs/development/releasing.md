# 发布流程

Hexo Workbench 不发布到 VS Code Marketplace，只通过 GitHub Releases 提供 VSIX 安装包。

## 首次发布

确认工作区干净、当前在 `main`，并且功能分支已经合并后运行：

```bash
pnpm release current
```

`current` 会使用 `package.json` 当前版本创建 tag，例如 `v0.1.0`。后续版本使用：

```bash
pnpm release patch
pnpm release minor
pnpm release major
```

也可以指定完整版本号，例如 `pnpm release 0.2.0`。发布前脚本会运行格式检查、类型检查、Lint、测试和 VSIX 打包，然后提交版本变更（如果有）、创建 tag，并推送 `main` 和 tag。

预览发布动作但不修改仓库：

```bash
pnpm release patch --dry-run
```

## GitHub Actions

`.github/workflows/release.yml` 监听 `v*` tag。它会在 Node.js 22 和 pnpm 11.17.0 环境中重新安装依赖、运行 `pnpm run package`，然后把 `hexo-workbench-<version>.vsix` 附加到 GitHub Release。

发布说明会包含手动安装命令：

```bash
code --install-extension hexo-workbench-0.1.0.vsix
```

## 手动验证

GitHub Actions 完成后，先从 Release Assets 下载 VSIX，在本机安装并用 Extension Development Host 或普通 VS Code 验证命令注册、图标、文章创建和图片粘贴。
