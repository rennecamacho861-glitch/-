# v0.8.17 脚本化战斗教程 QA 报告

## 测试范围

- 模拟层教程场景创建。
- 教程敌人属性预算与正式局隔离。
- 教程战斗步骤：防御、方向情报、对应闪避、优势投入速度、击杀、说服。
- 教程完成/跳过后恢复正式开局四选一。
- 既有战斗、道具、拾取、敌人 AI 与附魔回归。

## 自动化测试

命令：

```powershell
npm test
npm run build
```

结果：

- 通过：122
- 失败：0
- 生产构建：通过
- 本地开发服务器：`http://127.0.0.1:5188/` 返回 200

新增覆盖：

- `scripted tutorial spawns two stat-budget enemies before starter pickup`
- `scripted tutorial teaches guard, direction dodge, tempo spend, kill, and persuasion`
- `scripted tutorial can be skipped back to formal starter pickup`

## 验收结论

PASS。

教程流程已由 `src/sim` 状态驱动，HUD 只读取 `tutorialScenario` 并发送命令。教程敌人不参与正式局掉落，完成/跳过都会重置到正式开局四选一，符合 v0.8.17 规则与端口要求。

## 剩余风险

- 本轮尚未补浏览器截图证据；需要在后续 UI 验收中确认移动端教程弹窗和战斗按钮高亮不遮挡核心地图。
- 教程文本为第一版，后续可根据玩家理解情况继续缩短或分层。
