import type { TutorialInput, TutorialScenarioState, TutorialStepId } from "../types";

export const TUTORIAL_ENEMY_ONE_ID = "tutorial-enemy-1";
export const TUTORIAL_ENEMY_TWO_ID = "tutorial-enemy-2";

type TutorialStepConfig = {
  allowedInputs: TutorialInput[];
  highlightedInput: TutorialInput;
};

const TUTORIAL_STEP_CONFIGS: Record<TutorialStepId, TutorialStepConfig> = {
  "enemy1-guard": { allowedInputs: ["attack", "defend"], highlightedInput: "defend" },
  "enemy1-direction-guard": { allowedInputs: ["defend"], highlightedInput: "defend" },
  "enemy1-dodge": { allowedInputs: ["dodge-left", "dodge-right"], highlightedInput: "dodge-left" },
  "enemy1-invest-tempo": { allowedInputs: ["pressTempo"], highlightedInput: "pressTempo" },
  "enemy1-kill": { allowedInputs: ["attack"], highlightedInput: "attack" },
  "enemy2-intel": { allowedInputs: ["defend"], highlightedInput: "defend" },
  "enemy2-persuade": { allowedInputs: ["persuade"], highlightedInput: "persuade" }
};

/** Creates the scripted tutorial state used by the simulation and HUD. */
export function createTutorialScenarioState(): TutorialScenarioState {
  return configureTutorialStep(
    {
      active: true,
      stepId: "enemy1-guard",
      allowedInputs: [],
      enemyIds: [TUTORIAL_ENEMY_ONE_ID, TUTORIAL_ENEMY_TWO_ID],
      openingLoadoutDeferred: true,
      tempoInvested: 0
    },
    "enemy1-guard"
  );
}

/** Returns true for training actors that should not use normal loot or AI rules. */
export function isTutorialEnemyId(enemyId: string | undefined): boolean {
  return enemyId === TUTORIAL_ENEMY_ONE_ID || enemyId === TUTORIAL_ENEMY_TWO_ID;
}

/** Mutates a tutorial state into a new authored step while refreshing allowed inputs. */
export function configureTutorialStep(
  scenario: TutorialScenarioState,
  stepId: TutorialStepId,
  requiredDodge: "left" | "right" | undefined = scenario.requiredDodge
): TutorialScenarioState {
  const config = TUTORIAL_STEP_CONFIGS[stepId];
  scenario.stepId = stepId;
  scenario.allowedInputs = [...config.allowedInputs];
  scenario.highlightedInput = stepId === "enemy1-dodge" && requiredDodge ? (`dodge-${requiredDodge}` as TutorialInput) : config.highlightedInput;
  scenario.requiredDodge = requiredDodge;
  return scenario;
}

/** Converts combat and advantage commands into tutorial command IDs. */
export function tutorialInputFromCombatAction(action: { type: string; direction?: "left" | "right" }): TutorialInput | undefined {
  if (action.type === "attack") return "attack";
  if (action.type === "defend") return "defend";
  if (action.type === "dodge" && action.direction) return `dodge-${action.direction}` as TutorialInput;
  return undefined;
}
