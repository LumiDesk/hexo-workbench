# 工作区配置

Hexo Workbench 使用 Hexo 站点根目录中的 `.hexo-workbench.yml` 保存编辑偏好。它属于站点内容的一部分，可以和文章一起提交到 Git；扩展不会把这些设置写入全局用户配置。

使用命令面板执行 **Hexo Workbench: Initialize Workspace** 可以创建默认文件。

```yaml
image:
  # markdown 或 asset_img
  linkFormat: markdown
  # YYYY、MM、DD、HH、hh、mm、ss、SSS；留空则使用 VS Code 全局设置
  nameFormat: null

frontMatter:
  common:
    title: '{{title}}'
    date: '{{date}}'
    tags: []
    categories: []
  post:
    layout: post
  draft:
    layout: post
```

`frontMatter.common` 会合并到 `post` 或 `draft` 模板，后者字段优先。`{{title}}` 和 `{{date}}` 是唯一内置占位符，扩展只做字符串替换，不执行 YAML 或 JavaScript 代码。

Hexo 官方 Front Matter 字段包括 `layout`、`title`、`date`、`updated`、`comments`、`tags`、`categories`、`permalink`、`excerpt`、`disableNunjucks`、`lang` 和 `published`。这些字段可以由用户加入模板；主题专用字段也可以作为普通 YAML 字段加入，但扩展不会替用户解释它们。[Hexo Front-matter 文档](https://hexo.io/docs/front-matter)

`linkFormat` 只决定插入语法：

- `markdown`：插入普通 Markdown 图片引用；
- `asset_img`：插入 Hexo `{% asset_img %}` 标签。

`nameFormat` 决定粘贴图片的文件名，不包含扩展名。全局设置是 `hexoWorkbench.imageNameFormat`，工作区 `.hexo-workbench.yml` 中的非空值优先。比如 `HH-mm-ss` 会生成 `17-04-32.png`；同一秒内重复粘贴时，扩展会追加 `-2`、`-3` 等后缀。

普通 Markdown 图片要在首页、归档页等位置稳定解析，站点应开启 Hexo 官方的文章资源配置：

```yaml
post_asset_folder: true
marked:
  prependRoot: true
  postAsset: true
```

扩展不会自动修改站点 `_config.yml`。如果文章资源配置不满足条件，用户仍可以选择 `asset_img` 格式。
