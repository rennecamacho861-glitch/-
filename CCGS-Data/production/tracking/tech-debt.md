# Tech Debt

| ID | Status | Area | Debt | Reason | Paydown Trigger |
|---|---|---|---|---|---|
| TD-001 | Closed | Tests | 当前原型缺少自动化测试 | 已建立 `npm test`，覆盖 sim 基础公式与部分集成流程 | 2026-05-08 v0.4 实装 |
| TD-002 | Open | QA Evidence | 当前环境无法生成浏览器截图证据 | Playwright 未安装且 npx/npm cache 权限受限；Chrome/Edge headless 未产出截图 | 下次具备 browser/playwright 工具时补桌面与移动截图 |
| TD-003 | Open | Architecture | `src/sim/GameSimulation.ts` 仍约 1296 行，持有战斗回合、信息、反馈和结算编排；普通战斗道具 active effect 已在 2026-05-13 抽到 `itemEffectSystem.ts` | 原型阶段为保持外部 `SimulationPort` 稳定，允许先集中编排；继续新增战斗动作会放大风险 | 下次扩展战斗动作、伤害或优势规则前，拆 `combatRoundSystem` |
| TD-004 | Open | Architecture | `SimulationReadPort.snapshot()` 返回真实状态对象，依赖调用方自律只读 | 当前测试和 HUD 直接读取方便，但长期存在外部误改状态的风险 | HUD/view model 扩展前，改为只读快照或 `PresentationReadPort` view model |
| TD-005 | Open | UI Architecture | `src/main.ts` 约 300 行，DOM HUD 字符串、输入桥接和反馈状态仍在同一文件 | 本轮已移除 Phaser 静态依赖，但 HUD 自身还未拆分 | 下次 UI polish 前拆 `hudViewModel.ts` 与 `hudRenderer.ts` |
