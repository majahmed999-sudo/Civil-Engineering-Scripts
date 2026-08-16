"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildFunction = void 0;
exports.createBuildFunctionByIdMapping = createBuildFunctionByIdMapping;
const assert_1 = __importDefault(require("assert"));
const BuildStep_1 = require("./BuildStep");
const errors_1 = require("./errors");
const customFunction_1 = require("./utils/customFunction");
function createBuildFunctionByIdMapping(buildFunctions) {
    const buildFunctionById = {};
    for (const buildFunction of buildFunctions) {
        const fullId = buildFunction.getFullId();
        // Without the fence, last-write-wins would let the provider's array order
        // silently decide which implementation a `uses:` step resolves to.
        if (buildFunctionById[fullId] !== undefined) {
            throw new errors_1.BuildConfigError(`Build function with id ${fullId} is already defined.`);
        }
        buildFunctionById[fullId] = buildFunction;
    }
    return buildFunctionById;
}
class BuildFunction {
    namespace;
    id;
    name;
    supportedRuntimePlatforms;
    inputProviders;
    outputProviders;
    command;
    customFunctionModulePath;
    fn;
    shell;
    __metricsId;
    // The hook anchor this function declares itself as (the `__metricsId`
    // pattern). Registry-typed, so an unregistered anchor is a compile error;
    // a step-level `__hook_id` stamp overrides it (see
    // StepsConfigParser.resolveStepAnchor for the resolution rules).
    __hookId;
    constructor({ namespace, id, name, supportedRuntimePlatforms, inputProviders, outputProviders, command, fn, customFunctionModulePath, shell, __metricsId, __hookId, }) {
        (0, assert_1.default)(command !== undefined || fn !== undefined || customFunctionModulePath !== undefined, 'Either command, fn or path must be defined.');
        (0, assert_1.default)(!(command !== undefined && fn !== undefined), 'Command and fn cannot be both set.');
        (0, assert_1.default)(!(command !== undefined && customFunctionModulePath !== undefined), 'Command and path cannot be both set.');
        (0, assert_1.default)(!(fn !== undefined && customFunctionModulePath !== undefined), 'Fn and path cannot be both set.');
        this.namespace = namespace;
        this.id = id;
        this.name = name;
        this.supportedRuntimePlatforms = supportedRuntimePlatforms;
        this.inputProviders = inputProviders;
        this.outputProviders = outputProviders;
        this.command = command;
        this.fn = fn;
        this.shell = shell;
        this.customFunctionModulePath = customFunctionModulePath;
        this.__metricsId = __metricsId;
        this.__hookId = __hookId;
    }
    getFullId() {
        return this.namespace === undefined ? this.id : `${this.namespace}/${this.id}`;
    }
    createBuildStepFromFunctionCall(ctx, { id, name, callInputs = {}, workingDirectory, shell, env, ifCondition, timeoutMs, } = {}) {
        const buildStepId = BuildStep_1.BuildStep.getNewId(id);
        const buildStepName = name ?? this.name;
        const buildStepDisplayName = buildStepName ?? id ?? this.getFullId();
        const inputs = this.inputProviders?.map(inputProvider => {
            const input = inputProvider(ctx, buildStepId);
            if (input.id in callInputs) {
                input.set(callInputs[input.id]);
            }
            return input;
        });
        const outputs = this.outputProviders?.map(outputProvider => outputProvider(ctx, buildStepId));
        return new BuildStep_1.BuildStep(ctx, {
            id: buildStepId,
            displayName: buildStepDisplayName,
            command: this.command,
            fn: this.fn ??
                (this.customFunctionModulePath
                    ? (0, customFunction_1.createCustomFunctionCall)(this.customFunctionModulePath)
                    : undefined),
            workingDirectory,
            inputs,
            outputs,
            shell,
            supportedRuntimePlatforms: this.supportedRuntimePlatforms,
            env,
            ifCondition,
            timeoutMs,
            __metricsId: this.__metricsId,
            __hookId: this.__hookId,
        });
    }
}
exports.BuildFunction = BuildFunction;
