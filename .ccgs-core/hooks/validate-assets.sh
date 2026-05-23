#!/bin/bash
# ============================================================================
# validate-assets.sh — CCGS 资产命名规范检查（通用引擎，零硬编码）
# ============================================================================
# 用途: 检查资产文件命名是否符合规范（小写+下划线）
# 所有参数从 hooks-config.yaml 读取
# 可独立运行，也可被 validate-commit.sh 调用
# 退出码: 0 = 通过（可能有警告），不阻塞提交
# 兼容性: POSIX (macOS / Linux)
# ============================================================================

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
CONFIG="$PROJECT_ROOT/.ccgs-core/hooks/hooks-config.yaml"

# --- 如果是被 validate-commit.sh 调用，从参数接收文件列表 ---
if [ -n "$1" ]; then
    STAGED="$1"
else
    STAGED=$(git diff --cached --name-only 2>/dev/null)
fi

if [ -z "$STAGED" ]; then
    exit 0
fi

# --- 引入共享 YAML 解析库 ---
source "$PROJECT_ROOT/.ccgs-core/hooks/lib/yaml-parser.sh"

# --- 从配置读取资产路径 ---
ASSET_PATHS=$(yaml_get_list "$CONFIG" "asset_naming" "paths")
if [ -z "$ASSET_PATHS" ]; then
    ASSET_PATHS="Assets/"
fi

NAMING_PATTERN=$(yaml_get_value "$CONFIG" "asset_naming" "pattern" "^[a-z0-9_]+\.[a-z]+$")

WARNINGS=""

# --- 检查每个暂存文件 ---
while IFS= read -r staged_file; do
    [ -z "$staged_file" ] && continue
    
    # 检查文件是否在资产目录下
    is_asset=0
    while IFS= read -r asset_path; do
        [ -z "$asset_path" ] && continue
        if echo "$staged_file" | grep -qE "^${asset_path}"; then
            is_asset=1
            break
        fi
    done <<< "$(echo -e "$ASSET_PATHS")"

    if [ "$is_asset" -eq 1 ]; then
        filename=$(basename "$staged_file")
        # 跳过隐藏文件和元数据文件
        if echo "$filename" | grep -qE '^\.' ; then
            continue
        fi
        # 跳过 .meta 文件（Unity 特有）
        if echo "$filename" | grep -qE '\.meta$'; then
            continue
        fi
        # 检查命名规范
        if ! echo "$filename" | grep -qE "$NAMING_PATTERN"; then
            WARNINGS="${WARNINGS}\n  命名规范: $staged_file (建议: 小写字母+下划线，如 my_asset.png)"
        fi
    fi
done <<< "$STAGED"

if [ -n "$WARNINGS" ]; then
    echo -e "  [资产命名检查]$WARNINGS" >&2
fi

exit 0
