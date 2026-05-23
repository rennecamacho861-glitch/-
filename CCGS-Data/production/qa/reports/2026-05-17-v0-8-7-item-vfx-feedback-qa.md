# QA Report: v0.8.7 道具稀有度与程序化反馈演出

日期：2026-05-17

## Scope

验证绷带、回声针、手枪三件道具的规则文字、数据稀有度、运行时反馈事件、HUD/Phaser 表现端口和自动化回归。

## Automated Checks

| 检查 | 结果 | 证据 |
|---|---|---|
| 绷带与回声针 rare 稀有度 | PASS | `item_balance_system.test.mjs` rare 列表更新并通过 |
| 拾取战利价值按 rare 计算 | PASS | `pickup loot value follows item rarity` 通过 |
| 绷带战斗外回血并生成反馈 | PASS | `bandage is rare field-only healing and emits a heal feedback event` 通过 |
| 绷带战斗中不可用 | PASS | `bandage cannot be used during an encounter even with advantage` 通过 |
| 回声针四格区包含真实目标 | PASS | `echo needle marks a two-by-two pulse cluster containing the nearest target` 通过 |
| 手枪生成枪击反馈 | PASS | `black cloth reduces enemy sight...` 内断言 `gunshot` 反馈通过 |
| 全量回归 | PASS | `npm test` 74/74 通过 |
| 生产构建 | PASS | `npm run build` 通过 |

## Manual / Visual Notes

- 反馈动画使用 DOM/CSS 与 Phaser Graphics 程序化绘制，无新增贴图加载。
- `prefers-reduced-motion: reduce` 下禁用 CSS 动画和 Phaser shake，保留确认式文本。
- 本环境尝试后台启动 5188 dev server 时被桌面/shell 进程隔离终止；前台 `cmd.exe /c npm run dev` 已确认 Vite 能正常启动并显示 `http://127.0.0.1:5188/`。

## Residual Risk

- 未进行截图式人工验收；建议刷新浏览器后分别使用开局绷带、回声针和手枪确认动画节奏是否足够清楚、不遮挡主要地图。
