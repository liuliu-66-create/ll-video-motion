# ll-video-motion｜六六视频动效

输入一句话、一段中文文字或多个内容单元，由 Codex Skill 先判断应制作几个独立动效，向用户说明方案并等待确认；确认后选择已验证模板，在本地使用 Remotion 生成一个或多个真实 MP4。适合制作流程、对比、列举、数据、概念解释、选择判断等短视频过渡动效。

## 最简单的使用方式

在 Codex 中输入：

```text
请使用 $ll-video-motion，先分析下面这段内容应制作几个动效，给我确认方案后再生成：

我现在能够稳定更新，不是突然变自律了，而是把选题库、素材库和发布时间表都接进了同一个工作流。
```

Skill 会先判断内容中包含几个独立关系，说明建议动效数量、每个动效使用的内容和大致画面。用户确认后，它再分别选择模板、压缩画面文字、生成配置并渲染 MP4。用户不需要提前决定应拆成几个动效。

## 安装与运行

```powershell
npm.cmd install
```

将仓库内的 `skills/ll-video-motion` 安装到 Codex Skills 目录后，从本仓库运行即可。Skill 会自动向上查找项目根目录；也可以通过 `LL_VIDEO_MOTION_PROJECT` 指定仓库路径。

检查模板目录：

```powershell
node skills/ll-video-motion/scripts/catalog.mjs --check
```

根据配置生成视频：

```powershell
node skills/ll-video-motion/scripts/render.mjs --config <配置文件绝对路径>
```

启动可选编辑页：

```powershell
node skills/ll-video-motion/scripts/editor_server.mjs
```

编辑页用于保留原模板、修改文字或数据并重新导出 MP4，不是完整的视频剪辑软件。

## 项目边界

- `ll-video-motion`：一句话或一段内容生成一个或多个独立短动效素材，渲染前先确认方案。
- `ll-video-edit`：把逐字稿、配音、字幕、录屏和多个镜头合成为完整视频。
- 本项目不接入大模型 API，所有视频默认在用户自己的电脑本地渲染。

## 素材库说明

这是独立于单条视频项目的共享动效素材库。模板本身不包含账号 Logo；Logo 在完整成片最外层统一添加。

## 素材库结构

- `DESIGN_RULES.md`：所有模板共同遵守的视觉、定位和检查规则。
- `template-rules`：每个已通过模板自己的用途、输入、布局、动效、调用和验收规则。
- `library.json`：模板登记表，记录用途、可替换内容和预览位置。
- `public/assets`：背景、撕纸、印章等公共素材。
- `src/templates`：真正生成画面的动效模板。
- `presets`：只需修改文字的示例配置。
- `previews`：供人选择模板的对外样片。
- `qa`：对齐辅助线和边界数量的内部检查结果。

## 已完成模板

- 双向趋势：质量与价格变体已确认，仅作定性趋势示意；规则见 `template-rules/opposing-trends/TEMPLATE.md`。
- 投入累积／资源消耗：稿件增加与钱币减少，文字和插画分层，支持替换素材。规则见 `template-rules/cost-accumulation/TEMPLATE.md`。
- 剪贴画时间线：支持3～5个时间节点，无标题，插画在轴上、日期与说明在轴下。规则见 `template-rules/timeline-events/TEMPLATE.md`。
- 三方委托层级：固定表达上游决策方、中间承接方和实际制作方的三层关系。规则见 `template-rules/order-hierarchy/TEMPLATE.md`。
- 双选择：两个等权方向，只有核心选项使用真实撕纸强调。规则见 `template-rules/dual-choice/TEMPLATE.md`。
- 传递递减：用节点、资源数量和连接箭头表达多层传递后的持续损耗。规则见 `template-rules/transfer-decay/TEMPLATE.md`。
- 层级金字塔：从底层向上搭建，表达不依赖数量变化的层级与支撑关系。规则见 `template-rules/layered-pyramid/TEMPLATE.md`。
- 大数字卡：以一个核心数字为主角，撕纸只用于局部数据对照。规则见 `template-rules/big-number-card/TEMPLATE.md`。
- 阶段状态板：用连续进度带区分已完成、进行中和待开始，当前阶段原地突出。规则见 `template-rules/stage-status-board/TEMPLATE.md`。
- 不对等天平：用怀旧撕纸天平表达付出与回报等两端关系失衡。规则见 `template-rules/imbalance-scale/TEMPLATE.md`。
- 输入汇聚：多条短纸带从不同输入汇入唯一结果，不增加“汇合”等解释节点。规则见 `template-rules/input-convergence/TEMPLATE.md`。
- 动态数据图表：包含分类柱状图、时间趋势折线图、定性上升曲线和阶梯式增长四种已确认样式。规则见 `template-rules/dynamic-data-chart/TEMPLATE.md`。
- 音频对齐时间线：用音频波形、播放头和3～4个画面节点表达逐句声音与画面的同步落点。规则见 `template-rules/audio-alignment-timeline/TEMPLATE.md`。
- 多点列举：2～6点，规则见 `template-rules/multi-point-list/TEMPLATE.md`。
- 流程步骤：2～6步，支持折线和弯曲路线，规则见 `template-rules/process-flow/TEMPLATE.md`。
- 前后对比：左右对照，规则见 `template-rules/before-after-compare/TEMPLATE.md`。
- 概念解释：支持中心放射型和上下拆解型，规则见 `template-rules/concept-explainer/TEMPLATE.md`。
- 重点结论：突出一句核心结论，规则见 `template-rules/key-conclusion/TEMPLATE.md`。
- 真实录屏展示：无外框放大真实录屏，规则见 `template-rules/screen-recording-transition/TEMPLATE.md`。

## 使用原则

预览 MP4 只用于挑选模板。完整视频制作时，应调用对应模板并传入当前分镜的内容；不要把预览 MP4 当作固定素材剪进成片。具体输入、数量限制和检查要求，以该模板自己的 `TEMPLATE.md` 和 `layout.json` 为准。

## 新的固定流程

每确认一个模板，必须在进入下一个模板前同时完成：

1. 写入对应的 `template-rules/<模板>/TEMPLATE.md`。
2. 把贴纸位置、文字安全区和箭头方向登记到 `layout.json`。
3. 在 `library.json` 中登记规则、布局、合成项和预览视频。
4. 完成标准数量与边界数量检查后，状态才能标记为 `validated`。

## 本地预览

```powershell
npm.cmd run studio
```

## 渲染验证

```powershell
npm.cmd run render:multi-03-torn
```

新增 `src/components` 公共组件与 `src/styles/brand.ts` 品牌样式。模板选择按 `family` 合并统计变体，先判断内容关系，再选择构图。
