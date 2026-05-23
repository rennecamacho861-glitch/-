# Evidence Blocked: v0.4 Browser Screenshot

- 日期：2026-05-08
- 目标：为 HUD / playfield 可读性保存桌面截图证据
- 状态：Blocked

## 尝试

- `npx playwright --version`：失败，npm cache 目录权限错误，无法拉取或调用 Playwright。
- Chrome headless screenshot：命令返回但没有产出截图文件。
- Edge headless screenshot：命令返回但没有产出截图文件。

## 已完成的替代检查

- `GET http://127.0.0.1:5173/` 返回 200。
- `npm test` 通过。
- `npm run build` 通过。

## 后续

在具备 Browser / Playwright 工具或可用 headless screenshot 环境后，补：

- 桌面 1280x800 初始探索截图。
- 移动宽度 390x844 初始探索截图。
- 一张遭遇战斗面板截图。
