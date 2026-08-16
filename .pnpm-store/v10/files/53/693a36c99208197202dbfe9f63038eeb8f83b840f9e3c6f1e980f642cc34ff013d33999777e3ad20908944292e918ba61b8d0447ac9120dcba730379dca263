import { HookAnchorId } from '@expo/eas-build-job';
import { BuildFunctionById } from './BuildFunction';
import { BuildRuntimePlatform } from './BuildRuntimePlatform';
import { BuildStep } from './BuildStep';
import { BuildStepGlobalContext } from './BuildStepContext';
import { StepMetricResult } from './StepMetrics';
import { AnchorHooks, HookEntry } from './hooks';
export declare class BuildWorkflow {
    private readonly ctx;
    readonly buildSteps: BuildStep[];
    readonly buildFunctions: BuildFunctionById;
    readonly hooksByAnchorStep: ReadonlyMap<BuildStep, AnchorHooks>;
    constructor(ctx: BuildStepGlobalContext, { buildSteps, buildFunctions, hooksByAnchorStep, }: {
        buildSteps: BuildStep[];
        buildFunctions: BuildFunctionById;
        hooksByAnchorStep?: ReadonlyMap<BuildStep, AnchorHooks>;
    });
    get runtimePlatform(): BuildRuntimePlatform;
    /**
     * All steps in execution order: before-hooks → anchor → after-hooks per
     * occurrence. This is the validation view; execution itself walks
     * `buildSteps` and expands hooks around each anchor.
     */
    getExecutionOrderedSteps(): BuildStep[];
    executeAsync(): Promise<void>;
    private executeHookSideAsync;
}
/**
 * Executes hook entries around an anchor: the engine-public execution
 * primitive. Catches condition-evaluation errors AND execution errors, marks
 * global failure, preserves the FIRST local error, and reports ONE
 * `WorkflowHookMetric` per executed hook side.
 *
 * Default-run rules (a step or entry with no `if:`):
 * - `before`: runs unless a failure occurred within THIS hook sequence;
 *   failures predating the call are ignored — "runs iff the anchor runs".
 * - `after`: runs unconditionally — past the anchor's own failure AND past an
 *   earlier after-entry's failure.
 * A user `if:` is always evaluated against the real global context, so
 * `failure()` / `success()` keep their global meaning on both sides.
 */
export declare function executeHookStepsAsync(ctx: BuildStepGlobalContext, entries: HookEntry[], options: {
    anchor: HookAnchorId;
    timing: 'before' | 'after';
    /** The anchor's LOCAL outcome; set by the caller on after-timing calls. */
    anchorResult?: StepMetricResult;
}): Promise<{
    failedLocally: boolean;
    firstError: unknown;
}>;
