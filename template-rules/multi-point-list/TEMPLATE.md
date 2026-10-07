# 多点列举模板规则

## 用途

用于同一层级的并列信息，例如“总结三个重点”“五个注意事项”。不用于有先后顺序的流程，也不用于前后对比。

## 输入内容

- `items[].text`：每个分点的关键词。
- 支持 2～6 点，序号自动生成，不由用户填写。
- 只放关键词；完整逐字稿仍由字幕承载。

## 布局规则

- 2～5 点使用单列，6 点使用两列三行。
- 数字与圆章视为一个固定素材，不能拆开移动。
- 文字中心以米白撕纸的视觉中心为准，不能把圆章算入文字区域。
- 文字变长时只缩小字号，不移动中心，不拉伸贴纸。
- 具体位置和安全区见 `layout.json`。

## 动效顺序

每一项依次执行：完整贴纸进入 → 序号和文字贴入。相邻项目允许轻微重叠入场，最终全部停留。

## 调用

### 版式一：横向撕纸条

1. 复制 `presets/multi-point-03.json`。
2. 修改 `items` 数组，保留 2～6 项。
3. 使用合成项 `MultiPointTorn03` 渲染。

示例：

```powershell
npx remotion render src/index.ts MultiPointTorn03 previews/multi-point-output.mp4 --props=presets/multi-point-03.json --codec=h264 --crf=16
```

### 版式二：错落便签

1. 复制 `presets/multi-point-staggered-03.json`。
2. 修改 `items[].text`。
3. 使用合成项 `MultiPointStaggeredMemo` 渲染。
4. 布局与安全区见 `staggered-memo-layout.json`。

错落便签的所有元素必须停留在画面高度 `0～860` 内，底部 `860～1080` 固定留给完整视频字幕。数字使用贴纸视觉中心，关键词使用大便签安全区中心；两者都不得逐条手工偏移。

```powershell
npx remotion render src/index.ts MultiPointStaggeredMemo previews/multi-point-staggered-memo-v1.mp4 --props=presets/multi-point-staggered-03.json --codec=h264 --crf=16
```

### 版式三：印章标签墙

1. 复制 `presets/multi-point-stamp-label-03.json`。
2. 修改 `items[].text`。
3. 使用合成项 `MultiPointStampLabel` 渲染。
4. 布局与安全区见 `stamp-label-layout.json`。

该版式支持 2～6 个并列分点；序号自动生成。贴纸组依次完成：底纸进入 → 序号盖章 → 关键词贴入。该版不使用底部图标贴纸。文字与每一张圆章的序号分别按真实中心锁定，不得逐条手工偏移。

```powershell
npx remotion render src/index.ts MultiPointStampLabel previews/multi-point-stamp-label-03-v2.mp4 --props=presets/multi-point-stamp-label-03.json --codec=h264 --crf=16
```

### 版式四：索引标签

1. 复制 `presets/multi-point-index-tabs-04.json`。
2. 修改 `items[].text`，保留 2～6 项。
3. 使用合成项 `MultiPointIndexTabs` 渲染。
4. 布局与安全区见 `index-tabs-layout.json`。

编号必须在各自黑色圆章内水平、垂直居中；关键词必须在各自横向撕纸标签的文字安全区内水平、垂直居中。文字变长时只缩小字号，不移动中心点。

```powershell
npx remotion render src/index.ts MultiPointIndexTabs previews/multi-point-index-tabs-04-v1.mp4 --props=presets/multi-point-index-tabs-04.json --codec=h264 --crf=16
```


### 版式五：爆炸贴纸

1. 复制 `presets/multi-point-burst-stickers-05.json`。
2. 修改 `items[].text`，保留 2～6 项。
3. 使用合成项 `MultiPointBurstStickers` 渲染。
4. 布局与每种异形贴纸的独立安全区见 `burst-stickers-layout.json`。

数字必须在各自砖红圆章内水平、垂直居中；关键词必须在对应异形贴纸的文字安全区内水平、垂直居中。不同贴纸不得共用未经测量的中心坐标。

```powershell
npx remotion render src/index.ts MultiPointBurstStickers previews/multi-point-burst-stickers-05-v4.mp4 --props=presets/multi-point-burst-stickers-05.json --codec=h264 --crf=16
```

爆炸贴纸版式已通过样片确认，可作为正式调用项。

## 验收

- 序号必须位于圆章正中心。
- 每行文字必须位于米白纸中心。
- 6 点不得拥挤或溢出。
- 不得缺少任何底层碎纸，不得出现规则矩形。
