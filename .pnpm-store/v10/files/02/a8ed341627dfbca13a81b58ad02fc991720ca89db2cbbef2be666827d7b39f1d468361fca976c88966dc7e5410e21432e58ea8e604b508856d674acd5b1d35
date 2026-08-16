"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepsConfigParser = void 0;
const eas_build_job_1 = require("@expo/eas-build-job");
const node_assert_1 = __importDefault(require("node:assert"));
const AbstractConfigParser_1 = require("./AbstractConfigParser");
const BuildFunction_1 = require("./BuildFunction");
const BuildFunctionGroup_1 = require("./BuildFunctionGroup");
const errors_1 = require("./errors");
const hooks_1 = require("./hooks");
class StepsConfigParser extends AbstractConfigParser_1.AbstractConfigParser {
    steps;
    hooks;
    constructor(ctx, { steps, hooks, externalFunctions, externalFunctionGroups, }) {
        super(ctx, {
            externalFunctions,
            externalFunctionGroups,
        });
        this.steps = steps;
        this.hooks = hooks ?? {};
    }
    async parseConfigToBuildStepsAndBuildFunctionByIdMappingAsync() {
        const validatedSteps = (0, eas_build_job_1.validateSteps)(this.steps);
        const validatedHooks = this.validateHooks();
        // Hook steps are validated like job steps: a hook `uses:` naming an
        // unknown function must be a BuildConfigError, not an assertion crash.
        (0, hooks_1.validateAllStepFunctionsExist)([...validatedSteps, ...Object.values(validatedHooks).flat()], {
            externalFunctionIds: this.getExternalFunctionFullIds(),
            externalFunctionGroupIds: this.getExternalFunctionGroupFullIds(),
        });
        const buildFunctionById = (0, BuildFunction_1.createBuildFunctionByIdMapping)(this.externalFunctions ?? []);
        const buildFunctionGroupById = (0, BuildFunctionGroup_1.createBuildFunctionGroupByIdMapping)(this.externalFunctionGroups ?? []);
        // Only the job's own steps are scanned — steps constructed from hooks are
        // never treated as anchors (no nesting). Construction order (before →
        // anchor → after per occurrence; groups expand first) keeps generated
        // step ids identical across the splicing→engine rollout.
        const buildSteps = [];
        const hooksByAnchorStep = new Map();
        for (const stepConfig of validatedSteps) {
            const maybeFunctionGroup = (0, eas_build_job_1.isStepFunctionStep)(stepConfig)
                ? buildFunctionGroupById[stepConfig.uses]
                : undefined;
            if (maybeFunctionGroup !== undefined) {
                // The group expands FIRST (its internal steps get their ids), then the
                // anchors found among expanded steps get their hook steps constructed.
                // TODO: allow to set id, name, working_directory, shell, env and if
                // for function groups
                const expandedSteps = maybeFunctionGroup.createBuildStepsFromFunctionGroupCall(this.ctx, {
                    callInputs: stepConfig.with,
                });
                buildSteps.push(...expandedSteps);
                for (const expandedStep of expandedSteps) {
                    const anchorId = expandedStep.__hookId;
                    if (anchorId === undefined) {
                        continue;
                    }
                    const anchorHooks = this.constructAnchorHooks(anchorId, validatedHooks, {
                        buildFunctionById,
                        buildFunctionGroupById,
                    });
                    if (anchorHooks !== undefined) {
                        hooksByAnchorStep.set(expandedStep, anchorHooks);
                    }
                }
                continue;
            }
            const anchorId = StepsConfigParser.resolveStepAnchor(stepConfig, buildFunctionById);
            if (anchorId === undefined) {
                buildSteps.push(this.createBuildStepFromNonGroupStepConfig(stepConfig, buildFunctionById));
                continue;
            }
            const maps = { buildFunctionById, buildFunctionGroupById };
            const before = this.constructHookSideEntries(anchorId, 'before', validatedHooks, maps);
            const anchorStep = this.createBuildStepFromNonGroupStepConfig(stepConfig, buildFunctionById);
            buildSteps.push(anchorStep);
            const after = this.constructHookSideEntries(anchorId, 'after', validatedHooks, maps);
            if (before.length > 0 || after.length > 0) {
                hooksByAnchorStep.set(anchorStep, { anchor: anchorId, before, after });
            }
        }
        return {
            buildSteps,
            buildFunctionById,
            hooksByAnchorStep,
        };
    }
    validateHooks() {
        const validatedHooks = {};
        for (const [hookKey, hookSteps] of Object.entries(this.hooks)) {
            // A worker must not fail on a hook key newer than itself, so unregistered
            // keys skip validation entirely (their steps may reference functions this
            // worker lacks).
            if ((0, eas_build_job_1.parseHookKey)(hookKey) === null) {
                continue;
            }
            // An empty array is a deliberate no-op (e.g. opting out of a default);
            // any other non-step-array shape falls through to validateSteps below so
            // it errors instead of being dropped silently.
            if (Array.isArray(hookSteps) && hookSteps.length === 0) {
                continue;
            }
            try {
                validatedHooks[hookKey] = (0, eas_build_job_1.validateSteps)(hookSteps);
            }
            catch (err) {
                throw new errors_1.BuildConfigError(`Invalid steps in "hooks.${hookKey}": ${err instanceof Error ? err.message : String(err)}`);
            }
        }
        return validatedHooks;
    }
    /**
     * Resolves a non-group step's anchor. Stamp PRESENCE wins, not stamp
     * registration: an unregistered stamp value makes the step inert — it never
     * falls through to the invoked function's declaration (a newer server
     * stamping a function step with a future anchor must not silently rebind it
     * to the function's older anchor on this worker). Only when the field is
     * absent does a function step resolve via its function's own declaration.
     */
    static resolveStepAnchor(step, buildFunctionById) {
        if (step.__hook_id !== undefined) {
            return (0, eas_build_job_1.isHookAnchorId)(step.__hook_id) ? step.__hook_id : undefined;
        }
        if ((0, eas_build_job_1.isStepFunctionStep)(step)) {
            return buildFunctionById[step.uses]?.__hookId;
        }
        return undefined;
    }
    constructAnchorHooks(anchorId, validatedHooks, maps) {
        const before = this.constructHookSideEntries(anchorId, 'before', validatedHooks, maps);
        const after = this.constructHookSideEntries(anchorId, 'after', validatedHooks, maps);
        if (before.length === 0 && after.length === 0) {
            return undefined;
        }
        return { anchor: anchorId, before, after };
    }
    constructHookSideEntries(anchorId, side, validatedHooks, maps) {
        const hookSteps = validatedHooks[`${side}_${anchorId}`];
        if (hookSteps === undefined) {
            return [];
        }
        return (0, hooks_1.constructHookEntriesFromValidatedSteps)(this.ctx, hookSteps, maps);
    }
    createBuildStepFromNonGroupStepConfig(stepConfig, buildFunctionById) {
        if ((0, eas_build_job_1.isStepShellStep)(stepConfig)) {
            return (0, hooks_1.createBuildStepFromShellStep)(this.ctx, stepConfig);
        }
        else if ((0, eas_build_job_1.isStepFunctionStep)(stepConfig)) {
            return this.createBuildStepFromFunctionStepConfig(stepConfig, buildFunctionById);
        }
        else {
            throw new errors_1.BuildConfigError('Invalid job step configuration detected. Step must be shell or function step');
        }
    }
    createBuildStepFromFunctionStepConfig(step, buildFunctionById) {
        const buildFunction = buildFunctionById[step.uses];
        (0, node_assert_1.default)(buildFunction, 'function ID must be ID of function or function group');
        return buildFunction.createBuildStepFromFunctionCall(this.ctx, {
            id: step.id,
            name: step.name,
            callInputs: step.with,
            workingDirectory: step.working_directory,
            shell: step.shell,
            env: step.env,
            ifCondition: step.if,
        });
    }
}
exports.StepsConfigParser = StepsConfigParser;
