# v0.6.3 边缘墙地图 QA 报告

日期：2026-05-09  
范围：地图阻挡结构、移动、视野、远程判定、Phaser 地图表现  
结论：PASS WITH VISUAL FOLLOW-UP

## 检查项

| 项目 | 结果 | 说明 |
|---|---|---|
| TypeScript 编译 | PASS | `npm test` 前置 `tsc -p tsconfig.test.json` 通过 |
| 自动化测试 | PASS | 20/20 tests passed |
| 生产构建 | PASS | `npm run build` 通过，Vite 仅提示 Phaser bundle 体积警告 |
| 规则同步 | PASS | `rulebook.md` 已更新为 v0.6.3 边缘墙规则 |
| 架构同步 | PASS | `system-framework.md` 与 `module-ports.md` 已登记 `wallEdges` 端口 |
| 文档副本 | PASS | `docs/` 下规则书、系统框架、端口文档已同步 |
| 模拟层真源 | PASS | `TileKind` 不再包含 `wall`；`MapState.wallEdges` 成为阻挡真源 |
| 移动阻挡 | PASS | 单元测试验证边缘墙阻挡相邻移动，开放边允许移动 |
| 视野阻挡 | PASS | 单元测试验证横向、纵向和斜向一次拐角视线 |
| 远程攻击 | PASS | 手枪仍复用 `hasLineOfSight()`，不可穿过边缘墙 |
| 本地预览 | PASS | Vite 已在 `http://127.0.0.1:5173/` 与 `/index.html` 返回 200 |
| 视觉核验 | FOLLOW-UP | 已实现格边墙线绘制；仍需在浏览器中人工确认画面观感 |

## 自动化测试记录

命令：

```bash
npm test
```

结果：

```text
tests 20
pass 20
fail 0
```

新增覆盖：

- 地图不再含 `wall` tile。
- `wallEdges` 阻挡相邻移动。
- 地图外边界视为阻挡。
- 横向/纵向视线被边缘墙阻断。
- 斜向视线在一条拐角路径可通时可见，两条都被挡时不可见。

构建命令：

```bash
npm run build
```

结果：PASS。Vite 输出 chunk size warning，属于既有 Phaser bundle 体积提示，不阻塞本次地图结构改造。

本地预览：

```text
http://127.0.0.1:5173/ -> 200
http://127.0.0.1:5173/index.html -> 200
```

## 风险与后续

- 视觉层已绘制边缘墙，但未生成截图证据；建议下一轮用可控浏览器工具补充 `CCGS-Data/production/qa/evidence/` 截图。
- 当前边缘墙布局为第一版手工布局，后续 playtest 后可继续调整墙段密度和道具节点位置。
- 未来接入墙体美术切片时，必须保持 `wallEdges` 仍为唯一规则真源，资产只做表现。
