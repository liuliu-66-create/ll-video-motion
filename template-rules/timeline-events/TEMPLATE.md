# 剪贴画时间线

状态：validated。用户已确认无标题静态构图和源码动态预览，3/4/5 节点检查通过。

## 适用范围

表达随时间推进的事件。日期、短说明位于轴下，物件剪贴画位于轴上。
不适用于操作步骤、层级关系或循环。当前四组插画是催款场景的概念素材，不是真实凭证。
其他题材需要传入符合内容的 imageSrc；不要为凑布局套用催款插画。

## 输入

- events：3～5 个事件，超出范围报错，禁止静默复制或截断内容。
- events[].time：1～8 字日期/阶段。
- events[].title：1～10 字短说明。
- events[].illustration：delivery / calendar / waiting / disconnected。
- events[].imageSrc：可选，public 下的透明插画路径；保持等比缩放。
- events[].atSeconds：可选，相对于镜头开头的入场秒数；按真实配音提供。
- debug：显示图片框、文字框和字幕边界。

本版不显示标题，也不预留标题空间。不需要 label 或 note。
预览默认依次入场；用在成片时用 atSeconds 对齐配音，不重新生成语音。

## 分层和防遮挡

- 背景：BrandBackground 使用现有 newspaper-neutral-v1.png。
- 插画：timeline-collage-sprites-v1.png 透明图集，四组物件独立裁取，裁切框见 layout.json。
- 轴、刻度、圆点：代码绘制，独立于图片。轴为细直线，无箭头、编号或贴纸标题。
- 文字：Remotion 原生文字，日期深黑、说明砖红，字号默认 40 / 30。
- 插画底部最多 y=700，时间轴 y=708，文字 y=771～871，字幕从 y=940 开始。
- 插画从上方轻移入，所有动画帧均不得进入文字区。禁止非等比拉伸。
- 文案过长先精简，达到长度上限则拒绝渲染，不用遮挡或任意缩字解决。

## 验收

已确认静态参考：previews/timeline-collage-approved-styleframe.png。
源码静态图：previews/timeline-collage-source-v2.png。
动态预览：previews/timeline-collage-dynamic-v2.mp4，约6秒，无配音（素材库预览，导出器附带静音 AAC）。
检查 3/4/5 节点、最长允许文案、动画早中晚帧。动态效果已获用户确认，可按上述适用范围调用。
