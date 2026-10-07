# 素材库分类字段

`library.json` 使用两层分类，避免把构图变体误当成不同模板家族。

- `family`：语义与构图相同的一组模板。重复统计以此字段为准。
- `variant` 或 `layoutPattern`：家族内部的具体构图。
- `semanticTypes`：适合表达的关系类型。
- `avoidFor`：容易被硬套的内容类型。
- `status`：只有 `validated` 可自动调用；`candidate` 只能用于确认和测试。

全片选择规则：

- 同一 `family` 默认最多 3 次。
- 同一 `layoutPattern` 默认最多 2 次。
- 相邻镜头不得使用同一 `family`。
- 找不到匹配模板时，优先组合 `src/components` 中的品牌组件；情绪或隐喻场景才考虑定制插画。
