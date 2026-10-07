# 模板选择指南

先判断内容关系，再从对应范围选择具体模板。模板的最终可用状态以 `node scripts/catalog.mjs --check` 为准。

## 列举与归纳

- `multi-point-torn-list`：2～6 个并列要点，最通用。
- `multi-point-staggered-memo`：并列要点需要便签式层次。
- `multi-point-stamp-label`：短词或短句，需要印章标签感。
- `multi-point-index-tabs`：4～6 个条目，需要清晰索引感。
- `multi-point-burst-stickers`：多个极短关键词，需要更强节奏感。

不要用于有明确先后顺序的步骤。

## 流程与阶段

- `process-flow-zigzag`：2～6 个明确步骤，路线简洁。
- `process-flow-journey`：2～6 个步骤，强调推进过程或旅程感。
- `stage-status-board`：同时展示已完成、进行中和待开始。
- `audio-alignment-timeline`：3～4 句声音与画面节点的对应关系。
- `storyboard-work-order`：单个镜头的字幕、画面和素材任务单。
- `final-quality-stamp-board`：多个检查项目均已通过的结果板。

## 对比与变化

- `before-after-compare`：同一对象改变前后。
- `opposing-trends`：两个指标朝相反方向变化，但不是精确图表。
- `cost-accumulation`：投入不断增加，同时资源不断消耗。
- `transfer-decay`：资源经过多层传递后逐级减少。
- `timeline-events`：3～5 个带时间标签的事件。
- `dynamic-data-chart-time-line`：有真实时间轴和真实数值。
- `dynamic-data-chart-qualitative-rise`：只有方向性上升，不声称精确数值。
- `dynamic-data-chart-step-growth`：阶段式增长。

## 关系与结构

- `order-hierarchy`：固定三层的上游、中间和执行关系。
- `layered-pyramid`：从基础到结果的层级支撑。
- `input-convergence`：多个输入汇聚成一个结果。
- `imbalance-scale`：两端付出、回报、权责或资源明显不对等。

## 概念与解释

- `concept-explainer-radial`：一个核心对象，从三个不完全平行的角度向外解释。
- `concept-explainer-topdown`：一个概念、一句定义，再拆成三个平行组成部分或特点。

## 重点与数据

- `key-conclusion`：只突出一句核心结论。
- `key-conclusion-editorial-collage`：核心结论需要更丰富的编辑拼贴构图。
- `big-number-card`：只有一个核心真实数字，并辅以前后对照。
- `dynamic-data-chart-category-bars`：多个类别的真实数值比较。

不得为了使用数据模板而编造数据。

## 判断与选择

- `dual-choice`：两个平行、等权的选择方向。
- `action-prerequisite-card`：提出一个行动，并强调开始前必须先满足的条件或问题。

## 真实素材与证据

- `screen-recording-transition`：无设备外框地放大真实录屏。
- `material-photo-desk`：同时展示录屏、截图、品牌视觉和音频等真实素材。
- `typical-shot-filmstrip`：三个代表性真实镜头组成胶片条。

需要真实素材但用户没有提供时，先列出缺少的素材，不用虚构界面或占位内容冒充最终结果。

## 章节过渡

- 样式 A（内部 ID：`chapter-transition-dark-banner`）：单个章节编号加短标题，需要黑色旧报纸和横向撕纸标题条的海报感。
- 样式 B（内部 ID：`chapter-transition-split-newspaper`）：单个章节编号加短标题，需要黑白旧报纸纵向拼接；背景先出现，数字从左滑入，标题随后露出。

用户没有明确指定样式 A 或 B 时，必须主动运行 `node scripts/playground_server.mjs` 并打开输出的 `chooseUrl`，让用户看真实动态样片后回复“样式 A”或“样式 B”。不要等待用户主动要求查看 Playground，也不要要求用户记内部 ID。

这两种模板只生成约 5 秒的独立章节过渡素材。一次可以按同一风格批量生成多个章节，也可以由用户给各章节分别指定 A/B。不要把逐字稿正文塞进模板，也不要用它们制作贯穿整条视频的顶部目录进度条。

章节数字异常或数字渲染代码发生变化时，运行 `node scripts/validate_chapter_numbers.mjs` 并查看输出的 `00–99` 联系表。只有全部两位数字连续、可读且无越界，才能重新生成用户视频；不要把断裂、缺块或异常字脚当作做旧效果。
