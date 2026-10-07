# 三方委托层级

状态：validated。静态构图和动态样片已获用户确认，默认、最长文字、替换插画和非法超长输入检查通过。

## 适用范围

用于表达固定三层的委托、转包或上下游关系：上游决策方 → 中间承接方 → 实际执行方。
不适用于普通操作步骤、时间线、循环或超过三层的组织结构，不能因为画面有箭头就当成通用流程图。

## 输入

- `levels`：固定三个层级，少于或多于三个直接报错。
- `levels[].title`：1～6字层级名称。
- `levels[].note`：1～10字职责说明。
- `levels[].imageSrc`：可选，`public` 下的透明人物或场景插画；在固定插画区内等比缩放、底部对齐。
- `connectionLabels`：固定两条关系，每条1～6字。
- `levelAtSeconds`：三个层级相对镜头开头的入场秒数。
- `connectionAtSeconds`：两条关系箭头相对镜头开头的入场秒数。

## 分层与动效

- 背景固定使用 `BrandBackground` 的灰白旧报纸。
- 默认人物来自 `order-hierarchy-people-v2.png`，三组分别裁取；人物均为概念角色，不代表真实当事人。
- 箭头使用独立透明素材 `paper-arrow-down-right-v1.png`，没有端点红点、投影或光晕。
- 每一层先出现人物插画，再出现黑色主标题，最后出现砖红说明文字。
- 箭头保持自然比例，通过裁切宽度从左到右展开，不做非等比拉伸。
- 第二支箭头位于中间方和制作方的独立空白通道，任何动画帧均不得被人物遮挡。

## 边界

- 画布固定16:9、1920×1080；底部字幕安全区从 y=940 开始。
- 主标题与说明整体不低于 y=871，不进入字幕安全区。
- 文字超过上限必须精简，禁止静默截断、换行或移动已确认的中心点。
- 替换插画必须为透明背景；不允许拉伸，也不允许用虚构软件界面代替真实录屏。

## 验收

- 已确认静态图：`previews/candidates/order-hierarchy-collage-v6.png`。
- 已确认动态样片：`previews/order-hierarchy-dynamic-v1.mp4`（由参数化源码重新渲染）。
- 默认预设：`presets/order-hierarchy-default.json`。
- 最长文字边界预设：`presets/order-hierarchy-boundary.json`。
- 替换插画检查：`qa/order-hierarchy-replacement-art.png`；替换图保持自然比例并限制在固定插画区。
- 非法超长输入检查：`qa/order-hierarchy-invalid-text.json`；渲染按预期失败，不会静默截断。
