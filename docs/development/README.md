# 开发文档

这里记录实现阶段的开发、测试、调试和发布说明。仓库级别的强制规范位于根目录 [AGENTS.md](../../AGENTS.md)；本目录用于补充具体功能的实现和验收细节。

当前 P0 功能正在独立分支中实现。每个功能应补充实现说明、测试覆盖和真实博客验收步骤；Git 操作和发布流程不属于扩展实现范围。

## P0 实现约定

- Hexo 工作区根目录必须包含 `_config.yml`。
- 文章只识别 `source/_posts`，草稿只识别 `source/_drafts`。
- 工作区配置文件是 `.hexo-workbench.yml`，由 `Hexo Workbench: Initialize Workspace` 创建。
- 图片格式可选 `markdown` 或 `asset_img`；配置文件是默认值，Paste As 可以覆盖单次操作。
- `post_asset_folder` 未开启时不接管图片粘贴，避免生成 Hexo 无法处理的资源引用。

## 当前验证命令

```bash
pnpm run check-types
pnpm run lint
pnpm run test
pnpm run build
pnpm run package
```

纯逻辑测试位于 `tests/`。真实文章、图片、首页和归档页仍需在维护者自己的 Hexo 博客中验收。
