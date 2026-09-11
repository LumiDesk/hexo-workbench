# 产品评审结论

**状态：Accepted**
**确认日期：2026-09-11**

初次评审的六项问题均已得到维护者确认，当前没有阻塞 P0 实现的产品问题。

| 决策 | 确认结果 |
| --- | --- |
| 图片格式 | 方案 C：用户选择普通 Markdown 或 `asset_img`；提供工作区默认值和单次 Paste As 选择 |
| 目录策略 | 仅标准 `source/_posts`、`source/_drafts`，不扩展自定义目录支持 |
| Ctrl+V | 图片由扩展提供粘贴动作，普通文本沿用 VS Code；保留显式图片粘贴入口 |
| Front Matter | 使用工作区文件 `.hexo-workbench.yml`，提供 Hexo 官方字段默认模板，允许用户自定义 |
| Git 与发布 | 明确不开发；由已有 Git 工具、hook 和发布流程处理 |
| 验收 | 开发完成并通过自动化检查后，由维护者在自己的真实博客按清单测试 |

工作区文件名称、内置模板子集和命令名属于本轮实现约定，并非额外增加产品能力。具体示例将随实现补充到开发与使用文档。

官方参考：[Front Matter](https://hexo.io/docs/front-matter)、[标准写作目录](https://hexo.io/docs/writing)。
