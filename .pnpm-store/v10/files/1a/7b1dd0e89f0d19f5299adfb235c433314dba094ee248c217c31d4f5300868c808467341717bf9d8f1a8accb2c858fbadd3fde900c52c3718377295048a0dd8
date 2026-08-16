import { BuildRuntimePlatform } from './BuildRuntimePlatform';
import { BuildStep } from './BuildStep';
import type { BuildWorkflow } from './BuildWorkflow';
import { BuildConfigError } from './errors';
export declare class BuildWorkflowValidator {
    private readonly workflow;
    constructor(workflow: BuildWorkflow);
    validateAsync(): Promise<void>;
    private validateCustomFunctionModulesAsync;
}
/**
 * The aggregate step checks (unique ids, input/output references, runtime
 * platform allowance) over an execution-ordered view of steps. Shared by the
 * workflow validator and `validateHookStepsAsync`.
 */
export declare function collectAggregateStepErrors(steps: readonly BuildStep[], { runtimePlatform }: {
    runtimePlatform: BuildRuntimePlatform;
}): BuildConfigError[];
