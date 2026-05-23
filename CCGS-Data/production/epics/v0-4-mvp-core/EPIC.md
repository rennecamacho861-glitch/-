---
epic: "v0-4-mvp-core"
title: "v0.4 MVP Core Systems"
status: "In Review"
layer: "Foundation/Core"
owner: "Technical Director"
phase: "P1"
gdd: "CCGS-Data/design/gdd/rulebook.md"
architecture_module: "Simulation Core"
---
# Epic: v0.4 MVP Core Systems

> **Proposal**: `CCGS-Data/production/proposals/2026-05-08-v0-4-rules-to-mvp-implementation-proposal.md`

## Overview

本 Epic 将规则书 v0.4 的核心体验落到当前 Phaser + TypeScript 原型：先建立测试入口，再统一属性、局内状态、地图探索、视野信息和照面战斗，最后接入第一批道具、敌人行为与 HUD 信息呈现。

## Governing ADRs

| ADR | Decision Summary | Engine Risk |
|---|---|---|
| ADR-0001: v0.4 模拟层边界与测试优先 | `src/sim` 是规则真源；渲染和 HUD 只读状态与派发输入；Logic / Integration Story 先补测试证据。 | LOW |

## GDD Requirements

| TR-ID | Requirement | ADR Coverage |
|---|---|---|
| TR-TEST-001 | 建立自动化测试入口 | ADR-0001 |
| TR-RUN-001 | 一局 5-10 分钟搜打撤闭环 | ADR-0001 |
| TR-RUN-002 | 时间、危险、撤离、失败 | ADR-0001 |
| TR-STATS-001 | 五项属性与派生值公式 | ADR-0001 |
| TR-MAP-001 | 俯视角格子地图与可读探索状态 | ADR-0001 |
| TR-VISION-001 | 视野领先与远程先手提示 | ADR-0001 |
| TR-INTEL-001 | 信息获取与揭示 | ADR-0001 |
| TR-COMBAT-001 | 2-4 回合照面出口 | ADR-0001 |
| TR-COMBAT-002 | 基础动作与道具动作 | ADR-0001 |
| TR-COMBAT-003 | 逃跑与说服 | ADR-0001 |
| TR-ITEM-001 | 第一批道具效果 | ADR-0001 |
| TR-AI-001 | 敌人预算与倾向 | ADR-0001 |
| TR-UI-001 | HUD 与战斗面板信息 | ADR-0001 |
| TR-ARCH-001 | sim/render/HUD 边界 | ADR-0001 |

## Stories

| # | Story | Type | Status | Owner |
|---|---|---|---|---|
| 001 | 建立 sim 测试入口 | Logic | Done | gameplay-programmer |
| 002 | 统一角色属性与派生值 | Logic | Done | gameplay-programmer |
| 003 | 局内状态、撤离与失败闭环 | Integration | Done | gameplay-programmer |
| 004 | 地图探索、搜索与遭遇触发 | Integration | Done | gameplay-programmer |
| 005 | 视野与信息系统 | Logic | Done | gameplay-programmer |
| 006 | 照面战斗状态机 | Integration | Done | gameplay-programmer |
| 007 | v0.4 道具效果 | Integration | Done | gameplay-programmer |
| 008 | 敌人 AI MVP 行为 | Integration | Done | ai-programmer |
| 009 | HUD 与战斗面板对齐 | UI | Done | ui-programmer |
| 010 | QA 冒烟与 Playtest 记录 | Integration | Blocked: browser screenshot evidence | qa-lead |

## Asset Dependencies

- Visual Assets：继续使用色块/符号占位。
- UI/UX Assets：按钮、状态文本、信息列表可用 DOM 占位。
- Audio/VFX：MVP 不依赖音频。

## Definition of Done

This epic is complete when:

- 10 个 Story 全部完成并通过 `/story-done` 等价验收。
- `npm run build` 通过。
- Logic / Integration Story 有自动化测试证据。
- HUD / UI Story 有浏览器截图或手动证据。
- 规则书 v0.4 的 Acceptance Criteria 全部可在原型中验证。
