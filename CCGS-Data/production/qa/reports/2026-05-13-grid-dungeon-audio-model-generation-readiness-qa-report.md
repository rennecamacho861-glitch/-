# Grid Dungeon 音效模型生成准备 QA 报告

日期：2026-05-13

## 范围

本次 QA 覆盖“禁止电子/程序合成音，改用音效模型生成”的生产线准备状态。范围包括音频规则文档、模型 prompt 包、导入脚本、试听页状态和旧资产弃用声明；不覆盖实际听感，因为当前尚无模型渲染 WAV。

## 结论

管线准备：PASS

实际音频资产：BLOCKED / PENDING

原因：当前 Codex 工具环境没有可调用的音频生成模型。已按用户要求停止把程序合成音作为目标资产，并建立模型渲染导入门禁。

## 检查项

| 检查项 | 结果 | 说明 |
|---|---|---|
| 旧程序合成音是否被废弃 | PASS | 已新增弃用说明，并在 Sound Bible 中禁止作为最终资产使用。 |
| 是否准备模型生成请求 | PASS | `model-prompts-iter03.json` 已包含 102 条请求。 |
| 是否禁止 8-bit / 电子合成风格 | PASS | 每条请求带负面提示词，规则文档也已写明。 |
| 是否有导入校验 | PASS | `import-grid-dungeon-model-audio.mjs` 校验格式、时长、削波、缺失。 |
| 是否误接入运行时 | PASS | 本轮未修改 `src/`，旧试听页已改为待渲染状态说明。 |
| 是否已有模型 WAV | PENDING | 当前 `model-renders/iter03/` 尚无 102 个目标文件。 |

## 执行命令

```powershell
node scripts/audio/prepare-grid-dungeon-audio-model-prompts.mjs
node scripts/audio/import-grid-dungeon-model-audio.mjs --check
```

## 验证结果

- `prepare-grid-dungeon-audio-model-prompts.mjs`：生成 102 条模型音效请求。
- `import-grid-dungeon-model-audio.mjs --check`：`PENDING: 0/102 model audio files valid. Missing renders: 102`。

## 后续准入

只有当以下条件全部满足时，才允许把音频接入 Phaser：

- 模型渲染 WAV 全部放入 `CCGS-Data/design/audio/source/grid-dungeon/model-renders/iter03/`。
- 导入脚本生成 `public/assets/audio/grid-dungeon/manifest.model-generated.json`。
- 至少抽听脚步、撞墙、照面、近战、手枪、陷阱、拾取、优势窗口、探索 BGM、战斗 BGM。
- 抽听结论写入 QA evidence。

