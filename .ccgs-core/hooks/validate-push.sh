#!/bin/bash
# ============================================================================
# validate-push.sh — CCGS pre-push 钩子
# ============================================================================
# 用途: 检测到 git push 时输出警告提醒
# 绝不自动执行 push，仅作为安全提醒
# 退出码: 0 = 允许（带警告），不阻塞手动 push
# 兼容性: POSIX (macOS / Linux)
# ============================================================================

# 当前分支
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# --- 引入共享 YAML 解析库 ---
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
source "$PROJECT_ROOT/.ccgs-core/hooks/lib/yaml-parser.sh"
CONFIG="$PROJECT_ROOT/.ccgs-core/hooks/hooks-config.yaml"

# 受保护的分支列表
PROTECTED_BRANCHES=$(yaml_get_list "$CONFIG" "push_protection" "protected_branches")
if [ -z "$PROTECTED_BRANCHES" ]; then
    PROTECTED_BRANCHES="main master develop"
fi

MATCHED=""
for branch in $PROTECTED_BRANCHES; do
    if [ "$CURRENT_BRANCH" = "$branch" ]; then
        MATCHED="$branch"
        break
    fi
done

if [ -n "$MATCHED" ]; then
    echo "⚠️  [CCGS] 正在推送到受保护分支: '$MATCHED'" >&2
    echo "   请确认: 构建通过、测试通过、无 S1/S2 级 Bug" >&2
    echo "   提醒: CCGS 协议要求所有 push 必须由人工手动执行" >&2
    # 允许推送但带警告 — 如需阻塞请取消下方注释:
    # echo "❌ BLOCKED: 请先运行测试再推送到 $MATCHED" >&2
    # exit 1
fi

exit 0
