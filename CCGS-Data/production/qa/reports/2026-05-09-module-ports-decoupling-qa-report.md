# 模块端口与解耦确认 QA Report

日期：2026-05-09  
范围：`src/sim`、`src/render`、`src/main.ts`、架构端口文档。

## 静态边界检查

| 检查项 | 命令/方式 | 结果 |
|---|---|---|
| 渲染层不得调用命令端口 | `rg "move\\(|choosePickup\\(|useItem\\(|playCombatAction\\(|tryFlee\\(|continueFight\\(|tryPersuade\\(|reset\\(" src/render` | PASS，无匹配 |
| 模拟层不得依赖 Phaser/DOM | `rg "from \"phaser\"|document\\.|window\\.|HTMLElement|HTMLButtonElement|querySelector|addEventListener" src/sim` | PASS，无匹配 |
| 渲染层不直接依赖 `GameSimulation` | `rg "GameSimulation" src/render src/main.ts` | PASS，仅 `main.ts` 创建实例，`render` 无依赖 |
| 端口契约存在并被引用 | `rg "SimulationReadPort|SimulationCommandPort|SimulationPort|module-ports" src CCGS-Data/project-docs/architecture docs` | PASS |

## 自动化测试

命令：`npm test`

结果：PASS，11 tests passed。

## 构建验证

命令：`npm run build`

结果：PASS。

备注：Vite 仍提示 Phaser bundle 大于 500 kB，这是既有提示，不影响端口解耦。

## 结论

PASS。当前原型已形成明确端口边界：

- 渲染层：`SimulationReadPort`
- HUD/输入层：`SimulationPort`
- 模拟层：`GameSimulation implements SimulationPort`
- 端口真源：`CCGS-Data/project-docs/architecture/module-ports.md`

## 后续建议

- 在实装大量道具主动效果前，优先拆出 `itemSystem` 与 `combatSystem`，并在 `module-ports.md` 中登记新增端口。
- 在进入更大规模 UI 前，将 `snapshot()` 改为不可变快照或 view model，进一步防止外部误改状态。
