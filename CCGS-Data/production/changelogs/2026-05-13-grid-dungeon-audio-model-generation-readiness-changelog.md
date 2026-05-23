# Grid Dungeon 音效模型生成准备 Changelog

日期：2026-05-13

## Summary

根据用户要求，Grid Dungeon 音效方向从“程序合成占位音”改为“音效模型生成的生音效”。本轮不再尝试用本地合成脚本伪装真实音效，而是建立模型 prompt 包、导入校验脚本和弃用声明。

## Changed

- 更新 `sound-bible.md`：正式规定音频真源为模型生成、生录 Foley 或授权素材，禁止电子合成音作为最终资产。
- 更新 `audio-grid-dungeon.md`：将 Iter03 流程改为模型渲染、WAV 导入和人工试听门禁。
- 更新 `audio-preview.html`：移除旧程序音效试听入口，改为显示模型渲染待导入状态。
- 新增 `prepare-grid-dungeon-audio-model-prompts.mjs`：从现有事件池生成 102 条音效模型请求。
- 新增 `import-grid-dungeon-model-audio.mjs`：校验并导入模型渲染 WAV。
- 新增旧音频弃用说明：防止后续误把 `manifest.json` 和根目录 WAV 接入 runtime。

## Not Done

- 未生成真实模型音频 WAV：当前工具环境没有可调用的音效生成模型。
- 未接入 Phaser 播放：需等待 `manifest.model-generated.json` 和人工试听通过。

## Verification

- 模型请求生成通过：102 条请求。
- 导入检查结果符合预期：`PENDING: 0/102 model audio files valid. Missing renders: 102`。
- 未修改 `src/` 运行时代码。

