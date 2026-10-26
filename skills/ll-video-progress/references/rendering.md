# 配置、生成与检查

依赖 Python、Pillow、ffmpeg、ffprobe 和中文字体。Windows 使用 `py -X utf8`；脚本在本 Skill 的 `scripts/` 下，渲染不依赖 Video Motion 或 Remotion。

```powershell
py -X utf8 "<SKILL>/scripts/progress.py" --inspect-srt "<字幕绝对路径>"
py -X utf8 "<SKILL>/scripts/progress.py" --list-styles
py -X utf8 "<SKILL>/scripts/progress.py" --config "<配置绝对路径>" --dry-run
py -X utf8 "<SKILL>/scripts/progress.py" --config "<配置绝对路径>" --out "<新输出目录>" --preview-only
py -X utf8 "<SKILL>/scripts/progress.py" --config "<配置绝对路径>" --out "<新输出目录>" --browser-preview
```

`--browser-preview` 额外生成窄条透明 `preview.webm`。不带它仍生成正式 MOV、预览图、联系表和 QA。已存在视频时拒绝覆盖，修改使用新目录。

配置例子（替换为真实的字幕编号）：

```json
{
  "sourceSrt": "video.srt",
  "styleId": "walking-leading",
  "width": 1440,
  "canvasHeight": 1080,
  "barHeight": 64,
  "fps": 30,
  "appearance": {"fillColor": [172, 217, 93]},
  "chapters": [
    {"title":"效果展示","startCue":1,"endCue":9},
    {"title":"操作演示","startCue":10,"endCue":68},
    {"title":"工具选择","startCue":69,"endCue":94}
  ]
}
```

- 配置中的 `sourceSrt`、`fontPath`、`characterFrames` 相对配置文件目录解析，也支持绝对路径。SRT 为 UTF-8，编号不得重复。
- `startCue`/`endCue` 是字幕编号。分段必须按顺序完整覆盖字幕，不遗漏、不重叠。可选 `startText`/`endText` 逐字核对单条字幕，避免字幕文件变更导致错位。
- 第一章从零开始，之后在各段第一句开始时切换，到最后字幕结束。可选 `duration` 补已确认的片尾空白，不能截断字幕。时间量化到帧，误差不超过一帧。
- `width`/`canvasHeight` 是原视频画面规格；输出为窄条，普通款高度 `barHeight`，人物款高度 `barHeight + floor(barHeight/2)`。先确认原片比例；未提供实际像素尺寸时，可分别按 4:3 → 1440×1080、16:9 → 1920×1080、3:4 → 1080×1440 配置。用户提供实际分辨率时优先使用实际尺寸，也接受其他比例（如 9:16 → 1080×1920）。这里的 canvasHeight 记录原视频高度，不将其作为进度条导出高度，仍交付窄条透明素材。
- `appearance.fillColor` 是 RGB 数组；色号 `#7c3aed` 对应 `[124,58,237]`。也可覆盖 `baseColor`、`baseOpacity`、`fillOpacity`、`textColor`、`outlineColor`、`previewBackground`。透明度 0～1，默认白底约 43%。
- `fontSize` 默认随条高调整，同级标题同字号。标题放不下会报错，需要缩短标题或调整版式，不能裁切。
- 人物版 `characterFrames` 可提供 4～32 张按顺序排列的透明原地迈步 PNG；省略时使用内置人物。`walkFps` 默认 10，范围 1～30。人物统一缩放到不超过条高，条外最多露出半个条高。

正式交付 `progress-strip.mov`（窄条 ProRes 4444）。保留 `resolved-config.json`、`qa.json`、`encoded-frame.png`、`contact-sheet.png` 供复查；`reference-qtrle.mov` 是无损内部对照，不向用户推荐它。

自动 QA 检查实际 MOV 的格式、尺寸、无声轨、帧数、时长、完整解码，以及各章节起点、终点、中点导出后的 alpha 与源帧误差不超过 2/255。人物版还检查人物矩形之外的下方区域透明。打开联系表和导出帧做视觉检查，提供原片时再检查实际遮挡。

生成 8 秒选样样片：

```powershell
py -X utf8 "<SKILL>/scripts/progress_preview.py" --style walking-leading --color "#7c3aed" --out "<新样片目录>"
```

Playground：运行 `node "<SKILL>/scripts/playground_server.mjs"`，打开返回的 `progressUrl`。安装版通过 `runtime.local.json` 找到共用页面所在项目，也可设 `LL_VIDEO_PROGRESS_PROJECT`。页面提供取色器和色号，应用后生成同色真实预览、缩略图和透明 MOV。它是选样器，不负责自动分析用户字幕。

## 圆点连线、分段短线与文字领走

`styleId` 分别为 `dot-line`、`short-segments`、`text-leading`。支持 `appearance.fillColor`，`fontSize` 为 18–72 的整数，默认 24、26、25。新三款不需要设置 `barHeight`；高度根据实际字形自动计算，保留文字间距、透明边缘和人物空间。字幕段长不同时，仍按每章起止帧推进各段，不按总时长均分。

样片可用 `progress_preview.py --style text-leading --color "#91cdec" --font-size 25 --out "<新目录>"`。正式 Playground 的新增三款显示字号输入框，应用后预览和透明 MOV 同步更新。
