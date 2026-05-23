# v0.6.5 随机编织迷宫 QA 报告

日期：2026-05-11  
范围：seed 地图生成、边缘墙连通性、无死路、最长直线、敌人巡逻、生成数量回归  
结论：PASS WITH VISUAL FOLLOW-UP

## 检查项

| 项目 | 结果 | 说明 |
|---|---|---|
| Quick Spec | PASS | 已新增随机编织无死路迷宫规格 |
| TypeScript 编译 | PASS | `npm test` 前置 `tsc -p tsconfig.test.json` 通过 |
| 自动化测试 | PASS | 24/24 tests passed |
| 生产构建 | PASS | `npm run build` 通过，Vite 仅提示 Phaser bundle 体积警告 |
| 本地预览 | PASS | `http://127.0.0.1:5173/` 返回 200 |
| 规则同步 | PASS | `rulebook.md` 已更新为 v0.6.5 随机编织迷宫规则 |
| 架构同步 | PASS | `system-framework.md` 与 `module-ports.md` 已登记 seed 生成、开放方向 2-3、最长直线限制 |
| 文档副本 | PASS | `docs/` 下规则书、系统框架、端口文档已同步 |
| Seed 复现 | PASS | 单元测试验证同 seed 墙线一致、不同 seed 墙线不同 |
| 连通与无死路 | PASS | 单元测试验证全图连通、所有格子开放方向为 2-3 |
| 最长直线 | PASS | 单元测试验证最长横向/纵向连续开放边不超过 4 |
| 生成数量 | PASS | 集成测试验证 30 个道具节点、10 名敌人继续生成 |
| 可达性 | PASS | 集成测试验证初始道具节点、敌人和出口均从玩家起点可达 |
| 敌人巡逻 | PASS | 集成测试验证初始 patrol 点之间不穿墙 |
| 视觉核验 | FOLLOW-UP | 需要在浏览器中人工确认随机墙线观感不再呈现整排大长条 |

## 自动化测试记录

命令：

```bash
npm test
```

结果：

```text
tests 24
pass 24
fail 0
```

新增或强化覆盖：

- 同 seed / 不同 seed 的 `wallEdges` 生成差异。
- 全图开放方向 2-3。
- 最长直线开放段不超过 4。
- 初始道具节点、敌人、出口可达。
- 敌人 patrol 点跟随开放边生成，不穿墙。

构建命令：

```bash
npm run build
```

结果：PASS。Vite 输出 chunk size warning，属于既有 Phaser bundle 体积提示，不阻塞本次地图生成改造。

本地预览：

```text
http://127.0.0.1:5173/ -> 200
```

## 风险与后续

- 随机迷宫的体验质量仍需要人工 playtest 判断；若局部拐弯过密或追逐节奏过碎，可继续通过 Quick Design 调整墙密度和直线限制。
- 当前重开会生成新 seed，复现问题时需要从 `GameState.seed` 记录具体 seed。
