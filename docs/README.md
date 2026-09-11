# 文档目录

Hexo Workbench 的产品、设计和技术文档统一放在这里。文档按用途分目录，避免把产品决策、实现细节和开发流程混在一起。

## 目录约定

```text
docs/
├── product/       # 用户、场景、功能范围和验收标准
├── architecture/  # 扩展边界、模块关系和技术方案
├── decisions/     # 已确认的长期决策（ADR）
└── development/   # 开发、测试、发布和维护说明
```

## 当前文档

- [产品简报](product/brief.md)
- [核心用户流程](product/flows.md)
- [产品评审结论](product/open-questions.md)
- [扩展边界草案](architecture/extension-boundary.md)
- [ADR 0001：本地优先与主题无关](decisions/0001-local-first.md)

## 文档规则

- 文档先于实现明确目标、范围和验收标准。
- 每份仍在讨论中的文档标注 `Draft`，确认后改为 `Accepted`。
- 功能、配置或用户流程变化时，同步更新相关文档和 `CHANGELOG.md`。
- 长期有效的设计选择写入 `decisions/`，并说明背景、取舍和影响。
