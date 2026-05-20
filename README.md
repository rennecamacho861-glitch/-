# 照面之时

一个 2D 浏览器游戏原型：玩家在黑暗迷宫中搜集道具、判断风险，并在照面瞬间进入短促的视野、信息与战斗博弈。

## 本地运行

```bash
npm install
npm run dev
```

打开 http://127.0.0.1:5188/。

## 在线游玩部署

本仓库包含 GitHub Pages 自动部署流程：`.github/workflows/deploy-pages.yml`。

推送到 `main` 分支后，GitHub Actions 会自动执行：

```bash
npm ci
npm run build
```

构建产物会从 `dist/` 发布到 GitHub Pages。首次使用时，在 GitHub 仓库的 `Settings -> Pages` 中把 Source 设为 `GitHub Actions`。
