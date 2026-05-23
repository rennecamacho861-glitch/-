# CCGS 规则分发策略

## 架构概述

```
.ccgs-core/rules/*.md          ← 唯一真源（手动维护）
       ↓
distribute-rules.sh         ← 自动分发脚本（通用引擎）
       ↓
hooks-config.yaml           ← 映射配置（项目特定）
       ↓
各目录/.clinerules          ← 自动生成（禁止手动编辑）
各目录/.cursorrules         ← 自动生成（禁止手动编辑）
```

## 规则源文件

| 文件 | 适用领域 | 核心要求 |
|:---|:---|:---|
| `gameplay-code.md` | 玩法代码 | 数值配置化、逻辑与表现分离 |
| `engine-code.md` | 引擎/框架代码 | 禁止直接依赖业务层、接口隔离 |
| `ai-code.md` | AI 行为代码 | 行为树/状态机、可调试性 |
| `ui-code.md` | UI 代码 | 数据绑定分离、响应式布局 |
| `shader-code.md` | 着色器代码 | 性能预算、跨平台兼容 |
| `network-code.md` | 网络代码 | 权威服务器、带宽优化 |
| `narrative.md` | 叙事文档 | 分支一致性、本地化就绪 |
| `prototype-code.md` | 原型代码 | 隔离性、可丢弃性 |
| `design-docs.md` | GDD 设计文档 | 章节完整性、交叉引用一致性 |
| `data-files.md` | 配置/数据文件 | 格式合法性、版本号同步 |
| `test-standards.md` | 测试代码 | 命名规范、断言覆盖率 |

## 使用方法

### 首次安装或换 IDE 时

```bash
# 生成 Cline 格式规则文件
bash .ccgs-core/hooks/distribute-rules.sh cline

# 生成 Cursor 格式规则文件
bash .ccgs-core/hooks/distribute-rules.sh cursor

# 同时生成所有格式
bash .ccgs-core/hooks/distribute-rules.sh all
```

### 清理生成文件

```bash
bash .ccgs-core/hooks/distribute-rules.sh clean
```

### 修改规则后

编辑 `.ccgs-core/rules/*.md` 源文件，然后重新运行分发脚本即可。
**切勿直接编辑** `.clinerules` / `.cursorrules` 文件。

## 映射配置

映射关系在 `.ccgs-core/hooks/hooks-config.yaml` 的 `rules_mapping` 段中定义：

```yaml
rules_mapping:
  - source: "gameplay-code.md"
    target: "Assets/GameScripts/GameLogic"
  - source: "engine-code.md"
    target: "Assets/GameScripts/Engine"
```

更换项目时只需修改此映射，脚本零改动。

## IDE 适配参考

| IDE / 插件 | 规则文件名 | 加载方式 |
|:---|:---|:---|
| Cline (VS Code) | `.clinerules` | 编辑该目录文件时自动注入 |
| Cursor | `.cursorrules` | 项目根或子目录级别 |
| Continue.dev | 需手动配置 `contextProviders` | 参照 Continue 文档 |
| Antigravity | `user_global` 中引用 | 全局加载 |

## 注意事项

- 生成的文件已加入 `.gitignore`，不进入版本控制
- 可随时删除并重新生成，无数据丢失风险
- 新增规则领域时，先在 `.ccgs-core/rules/` 创建源文件，再在 `hooks-config.yaml` 添加映射
