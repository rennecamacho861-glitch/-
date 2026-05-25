---
id: "metagame-economy"
system: "Metagame Economy"
layer: "Foundation"
version: "0.1.0"
status: "Draft / Awaiting Confirmation"
related_adrs: []
---

# 局外账号、仓库、商店与地图档位系统

> **Status**: Draft / Awaiting Confirmation  
> **Author**: Codex + CCGS Game Designer  
> **Last Updated**: 2026-05-25  
> **Implements Pillar**: 长线程布局、搜打撤目标感、赌博式风险选择

## Overview

本系统把《照面之时》从单局原型扩展为明确的搜打撤大框架：玩家拥有一个局外账号 Profile，账号保存金币、角色属性档位、仓库、商店刷新状态和可部署装备。玩家在局外用金币购买、出售、重掷属性或升级属性总值，再选择 5 档地图之一支付入场费并按该档战备区间携带道具进入局内。安全撤离时，本局拾取和击败敌人获得的道具全部带回仓库；失败时，本次带入和局内获取的道具丢失，只保留仓库中未带入的物品。该框架的目标是让玩家每局都有“我要带什么、去哪一档、拿到多少就撤”的清晰目标。

## Player Fantasy

玩家不再只是进入一张随机迷宫，而是像废土拾荒者在出工前整理家底：用有限金币赌一组属性、买几件趁手工具、决定今天进浅层捡白货还是押一笔门票去深层搏附魔。撤离成功的瞬间应像把赢来的筹码装进口袋；失败则像一次押注被清桌，但仍能靠仓库、金币和下一次更聪明的战备回来。

目标美学：

- **Autonomy**：玩家可选择省钱低档、带重装高档、卖货攒升级、重掷属性或赌商店刷新。
- **Competence**：地图档位明确展示敌人数值区间、掉落等级和附魔概率，玩家能理解风险收益。
- **Discovery**：高档地图提供附魔、宝石和敌人成长压力，鼓励玩家带着构筑目标深入。
- **Gamble Tension**：入场费、战备价值和撤离收益共同形成“什么时候离桌”的赌局压力。

## Detailed Rules

### 1. Account Profile

首版账号是本地 Profile，不接入后端登录。Profile 存在浏览器本地存档中，至少包含：

- `profileId`：本地生成的稳定 ID。
- `gold`：局外金币。
- `statTier`：属性总值档位，初始为 `rookie`。
- `stats`：当前玩家五项属性，进入局内时复制到 `GameState.player.stats`。
- `stash`：局外仓库道具实例列表。
- `shop`：当前商店 offer、刷新计数和下次自动刷新条件。
- `runHistory`：最近若干局结果，用于 UI 展示和调参，不影响规则。

新账号默认：

- 起始金币：`120`。
- 起始属性档位：`rookie`，随机总值 `10-12`。
- 起始仓库：空。
- 首次进入前必须完成一次属性 roll，并进入商店/战备界面。

### 2. Attribute Roll And Upgrade

玩家属性仍使用五项：精神、智力、力量、速度、体质。局外属性用于进入每一局时复制给玩家。

属性档位：

| 档位 | 总值范围 | 单项范围 | 解锁方式 | 设计目的 |
|---|---:|---:|---|---|
| `rookie` | 10-12 | 1-6 | 新账号默认 | 低成本、弱构筑、适合一二档地图 |
| `hardened` | 12-15 | 1-7 | 支付金币升级 | 允许更稳定地进入二三档 |
| `veteran` | 15-20 | 1-8 | 支付高额金币升级 | 面向四五档地图和深层押注 |

重掷属性：

- 玩家可花费金币在当前属性档位内重新 roll 总值与分配。
- 重掷只改变属性，不改变金币、仓库或商店。
- 首版重掷成本：`80 + 本档已重掷次数 x 20`，每次档位升级后该计数清零。
- 单项最低为 1；单项最高由当前档位决定。
- 分配必须尽量避免极端废号：roll 后至少有 1 项为当前档位高值倾向，至少有 1 项为低值倾向。

升级总值档位：

- `rookie -> hardened`：`800` 金币。
- `hardened -> veteran`：`2400` 金币。
- 升级后立即在新档位内 roll 一次属性，不额外收费。
- 升级不可降级；重掷只能在当前最高档位内进行。

### 3. Gold Economy

金币来源：

- 安全撤离后出售物品。
- 撤离奖励结算。
- 首版不直接把局内拾取转换为金币，必须通过“卖出仓库物品”完成，避免玩家无法感知物品本身价值。

金币消耗：

- 商店购买道具。
- 手动刷新商店。
- 重掷属性。
- 升级属性总值档位。
- 支付地图入场费。

卖出规则：

- 仓库物品可以在局外卖出。
- 卖出价格 = 当前购买估值的 `50%`，向下取整，最低 1 金币。
- 已消耗次数、弹药、耐久或破碎状态会降低估值；附魔和宝石会提高估值。

### 4. Item Pricing

基础购买价：

| 稀有度 | 颜色语义 | 基础价 | 备注 |
|---|---|---:|---|
| `common` | 白色 | 25 | 常见小工具 |
| `uncommon` | 蓝色 | 70 | 有明确构筑方向 |
| `rare` | 橙色 | 220 | 长期资产、强主动或关键武器 |
| `mythic` | 红色 | 680 | 附魔宝石或极高价值实例 |

实例修正：

- 附魔物品购买价乘以 `1.8`。
- 剩余次数/弹药按 `remainingCharges / maxCharges` 修正，最低保留 40% 估值；无限使用道具不受次数折价。
- 已破碎或 0 充能消耗品不可购买、不可卖出。
- 商店可以出售附魔物品，但只在三档以上地图解锁后进入商店池。

### 5. Shop

商店以 offer 槽位展示道具实例，不只是 `ItemId`。每个 offer 必须包含：

- 道具实例与剩余次数、弹药、耐久、附魔。
- 价格。
- 来源稀有度。
- 是否受当前账号进度解锁。

商店刷新：

- 商店默认 6 个槽位。
- 每完成 1 局，无论撤离或失败，商店刷新 2 个最旧槽位。
- 每完成 3 局，商店全量刷新。
- 玩家可支付 `60` 金币手动全量刷新。
- 手动刷新不会改变属性、仓库或当前战备。

商店稀有度权重按已解锁最高地图档位决定：

| 已解锁最高地图 | common | uncommon | rare | mythic |
|---|---:|---:|---:|---:|
| Tier 1 | 90 | 10 | 0 | 0 |
| Tier 2 | 76 | 22 | 2 | 0 |
| Tier 3 | 55 | 34 | 10 | 1 |
| Tier 4 | 42 | 38 | 18 | 2 |
| Tier 5 | 35 | 35 | 25 | 5 |

### 6. Stash And Deployment

仓库规则：

- 首版仓库无容量上限，避免早期 UI 与整理成本抢走核心验证。
- 仓库保存完整 `InventorySlot`，包括 `ItemId`、剩余次数、弹药、耐久、附魔、已触发状态。
- 仓库物品只能在局外买入、卖出、装备到战备或从战备卸回。

战备规则：

- 每次出发前选择地图档位，并在该档的战备区间内携带物品。
- 战备值 = 携带物品当前购买估值之和。
- 携带物品从仓库转入 `deploymentLoadout`；进入局内后复制为玩家初始背包。
- 安全撤离后，玩家背包中所有剩余实例回到仓库。
- 失败后，本次带入的物品和局内获得的物品全部丢失；仓库中未带入的物品保留。

战备区间不是强制最小值，只有最大值；UI 显示推荐区间，用于引导风险：

| 地图档位 | 入场费 | 战备上限 | 推荐战备 | 说明 |
|---|---:|---:|---:|---|
| Tier 1 | 0 | 80 | 0-50 | 新手回收区，白装为主 |
| Tier 2 | 30 | 160 | 40-120 | 当前原型难度基准 |
| Tier 3 | 90 | 300 | 120-240 | 橙装正常出现，开始有附魔 |
| Tier 4 | 220 | 520 | 240-420 | 高附魔率、高损失压力 |
| Tier 5 | 500 | 850 | 420-700 | 宝石与附魔敌人核心产出 |

### 7. Map Tiers

五档地图代表不同深度的废墟管廊。进入地图时支付入场费；若金币不足，不可进入。

| 地图档位 | 玩家可见名 | 敌人数值总值 | 敌人初始携带 | 地图/掉落稀有度 | 自然附魔 | 宝石 |
|---|---|---:|---|---|---:|---|
| Tier 1 | 外环废料带 | 8-12 | 0-1 件 common | common 92 / uncommon 8 / rare 0 | 0% | 0% |
| Tier 2 | 封存管廊 | 10-20 | 1 件 common/uncommon | common 75 / uncommon 23 / rare 2 | 0% | 0% |
| Tier 3 | 深层回收井 | 16-24 | 1-2 件，允许 rare | common 55 / uncommon 35 / rare 10 | 10% | 0% |
| Tier 4 | 红光禁区 | 20-30 | 2 件，rare 权重提高 | common 40 / uncommon 40 / rare 20 | 20% | 0% |
| Tier 5 | 黑核地堡 | 24-36 | 至少 1 件附魔物品，另有 1-2 件普通装备 | common 35 / uncommon 35 / rare 25 / mythic 5 | 20% | 进入掉落与宝箱池 |

Tier 2 是当前游戏难度的新定位，但敌人不再固定总值 15，而是每名普通敌人先随机获得 `10-20` 总属性点，再随机分配到五项属性。UI 必须提示“敌人总值约 10-20，波动很大”，让玩家知道有弱敌也有强敌。

地图档位影响：

- 初始敌人数值预算。
- 初始敌人道具携带权重。
- 地图 LootNode offer 权重。
- 敌人局内拾取 offer 权重。
- 击败敌人的掉落权重。
- 自然附魔概率。
- 附魔宝石是否进入掉落与宝箱池。

### 8. Extraction And Failure

安全撤离：

- 玩家在出口/撤离井完成撤离后，本局玩家背包全部转回仓库。
- 道具实例保留当前状态：弹药、次数、耐久、附魔、已触发状态。
- 结算显示：带回道具列表、估值合计、可卖出金币合计、净收益。

失败：

- 玩家生命归零或被规则判定失败时，本次带入与局内获得的物品全部丢失。
- 已支付入场费不返还。
- 仓库中未带入物品和金币余额保留。
- 失败结算显示丢失物品、丢失估值和推荐下一步：低档回本、卖出仓库物、重掷属性或减少战备。

## Formulas

### Attribute Roll

```text
total = randomInt(tierMin, tierMax)
stats = distribute total into 5 stat keys
each stat >= 1
each stat <= tierStatCap
ensure at least one high tendency and one low tendency when possible
```

建议首版分配方法：

1. 每项先给 1 点。
2. 剩余点数按 seed 随机分配。
3. 若超过单项上限，溢出重投到其他项。
4. 若结果全项过于平均，在最高项 +1、最低项 -1，保持总值不变并不低于 1。

### Item Price

```text
basePrice = rarityPrice[item.rarity]
affixMultiplier = item.affix ? 1.8 : 1.0
chargeMultiplier = infinite ? 1.0 : max(0.4, remainingCharges / maxCharges)
conditionMultiplier = durability ? clamp(durability / maxDurability, 0.4, 1.0) : 1.0
buyPrice = ceil(basePrice * affixMultiplier * chargeMultiplier * conditionMultiplier)
sellPrice = max(1, floor(buyPrice * 0.5))
```

### Deployment Value

```text
deploymentValue = sum(buyPrice(slot) for slot in deploymentLoadout)
canStartRun = gold >= entryFee[tier] && deploymentValue <= deploymentCap[tier]
```

### Map Tier Loot

```text
rarity = weightedRoll(mapTier.rarityWeights)
if mapTier.naturalAffixChance > 0 and item is enchantable:
  affix = rollPercent < mapTier.naturalAffixChance ? randomEnchantment() : null
if mapTier.gemChance > 0:
  mythic gem may replace a high-value offer slot according to tier weights
```

### Enemy Stat Budget

```text
enemyTotal = randomInt(tier.enemyStatMin, tier.enemyStatMax)
enemyStats = distribute enemyTotal into 5 stats with per-tier cap
```

Tier 2 enemy stat budget replaces the old fixed 15-point enemy assumption.

## Edge Cases

- 金币不足以支付任何入场费：Tier 1 入场费为 0，保证玩家永远能继续游玩。
- 仓库为空且金币为 0：玩家仍可进入 Tier 1 裸装回本。
- 战备超过上限：开始按钮禁用，UI 标出超出的战备值。
- 商店 offer 中物品被购买：该槽位清空，直到下一次刷新补货。
- 附魔物品卖出：按附魔倍率计价；卖出后该实例永久移除。
- 已附魔道具不能再次自然附魔；宝石仍不能覆盖已有附魔。
- 玩家从局内带回 0 次数物品：若规则允许空实例存在，则进仓库但估值为 0 且不可卖；更推荐在撤离结算时自动丢弃并提示。
- 失败后本次带入物丢失：如果未来新增保险/保底箱，必须另写规则，不能默认保留。
- Tier 5 敌人“必携带附魔物品”：如果生成到非附魔兼容道具，必须重抽或给其一件兼容 common/uncommon 附魔物品。
- 多个本地 Profile：首版只支持 1 个当前 Profile；多档存档留作后续。
- 清浏览器缓存：本地 Profile 会丢失；若要公开传播，需在 UI 提醒“本地存档”。

## Dependencies

| 系统 | 依赖方向 | 契约 |
|---|---|---|
| Run State | Metagame -> Run | `startRun(tier, loadout)` 创建局内状态；`finishRun(outcome)` 回写仓库/金币 |
| Actor Stats | Metagame -> Stats | Profile 属性复制到玩家；地图档位生成敌人预算 |
| Item System | 双向 | 商店、仓库、战备、掉落都保存 `InventorySlot` 实例 |
| Enchantment System | 双向 | 附魔概率由地图档位覆盖；附魔实例参与价格和掉落 |
| Enemy AI | Metagame -> Enemy | 地图档位决定敌人数值预算、初始装备、附魔携带 |
| Map & Exploration | Metagame -> Map | 地图档位决定 LootNode 权重、敌人数量/质量、撤离收益 |
| HUD & Menus | Metagame -> UI | 需要新增 Profile、Shop、Stash、Deployment、Map Select 屏幕 |
| Save System | Metagame -> Storage | 本地持久化 Profile，局内失败/撤离后写回 |

## Tuning Knobs

| 参数 | 默认值 | 建议范围 | 类别 | 说明 |
|---|---:|---:|---|---|
| 起始金币 | 120 | 80-180 | Gate | 决定首次商店购买能力 |
| 重掷基础成本 | 80 | 50-150 | Sink | 控制刷属性冲动 |
| 重掷递增成本 | 20 | 10-50 | Sink | 防止无限刷完美属性 |
| hardened 升级成本 | 800 | 600-1200 | Curve | 中期目标 |
| veteran 升级成本 | 2400 | 1800-3600 | Curve | 长期目标 |
| common 价格 | 25 | 15-40 | Curve | 基础物价锚 |
| uncommon 价格 | 70 | 50-100 | Curve | 蓝装构筑门槛 |
| rare 价格 | 220 | 160-320 | Curve | 橙装长期资产 |
| mythic 价格 | 680 | 500-1000 | Curve | 宝石与终局押注 |
| 附魔价格倍率 | 1.8 | 1.5-2.5 | Curve | 附魔价值 |
| 卖出倍率 | 0.5 | 0.4-0.6 | Faucet/Sink | 让买卖存在损耗 |
| 商店槽位 | 6 | 4-8 | UI/Gate | 可选择数量 |
| 手动刷新成本 | 60 | 30-120 | Sink | 金币回收 |
| Tier 2 敌人数值 | 10-20 | 10-22 | Challenge | 当前难度基准波动 |
| Tier 3 附魔概率 | 10% | 8%-15% | Reward | 引入附魔 |
| Tier 4/5 附魔概率 | 20% | 15%-25% | Reward | 高档记忆点 |
| Tier 5 mythic 权重 | 5 | 2-8 | Reward | 宝石终局产出 |

## Acceptance Criteria

- 新 Profile 创建后拥有金币、属性、仓库和商店状态。
- 属性 roll 在当前档位总值范围内，五项属性合法，且可 seed 复现。
- 玩家可花金币重掷属性，费用随本档重掷次数递增。
- 玩家可花金币把属性总值档位从 10-12 升到 12-15，再升到 15-20。
- 商店能生成不同稀有度的道具实例，附魔实例价格更高。
- 玩家可购买道具进仓库，可卖出仓库道具并获得 1/2 估值金币。
- 玩家可从仓库配置战备，战备值不能超过地图档位上限。
- 选择地图档位会检查入场费和战备上限，并扣除入场费后开始局内。
- Tier 2 使用 10-20 敌人数值预算，取代固定 15 点分配。
- 五档地图各自应用不同敌人数值、掉落权重、附魔概率和宝石规则。
- Tier 5 敌人出生时必定至少携带 1 件附魔物品。
- 安全撤离会把玩家背包实例全部转回仓库并保留状态。
- 失败会丢失本次带入与局内获得物品，不影响未带入仓库物品。
- 所有局外状态变更只发生在模拟/元进度层，不由 DOM 或 Phaser 直接修改。

## Open Questions

1. “账号”首版是否接受本地 Profile？若需要真实登录、跨设备同步和排行榜，需要新增后端/认证/部署方案，范围会显著扩大。
2. 仓库首版是否无容量上限？如果要容量压力，需要额外设计扩容价格和整理 UI。
3. 入场费与战备上限是否采用本文默认值，还是希望更快/更慢地逼迫玩家卖货？
4. 失败是否丢失所有带入物？如果想降低挫败，可加入“安全箱 1 格”或“保险费”机制，但会削弱赌博压力。
5. Tier 5 的 mythic `5` 权重是否过高？如果宝石必须保持极稀有，可以改为固定 1%-2% 独立检定。
