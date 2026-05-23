# 《照面之时》Sound Bible

版本：0.3  
日期：2026-05-13  
范围：Grid Dungeon 音频方向、音效生成模型约束、素材接收规范

## Overview

《照面之时》的正式音频方向改为“音效生成模型或实录 Foley 素材”，不再接受程序化电子合成音作为游戏内可用资产。旧的 Iter01/Iter02 本地合成 WAV 只能作为事件覆盖和节奏参考，不能进入后续 Phaser 接入。新的音效应像 image gen 生成视觉参考一样，由音效模型直接生成真实感声音：脚步、碎石、旧金属、布料、皮革、短枪、弹壳、陷阱簧片、呼吸、墙后动静和低调 BGM。

## Player Fantasy

玩家听到的应该是“迷宫里真实发生了什么”，不是“系统播放了一个提示音”。每一步、每次照面、每个防御和躲闪都要像身体和物件在狭窄空间里摩擦、碰撞和下注。

## Detailed Rules

### Source Policy

- 允许：音效生成模型输出、授权实录 Foley、授权素材库加工。
- 禁止：8-bit、chiptune、电子蜂鸣、纯振荡器音、科幻 UI blip、卡通按钮音。
- 禁止：把 `scripts/audio/generate-grid-dungeon-sfx.mjs` 的程序化 WAV 当作最终游戏音效。
- 模型生成请求统一来自 `CCGS-Data/design/audio/source/grid-dungeon/model-prompts-iter03.json`。
- 模型渲染结果放入 `CCGS-Data/design/audio/source/grid-dungeon/model-renders/iter03/`，再由导入脚本校验并复制到 `public/assets/audio/grid-dungeon/model/`。

### Audio Pillars

1. **真实材料优先**：先像物件，再像反馈。
2. **低武近身**：声音来自身体、刀、布、皮革、短枪、旧墙体和低压设备。
3. **赌局张力**：照面、优势窗口、行动确认可以有硬币/金属片/低频下注感，但不能电子化。
4. **墙后不透明**：墙后敌人只给闷步、摩擦、呼吸、低频压力，不泄露完整信息。
5. **BGM 退后**：BGM 是空间压力和节奏底床，不替代玩法提示。

### Model Prompt Rules

- 每条 prompt 必须包含：真实 Foley、低武废土、近距离录音、目标时长、负面提示。
- 每条 prompt 必须明确排除：8-bit、chiptune、oscillator、laser、cartoon UI、明显电子合成。
- BGM prompt 必须要求 organic loop，不得要求 synth pad 或电子节拍。
- 高频事件保留多 variation：脚步、挥击、格挡、手枪、远处敌人。

## Formulas

- 接收格式固定为 `44.1kHz / 16-bit / mono PCM WAV`。
- 导入校验允许时长误差：`max(200ms, 目标时长 * 25%)`。
- 任一 WAV 样本峰值不得达到 `32767`，避免削波。
- 关键音频 `criticalCue=true` 必须带 `visualFallback`，不得只靠声音传递玩法信息。

## Edge Cases

- 如果模型只输出 stereo 或 48kHz，必须先用外部音频工具转码为规定格式，再运行导入脚本。
- 如果模型生成音听起来像电子提示音，即使格式通过也不能进入主 manifest。
- 如果 BGM 遮挡脚步、枪声、陷阱或重伤，应重新生成更稀疏版本。
- 当前环境没有可调用的音频生成模型时，状态必须记录为 BLOCKED/PENDING，不得用程序化音效冒充。

## Dependencies

- `CCGS-Data/design/gdd/audio-grid-dungeon.md`
- `CCGS-Data/design/audio/source/grid-dungeon/model-prompts-iter03.json`
- `scripts/audio/prepare-grid-dungeon-audio-model-prompts.mjs`
- `scripts/audio/import-grid-dungeon-model-audio.mjs`

## Tuning Knobs

- prompt 的材料描述：金属、碎石、潮湿混凝土、皮革、布料、身体冲击。
- variation 数量和目标时长。
- BGM loop 的密度、低频强度和可循环长度。
- 导入前是否进行人工听感筛选。

## Acceptance Criteria

- 模型 prompt pack 覆盖当前全部音频事件与 variation。
- 未获得模型生成 WAV 前，音频状态为 pending，不接入 runtime。
- 模型 WAV 导入后必须通过格式、时长、削波、关键提示视觉替代检查。
- QA 必须记录旧程序化音效已废弃、模型渲染是否完成、人工试听是否通过。
