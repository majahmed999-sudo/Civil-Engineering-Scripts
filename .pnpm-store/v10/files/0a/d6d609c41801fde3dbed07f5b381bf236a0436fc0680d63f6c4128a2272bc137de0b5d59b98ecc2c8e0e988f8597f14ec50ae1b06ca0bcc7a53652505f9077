import { HookAnchorId, ShellStep, Step } from '@expo/eas-build-job';
import { BuildFunction, BuildFunctionById } from './BuildFunction';
import { BuildFunctionGroup, BuildFunctionGroupById } from './BuildFunctionGroup';
import { BuildStep } from './BuildStep';
import { BuildStepGlobalContext } from './BuildStepContext';
/**
 * One entry per AUTHORED hook step — the unit the user wrote. The wrapper
 * earns its place twice. (1) A function-group call vanishes at expansion, so
 * the entry is the authored `if:`'s only home, evaluated once for the whole
 * group; `run:` and single-function entries keep the `if:` on the step itself
 * — the condition never exists in two places. Entry conditions see the global
 * context only; a group call's `with:` inputs are not visible to them.
 * (2) An entry whose explicit `if:` passed behaves like a single step whose
 * `if:` passed: its no-`if:` steps run past earlier entries' failures, while
 * within-entry failures still skip later siblings.
 */
export interface HookEntry {
    steps: BuildStep[];
    ifCondition?: string;
}
/**
 * The hook entries attached to one anchor step occurrence. Carries the anchor
 * id because a stamped anchor is not reverse-derivable from a `BuildStep`.
 */
export interface AnchorHooks {
    anchor: HookAnchorId;
    before: HookEntry[];
    after: HookEntry[];
}
/**
 * Constructs hook entries from authored hook steps: ONE authored step → ONE
 * entry, anchor discovery disabled (a hook step invoking an anchored function
 * or a function group never becomes an anchor itself — no nesting). Validates
 * step shapes and function existence; the aggregate (cross-key) validation is
 * `validateHookStepsAsync`.
 *
 * Promise-returning by contract (like `validateHookStepsAsync`) even though
 * the body is synchronous: this API is pre-published for the native hook
 * runner (phase 3, not yet landed), and widening sync → async later would
 * break its callers.
 */
export declare function constructHookEntriesAsync(ctx: BuildStepGlobalContext, steps: Step[], { externalFunctions, externalFunctionGroups, }: {
    externalFunctions?: BuildFunction[];
    externalFunctionGroups?: BuildFunctionGroup[];
}): Promise<HookEntry[]>;
/**
 * Aggregate validation over an execution-ordered view of steps (unique ids,
 * output references, runtime-platform allowance). The parser runs it over
 * `job steps + hooks` (through `BuildWorkflowValidator`).
 */
export declare function validateHookStepsAsync(ctx: BuildStepGlobalContext, orderedView: readonly BuildStep[]): Promise<void>;
/** Package-internal: the parser path — steps already validated, function maps already built. */
export declare function constructHookEntriesFromValidatedSteps(ctx: BuildStepGlobalContext, validatedSteps: Step[], { buildFunctionById, buildFunctionGroupById, }: {
    buildFunctionById: BuildFunctionById;
    buildFunctionGroupById: BuildFunctionGroupById;
}): HookEntry[];
/** Package-internal: shared shell-step construction (job steps and hook steps). */
export declare function createBuildStepFromShellStep(ctx: BuildStepGlobalContext, step: ShellStep): BuildStep;
/** Package-internal. */
export declare function validateAllStepFunctionsExist(steps: Step[], { externalFunctionIds, externalFunctionGroupIds, }: {
    externalFunctionIds: string[];
    externalFunctionGroupIds: string[];
}): void;
