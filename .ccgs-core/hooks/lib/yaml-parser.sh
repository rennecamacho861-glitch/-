#!/bin/bash
# ============================================================================
# yaml-parser.sh — 轻量级纯 Bash YAML 解析库
# ============================================================================
# 供 CCGS Hooks 脚本共享使用，避免重复代码。
# 注意: 仅支持 hooks-config.yaml 中的特定简单结构，不支持全量 YAML 规范。
# ============================================================================

# 获取单值 (格式: section -> key: value)
# 用法: yaml_get_value <file> <section> <key> [default]
yaml_get_value() {
    local file="$1"
    local section="$2"
    local key="$3"
    local default="${4:-}"
    
    if [ ! -f "$file" ]; then
        echo "$default"
        return
    fi
    
    local in_section=0
    local value=""
    
    while IFS= read -r line; do
        # 检测是否进入目标段
        if echo "$line" | grep -qE "^[[:space:]]*${section}:"; then
            in_section=1
            continue
        fi
        
        # 如果在段内
        if [ "$in_section" -eq 1 ]; then
            # 跳过空行和注释
            if [ -z "$line" ] || echo "$line" | grep -qE '^[[:space:]]*#'; then
                continue
            fi
            
            # 遇到下一个顶级 key，退出 (顶级 key 没有前导空格)
            if echo "$line" | grep -qE '^[a-zA-Z_]'; then
                break
            fi
            
            # 匹配目标 key
            if echo "$line" | grep -qE "^[[:space:]]+${key}:"; then
                value=$(echo "$line" | sed "s/.*${key}:[[:space:]]*//" | sed 's/^"//;s/"$//' | sed "s/^'//;s/'$//")
                break
            fi
        fi
    done < "$file"
    
    if [ -n "$value" ]; then
        echo "$value"
    else
        echo "$default"
    fi
}

# 获取列表项 (格式: section -> list_key -> - item)
# 如果没有 list_key（直接在 section 下的列表），传入空字符串即可
# 用法: yaml_get_list <file> <section> [list_key]
yaml_get_list() {
    local file="$1"
    local section="$2"
    local list_key="${3:-}"
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    local in_section=0
    local in_list=0
    
    # 如果没有 list_key，直接认为进入了 section 就在 list 中
    if [ -z "$list_key" ]; then
        in_list=1
    fi
    
    while IFS= read -r line; do
        # 寻找顶级 section
        if [ "$in_section" -eq 0 ]; then
            if echo "$line" | grep -qE "^[[:space:]]*${section}:"; then
                in_section=1
            fi
            continue
        fi
        
        # 在 section 内
        if [ "$in_section" -eq 1 ]; then
            # 遇到下一个顶级 key，退出
            if echo "$line" | grep -qE '^[a-zA-Z_]'; then
                break
            fi
            
            # 如果需要寻找次级 list_key
            if [ "$in_list" -eq 0 ]; then
                if echo "$line" | grep -qE "^[[:space:]]+${list_key}:"; then
                    in_list=1
                fi
                continue
            fi
            
            # 在 list 内读取 - item
            if [ "$in_list" -eq 1 ]; then
                if echo "$line" | grep -qE '^[[:space:]]+- '; then
                    echo "$line" | sed 's/^[[:space:]]*- //' | sed 's/^"//;s/"$//' | sed "s/^'//;s/'$//"
                elif echo "$line" | grep -qE '^[[:space:]]+[a-zA-Z_]+:'; then
                    # 遇到同级的其他 key，说明列表结束
                    break
                fi
            fi
        fi
    done < "$file"
}

# 解析 rules_mapping 对象列表
# 用法: yaml_parse_rules_mapping <file>
yaml_parse_rules_mapping() {
    local file="$1"
    local in_mapping=0
    local current_source=""
    local current_target=""
    local ended_by_break=0
    
    if [ ! -f "$file" ]; then
        return
    fi
    
    while IFS= read -r line; do
        if echo "$line" | grep -qE '^rules_mapping:'; then
            in_mapping=1
            continue
        fi
        
        if [ "$in_mapping" -eq 1 ]; then
            if [ -z "$line" ] || echo "$line" | grep -qE '^[[:space:]]*#'; then
                continue
            fi
            
            if echo "$line" | grep -qE '^[a-zA-Z_]'; then
                if [ -n "$current_source" ] && [ -n "$current_target" ]; then
                    echo "${current_source}|${current_target}"
                fi
                ended_by_break=1
                break
            fi
            
            if echo "$line" | grep -qE '[[:space:]]source:'; then
                if [ -n "$current_source" ] && [ -n "$current_target" ]; then
                    echo "${current_source}|${current_target}"
                fi
                current_source=$(echo "$line" | sed 's/.*source:[[:space:]]*//' | sed 's/^"//;s/"$//' | sed "s/^'//;s/'$//")
                current_target=""
            fi
            
            if echo "$line" | grep -qE '[[:space:]]target:'; then
                current_target=$(echo "$line" | sed 's/.*target:[[:space:]]*//' | sed 's/^"//;s/"$//' | sed "s/^'//;s/'$//")
            fi
        fi
    done < "$file"
    
    if [ "$ended_by_break" -eq 0 ] && [ "$in_mapping" -eq 1 ] && [ -n "$current_source" ] && [ -n "$current_target" ]; then
        echo "${current_source}|${current_target}"
    fi
}
