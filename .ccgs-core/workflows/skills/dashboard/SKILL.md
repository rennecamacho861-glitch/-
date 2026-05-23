---
name: dashboard
description: "Starts a local HTTP server and opens a visually stunning browser dashboard to view the project's global status, burndown, and health."
argument-hint: "[no arguments]"
user-invocable: true
allowed-tools: RunCommand
agent: producer
---

# Project Dashboard

This skill launches the visual project dashboard.

## Instructions
1. Run the dashboard python script in the background. Note that this script blocks and runs a server until closed.
2. Command: `python3 .ccgs-core/scripts/dashboard/dashboard.py`
3. Tell the user that the dashboard has been launched in their browser.
4. The server will keep running in the terminal. The user can exit it (Ctrl+C) when they are done.
