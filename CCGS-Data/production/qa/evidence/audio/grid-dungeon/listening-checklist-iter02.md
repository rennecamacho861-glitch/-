# Grid Dungeon 音效试听抽查清单 Iter02

日期：2026-05-12  
范围：Foley 风格占位音效、战斗交互过程音、BGM loop  
状态：READY_FOR_MANUAL_LISTENING

## 试听重点

- 不应像 8-bit、chiptune 或明显合成电子提示音。
- 应更像低武废土中的真实材料：金属、碎石、湿地、皮革、布料、钝击、呼吸、弹壳。
- 战斗过程要能听出“挥击/撞刀/擦过/命中/防御/推搡/后撤”的阶段，不只是一声结果音。
- BGM 要退后，不能抢过脚步、枪声、陷阱和重伤。

## 抽查样本

| 场景 | 文件 | 预期听感 |
|---|---|---|
| 金属脚步 | `public/assets/audio/grid-dungeon/sfx_explore_footstep_metal_01.wav` | 鞋底踩旧金属，有轻微金属和灰尘。 |
| 碎石脚步 | `public/assets/audio/grid-dungeon/sfx_explore_footstep_rubble_01.wav` | 碎石颗粒感，不像按钮点击。 |
| 撞墙 | `public/assets/audio/grid-dungeon/sfx_explore_wall_bump_01.wav` | 低频硬碰 + 墙皮粉尘。 |
| 照面 | `public/assets/audio/grid-dungeon/sfx_combat_faceoff_01.wav` | 像牌桌落注，但仍保留低武压迫。 |
| 敌人靠近 | `public/assets/audio/grid-dungeon/sfx_combat_enemy_step_close_01.wav` | 墙后闷步，不泄露装备。 |
| 武器预备 | `public/assets/audio/grid-dungeon/sfx_combat_weapon_ready_01.wav` | 金属和刮擦，提示姿态变化。 |
| 挥击 | `public/assets/audio/grid-dungeon/sfx_combat_melee_swing_01.wav` | 布料和刀风，不电子。 |
| 撞刀 | `public/assets/audio/grid-dungeon/sfx_combat_melee_clash_01.wav` | 清楚的金属碰撞，可和命中区分。 |
| 命中 | `public/assets/audio/grid-dungeon/sfx_combat_melee_hit_01.wav` | 钝击 + 少量金属，不夸张。 |
| 重伤 | `public/assets/audio/grid-dungeon/sfx_combat_heavy_wound_01.wav` | 更重、更低、更危险，但不爆音。 |
| 手枪 | `public/assets/audio/grid-dungeon/sfx_item_pistol_fire_01.wav` | 短枪声 + 弹壳感，不电影化长尾。 |
| 陷阱 | `public/assets/audio/grid-dungeon/sfx_item_trap_trigger_01.wav` | 机械簧片/警觉感，能提示危险。 |
| 探索 BGM | `public/assets/audio/grid-dungeon/music_exploration_bed_loop_01.wav` | 低频、滴水、远处金属，能循环。 |
| 战斗 BGM | `public/assets/audio/grid-dungeon/music_combat_tension_loop_01.wav` | 低频脉冲和稀疏金属，保持紧张。 |
| 优势 BGM | `public/assets/audio/grid-dungeon/music_advantage_pulse_loop_01.wav` | 牌桌脉冲感，不像胜利音乐。 |

## 判定

- PASS：真实材料感增强，战斗交互更完整，BGM 不抢信息。
- REVISE：仍像电子提示、过亮、过尖、过长、枪声太电影化、BGM 太满。
- BLOCK：关键信息只靠声音，没有视觉替代。

## 自动化结果

- `validate-grid-dungeon-sfx.mjs` 已通过 WAV header、时长、削波、manifest 一致性和 critical cue 视觉替代检查。
