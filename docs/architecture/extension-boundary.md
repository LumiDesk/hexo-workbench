# 扩展边界草案

**状态：Draft**

本文只定义第一阶段的模块职责，不提前锁定具体实现细节。

## 模块边界

```text
VS Code API
    │
    ├── Extension shell       激活、命令注册、生命周期
    ├── Project detector      定位 Hexo 工作区和站点根目录
    ├── Hexo config reader    读取站点配置并校验标准目录和资源策略
    ├── Workspace config      读取 .hexo-workbench.yml 的图片格式和 Front Matter 模板
    ├── Content service       创建文章、草稿和 Front Matter
    ├── Asset service         处理剪贴板图片、文件名和资源写入
    ├── Document editor       在光标位置安全插入引用
    ├── Preview service       启停本地 Hexo server
    └── Diagnostics           输出提示、错误和可恢复动作
```

## 设计约束

- `src/extension.ts` 只负责组装服务和注册 VS Code 入口，不承载图片路径或 Front Matter 业务逻辑。
- 路径解析、文件命名、Front Matter 生成等逻辑应放在不依赖 `vscode` API 的纯模块中，便于单元测试。
- 文件读写优先使用 `vscode.workspace.fs`，避免假设操作系统路径分隔符。
- 站点配置读取必须区分 Hexo 站点根目录 `_config.yml` 和主题配置，不能从主题目录推断文章路径。
- 只支持标准 `source/_posts` 和 `source/_drafts`；不增加 Git、发布或自定义目录适配模块。
- 链接格式是用户设置；配置读取和生成引用的逻辑不能擅自切换格式。
- 官方 Front Matter 字段提供默认模板；自定义字段只视作 YAML 数据，不能执行用户配置代码。
- 任何文档编辑都要在资源写入成功后执行，并尽量使用单次 `WorkspaceEdit` 保持撤销体验。
- 预览进程必须由扩展持有并在 `deactivate` 时清理；不能遗留后台进程。
- 主题（包括 Tessera）只作为 Hexo 生成结果的消费者，不能成为扩展运行时依赖。

## 初步目录建议

```text
src/
├── extension.ts
├── commands/
├── hexo/
│   ├── project.ts
│   ├── config.ts
│   └── front-matter.ts
├── assets/
│   ├── clipboard.ts
│   ├── naming.ts
│   └── references.ts
├── editor/
├── preview/
└── shared/
```

具体目录在第一项功能开始前再确认，避免为了空模块提前制造复杂结构。
