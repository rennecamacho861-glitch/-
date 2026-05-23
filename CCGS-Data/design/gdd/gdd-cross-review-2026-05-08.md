# Cross-GDD Review Report

日期：2026-05-08  
范围：`game-concept.md`、`systems-index.md`、`rulebook.md`、`system-framework.md`

## 结论

Verdict：PASS WITH CONCERNS

规则书在本次修订前已经符合项目核心体验方向，但不完全符合 CCGS GDD 文档标准，也有若干会阻塞实装的模糊点。v0.4 修订后，规则书已经补齐 Summary、Overview、Player Fantasy、Detailed Rules、Formulas、Edge Cases、Dependencies、Tuning Knobs、Acceptance Criteria，并把 5 个实装前待确认点转为 MVP 临时默认。

## 一致性审阅

### 已修复

- 规则书缺少 CCGS 要求的 8 个 GDD 栏目，导致后续 Story 难以直接追踪验收标准。
- 战斗外系统缺少撤离、失败、危险推进、AI 巡逻和遭遇触发的明确闭环。
- 视野系统未明确 MVP 视野形状、墙体遮挡和远程攻击路径。
- 照面战斗虽然目标是短促，但没有硬性防止拖成长 HP 消耗战的出口规则。
- 说服成功、敌人拾取、支付道具、玩家初始属性、躲闪表现均处于“待确认”，不利于进入代码。

### 当前一致

- `game-concept.md` 的核心支柱：视野领先、信息博弈、短促照面、长线程布局，已被 `rulebook.md` 覆盖。
- `systems-index.md` 的 MVP 系统顺序与 `system-framework.md` 的模块拆分一致。
- `rulebook.md` 和 `system-framework.md` 均要求 `src/sim` 拥有规则与状态，`src/render` 只表现，`src/main.ts` 只做 HUD 与输入桥接。

## 设计整体性审阅

### 通过项

- 核心体验清晰：黑暗探索制造下注压力，照面战斗制造短促读心。
- 属性与行为绑定明确：精神管视野，智力管信息/说服，力量管伤害/同速优先，速度管先后手/躲闪/逃跑，体质管生命/重伤/debuff。
- 道具不会只是数值堆叠：手枪、绷带、长刀、陷阱、眼镜分别打开远程、治疗、初见抢速、报警信息、道具读牌。
- 规则已经强调“玩家必须知道为什么吃亏”，这是视野+信息系统能否成立的关键。

### 仍需关注

- 目前多个系统集中在一份 `rulebook.md`，适合轻量原型，但后续进入更大范围开发时应拆成独立系统 GDD。
- Enemy AI 只达到 MVP 草案级，能支撑巡逻、追击、撤退，但还不足以支撑复杂敌人协作。
- HUD & Combat UI 已有信息要求，但缺少交互线框和移动端布局规则。
- 当前测试框架仍未建立；根据 TD-001，进入 v0.4 代码实装前应优先补 `tests/unit`。

## Cross-System Scenario Walkthrough

### 场景 1：玩家未看见猎手，猎手手枪远程先手

- 触发：猎手看见玩家，玩家未看见猎手，猎手有手枪且路径无遮挡。
- 系统链：Vision -> Item -> Encounter -> HUD。
- v0.4 结果：猎手可进行一次远程先手；玩家至少进入察觉状态；HUD 必须显示方向/来源提示。
- 风险：若 UI 没显示来源，玩家会感觉被系统黑箱惩罚。已写入规则书第 14 章验收。

### 场景 2：玩家防御试探高力量敌人

- 触发：玩家信息不足时选择防御。
- 系统链：Encounter -> Damage -> Intel -> Advantage。
- v0.4 结果：防御减免 60% 伤害，若承受敌方动作，触发信息获取并获得优势窗口。
- 风险：若防御过强会成为默认最优策略；已将防御减伤列入调参旋钮。

### 场景 3：第 4 回合仍无人结束战斗

- 触发：双方持续互相低效行动。
- 系统链：Encounter -> Advantage -> Flee/Persuade/Continue。
- v0.4 结果：按重伤、生命、速度顺序强制给出优势窗口；完全相同则双方后退并脱战，危险 +1。
- 风险：可能被玩家用来拖脱战；后续 playtest 需观察是否形成稳定逃避策略。

## GDDs Flagged for Revision

| GDD | Reason | Priority |
|---|---|---|
| `rulebook.md` | 已完成 v0.4 对齐，待用户确认 | High |
| `systems-index.md` | 已更新系统状态，Enemy AI 与 HUD 仍是 Drafted | Medium |
| `system-framework.md` | 已同步 v0.4 默认，但仍缺正式 ADR / control manifest / TR registry | Medium |

## 建议下一步

1. 由用户确认或修改 `rulebook.md` v0.4 的 MVP 默认决策。
2. 创建 v0.4 实装 Proposal，将 Rulebook -> Architecture -> Story 的追踪关系固定下来。
3. 在实装前建立 Vitest 与第一批 `tests/unit`，偿还 TD-001。
4. 先实现 Foundation/Core：Run State、Actor Stats、Map & Exploration、Vision & Intel、Encounter Combat。
