# ADR-0002: Phaser 表现层异步边界与构建拆包

## Status
Accepted

## Date
2026-05-13

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | Phaser 3 + Vite + TypeScript |
| **Domain** | Rendering / Core / Build |
| **Knowledge Risk** | LOW |
| **References Consulted** | `.ccgs-core/docs/technical-preferences.md`、`CCGS-Data/project-docs/architecture/module-ports.md`、`CCGS-Data/project-docs/architecture/ADR-0001-v0-4-simulation-boundary.md` |
| **Post-Cutoff APIs Used** | None |
| **Verification Required** | `npm run build` 必须显示入口 chunk 与 Phaser vendor chunk 分离；`npm test` 必须保持通过 |

> 项目尚未配置 `CCGS-Data/project-docs/engine-reference/phaser/` 参考库；本 ADR 只使用当前项目已验证的 Phaser 3 / Vite 运行方式。

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | ADR-0001 |
| **Enables** | 后续 `PresentationReadPort` / HUD view model 拆分 |
| **Blocks** | None |
| **Ordering Note** | 先拆构建与运行边界，再拆 HUD view model 和战斗系统内部逻辑 |

## Context

### Problem Statement

`src/main.ts` 同时静态导入 Phaser、创建 `GameSimulation`、构建 DOM HUD 和绑定输入，导致首包把 Phaser 与游戏逻辑打在一起。构建产物出现单 chunk 约 1.56MB 的警告；更重要的是，入口层职责边界变得模糊，长期会削弱“Phaser 只表现，`src/sim` 只结算”的项目红线。

### Constraints

- `src/sim` 仍是唯一规则与状态真源。
- `src/render` 可以依赖 Phaser；`src/main.ts` 不应静态依赖 Phaser。
- 当前游戏不依赖本地存档，开发服务固定端口为 `5188`。
- 不能改变 `SimulationPort` 对外接口，避免打断现有测试和 HUD。

### Requirements

- Phaser 必须被隔离到表现层异步 chunk。
- DOM HUD 和模拟层入口必须能在不静态加载 Phaser 的情况下初始化。
- Vite 构建必须用明确 vendor chunk 命名 Phaser 体积来源。
- 固定端口配置必须在 `package.json` 与 `vite.config.ts` 中一致。

## Decision

采用“入口轻量化 + Phaser 表现层异步启动”的架构：

- 新增 `src/render/startPhaserGame.ts`，作为唯一创建 `new Phaser.Game(...)` 的表现层启动点。
- `src/main.ts` 不再静态导入 `phaser` 或 `GameScene`，改为 `import("./render/startPhaserGame")` 动态启动画布。
- `src/main.ts` 仍创建 `GameSimulation`，并只把 `SimulationReadPort` 传给 `startPhaserGame`。
- `vite.config.ts` 增加 `manualChunks`，把 `node_modules/phaser` 明确拆为 `phaser-vendor`。
- `vite.config.ts` 的 `server` 与 `preview` 固定到 `127.0.0.1:5188` 且 `strictPort: true`。
- `chunkSizeWarningLimit` 设置为 `1500`，把 Phaser 3 的已知 vendor 体积视为当前浏览器原型预算；入口 chunk 若继续膨胀仍可通过构建产物观察。

### Architecture Diagram

```text
src/main.ts
  ├─ creates GameSimulation
  ├─ renders DOM HUD
  ├─ forwards input through SimulationPort
  └─ dynamic import("./render/startPhaserGame")
          └─ imports Phaser + GameScene
              └─ reads SimulationReadPort only
```

### Key Interfaces

```ts
export function startPhaserGame(simulation: SimulationReadPort): Phaser.Game;
```

## Alternatives Considered

### Alternative 1: 保持静态导入

- **Description**: 继续在 `main.ts` 里 `import Phaser from "phaser"` 并直接创建游戏实例。
- **Pros**: 最简单，无需拆文件。
- **Cons**: 首包巨大，入口层静态依赖 Phaser，职责边界模糊。
- **Rejection Reason**: 不符合长期“入口桥接层轻量化”的架构方向。

### Alternative 2: 只使用 Vite manualChunks

- **Description**: 保持代码结构不变，仅用 Rollup `manualChunks` 把 Phaser 拆成 vendor。
- **Pros**: 改动少，chunk 名称清晰。
- **Cons**: `main.ts` 仍静态依赖 Phaser，入口层职责没有真正拆开。
- **Rejection Reason**: 只能改善构建表现，不能降低架构耦合。

### Alternative 3: 动态启动 Phaser + vendor chunk

- **Description**: 入口动态加载 Phaser 启动模块，同时用 Vite 命名 vendor chunk。
- **Pros**: 首包明显变小；Phaser 创建点集中；端口与构建预算明确。
- **Cons**: 启动画布需要一次异步加载；`main.ts` 仍包含 HUD 字符串构建，后续还需拆 view model。
- **Rejection Reason**: 采纳。

## Consequences

### Positive

- 入口 JS 从约 1.56MB 降到约 78KB。
- Phaser 明确归属 `src/render`，`main.ts` 不再静态依赖 Phaser。
- 构建产物显示 `phaser-vendor`，后续能区分引擎体积和游戏逻辑体积。
- 开发端口配置与 npm 脚本对齐到 `5188`。

### Negative

- 首次显示 playfield 依赖异步 chunk 加载。
- 构建预算对 Phaser vendor 体积做了项目级豁免，后续需要观察非 vendor chunk 是否膨胀。

### Risks

- **风险：HUD 继续膨胀**。缓解：下一步拆 `HudViewModel` 和 HUD render helpers。
- **风险：`GameSimulation` 继续膨胀**。缓解：登记技术债，优先拆 `combatRoundSystem` 与 `itemEffectSystem`。
- **风险：动态加载失败时画布为空**。缓解：后续 UI polish 可增加加载/失败提示；当前构建测试覆盖静态可编译性。

## GDD Requirements Addressed

| GDD System | Requirement | How This ADR Addresses It |
|------------|-------------|--------------------------|
| Architecture | `src/sim` 拥有规则和状态；`src/render` 只表现；`src/main.ts` 只做 HUD 与输入桥接 | Phaser 创建点迁入 `src/render/startPhaserGame.ts`，`main.ts` 仅动态启动表现层并转发输入 |
| Module Ports | 渲染层只能依赖 `SimulationReadPort` | `startPhaserGame(simulation: SimulationReadPort)` 强制只读端口 |
| Local Runtime | 开发服务固定端口 5188，避免 5173/5174 挤占 | `vite.config.ts` 的 server/preview 与 package scripts 对齐到 5188 strictPort |

## Performance Implications

- **CPU**: 无规则计算变化。
- **Memory**: Phaser 仍会在 playfield 启动时加载，整体内存基本不变。
- **Load Time**: 初始入口 chunk 降至约 78KB；Phaser vendor 约 1.48MB，在异步 chunk 中加载。
- **Network**: 总下载量接近不变，但缓存分层更清晰。

## Migration Plan

1. 新增 `src/render/startPhaserGame.ts`。
2. 移除 `src/main.ts` 对 Phaser 和 `GameScene` 的静态导入。
3. 用动态 import 启动表现层，并在 unload 时销毁返回的 game 实例。
4. 更新 Vite server/preview 端口和 chunk 配置。
5. 运行 `npm run build` 与 `npm test`。

## Validation Criteria

- `npm run build` 通过，且构建产物包含小入口 chunk、`startPhaserGame` chunk、`phaser-vendor` chunk。
- 构建不再出现超过默认项目预算的 chunk warning。
- `npm test` 全部通过。
- `src/sim` 不引入 Phaser、DOM 或 CSS。

## Related Decisions

- `CCGS-Data/project-docs/architecture/ADR-0001-v0-4-simulation-boundary.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
