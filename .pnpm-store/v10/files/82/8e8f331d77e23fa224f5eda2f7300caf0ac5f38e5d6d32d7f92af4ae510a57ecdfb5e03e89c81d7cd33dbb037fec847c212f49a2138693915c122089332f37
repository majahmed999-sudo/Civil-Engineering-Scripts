import { JobInterpolationContext, StaticJobInterpolationContext } from '@expo/eas-build-job';
import { bunyan } from '@expo/logger';
import { BuildRuntimePlatform } from './BuildRuntimePlatform';
import { BuildStep, SerializedBuildStepOutputAccessor } from './BuildStep';
import { BuildStepEnv } from './BuildStepEnv';
import { StepMetric, StepMetricInput, StepMetricResult, WorkflowHookMetric } from './StepMetrics';
interface SerializedExternalBuildContextProvider {
    projectSourceDirectory: string;
    projectTargetDirectory: string;
    defaultWorkingDirectory: string;
    buildLogsDirectory: string;
    runtimePlatform: BuildRuntimePlatform;
    staticContext: Omit<StaticJobInterpolationContext, 'steps'>;
    env: BuildStepEnv;
}
export interface ExternalBuildContextProvider {
    readonly projectSourceDirectory: string;
    readonly projectTargetDirectory: string;
    readonly defaultWorkingDirectory: string;
    readonly buildLogsDirectory: string;
    readonly runtimePlatform: BuildRuntimePlatform;
    readonly logger: bunyan;
    readonly staticContext: () => Omit<StaticJobInterpolationContext, 'steps'>;
    readonly env: BuildStepEnv;
    updateEnv(env: BuildStepEnv): void;
    reportStepMetric?(metric: StepMetric): void;
    reportWorkflowHookMetric?(metric: WorkflowHookMetric): void;
}
export interface SerializedBuildStepGlobalContext {
    stepsInternalBuildDirectory: string;
    stepById: Record<string, SerializedBuildStepOutputAccessor>;
    provider: SerializedExternalBuildContextProvider;
    skipCleanup: boolean;
}
export declare class BuildStepGlobalContext {
    private readonly provider;
    readonly skipCleanup: boolean;
    stepsInternalBuildDirectory: string;
    readonly runtimePlatform: BuildRuntimePlatform;
    readonly baseLogger: bunyan;
    private didCheckOut;
    private _hasAnyPreviousStepFailed;
    private stepById;
    constructor(provider: ExternalBuildContextProvider, skipCleanup: boolean);
    get projectSourceDirectory(): string;
    get projectTargetDirectory(): string;
    get defaultWorkingDirectory(): string;
    get buildLogsDirectory(): string;
    get env(): BuildStepEnv;
    get staticContext(): StaticJobInterpolationContext;
    updateEnv(updatedEnv: BuildStepEnv): void;
    registerStep(step: BuildStep): void;
    getStepOutputValue(path: string): string | undefined;
    getInterpolationContext(): JobInterpolationContext;
    /**
     * One builder for both step-level and hook-entry-level `if:` contexts so
     * the two cannot drift; the real differences (step inputs, step-level env
     * overrides) ride in as parameters.
     */
    getIfConditionContext({ inputs, env, }: {
        inputs: Record<string, unknown>;
        env: BuildStepEnv;
    }): Record<string, unknown>;
    private getEasContext;
    interpolate<InterpolableType extends string | object>(value: InterpolableType): InterpolableType;
    stepCtx(options: {
        logger: bunyan;
        relativeWorkingDirectory?: string;
    }): BuildStepContext;
    markAsCheckedOut(logger: bunyan): void;
    get hasAnyPreviousStepFailed(): boolean;
    markAsFailed(): void;
    addStepMetric(metric: StepMetricInput): void;
    collectStepMetric(step: BuildStep, result: StepMetricResult, durationMs: number): void;
    reportWorkflowHookMetric(metric: WorkflowHookMetric): void;
    wasCheckedOut(): boolean;
    hashFiles(...patterns: string[]): string;
    serialize(): SerializedBuildStepGlobalContext;
    static deserialize(serialized: SerializedBuildStepGlobalContext, logger: bunyan): BuildStepGlobalContext;
}
export interface SerializedBuildStepContext {
    relativeWorkingDirectory?: string;
    global: SerializedBuildStepGlobalContext;
}
export declare class BuildStepContext {
    private readonly ctx;
    readonly logger: bunyan;
    readonly relativeWorkingDirectory?: string;
    constructor(ctx: BuildStepGlobalContext, { logger, relativeWorkingDirectory, }: {
        logger: bunyan;
        relativeWorkingDirectory?: string;
    });
    get global(): BuildStepGlobalContext;
    get workingDirectory(): string;
    serialize(): SerializedBuildStepContext;
    static deserialize(serialized: SerializedBuildStepContext, logger: bunyan): BuildStepContext;
}
export {};
