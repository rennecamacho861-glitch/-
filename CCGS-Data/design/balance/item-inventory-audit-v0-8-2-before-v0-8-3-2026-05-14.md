# v0.8.2 道具现状盘点（v0.8.3 新增前）

日期：2026-05-14  
范围：`src/sim/items.ts` 中已进入 `ALL_ITEM_IDS` 与 `PICKUP_ITEM_POOL` 的 55 件道具。  
用途：在新增 v0.8.3 交叉端口道具前，锁定旧池内容、稀有度、场景端口和效果键，避免新增内容重复旧道具的同端口同效果数值竞赛。

## 汇总

| 维度 | 数量 |
|---|---:|
| 总道具 | 55 |
| common | 22 |
| uncommon | 28 |
| rare | 5 |
| damage | 24 |
| survival | 15 |
| intel | 15 |
| utility | 1 |

## 全量盘点

| ItemId | Rarity | Category | Use Context | Timing | Effect Key |
|---|---|---|---|---|---|
| pistol | rare | damage | combat | active | ranged-shot |
| bandage | common | survival | both | active | heal-3 |
| long-knife | rare | damage | combat | active | first-attack-and-throw |
| trap | common | intel | field | active | alarm-trap |
| glasses | common | intel | passive | passive | reveal-item-on-dodge |
| glow | common | intel | field | active | vision-boost |
| echo | common | intel | field | active | nearest-signal |
| weighted-grip | common | damage | passive | passive | first-hit-damage |
| blade-oil | common | damage | combat | active | heavy-threshold-minus |
| lime-powder | common | damage | combat | active | dodge-penalty |
| throwing-knife | uncommon | damage | combat | active | short-throw |
| sleeve-stone | common | damage | combat | active | tie-strength |
| ice-awl | uncommon | damage | combat | active | temporary-melee-damage |
| caltrops | uncommon | damage | field | active | speed-trap |
| hook-rope | uncommon | damage | combat | active | flee-penalty |
| acid-vial | uncommon | damage | combat | active | minor-dot |
| old-magazine | rare | damage | both | active | pistol-ammo |
| thick-cloth | common | survival | passive | passive | first-melee-reduce |
| bracer | uncommon | survival | passive | passive | first-defend-bonus |
| smoke-ball | uncommon | survival | combat | active | smoke-flee |
| painkiller | common | survival | combat | active | ignore-heavy-wound |
| coagulation-powder | common | survival | both | active | cleanse-or-heal-1 |
| wood-shield | uncommon | survival | combat | reaction | breakable-damage-reduce |
| soft-shoes | common | survival | passive | passive | first-dodge-flee |
| steady-charm | common | survival | passive | passive | ambush-reduce |
| adrenaline-shot | uncommon | survival | combat | active | temporary-speed |
| splint | uncommon | survival | combat | active | debuff-duration-reduce |
| lens | uncommon | intel | combat | active | reveal-speed-stat |
| counting-beads | common | intel | passive | passive | reveal-charges |
| notebook | common | intel | passive | passive | extra-stat-intel |
| scent-powder | uncommon | intel | combat | active | mark-enemy |
| black-cloth | uncommon | intel | field | active | visibility-reduce |
| bell-wire | uncommon | intel | field | active | equipment-alarm |
| polarized-lens | common | intel | passive | passive | smoke-flash-immunity |
| marked-coin | uncommon | intel | both | active | persuasion-payment |
| voice-whistle | common | intel | field | active | lure-step |
| rib-hook | uncommon | damage | combat | active | advantage-next-melee-damage |
| ankle-line | uncommon | damage | combat | active | advantage-dodge-penalty |
| chase-spur | uncommon | damage | combat | active | advantage-speed |
| counter-plate | uncommon | survival | combat | active | advantage-incoming-reduce |
| panic-nail | uncommon | survival | combat | active | advantage-flee-penalty |
| focus-thread | uncommon | survival | combat | active | advantage-dodge-boost |
| breath-cord | common | intel | passive | passive | round-two-stat-or-item |
| sharpening-stone | common | damage | combat | active | next-melee-damage |
| glass-spike | common | damage | combat | active | round-crit |
| tinder-vial | uncommon | damage | combat | active | next-hit-burn |
| poison-needle | uncommon | damage | combat | active | next-hit-poison |
| barbed-line | uncommon | damage | combat | active | next-hit-bleed |
| frost-nail | rare | damage | combat | active | next-hit-freeze |
| antidote-tablet | uncommon | survival | both | active | cleanse-poison-heal |
| insulation-cloth | uncommon | survival | combat | active | cleanse-burn-freeze-shield |
| signal-mirror | common | intel | field | active | visible-item-intel |
| folded-map | uncommon | intel | field | active | global-intel |
| runner-knot | uncommon | utility | field | active | two-step-move |
| signal-flare | rare | intel | field | active | flare-vision |

## 设计缺口

- 旧池已有较多“战斗手动 -> 下一次近战附加状态/数值”的道具，继续新增时应少做同构加减法。
- 旧池缺少“状态已被施加 -> 转化为不同收益”的被动链。
- 旧池缺少“成功躲闪 -> 反向上状态/暴击/情报”的组合链。
- 旧池缺少“受到近战命中 -> 给攻击者负面状态”的反应链。
- 旧池场外道具主要提供视野、移动、诱导，缺少专门指向高价值拾取点的构筑信息。

