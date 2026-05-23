# v0.8.15 HUD 道具折叠、优势续战反馈与新手教程 Changelog

日期：2026-05-20  
范围：`quick-design` 小改动落地，覆盖 HUD 展示、优势窗口继续战斗与新手教程

## 变更摘要

- 新增 Quick Design Spec：`CCGS-Data/design/quick-specs/hud-advantage-tutorial-onboarding-2026-05-20.md`。
- 同步 `rulebook.md`、`combat-system.md` 与 `system-framework.md`：
  - 背包道具说明改为 hover/focus 展开。
  - 优势窗口继续战斗不再限制同场同类只能用 1 次。
  - 每次续战选择都必须生成确认式反馈。
  - 新手教程为 HUD 本地状态，不写入 `GameState`。
- `src/main.ts`：
  - 背包按钮默认只显示图标、名称和次数。
  - 新增道具说明悬浮层。
  - 新增首次进入的“是否需要新手教程”弹窗。
  - 新增按场景触发的一次性教程：目的、拾取、视野、道具、敌人、战斗、优势。
  - 教程关闭偏好写入 localStorage，关闭后不再打断游玩。
- `src/styles.css`：
  - 新增背包道具 hover/focus 说明层。
  - 新增教程弹窗样式。
  - 新增优势续战反馈视觉样式。
- `src/sim/GameSimulation.ts`：
  - 移除同场同类续战加成的一次性阻断。
  - `continueFight()` 新增 `advantage-press` 反馈事件。
- `tests/unit/combat_advantage_flee_persuasion_test.mjs`：
  - 更新优势续战测试，覆盖同场再次获得优势后可重复选择同类加成。
  - 新增续战反馈事件断言。
- `.gitignore`：
  - 忽略 `_public-upload*/` 导出目录，避免公开上传缓存污染主工作区状态。

## 关键文件

- `CCGS-Data/design/quick-specs/hud-advantage-tutorial-onboarding-2026-05-20.md`
- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/design/gdd/combat-system.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `src/main.ts`
- `src/styles.css`
- `src/sim/GameSimulation.ts`
- `src/sim/types.ts`
- `tests/unit/combat_advantage_flee_persuasion_test.mjs`
- `.gitignore`

## 验证

- `npm test`：119 / 119 通过。
- `npm run build`：通过。
- 本地 dev server：`http://127.0.0.1:5188/` 返回 200。

## Scope Check

- 计划内：背包道具展示折叠、优势续战重复加成、续战反馈、新手教程、规则/架构文档同步、测试更新。
- 计划外但必要：`.gitignore` 忽略 `_public-upload*/`，用于隔离前一次公开上传导出目录。
- 未上传公开仓库：本轮只修改主工作区。若要让 GitHub Pages 在线版同步，需要后续重新导出并推送最小公开版本。

## 后续建议

- 后续可把教程文案抽到独立 UX 文档或本地化表。
- 若教程需要跨浏览器同步，需要设计账户或云存储；当前只使用本机 localStorage。
- 若要让触摸设备更容易查看背包说明，可增加长按或信息按钮。
