---
id: "metagame-shell-product-ui"
system: "Game Shell & Product UI"
layer: "Presentation"
version: "0.1.1"
status: "Designed"
related_adrs: []
---
# Game Shell & Product UI

> **Status**: Designed  
> **Author**: Codex + CCGS UI/Art workflow  
> **Last Updated**: 2026-05-25  
> **Implements Pillar**: 搜打撤目标感、局外构筑、低武器高风险战备

## Overview

Game Shell & Product UI 把玩法原型包装成可传播、可进入、可理解的游戏外壳。它负责主页、局外页面导航、入场前地图与战备配置、商店、仓库、账号密码 hook 和视觉资产接入，不改变 `src/sim` 的经济、战斗或地图规则。

## Player Fantasy

玩家进入游戏时应像打开一台废土避难所里的战备终端：先看见“这是一场搜打撤”，再决定要带什么、买什么、去哪里赌一局。它的幻想不是现代商城，而是行动前的压迫感、构筑感和“这趟能不能带出来”的风险感。

## Detailed Design

### Core Rules

- 主页是局外默认入口，也是行动配置主窗口，展示游戏名、核心目标、地图档位选择、当前战备清单和开始行动按钮。
- 局外导航只保留 `行动 / 商店 / 仓库 / 档案` 四个顶层入口。
- 账号页保留账号和密码 hook，但当前版本不接入真实认证、数据库或云存档。
- 地图档位不再是独立页面，必须作为主页中最显眼的行动选择区呈现。
- 战备清单不再是独立页面，必须作为主页中“入场检查”窗口呈现，并与地图选择共同决定是否可开始行动。
- 商店页负责购买、刷新和查看商品信息。
- 仓库页负责存放、带入和出售。
- 物品信息仍使用 hover/focus tooltip，读取玩家可见道具文本端口。
- UI 资产只作为表现层背景、边框、标签和装饰，不承载玩法数值真源。

### States and Transitions

- `home`：默认局外页；包含地图档位选择、战备清单、开始行动、商店/仓库/教程快捷入口。
- `account`：显示本地档案、属性教育、账号 hook。
- `shop`：购买补给。
- `stash`：管理仓库。
- `activeRun`：局内状态下局外面板折叠为紧凑摘要。

### Interactions with Other Systems

- 读取 `MetagameState` 展示金币、仓库、战备、商店和地图档位。
- 调用 `MetagamePort` 处理地图选择、开始 run、购买、刷新、带入、撤下、出售、重 Roll、升级和教程入口。
- 读取 `itemText` 端口展示道具说明、限制、附魔效果和经济信息。
- 使用 `public/assets/grid-dungeon/ui/` 的 UI 资产增强页面识别。

## Formulas

The `profile_stat_total` formula is defined as:

`profile_stat_total = spirit + intellect + strength + speed + constitution`

| Variable | Symbol | Type | Range | Description |
|---|---|---:|---|---|
| spirit | `spirit` | int | 1-8 | 精神 |
| intellect | `intellect` | int | 1-8 | 智力 |
| strength | `strength` | int | 1-8 | 力量 |
| speed | `speed` | int | 1-8 | 速度 |
| constitution | `constitution` | int | 1-8 | 体质 |

Output Range: 当前档位通常为 10-20。  
Example: `3 + 2 + 2 + 3 + 2 = 12`。

The `deployment_display` formula is defined as:

`deployment_display = deploymentValue / selectedMapTier.deploymentValueCap`

| Variable | Symbol | Type | Range | Description |
|---|---|---:|---|---|
| deploymentValue | `deploymentValue` | int | 0+ | 当前带入物品总战备值 |
| selected cap | `selectedMapTier.deploymentValueCap` | int | 18+ | 当前地图档位战备上限 |

Output Range: UI 显示为分数；超过上限时开始按钮禁用。

## Edge Cases

- **If the player is in an active run**: 局外导航隐藏，只显示紧凑战备摘要。
- **If the stash is empty**: 仓库页显示空状态，并引导通过撤离或商店获取物品。
- **If deployment value exceeds the selected tier cap**: 战备页开始按钮禁用，显示不可进场状态。
- **If gold is below entry fee**: 战备页开始按钮禁用，玩家需换低档位或出售物品。
- **If auth inputs are used before account backend exists**: 登录/注册按钮保持禁用，不写入 Profile。
- **If a player acts on a long shop/stash list**: 同页操作后保留滚动位置。
- **If the player switches pages**: 不继承旧页滚动位置，避免新页面打开在中段。

## Dependencies

- `Metagame Economy`：提供 Profile、金币、商店、仓库、战备和地图档位。
- `Item System`：提供道具定义、稀有度、附魔、使用限制和玩家可读文本。
- `HUD & Combat UI`：共享 DOM HUD 样式和低血量/tooltip 等通用模式。
- `Art Bible`：约束旧金属、暗青、琥珀、暗红的视觉语言。
- `Asset Pipeline`：提供 imagegen 源图、裁切脚本、manifest 与运行时路径。

## Tuning Knobs

- 默认局外页：当前为 `home`。
- 页面顺序：行动、商店、仓库、档案。
- 行动主页面板宽度：桌面当前为 `min(1160px, calc(100vw - 360px))`。
- 辅助页面面板宽度：桌面当前为 `min(900px, calc(100vw - 384px))`，档案页可更窄。
- 主页 hero 背景高度：当前约 300px，主要空间让给地图档位与入场检查。
- 移动端导航列数：当前为 2 列。
- 装饰资产透明度：通过 CSS 伪元素 opacity 调整，避免盖住文字。

## Visual/Audio Requirements

- 主页使用 imagegen 生成的废土战备终端 hero 背景。
- 页面标签使用旧金属标签底板强化当前页/非当前页差异。
- 商店、战备、仓库分别使用补给柜台、装备箱、储物柜装饰，强化页面身份。
- 不新增音频。
- 不得出现现代 SaaS 后台、营销页大白底或高饱和霓虹商城风格。

## UI Requirements

- 主页必须直接提供地图档位选择、战备清单、开始行动、商店、仓库、教程等入口。
- 地图和战备不得作为与商店/仓库同级的独立导航页出现。
- 页面导航必须可点击，当前页面必须有视觉高亮和 `aria-pressed`。
- 账号 hook 输入必须使用 `data-auth-hook` / `data-auth-field`，后续可被账号系统绑定。
- 关键 CTA 在桌面和移动端都不能遮挡局内核心 playfield。
- 道具 tooltip 字体保持当前可读规格，支持鼠标 hover 与键盘 focus。

## Acceptance Criteria

- **GIVEN** 玩家在局外状态，**WHEN** 打开游戏，**THEN** 默认看到主页而不是直接看到所有系统堆叠。
- **GIVEN** 玩家在主页，**WHEN** 选择地图档位或调整战备，**THEN** 这些选择发生在同一个行动入口窗口内，不跳转到独立地图/战备页面。
- **GIVEN** 玩家点击页面导航，**WHEN** 切换到商店/仓库/档案，**THEN** 只显示对应辅助页面的主要内容。
- **GIVEN** 玩家在商店或仓库较低位置操作，**WHEN** 购买、带入或出售，**THEN** 当前滚动位置不被重置。
- **GIVEN** 账号系统尚未接入，**WHEN** 玩家看到账号页，**THEN** 可见账号/密码 hook 且登录/注册不可误触。
- **GIVEN** UI 资产已生成，**WHEN** 构建项目，**THEN** CSS 能通过 `/assets/grid-dungeon/ui/` 加载主页与局外装饰。
- **GIVEN** 运行自动化测试，**WHEN** 执行 `npm test`，**THEN** 现有模拟层回归全部通过。

## Open Questions

- 后续账号系统接入时，是否使用本地游客档案到云档案的迁移流程？
- 是否需要正式标题 logo 与启动加载页？
- 是否为不同地图档位生成独立背景或只复用当前战备终端风格？
