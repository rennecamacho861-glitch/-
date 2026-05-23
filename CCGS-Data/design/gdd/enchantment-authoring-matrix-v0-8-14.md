# v0.8.14 全道具附魔撰写矩阵

状态：规则草案，等待确认  
关联真源：`rulebook.md` 第 12.3.4、24E 章  
用途：为当前 134 件可拾取道具提供六种附魔的统一撰写规律和承载模板，避免后续代码与文本为每件道具写孤立特例。逐项穷举结果见 `enchantment-exhaustive-table-v0-8-14.md`。

## Overview

本文件把所有道具分成 6 类附魔承载模板：`HIT`、`PRIME`、`COUNTER`、`SUPPORT`、`TRAP`、`AMMO`。每件道具都可以拥有六种附魔，但附魔不改变道具原本身份；它只在该道具的真实生效端口上附带一个额外层。这样所有道具都有可写文案，也能保持后续实现的端口统一。若需要检查每件道具对六种附魔的具体文本，使用 `enchantment-exhaustive-table-v0-8-14.md`。

## Player Fantasy

玩家看到“燃烧的绷带”“闪耀的回声针”“剧毒的飞刀”时，应立刻理解：这件物品不是单纯多一个数值，而是在它原本擅长的时刻留下一个火、毒、寒、血、暴击或二次触发的机会。强道具变得更像一张赌桌上的好牌，弱道具也可能因为附魔成为临时构筑核心。

## Detailed Rules

### 附魔公共规则

- 每件道具实例最多 1 个附魔。
- 附魔跟随实例转移、掉落、敌人拾取和内战遗物保留。
- 附魔永远不独立触发；必须由该道具原本的使用、被动、陷阱、弹药或反应端口承载。
- 同一角色同一时间最多保留 1 个 `SUPPORT` 预备附魔；新的 `SUPPORT` 预备会刷新旧预备，不叠加。
- 任何附魔造成的状态、暴击或复制结算都受战斗触发链上限约束。

### 承载模板总表

| 模板 | 适用道具 | 燃烧的 | 剧毒的 | 极寒的 | 染血的 | 致命的 | 闪耀的 |
|---|---|---|---|---|---|---|---|
| `HIT` 命中承载 | 直接造成伤害的武器、投掷物、直接反伤 | 本次命中后对同一目标施加 `enchantPower` 层灼烧 | 施加 `enchantPower` 层中毒 | 施加 `ceil(enchantPower / 2)` 层冻结 | 施加 `enchantPower` 层流血 | 本次伤害 +50% 暴击率 | 本次基础伤害再结算 1 次，不复制附魔 |
| `PRIME` 蓄势承载 | 让下一次攻击变强、附状态、降重伤阈值或提高暴击的道具 | 原有蓄势命中时额外施加灼烧 | 额外施加中毒 | 额外施加冻结 | 额外施加流血 | 原有蓄势命中时 +50% 暴击率 | 原有蓄势命中后再结算一次同源攻击 |
| `COUNTER` 反应承载 | 防御、躲闪、受击、重伤、低血、优势反制类道具 | 反应成功时让触发者或攻击者灼烧 | 让触发者或攻击者中毒 | 让触发者或攻击者冻结 | 让触发者或攻击者流血 | 反应造成的下一次反击/伤害 +50% 暴击率 | 反应 payload 额外触发 1 次 |
| `SUPPORT` 支援承载 | 治疗、情报、视野、移动、说服、常驻小属性 | 成功使用/触发后获得一次火焰预备，下一次有效命中施加灼烧 | 获得毒性预备 | 获得寒霜预备 | 获得流血预备 | 获得致命预备，下一次有效命中 +50% 暴击率 | 获得闪耀预备，下一次有效命中复制一次基础 payload |
| `TRAP` 地物承载 | 陷阱、铜铃线、绊线卷等布置物 | 触发者额外灼烧 | 触发者额外中毒 | 触发者额外冻结 | 触发者额外流血 | 陷阱直接伤害 +50% 暴击率；无伤害则下一次对触发者的命中 +50% 暴击率 | 陷阱基础 payload 额外触发 1 次 |
| `AMMO` 弹药承载 | 旧弹夹等只补充攻击资源的道具 | 本次补充的下一发有效子弹带灼烧 | 下一发带中毒 | 下一发带冻结 | 下一发带流血 | 下一发 +50% 暴击率 | 下一发命中后额外结算 1 次基础子弹伤害 |

### 玩家可读文案模板

| 模板 | 文案句式 |
|---|---|
| `HIT` | `附魔名 + 道具名`：命中时，除原本效果外，追加对应附魔效果。 |
| `PRIME` | `附魔名 + 道具名`：准备的下一次攻击命中时，追加对应附魔效果。 |
| `COUNTER` | `附魔名 + 道具名`：原本的反应条件成立时，把附魔打回触发者。 |
| `SUPPORT` | `附魔名 + 道具名`：使用或触发后，为下一次有效攻击留下对应附魔预备。 |
| `TRAP` | `附魔名 + 道具名`：敌人触发时，除原本警报/伤害/情报外，追加对应附魔效果。 |
| `AMMO` | `附魔名 + 道具名`：完成补充后，下一发有效子弹携带对应附魔。 |

## 全道具承载映射

| ItemId | 当前名 | 附魔承载模板 |
|---|---|---|
| `bandage` | 绷带 | SUPPORT |
| `trap` | 陷阱 | TRAP |
| `glasses` | 眼镜 | SUPPORT |
| `glow` | 照明棒 | SUPPORT |
| `echo` | 回声针 | SUPPORT |
| `weighted-grip` | 配重握柄 | PRIME |
| `blade-oil` | 刀油 | PRIME |
| `lime-powder` | 石灰粉 | COUNTER |
| `throwing-knife` | 飞刀 | HIT |
| `sleeve-stone` | 袖中石 | PRIME |
| `ice-awl` | 冰锥 | PRIME |
| `caltrops` | 铁蒺藜 | TRAP |
| `hook-rope` | 钩绳 | COUNTER |
| `acid-vial` | 腐蚀小瓶 | HIT |
| `thick-cloth` | 厚布衣 | SUPPORT |
| `bracer` | 护臂 | SUPPORT |
| `smoke-ball` | 烟雾球 | SUPPORT |
| `painkiller` | 止痛片 | SUPPORT |
| `coagulation-powder` | 凝血粉 | SUPPORT |
| `wood-shield` | 木盾片 | COUNTER |
| `soft-shoes` | 软底鞋 | SUPPORT |
| `steady-charm` | 稳心符 | SUPPORT |
| `adrenaline-shot` | 肾上针 | SUPPORT |
| `splint` | 夹板 | SUPPORT |
| `lens` | 镜片 | SUPPORT |
| `counting-beads` | 计数珠 | SUPPORT |
| `notebook` | 记事本 | SUPPORT |
| `scent-powder` | 气味粉 | SUPPORT |
| `black-cloth` | 黑布 | SUPPORT |
| `bell-wire` | 铜铃线 | TRAP |
| `polarized-lens` | 偏光片 | SUPPORT |
| `marked-coin` | 标记硬币 | SUPPORT |
| `voice-whistle` | 假声哨 | SUPPORT |
| `rib-hook` | 肋钩 | PRIME |
| `ankle-line` | 绊踝线 | COUNTER |
| `chase-spur` | 追步刺 | PRIME |
| `counter-plate` | 反压铁片 | COUNTER |
| `panic-nail` | 压胆钉 | COUNTER |
| `focus-thread` | 定神线 | SUPPORT |
| `breath-cord` | 数息绳 | SUPPORT |
| `sharpening-stone` | 磨刀石 | PRIME |
| `glass-spike` | 玻璃刺 | PRIME |
| `tinder-vial` | 火绒瓶 | PRIME |
| `poison-needle` | 毒针 | PRIME |
| `barbed-line` | 锯齿线 | PRIME |
| `frost-nail` | 冷凝钉 | PRIME |
| `antidote-tablet` | 解毒片 | SUPPORT |
| `insulation-cloth` | 绝缘布 | COUNTER |
| `signal-mirror` | 信号镜 | SUPPORT |
| `folded-map` | 折叠地图 | SUPPORT |
| `runner-knot` | 跑绳结 | SUPPORT |
| `signal-flare` | 信号火 | SUPPORT |
| `soot-hook` | 煤钩 | COUNTER |
| `venom-saw` | 毒锯片 | COUNTER |
| `blood-knot` | 血结绳 | PRIME |
| `frost-latch` | 霜扣 | COUNTER |
| `lens-thread` | 镜线 | SUPPORT |
| `stitch-kit` | 缝合包 | SUPPORT |
| `tripwire-spool` | 绊线卷 | TRAP |
| `red-compass` | 红针罗盘 | SUPPORT |
| `smoke-needle` | 烟针 | COUNTER |
| `thorn-plate` | 刺片 | COUNTER |
| `salve-tin` | 药膏铁盒 | SUPPORT |
| `field-ration` | 压缩口粮 | SUPPORT |
| `charcoal-tablet` | 炭净片 | SUPPORT |
| `pressure-bandage` | 压伤绷带 | SUPPORT |
| `heat-pad` | 暖石贴 | SUPPORT |
| `blood-sponge` | 血吸垫 | PRIME |
| `mercy-thread` | 缓息线 | SUPPORT |
| `emergency-syringe` | 急救针 | SUPPORT |
| `lead-wrap` | 铅缠带 | PRIME |
| `ankle-spring` | 踝簧 | SUPPORT |
| `cracked-scope` | 裂准镜 | PRIME |
| `spark-fuse` | 火星引线 | PRIME |
| `second-breath` | 二息带 | SUPPORT |
| `rust-cloud` | 锈粉囊 | COUNTER |
| `coal-beads` | 煤珠串 | COUNTER |
| `toxin-skein` | 毒丝束 | COUNTER |
| `cold-rivet` | 冷铆钉 | COUNTER |
| `crit-hook` | 裂口钩 | PRIME |
| `guard-breaker` | 破挡楔 | PRIME |
| `servo-heel` | 伺服鞋跟 | SUPPORT |
| `mnemonic-plate` | 记忆钢片 | SUPPORT |
| `knuckle-core` | 指节铁芯 | PRIME |
| `exit-charm` | 出口符牌 | SUPPORT |
| `opener-gear` | 开局齿轮 | SUPPORT |
| `first-glint` | 初光片 | SUPPORT |
| `pilot-flame` | 引燃头 | PRIME |
| `rawhide-guard` | 生皮护边 | SUPPORT |
| `second-gear` | 二段齿轮 | PRIME |
| `coolant-breath` | 冷却气囊 | SUPPORT |
| `second-sight` | 二次校准片 | SUPPORT |
| `venom-timer` | 延时毒囊 | PRIME |
| `long-fuse` | 长引线 | PRIME |
| `fatigue-tax` | 疲劳刻痕 | PRIME |
| `bunker-prayer` | 地堡祈牌 | SUPPORT |
| `escape-count` | 逃生计数绳 | SUPPORT |
| `spring-step` | 弹簧步带 | SUPPORT |
| `dust-kicker` | 扬尘片 | HIT |
| `slip-venom` | 滑毒线 | COUNTER |
| `dodge-reader` | 侧闪读片 | SUPPORT |
| `guard-lens` | 防御镜片 | SUPPORT |
| `brace-piston` | 护架活塞 | PRIME |
| `shield-spark` | 盾火石 | COUNTER |
| `calm-mouthpiece` | 稳声咬嘴 | SUPPORT |
| `wound-motor` | 伤口马达 | PRIME |
| `crack-reader` | 裂纹读片 | SUPPORT |
| `crush-salt` | 压碎盐包 | COUNTER |
| `ember-step` | 余烬踏板 | SUPPORT |
| `heat-read` | 热读片 | SUPPORT |
| `ash-threshold` | 灰线刻尺 | PRIME |
| `toxic-focus` | 毒焦环 | PRIME |
| `bitter-mouth` | 苦味咬嘴 | SUPPORT |
| `green-pulse` | 绿脉管 | SUPPORT |
| `ice-step` | 冰步扣 | SUPPORT |
| `cold-reader` | 冷读针 | SUPPORT |
| `shatter-pin` | 碎冰针 | HIT |
| `crit-lens` | 暴击镜片 | SUPPORT |
| `white-spark` | 白火星 | PRIME |
| `snap-sinew` | 响筋线 | SUPPORT |
| `pain-wheel` | 痛轮 | SUPPORT |
| `blood-map` | 血迹地图 | SUPPORT |
| `recoil-plate` | 反冲铁片 | HIT |
| `overrun-chain` | 越线链 | COUNTER |
| `hard-receipt` | 硬账票 | SUPPORT |
| `marrow-coin` | 髓币 | SUPPORT |
| `breakwater-splint` | 防波夹板 | SUPPORT |
| `trauma-scan` | 创伤扫描片 | SUPPORT |
| `last-ice` | 最后冰钉 | COUNTER |
| `last-match` | 最后火柴 | COUNTER |
| `data-spur` | 数据马刺 | SUPPORT |
| `long-knife` | 长刀 | HIT |
| `old-magazine` | 旧弹夹 | AMMO |
| `pistol` | 手枪 | HIT |

## Formulas

| 名称 | 公式 |
|---|---|
| 附魔强度 | `enchantPower = max(1, min(3, floor(eligiblePayloadAmount)))` |
| 支援预备持续 | 战斗内触发后保留 2 个动作回合；场外触发后保留到下一次照面第 1 个动作回合结束 |
| 支援预备上限 | 每名单位最多 1 个；新预备刷新旧预备 |
| 闪耀复制 | 只复制基础 payload 1 次，不复制附魔自身，不触发第二次闪耀 |

## Edge Cases

- 道具没有任何伤害或攻击端口时，使用 `SUPPORT` 模板，不直接伤害敌人。
- 治疗和情报道具触发附魔预备时，原本治疗或情报仍正常生效。
- `AMMO` 模板只影响补充后的下一发有效子弹或远程攻击；换弹失败则不产生附魔子弹。
- `TRAP` 模板在布置时不触发，必须等敌人实际踩中。
- 如果闪耀复制的基础 payload 是情报、治疗或移动，只复制该 payload，不复制由附魔产生的状态。

## Dependencies

| 系统 | 依赖 |
|---|---|
| Item System | 需要 `InventorySlot.affix`、承载模板与宝石写入规则 |
| Combat System | 需要统一读取 `HIT / PRIME / COUNTER / SUPPORT / TRAP / AMMO` 的附魔 payload |
| Status Effect System | 需要承接燃烧、中毒、冻结、流血 |
| HUD & Text | 需要展示 `附魔名 + 道具名` 和简洁的模板文案 |
| Enemy AI | 需要把已附魔道具评分上调，并识别 `SUPPORT` 预备 |

## Tuning Knobs

| 参数 | 默认值 | 建议范围 |
|---|---:|---:|
| 自然附魔概率 | 10% | 5%-12% |
| 支援预备持续 | 2 动作回合 | 1-2 |
| 附魔强度上限 | 3 | 2-3 |
| 致命暴击率 | +50% | +35%-60% |
| mythic 宝石槽位概率 | 1% | 0.5%-2% |

## Acceptance Criteria

- 所有 134 件当前可拾取道具都在“全道具承载映射”中有且只有一个模板。
- 每个模板都提供六种附魔的玩家可读句式和运行效果。
- `enchantment-exhaustive-table-v0-8-14.md` 必须穷举 134 件道具 × 6 种附魔的 804 个组合，并写明难适配道具的微调规则。
- 非伤害道具不再是“无效附魔”；它们统一通过 `SUPPORT` 预备转化为下一次有效攻击收益。
- 附魔仍不绕过原道具端口，不创造不受控的独立伤害。
- 后续实装必须从本矩阵生成或校验运行时映射，避免代码表和规则表分叉。
