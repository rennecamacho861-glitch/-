# Story 002: LootNode、敌人拾取与掉落

状态：Done  
类型：Logic / Integration  
关联：`src/sim/**`

## Acceptance Criteria

- [x] `SearchPoint` 替换为 `LootNode`，节点包含 3 件不同候选与 `depleted` 状态。
- [x] 玩家进入节点后生成 `pendingPickupOffer`，选择不额外推进回合。
- [x] 敌人移动到节点后自动拾取 1 件并清空节点。
- [x] 敌人固定类型字段移除，战斗决策由属性、道具和状态推导。
- [x] 敌人击败后按掉落规则结算，并保留手枪剩余弹药等实例状态。

## Test Evidence

- `npm test`：11 tests passed。
- 覆盖三选一、敌人拾取、远程先手、手枪 5 发、掉落保留弹药和 0 充能不掉落。
