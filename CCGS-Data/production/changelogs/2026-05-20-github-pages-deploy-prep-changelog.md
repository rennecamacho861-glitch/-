# GitHub Pages 可游玩部署准备 Changelog

日期：2026-05-20  
范围：将当前游戏整理为可推送到 GitHub 并通过 Pages 自动部署的仓库快照。

## 变更摘要

- 初始化本地 Git 仓库，默认分支为 `main`。
- 新增 `.github/workflows/deploy-pages.yml`，推送到 `main` 后自动执行 `npm ci`、`npm test`、`npm run build` 并发布 `dist/` 到 GitHub Pages。
- `vite.config.ts` 增加 `base: "./"`，使构建产物可在 GitHub Pages 子路径下运行。
- `src/render/gridDungeonAssets.ts` 改为使用 `import.meta.env.BASE_URL` 拼接资源路径，避免部署到仓库子路径时素材 404。
- 新增 `src/vite-env.d.ts`，补齐 Vite 环境变量类型。
- `README.md` 增加在线游玩部署说明。

## 验证

- `npm test`：119 项通过。
- `npm run build`：通过。

## 当前阻塞

- 本机未安装 GitHub CLI。
- 当前 GitHub 连接器未列出可访问仓库。
- 仍需要目标 GitHub 仓库 URL 才能执行 `git remote add origin ...` 与 `git push -u origin main`。
