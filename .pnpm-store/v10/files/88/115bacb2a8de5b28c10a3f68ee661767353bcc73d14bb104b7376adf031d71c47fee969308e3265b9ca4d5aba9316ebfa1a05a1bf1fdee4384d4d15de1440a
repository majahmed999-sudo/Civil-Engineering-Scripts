import { Hooks, Step } from '@expo/eas-build-job';
import { AbstractConfigParser } from './AbstractConfigParser';
import { BuildFunction, BuildFunctionById } from './BuildFunction';
import { BuildFunctionGroup } from './BuildFunctionGroup';
import { BuildStep } from './BuildStep';
import { BuildStepGlobalContext } from './BuildStepContext';
import { AnchorHooks } from './hooks';
export declare class StepsConfigParser extends AbstractConfigParser {
    private readonly steps;
    private readonly hooks;
    constructor(ctx: BuildStepGlobalContext, { steps, hooks, externalFunctions, externalFunctionGroups, }: {
        steps: Step[];
        hooks: Hooks | undefined;
        externalFunctions?: BuildFunction[];
        externalFunctionGroups?: BuildFunctionGroup[];
    });
    protected parseConfigToBuildStepsAndBuildFunctionByIdMappingAsync(): Promise<{
        buildSteps: BuildStep[];
        buildFunctionById: BuildFunctionById;
        hooksByAnchorStep: ReadonlyMap<BuildStep, AnchorHooks>;
    }>;
    private validateHooks;
    /**
     * Resolves a non-group step's anchor. Stamp PRESENCE wins, not stamp
     * registration: an unregistered stamp value makes the step inert — it never
     * falls through to the invoked function's declaration (a newer server
     * stamping a function step with a future anchor must not silently rebind it
     * to the function's older anchor on this worker). Only when the field is
     * absent does a function step resolve via its function's own declaration.
     */
    private static resolveStepAnchor;
    private constructAnchorHooks;
    private constructHookSideEntries;
    private createBuildStepFromNonGroupStepConfig;
    private createBuildStepFromFunctionStepConfig;
}
