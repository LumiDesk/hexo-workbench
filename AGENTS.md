# AGENTS.md

## 项目定位

Hexo Workbench 是一个面向 Hexo 博客的 VS Code 写作环境。项目保持本地优先：文章、图片资源和配置文件由用户自己的工作区与 Git 仓库维护，扩展不应绑定某个 Hexo 主题。

当前项目使用 pnpm、TypeScript、esbuild 和 ESLint。扩展入口位于 `src/extension.ts`，构建产物输出到 `dist/`。

## 开发环境

- Node.js 20 或更高版本
- pnpm 11 或更高版本
- VS Code 1.100 或更高版本
- 使用仓库声明的 pnpm 版本和 lockfile，不要改用 npm 或 yarn 更新依赖

安装依赖：

```bash
pnpm install
```

## 代码规范

- 使用严格 TypeScript；避免 `any`，为公共函数和跨模块数据定义明确类型。
- 使用 2 个空格缩进、LF 换行和 UTF-8 编码；不使用分号。
- 代码格式以 Prettier 配置为准，提交前必须运行 `pnpm run format:check`。
- 代码静态检查以 ESLint 配置为准，提交前必须运行 `pnpm run lint`。
- 构建逻辑集中在 `esbuild.mjs`，不要把编译产物提交到 Git。
- 扩展 API 的资源（命令、监听器、定时器等）必须注册到 `context.subscriptions`，避免扩展停用后泄漏资源。
- 用户可见文案、命令标题和错误提示要清晰，并优先保持中英文语境一致。
- 不要提交密钥、Token、个人路径或机器相关配置。

## 验证要求

每次提交前至少运行：

```bash
pnpm run check-types
pnpm run format:check
pnpm run lint
pnpm run test
pnpm run build
```

涉及行为变化时，必须补充有意义的测试。测试应验证用户可观察的行为或独立的业务逻辑，不要只重复实现细节。引入测试框架后，把测试命令加入 `package.json`，并在提交前运行对应测试。

涉及 VS Code 扩展激活、命令或编辑器交互时，还要用 F5 启动 Extension Development Host 做一次手动验收。涉及 VSIX 内容时运行：

```bash
pnpm run package
```

## 分支和提交

- `main` 始终保持可构建、可验收状态。
- 开始一项新功能或一批关联功能前，先从最新 `main` 创建独立分支。分支名使用 `talyra42/feature/<short-name>`、`talyra42/fix/<short-name>` 或 `talyra42/chore/<short-name>`。
- 一个分支只处理一个清晰的功能或问题范围；不要在功能分支中混入无关重构。
- 按逻辑阶段进行小而完整的 commit，不要把整个功能长期堆积到一个提交中。每个 commit 都应尽量能独立说明改动目的，并通过适用的检查。
- 提交信息使用 Conventional Commits，例如：`feat: add hexo post creation command`、`fix: resolve post asset path`、`chore: update build tooling`。
- 功能完成后，先完成代码检查和验收，再合并到 `main`。合并后保留功能分支结构，不要自动删除分支。
- 未经明确要求，不要强制改写公共分支历史，也不要替用户推送远程分支或创建发布版本。

## 文档和变更记录

用户可见的能力、配置或命令发生变化时，同步更新 `README.md` 和 `CHANGELOG.md`。如果后续增加独立使用文档，再同步维护对应文档目录。

## 当前范围

当前仓库只是扩展模板。`Hello World` 命令仅用于验证扩展可以激活和打包；新增 Hexo 写作功能前，先明确功能范围、验收标准和对应分支。
