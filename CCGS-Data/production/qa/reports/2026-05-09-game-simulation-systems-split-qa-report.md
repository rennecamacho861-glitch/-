# GameSimulation 系统拆分 QA 报告

日期：2026-05-09  
范围：模拟层架构重构  
结论：PASS

## 检查项

| 项目 | 结果 | 说明 |
|---|---|---|
| TypeScript 编译 | PASS | `npm test` 前置 `tsc -p tsconfig.test.json` 通过 |
| 自动化测试 | PASS | 11/11 tests passed |
| 生产构建 | PASS | `npm run build` 通过，Vite 仅提示 Phaser bundle 体积警告 |
| 外部端口兼容 | PASS | `SimulationPort` 未改签名 |
| 渲染层隔离 | PASS | 本次未修改 `src/render` |
| HUD 隔离 | PASS | 本次未修改 `src/main.ts` |
| 规则一致性 | PASS | 未改变规则书语义 |

## 自动化测试记录

命令：

```bash
npm test
```

结果：

```text
tests 11
pass 11
fail 0
```

构建命令：

```bash
npm run build
```

结果：PASS。Vite 输出 chunk size warning，属于既有 Phaser bundle 体积提示，不阻塞本次模拟层拆分。

覆盖的关键路径：
- 新局初始化。
- LootNode 三选一。
- 敌人拾取并清空节点。
- 72 回合危险增长。
- 相邻遭遇创建。
- 未见远程先手只触发一次。
- 防御减免远程伤害。
- 手枪弹药状态保留。
- 敌人掉落保留剩余 charges。
- 属性派生公式。

## 风险与后续

- 下一轮战斗内道具扩展前，应优先拆 `combatRoundSystem`，避免 `GameSimulation` 再度膨胀。
- 仍需在浏览器中做一次手动 smoke，确认拆分未影响 HUD 日志可读性。
