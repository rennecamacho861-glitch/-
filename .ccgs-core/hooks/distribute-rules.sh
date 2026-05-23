#!/bin/bash
# ============================================================================
# distribute-rules.sh — CCGS 规则自动分发脚本（通用引擎，零硬编码）
# ============================================================================
# 用途: 从 .ccgs-core/rules/*.md 源文件自动生成各 IDE 的规则文件
# 映射关系从 hooks-config.yaml 的 rules_mapping 段读取
# 
# 用法:
#   bash .ccgs-core/hooks/distribute-rules.sh cline    # 生成 .clinerules
#   bash .ccgs-core/hooks/distribute-rules.sh cursor   # 生成 .cursorrules
#   bash .ccgs-core/hooks/distribute-rules.sh all      # 生成所有格式
#   bash .ccgs-core/hooks/distribute-rules.sh clean    # 清理所有生成的规则文件
#
# 退出码: 0 = 成功, 1 = 配置错误
# 兼容性: POSIX (macOS / Linux)
# ============================================================================

set -euo pipefail

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
CONFIG="$PROJECT_ROOT/.ccgs-core/hooks/hooks-config.yaml"
RULES_DIR="$PROJECT_ROOT/.ccgs-core/rules"
TARGET_IDE="${1:-all}"

# --- IDE → 文件名映射 ---
filename_for_ide() {
    case "$1" in
        cline)  echo ".clinerules" ;;
        cursor) echo ".cursorrules" ;;
        *)      echo "" ;;
    esac
}

# --- 自动生成声明头部 ---
generate_header() {
    local source_name="$1"
    local ide_name="$2"
    cat << EOF
# ============================================================
# ⚠️ 此文件由 distribute-rules.sh 自动生成，禁止手动编辑
# 源文件: .ccgs-core/rules/${source_name}
# 目标 IDE: ${ide_name}
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# 重新生成: bash .ccgs-core/hooks/distribute-rules.sh ${ide_name}
# ============================================================

EOF
}

# --- 检查前置条件 ---
if [ ! -f "$CONFIG" ]; then
    echo "❌ 错误: 未找到配置文件 $CONFIG" >&2
    exit 1
fi

if [ ! -d "$RULES_DIR" ]; then
    echo "❌ 错误: 未找到规则源文件目录 $RULES_DIR" >&2
    exit 1
fi

# --- 引入共享 YAML 解析库 ---
source "$PROJECT_ROOT/.ccgs-core/hooks/lib/yaml-parser.sh"

# --- 分发到指定 IDE ---
distribute_for_ide() {
    local ide="$1"
    local rule_filename
    rule_filename=$(filename_for_ide "$ide")
    
    if [ -z "$rule_filename" ]; then
        echo "⚠️  不支持的 IDE: $ide（支持: cline, cursor, all, clean）" >&2
        return 1
    fi
    
    local count=0
    
    while IFS='|' read -r source target; do
        [ -z "$source" ] && continue
        [ -z "$target" ] && continue
        
        local source_path="$RULES_DIR/$source"
        local target_dir="$PROJECT_ROOT/$target"
        local target_file="$target_dir/$rule_filename"
        
        # 检查源文件是否存在
        if [ ! -f "$source_path" ]; then
            echo "⚠️  源文件不存在，跳过: $source_path" >&2
            continue
        fi
        
        # 确保目标目录存在
        mkdir -p "$target_dir"
        
        # 生成规则文件（头部声明 + 源文件内容）
        generate_header "$source" "$ide" > "$target_file"
        cat "$source_path" >> "$target_file"
        
        count=$((count + 1))
        echo "  ✅ $target/$rule_filename ← $source"
    done <<< "$(yaml_parse_rules_mapping "$CONFIG")"
    
    echo "  📊 共分发 $count 条规则 → $ide 格式"
}

# --- 清理所有生成的规则文件 ---
clean_rules() {
    local count=0
    
    while IFS='|' read -r source target; do
        [ -z "$source" ] && continue
        [ -z "$target" ] && continue
        
        local target_dir="$PROJECT_ROOT/$target"
        
        for rule_file in ".clinerules" ".cursorrules"; do
            if [ -f "$target_dir/$rule_file" ]; then
                rm "$target_dir/$rule_file"
                echo "  🗑️  已删除: $target/$rule_file"
                count=$((count + 1))
            fi
        done
    done <<< "$(yaml_parse_rules_mapping "$CONFIG")"
    
    echo "  📊 共清理 $count 个规则文件"
}

# ============================================================================
# 主执行逻辑
# ============================================================================

echo "🔄 CCGS 规则分发 (IDE: $TARGET_IDE)"
echo "   配置: $CONFIG"
echo "   源文件: $RULES_DIR/"
echo ""

case "$TARGET_IDE" in
    cline)
        distribute_for_ide "cline"
        ;;
    cursor)
        distribute_for_ide "cursor"
        ;;
    all)
        echo "--- Cline ---"
        distribute_for_ide "cline"
        echo ""
        echo "--- Cursor ---"
        distribute_for_ide "cursor"
        ;;
    clean)
        clean_rules
        ;;
    *)
        echo "❌ 未知参数: $TARGET_IDE" >&2
        echo "   用法: bash distribute-rules.sh [cline|cursor|all|clean]" >&2
        exit 1
        ;;
esac

echo ""
echo "🎯 分发完成！"
echo "   💡 提示: 生成的规则文件已加入 .gitignore，可随时重新生成"
