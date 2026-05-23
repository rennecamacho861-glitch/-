# 《照面之时》Grid Dungeon 音频事件规格

版本：0.3  
日期：2026-05-13  
范围：音效生成模型请求、模型渲染导入与事件 manifest

## Overview

本规格将 Grid Dungeon 的音频生产方式从“本地程序化合成”切换为“音效生成模型/实录 Foley”。旧合成资产保留为历史参考，但不作为后续 Phaser 接入目标。当前真实目标是生成并导入 `model-prompts-iter03.json` 中列出的 102 条模型请求。

## Player Fantasy

音频应该像在一座真实、肮脏、低武的迷宫中录到的声音：鞋底、墙面、武器、枪机、弹壳、布料、呼吸、陷阱和远处敌人。玩家在战斗中听到的是双方身体和装备的交互过程，而不是抽象电子提示。

## Detailed Rules

### Production Flow

1. 运行 `node scripts/audio/prepare-grid-dungeon-audio-model-prompts.mjs` 生成 prompt pack。
2. 使用音效生成模型按 prompt 生成 WAV。
3. 将模型输出放入 `CCGS-Data/design/audio/source/grid-dungeon/model-renders/iter03/`。
4. 文件名必须匹配 prompt pack 的 `targetFile`。
5. 运行 `node scripts/audio/import-grid-dungeon-model-audio.mjs` 导入并生成 `manifest.model-generated.json`。
6. 通过人工试听后，下一轮再决定是否替换 runtime 使用的 manifest。

### Event Coverage

- 当前 prompt pack 继承 Iter02 的 64 个事件、102 个 variation。
- 覆盖探索 Foley、遭遇提示、战斗交互、道具 Foley、UI、ambient、BGM。
- 具体事件、prompt、目标文件和视觉替代以 `model-prompts-iter03.json` 为准。

### Forbidden Audio Style

- 不使用 8-bit。
- 不使用 chiptune。
- 不使用电子蜂鸣、纯振荡器、科幻激光、卡通 UI。
- 不使用明显合成器 pad 伪装 BGM。
- 不使用程序化噪声脚本产物作为最终资产。

## Formulas

- 接收格式：`44.1kHz / 16-bit / mono PCM WAV`。
- 导入时长容差：`max(200ms, expectedDurationMs * 0.25)`。
- 削波判定：任一样本绝对值达到 `32767` 则失败。
- 导入成功后 manifest 字段 `sourceType` 必须为 `audio-model-generated`。

## Edge Cases

- 模型输出格式不符合要求：不导入，先外部转码。
- 模型输出听感仍然电子化：格式可过，但人工试听必须打回。
- 模型缺失某个 variation：导入保持失败，不生成完整 manifest。
- BGM 不得自动播放；后续 runtime 必须等待用户输入解锁音频。

## Dependencies

- `CCGS-Data/design/gdd/sound-bible.md`
- `CCGS-Data/design/audio/source/grid-dungeon/model-prompts-iter03.json`
- `public/assets/audio/grid-dungeon/manifest.model-target.json`
- `scripts/audio/import-grid-dungeon-model-audio.mjs`

## Tuning Knobs

- `promptZh` / `promptEn` 的材料与情绪描述。
- `negativePrompt` 的禁用风格。
- `expectedDurationMs` 的目标时长。
- `defaultVolume`、`priority` 和 `bus`。

## Acceptance Criteria

- Prompt pack 生成成功，包含 102 条模型请求。
- 当前缺少模型 WAV 时，导入检查应明确显示 `PENDING`，不能静默通过。
- 模型 WAV 全部到位后，导入脚本能生成 `manifest.model-generated.json`。
- 人工试听确认非电子化后，才能进入 Phaser 音频接入计划。
