# Grid Dungeon 音效 Iter02 Changelog

日期：2026-05-12  
类型：音频资产生成 / team-audio Iter02  
对应规则：低武废土迷宫、照面博弈、视野/信息提示  
范围边界：本轮不修改 Phaser 运行时代码

## 修改文件

- `CCGS-Data/design/gdd/sound-bible.md`
- `CCGS-Data/design/gdd/audio-grid-dungeon.md`
- `scripts/audio/generate-grid-dungeon-sfx.mjs`
- `scripts/audio/validate-grid-dungeon-sfx.mjs`
- `public/assets/audio/grid-dungeon/manifest.json`
- `CCGS-Data/design/audio/source/grid-dungeon/audio-event-source.json`
- `CCGS-Data/production/qa/evidence/audio/grid-dungeon/validation-summary.json`
- `CCGS-Data/production/qa/evidence/audio/grid-dungeon/audio-preview.html`

## 新增文件

- `CCGS-Data/production/qa/evidence/audio/grid-dungeon/listening-checklist-iter02.md`
- `CCGS-Data/production/qa/reports/2026-05-12-grid-dungeon-audio-iter02-foley-bgm-qa-report.md`

## 变更摘要

- 将音频方向从 Iter01 的程序化提示音推进到 Foley 风格：布料、皮革、旧金属、碎石、湿地、钝击、呼吸、弹壳、陷阱簧片。
- 明确不走 8-bit/chiptune 或明显合成电子音路线。
- 扩展音频事件到 64 个，生成 102 个 WAV。
- 增加战斗过程交互音：行动确认、读牌迹象、敌人靠近、武器预备、呼吸、撞刀、擦过、推搡、近身、后撤、防御吃力。
- 新增 3 条低强度 BGM/底床 loop：探索、战斗、优势窗口。
- Manifest 新增 `materialStyle`，区分 `foley-layered-placeholder` 与 `organic-bgm-loop`。
- 校验脚本允许 `music` category，并继续检查 WAV 格式、时长、削波和 critical cue 视觉替代。
- 更新试听页，加入 BGM 和更多战斗交互样本。

## 验证

- `node scripts/audio/generate-grid-dungeon-sfx.mjs`：PASS，生成 102 个 WAV。
- `node scripts/audio/validate-grid-dungeon-sfx.mjs`：PASS，最大峰值约 `-0.92 dBFS`。
- HTML 试听页链接解析：PASS，15 个预览音频均存在。

## 已知限制

- 当前素材是程序化 Foley 风格占位，不是实录素材库。
- 主观试听仍需人工确认，尤其是 BGM 是否过满、手枪是否过亮、战斗交互是否足够真实。
- 本轮未接入 `src/`、Phaser loader、AudioManager 或 gameplay trigger。
