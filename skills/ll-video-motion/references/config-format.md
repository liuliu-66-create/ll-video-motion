# 生成配置格式

配置使用 UTF-8 JSON，最外层只需要模板编号和要替换的画面字段：

```json
{
  "templateId": "big-number-card",
  "selectionReason": "原文只有一个明确数据，并且需要突出前后差异",
  "props": {
    "headline": "同样的时间，产出效率提升了多少？",
    "eyebrow": "连续 7 天实测",
    "value": "3.5",
    "suffix": "倍"
  }
}
```

## 字段规则

- `templateId`：必填，必须使用 `node scripts/catalog.mjs --summary` 返回的 `styleId`。
- `selectionReason`：建议填写，只用于记录选择理由，不会传进视频。
- `props`：需要替换的模板字段。未填写的字段会沿用该模板已确认的默认预设。
- `outputPath`：可选，指定 MP4 绝对路径；普通生成不必填写。

生成前运行：

```powershell
node scripts/render.mjs --config <配置绝对路径> --dry-run
```

确认后运行：

```powershell
node scripts/render.mjs --config <配置绝对路径>
```

也可以通过 `--output <MP4绝对路径>` 临时覆盖配置中的输出位置。

## 内容要求

- `props` 的准确字段以 `node scripts/catalog.mjs --id <styleId>` 返回的 `editable`、默认预设和对应 `TEMPLATE.md` 为准。
- 数组会整体替换默认数组；例如 `items`、`steps`、`levels` 和 `events` 必须一次提供完整内容。
- 不删除模板需要的素材字段。真实素材路径必须存在，且应来自用户或项目已经确认的素材。
- 不在配置中写入模板名称、语义分类、验证说明或给用户看的制作备注。
