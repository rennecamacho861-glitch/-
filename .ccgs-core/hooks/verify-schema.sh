#!/bin/bash
# Wrapper for verify-schema.py

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
python3 "$SCRIPT_DIR/verify-schema.py" "$1" "$2"
exit $?
