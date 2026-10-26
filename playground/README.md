# 在线动效素材模板库

这是素材库的视觉验收页。左侧按分类选择样式，右侧播放真实动态样片；播放器下方可以直接对照同一大类里的视觉缩略图。

- 共 10 个分类、36 个短动效模板和 2 种章节进度条，合计 38 种展示样式。部分模板共用底层源码，但每项都有独立登记 ID；
- 样片已复制到 `samples/`，缩略图位于 `posters/`，不依赖原素材库相对路径；
- 不需要联网；
- 可以搜索大类、样式和用途；
- 键盘方向键也可以切换样式；
- “判断与选择”里的“双选择”已完成静态和动态验收，播放真实视频样片。
- 素材桌面、典型镜头胶片条、分镜工作单、检查结果列点和行动前提强调卡均播放用户已确认的真实动态样片。

## Windows 打开方式

在 `playground` 目录启动本地网页：

```powershell
py -m http.server 4173 --bind 127.0.0.1
```

然后打开：`http://127.0.0.1:4173/index.html`

只选择章节过渡样式时，直接打开：

```text
http://127.0.0.1:4173/index.html?category=transition
```

用户不需要记模板内部名称，看完后只需回复“样式 A”或“样式 B”。

章节进度条入口为 `http://127.0.0.1:4173/index.html?category=progress`，由独立 `ll-video-progress` Skill 负责。内置“朦胧白底”和“人物领走”两款，均可改 RGB 填充色。播放器使用透明 WebM，下载为窄条 ProRes 4444 MOV，当前内置样片均为 8 秒；全长素材按用户 SRT 正式生成。

要改色，从项目根目录运行 `node skills/ll-video-progress/scripts/playground_server.mjs`，普通静态 HTTP 服务只支持观看默认样片。颜色生成后播放器、缩略图与下载文件一致。

Video Motion 的入口是 `http://127.0.0.1:4173/index.html?mode=motion`，只展示 36 个短动效模板。其 `scripts/playground_server.mjs` 返回这个入口与章节过渡选样链接；进度条实现已迁出 Video Motion。两者共用项目 `scripts/playground_server.mjs` 提供的页面服务，不共享 Skill 的制作流程。
