# Grid Dungeon 音效模型生成准备证据 Iter03

日期：2026-05-13

## 结论

状态：`PENDING_RENDER`

本轮已经把 Grid Dungeon 音效生产线从“程序合成占位音”切换为“音效模型渲染 + 导入校验”。当前环境没有可调用的音频生成模型，因此没有伪造或替代生成最终 WAV；模型渲染文件需要由外部音效生成模型产出后再导入。

## 已完成

- 已生成 102 条音效模型请求，覆盖 64 个事件及其 variation。
- 已生成模型渲染说明，包含风格、负面提示词、格式要求与文件命名。
- 已新增模型音频导入脚本，校验 44.1kHz / 16-bit / mono PCM WAV、时长、削波和缺失文件。
- 已禁用旧试听页对程序合成 WAV 的播放入口，改为显示模型渲染待导入状态。
- 已明确旧 `public/assets/audio/grid-dungeon/*.wav` 为废弃参考资产。

## 待完成

- 使用音效生成模型渲染 `model-prompts-iter03.json` 中列出的 WAV。
- 将渲染文件放入 `CCGS-Data/design/audio/source/grid-dungeon/model-renders/iter03/`。
- 运行 `node scripts/audio/import-grid-dungeon-model-audio.mjs`。
- 人工试听抽查后，才能允许后续 Phaser runtime 接入 `manifest.model-generated.json`。

## 当前导入检查

- 期望文件数：102
- 有效文件数：0
- 缺失文件数：102
- 结果：`PENDING`

该结果符合预期：音频模型尚未完成实际渲染。

## 风险

- 当前没有可调用的本地或连接器级音频生成模型，无法在本轮直接产出真实生音效 WAV。
- 旧程序合成资产仍存在于目录中，仅用于文件结构参考；后续 runtime 接入时必须避开旧 manifest。
- 模型生成的 BGM/loop 需要额外人工试听确认循环点，否则可能出现接缝或音色过满。

