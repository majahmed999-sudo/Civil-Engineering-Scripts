"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructHookEntriesAsync = constructHookEntriesAsync;
exports.validateHookStepsAsync = validateHookStepsAsync;
exports.constructHookEntriesFromValidatedSteps = constructHookEntriesFromValidatedSteps;
exports.createBuildStepFromShellStep = createBuildStepFromShellStep;
exports.validateAllStepFunctionsExist = validateAllStepFunctionsExist;
const eas_build_job_1 = require("@expo/eas-build-job");
const node_assert_1 = __importDefault(require("node:assert"));
const BuildFunction_1 = require("./BuildFunction");
const BuildFunctionGroup_1 = require("./BuildFunctionGroup");
const BuildStep_1 = require("./BuildStep");
const BuildStepOutput_1 = require("./BuildStepOutput");
const BuildWorkflowValidator_1 = require("./BuildWorkflowValidator");
const errors_1 = require("./errors");
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
async function constructHookEntriesAsync(ctx, steps, { externalFunctions, externalFunctionGroups, }) {
    // An empty array is a valid no-op (e.g. opting out of a default hook);
    // validateSteps requires at least one step, so short-circuit before it —
    // but ONLY for a real array (malformed wire input must still reach
    // validateSteps and be rejected, not silently disable the hook).
    if (Array.isArray(steps) && steps.length === 0) {
        return [];
    }
    const validatedSteps = (0, eas_build_job_1.validateSteps)(steps);
    const buildFunctionById = (0, BuildFunction_1.createBuildFunctionByIdMapping)(externalFunctions ?? []);
    const buildFunctionGroupById = (0, BuildFunctionGroup_1.createBuildFunctionGroupByIdMapping)(externalFunctionGroups ?? []);
    validateAllStepFunctionsExist(validatedSteps, {
        externalFunctionIds: Object.keys(buildFunctionById),
        externalFunctionGroupIds: Object.keys(buildFunctionGroupById),
    });
    return constructHookEntriesFromValidatedSteps(ctx, validatedSteps, {
        buildFunctionById,
        buildFunctionGroupById,
    });
}
/**
 * Aggregate validation over an execution-ordered view of steps (unique ids,
 * output references, runtime-platform allowance). The parser runs it over
 * `job steps + hooks` (through `BuildWorkflowValidator`).
 */
async function validateHookStepsAsync(ctx, orderedView) {
    const errors = (0, BuildWorkflowValidator_1.collectAggregateStepErrors)(orderedView, {
        runtimePlatform: ctx.runtimePlatform,
    });
    if (errors.length !== 0) {
        throw new errors_1.BuildWorkflowError('Hook steps are invalid.', errors);
    }
}
/** Package-internal: the parser path — steps already validated, function maps already built. */
function constructHookEntriesFromValidatedSteps(ctx, validatedSteps, { buildFunctionById, buildFunctionGroupById, }) {
    const entries = [];
    for (const step of validatedSteps) {
        if (!(0, eas_build_job_1.isStepFunctionStep)(step)) {
            entries.push({
                steps: [createBuildStepFromShellStep(ctx, step)],
            });
            continue;
        }
        const maybeFunctionGroup = buildFunctionGroupById[step.uses];
        if (maybeFunctionGroup !== undefined) {
            entries.push({
                steps: maybeFunctionGroup.createBuildStepsFromFunctionGroupCall(ctx, {
                    callInputs: step.with,
                }),
                ...(step.if ? { ifCondition: step.if } : null),
            });
            continue;
        }
        const buildFunction = buildFunctionById[step.uses];
        (0, node_assert_1.default)(buildFunction, 'function ID must be ID of function or function group');
        entries.push({
            steps: [
                buildFunction.createBuildStepFromFunctionCall(ctx, {
                    id: step.id,
                    name: step.name,
                    callInputs: step.with,
                    workingDirectory: step.working_directory,
                    shell: step.shell,
                    env: step.env,
                    ifCondition: step.if,
                }),
            ],
        });
    }
    return entries;
}
/** Package-internal: shared shell-step construction (job steps and hook steps). */
function createBuildStepFromShellStep(ctx, step) {
    const id = BuildStep_1.BuildStep.getNewId(step.id);
    const displayName = step.name ??
        step.id ??
        step.run
            .split('\n')
            .find(line => line.trim())
            ?.trim() ??
        step.run;
    const outputs = step.outputs?.map(entry => new BuildStepOutput_1.BuildStepOutput(ctx, {
        id: entry.name,
        stepDisplayName: displayName,
        required: entry.required ?? true,
    }));
    return new BuildStep_1.BuildStep(ctx, {
        id,
        displayName,
        outputs,
        workingDirectory: step.working_directory,
        shell: step.shell,
        command: step.run,
        env: step.env,
        ifCondition: step.if,
        __metricsId: step.__metrics_id,
    });
}
/** Package-internal. */
function validateAllStepFunctionsExist(steps, { externalFunctionIds, externalFunctionGroupIds, }) {
    const calledFunctionsOrFunctionGroupsSet = new Set();
    for (const step of steps) {
        if (step.uses) {
            calledFunctionsOrFunctionGroupsSet.add(step.uses);
        }
    }
    const externalFunctionIdsSet = new Set(externalFunctionIds);
    const externalFunctionGroupsIdsSet = new Set(externalFunctionGroupIds);
    const nonExistentFunctionsOrFunctionGroups = Array.from(calledFunctionsOrFunctionGroupsSet).filter(calledFunctionOrFunctionGroup => !externalFunctionIdsSet.has(calledFunctionOrFunctionGroup) &&
        !externalFunctionGroupsIdsSet.has(calledFunctionOrFunctionGroup));
    if (nonExistentFunctionsOrFunctionGroups.length > 0) {
        throw new errors_1.BuildConfigError(`Calling non-existent functions: ${nonExistentFunctionsOrFunctionGroups
            .map(f => `"${f}"`)
            .join(', ')}.`);
    }
}
