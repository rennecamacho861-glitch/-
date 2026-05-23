# QA Report：ADR-0002 Phaser 表现层异步边界

日期：2026-05-13  
状态：PASS

## 检查目标

- `src/main.ts` 不再静态依赖 Phaser。
- Phaser 创建点集中在 `src/render/startPhaserGame.ts`。
- 构建产物能把入口、Phaser bootstrap 和 Phaser vendor 分开。
- 固定端口配置在 `package.json` 与 `vite.config.ts` 中保持一致。
- 现有模拟层自动化测试不回归。

## 自动化验证

- `npm run build`：通过。
- `npm test`：35 项通过，0 项失败。

## 构建证据

| Chunk | 大小 | gzip |
|---|---:|---:|
| `index` | 78.65 kB | 26.37 kB |
| `startPhaserGame` | 5.18 kB | 2.15 kB |
| `phaser-vendor` | 1,478.57 kB | 339.68 kB |

## 技术债扫描结论

- 需要继续解耦：`GameSimulation.ts` 已达 1330 行，应拆 `combatRoundSystem` 与 `itemEffectSystem`。
- 需要继续解耦：`snapshot()` 返回真实状态对象，应进入只读快照或 view model。
- 需要继续解耦：`main.ts` 已从 Phaser 中解开，但 HUD 字符串与输入桥接仍可拆成 UI 模块。

## 残余风险

- Phaser vendor 体积仍然存在，只是已从入口包移出；后续若首屏需要更快，可补加载态与错误态。
- 尚未做浏览器截图验证；该环境限制已由 TD-002 跟踪。
