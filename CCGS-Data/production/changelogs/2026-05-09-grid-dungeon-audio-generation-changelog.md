# Grid Dungeon 音效生成 Changelog

日期：2026-05-09  
类型：音频资产生成 / CCGS team-audio  
对应规则：低武废土迷宫、照面博弈、视野/信息提示  
范围边界：本轮不修改 Phaser 运行时代码

## 新增文件

- `CCGS-Data/design/gdd/sound-bible.md`
- `CCGS-Data/design/gdd/audio-grid-dungeon.md`
- `CCGS-Data/design/audio/source/grid-dungeon/audio-event-source.json`
- `public/assets/audio/grid-dungeon/manifest.json`
- `scripts/audio/generate-grid-dungeon-sfx.mjs`
- `scripts/audio/validate-grid-dungeon-sfx.mjs`
- `CCGS-Data/production/qa/evidence/audio/grid-dungeon/validation-summary.json`
- `CCGS-Data/production/qa/evidence/audio/grid-dungeon/listening-checklist-iter01.md`
- `CCGS-Data/production/qa/evidence/audio/grid-dungeon/audio-preview.html`
- `CCGS-Data/production/qa/reports/2026-05-09-grid-dungeon-audio-generation-qa-report.md`

## 新增资产

- `public/assets/audio/grid-dungeon/*.wav`
- 共 54 个 WAV 资产，覆盖 42 个音频事件。
- 格式统一为 `44.1kHz / 16-bit / mono PCM WAV`。

## 变更摘要

- 建立首版 Sound Bible，确定“低武废土 + 牌桌紧张感”的声音方向。
- 建立 Grid Dungeon 音频事件规格，覆盖探索、遭遇、战斗、道具、UI 和低强度 ambient。
- 新增 deterministic Node 音频生成脚本，无新增 npm 依赖。
- 新增音频 manifest，记录事件、文件、分类、bus、优先级、默认音量、variation、critical cue 和视觉替代。
- 新增校验脚本，检查 WAV header、采样率、位深、声道、时长、削波和关键提示可访问性。
- 提供试听清单与 HTML 预览页，方便下一轮人工主观听感确认。

## 验证

- `node scripts/audio/generate-grid-dungeon-sfx.mjs`：PASS，生成 54 个 WAV。
- `node scripts/audio/validate-grid-dungeon-sfx.mjs`：PASS，最大峰值约 `-0.72 dBFS`。
- `npm test`：PASS，20/20 tests passed。
- `npm run build`：PASS，保留既有 Vite chunk size warning。

## 已知限制

- 本轮未接入 `src/`、Phaser loader、AudioManager 或 gameplay trigger。
- 当前 WAV 为程序化占位资产，后续可用人工音效或更精细合成替换。
- 主观试听未在自动化中完成，需要按 `listening-checklist-iter01.md` 人工确认。
