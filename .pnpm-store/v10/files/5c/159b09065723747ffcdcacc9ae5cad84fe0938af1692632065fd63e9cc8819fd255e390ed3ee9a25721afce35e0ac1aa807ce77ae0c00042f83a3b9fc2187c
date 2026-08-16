import { HookAnchorId } from '@expo/eas-build-job';
import { BuildRuntimePlatform } from './BuildRuntimePlatform';
import { BuildStepContext, BuildStepGlobalContext } from './BuildStepContext';
import { BuildStepEnv } from './BuildStepEnv';
import { BuildStepInput } from './BuildStepInput';
import { BuildStepOutput, BuildStepOutputById, SerializedBuildStepOutput } from './BuildStepOutput';
export declare enum BuildStepStatus {
    NEW = "new",
    IN_PROGRESS = "in-progress",
    SKIPPED = "skipped",
    FAIL = "fail",
    WARNING = "warning",
    SUCCESS = "success"
}
export declare enum BuildStepLogMarker {
    START_STEP = "start-step",
    END_STEP = "end-step"
}
export type BuildStepFunction = (ctx: BuildStepContext, { inputs, outputs, env, }: {
    inputs: {
        [key: string]: {
            value: unknown;
        };
    };
    outputs: BuildStepOutputById;
    env: BuildStepEnv;
    signal?: AbortSignal;
}) => unknown;
export interface SerializedBuildStepOutputAccessor {
    id: string;
    executed: boolean;
    outputById: Record<string, SerializedBuildStepOutput>;
    displayName: string;
}
export declare class BuildStepOutputAccessor {
    readonly id: string;
    readonly displayName: string;
    protected readonly executed: boolean;
    protected readonly outputById: BuildStepOutputById;
    constructor(id: string, displayName: string, executed: boolean, outputById: BuildStepOutputById);
    get outputs(): BuildStepOutput[];
    getOutputValueByName(name: string): string | undefined;
    hasOutputParameter(name: string): boolean;
    serialize(): SerializedBuildStepOutputAccessor;
    static deserialize(serialized: SerializedBuildStepOutputAccessor): BuildStepOutputAccessor;
}
export declare class BuildStep extends BuildStepOutputAccessor {
    private static nextGeneratedId;
    readonly id: string;
    readonly displayName: string;
    readonly supportedRuntimePlatforms?: BuildRuntimePlatform[];
    readonly inputs?: BuildStepInput[];
    readonly outputById: BuildStepOutputById;
    readonly command?: string;
    readonly fn?: BuildStepFunction;
    readonly shell: string;
    readonly ctx: BuildStepContext;
    readonly stepEnvOverrides: BuildStepEnv;
    readonly ifCondition?: string;
    readonly timeoutMs?: number;
    readonly __metricsId?: string;
    readonly __hookId?: HookAnchorId;
    status: BuildStepStatus;
    private readonly outputsDir;
    private readonly envsDir;
    private readonly inputById;
    protected executed: boolean;
    static getNewId(userDefinedId?: string): string;
    constructor(ctx: BuildStepGlobalContext, { id, displayName, inputs, outputs, command, fn, workingDirectory: maybeWorkingDirectory, shell, supportedRuntimePlatforms: maybeSupportedRuntimePlatforms, env, ifCondition, timeoutMs, __metricsId, __hookId, }: {
        id: string;
        displayName: string;
        inputs?: BuildStepInput[];
        outputs?: BuildStepOutput[];
        command?: string;
        fn?: BuildStepFunction;
        workingDirectory?: string;
        shell?: string;
        supportedRuntimePlatforms?: BuildRuntimePlatform[];
        env?: BuildStepEnv;
        ifCondition?: string;
        timeoutMs?: number;
        __metricsId?: string;
        __hookId?: HookAnchorId;
    });
    executeAsync(): Promise<void>;
    canBeRunOnRuntimePlatform(): boolean;
    shouldExecuteStep(): boolean;
    skip(): void;
    private getInterpolationContext;
    private executeCommandAsync;
    private executeFnAsync;
    private interpolateInputsOutputsAndGlobalContextInTemplate;
    private collectAndValidateOutputsAsync;
    private collectAndUpdateEnvsAsync;
    private getScriptEnv;
}
