#!/bin/bash
# ============================================================================
# install-hooks.sh — CCGS Git Hooks 一键安装脚本
# ============================================================================
# 用途: 将 .ccgs-core/hooks/ 下的校验脚本安装为 Git Hooks
# 创建符号链接到 .git/hooks/ 目录
# 同时安装 commit-msg 钩子用于校验 commit message 格式
# 兼容性: POSIX (macOS / Linux)
# ============================================================================

set -euo pipefail

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
if [ -z "$PROJECT_ROOT" ]; then
    echo "❌ 错误: 当前目录不是 Git 仓库" >&2
    exit 1
fi

HOOKS_SRC="$PROJECT_ROOT/.ccgs-core/hooks"
HOOKS_DST="$PROJECT_ROOT/.git/hooks"
CONFIG="$HOOKS_SRC/hooks-config.yaml"

# --- 检查前置条件 ---
if [ ! -d "$HOOKS_SRC" ]; then
    echo "❌ 错误: 未找到 $HOOKS_SRC 目录" >&2
    exit 1
fi

if [ ! -f "$CONFIG" ]; then
    echo "❌ 错误: 未找到配置文件 $CONFIG" >&2
    exit 1
fi

# --- 检查模式 (--check) ---
if [ "${1:-}" = "--check" ]; then
    ERR=0
    # 检查钩子脚本是否有执行权限
    for hook in validate-commit.sh validate-push.sh validate-assets.sh; do
        if [ ! -x "$HOOKS_SRC/$hook" ]; then
            echo "❌ 错误: $HOOKS_SRC/$hook 没有执行权限"
            ERR=1
        fi
    done
    
    # 检查 Git 钩子是否指向我们的脚本
    PRE_COMMIT="$HOOKS_DST/pre-commit"
    if [ ! -L "$PRE_COMMIT" ] || [ "$(readlink "$PRE_COMMIT")" != "$HOOKS_SRC/validate-commit.sh" ]; then
        echo "❌ 错误: pre-commit 钩子未正确安装或不是预期的符号链接"
        ERR=1
    fi
    
    PRE_PUSH="$HOOKS_DST/pre-push"
    if [ ! -L "$PRE_PUSH" ] || [ "$(readlink "$PRE_PUSH")" != "$HOOKS_SRC/validate-push.sh" ]; then
        echo "❌ 错误: pre-push 钩子未正确安装或不是预期的符号链接"
        ERR=1
    fi
    
    COMMIT_MSG="$HOOKS_DST/commit-msg"
    if [ ! -x "$COMMIT_MSG" ] || ! grep -q "CCGS commit-msg" "$COMMIT_MSG" 2>/dev/null; then
        echo "❌ 错误: commit-msg 钩子未正确安装或没有执行权限"
        ERR=1
    fi
    
    if [ "$ERR" -eq 0 ]; then
        echo "✅ CCGS Git Hooks 已正确安装并具备执行权限"
        exit 0
    else
        echo "⚠️  请运行: bash .ccgs-core/hooks/install-hooks.sh 进行安装或修复"
        exit 1
    fi
fi

# --- 确保 .git/hooks 目录存在 ---
mkdir -p "$HOOKS_DST"

# --- 设置脚本可执行权限 ---
chmod +x "$HOOKS_SRC/validate-commit.sh" 2>/dev/null || true
chmod +x "$HOOKS_SRC/validate-push.sh" 2>/dev/null || true
chmod +x "$HOOKS_SRC/validate-assets.sh" 2>/dev/null || true

# --- 安装 pre-commit 钩子 ---
PRE_COMMIT="$HOOKS_DST/pre-commit"
if [ -f "$PRE_COMMIT" ] && [ ! -L "$PRE_COMMIT" ]; then
    echo "⚠️  已存在非符号链接的 pre-commit 钩子，备份为 pre-commit.backup"
    mv "$PRE_COMMIT" "${PRE_COMMIT}.backup"
fi
ln -sf "$HOOKS_SRC/validate-commit.sh" "$PRE_COMMIT"
echo "✅ pre-commit → validate-commit.sh"

# --- 安装 commit-msg 钩子（校验 commit message 格式）---
COMMIT_MSG_HOOK="$HOOKS_DST/commit-msg"

# 从配置读取 commit message 正则
COMMIT_PATTERN=$(grep '^[[:space:]]*pattern:' "$CONFIG" 2>/dev/null | head -1 | sed 's/^[[:space:]]*pattern:[[:space:]]*//' | sed 's/^"//;s/"$//' | sed "s/^'//;s/'$//")
COMMIT_PATTERN=${COMMIT_PATTERN:-'^(feat|fix|docs|style|refactor|perf|test|chore|hotfix|epic)\(.+\): .+'}

if [ -f "$COMMIT_MSG_HOOK" ] && [ ! -L "$COMMIT_MSG_HOOK" ]; then
    echo "⚠️  已存在非符号链接的 commit-msg 钩子，备份为 commit-msg.backup"
    mv "$COMMIT_MSG_HOOK" "${COMMIT_MSG_HOOK}.backup"
fi

# 生成 commit-msg 钩子脚本（内联，因为它很短）
cat > "$COMMIT_MSG_HOOK" << 'HOOK_EOF'
#!/bin/bash
# CCGS commit-msg 钩子 — 校验 commit message 格式
# 由 install-hooks.sh 自动生成

MSG_FILE="$1"
MSG=$(head -1 "$MSG_FILE")

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
CONFIG="$PROJECT_ROOT/.ccgs-core/hooks/hooks-config.yaml"

# 从配置读取正则
PATTERN=$(grep '^[[:space:]]*pattern:' "$CONFIG" 2>/dev/null | head -1 | sed 's/^[[:space:]]*pattern:[[:space:]]*//' | sed 's/^"//;s/"$//' | sed "s/^'//;s/'$//")
PATTERN=${PATTERN:-'^(feat|fix|docs|style|refactor|perf|test|chore|hotfix|epic)\(.+\): .+'}

# 跳过 merge commit 和 rebase
if echo "$MSG" | grep -qE '^(Merge|Revert|fixup!|squash!)'; then
    exit 0
fi

if ! echo "$MSG" | grep -qE "$PATTERN"; then
    echo "" >&2
    echo "❌ [CCGS] Commit message 格式不合规" >&2
    echo "   收到: $MSG" >&2
    echo "   格式: type(scope): description" >&2
    echo "   类型: feat|fix|docs|style|refactor|perf|test|chore|hotfix|epic" >&2
    echo "   示例: feat(塔系统): 新增旋转吸附动画" >&2
    echo "         fix(DDA): 修复心流通道计算溢出" >&2
    echo "" >&2
    exit 1
fi

exit 0
HOOK_EOF
chmod +x "$COMMIT_MSG_HOOK"
echo "✅ commit-msg → 格式校验（从配置读取正则）"

# --- 安装 pre-push 钩子 ---
PRE_PUSH="$HOOKS_DST/pre-push"
if [ -f "$PRE_PUSH" ] && [ ! -L "$PRE_PUSH" ]; then
    echo "⚠️  已存在非符号链接的 pre-push 钩子，备份为 pre-push.backup"
    mv "$PRE_PUSH" "${PRE_PUSH}.backup"
fi
ln -sf "$HOOKS_SRC/validate-push.sh" "$PRE_PUSH"
echo "✅ pre-push → validate-push.sh"

# --- 完成 ---
echo ""
echo "🎉 CCGS Git Hooks 安装完成！"
echo "   配置文件: $CONFIG"
echo "   安装位置: $HOOKS_DST/"
echo ""
echo "   已安装的钩子:"
echo "   • pre-commit  — 文件格式校验 + GDD 章节检查 + 资产命名"
echo "   • commit-msg  — Commit message 格式校验"
echo "   • pre-push    — Push 安全提醒"
echo ""
echo "   卸载方法: rm $HOOKS_DST/{pre-commit,commit-msg,pre-push}"
