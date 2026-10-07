# 第20号模板可编辑原型

这是与正式 Playground 隔离的试验目录。删除本目录即可完整撤销原型，不会影响 `playground-display-v1`。

原型验证三件事：

1. 表单能生成标准配置 JSON；
2. 配置可以驱动现有 Remotion 组件；
3. 本地服务可以输出真实 MP4。

启动：

```powershell
node editor-prototype/server.mjs
```

打开 `http://127.0.0.1:4174/`。

未来 Skill 应生成与 `config.schema.json` 一致的配置，再调用同一渲染入口；网页只是人工试用界面，不是 Skill 的核心依赖。

第19项“放射式解释”已接入 `ll-video-motion` Skill，配置见 `radial-config.schema.json`，编辑入口为 `/radial.html?job=<jobId>`。Skill 会直接生成 MP4 与任务配置，用户只在需要修改文字或时长时才打开编辑页。
