"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasUpdateEnvironmentRequiredFlag = exports.EasUpdateEnvironmentFlag = exports.EasJsonOnlyFlag = exports.EASNonInteractiveFlag = exports.EASEnvironmentVariableScopeFlag = exports.EASVariableVisibilityFlag = exports.EASVariableFormatFlag = exports.EASMultiEnvironmentFlag = exports.EASEnvironmentFlag = exports.EasEnvironmentFlagParameters = exports.EasNonInteractiveAndJsonFlags = void 0;
exports.isNonInteractiveByDefault = isNonInteractiveByDefault;
exports.resolveNonInteractiveAndJsonFlags = resolveNonInteractiveAndJsonFlags;
const core_1 = require("@oclif/core");
const getenv_1 = require("getenv");
function isNonInteractiveByDefault() {
    return (0, getenv_1.boolish)('CI', false) || !process.stdin.isTTY;
}
exports.EasNonInteractiveAndJsonFlags = {
    json: core_1.Flags.boolean({
        description: 'Enable JSON output, non-JSON messages will be printed to stderr. Implies --non-interactive.',
    }),
    'non-interactive': core_1.Flags.boolean({
        description: 'Run the command in non-interactive mode.',
        default: () => Promise.resolve(isNonInteractiveByDefault()),
        noCacheDefault: true,
    }),
};
function resolveNonInteractiveAndJsonFlags(flags) {
    const json = flags.json ?? false;
    const nonInteractive = flags['non-interactive'] || json;
    return { json, nonInteractive };
}
exports.EasEnvironmentFlagParameters = {
    description: "Environment variable's environment, e.g. 'production', 'preview', 'development'",
};
exports.EASEnvironmentFlag = {
    environment: core_1.Flags.string({
        description: "Environment variable's environment, e.g. 'production', 'preview', 'development'",
    }),
};
exports.EASMultiEnvironmentFlag = {
    environment: core_1.Flags.string({
        ...exports.EasEnvironmentFlagParameters,
        multiple: true,
    }),
};
exports.EASVariableFormatFlag = {
    format: core_1.Flags.option({
        description: 'Output format',
        options: ['long', 'short'],
        default: 'short',
    })(),
};
exports.EASVariableVisibilityFlag = {
    visibility: core_1.Flags.option({
        description: 'Visibility of the variable',
        options: ['plaintext', 'sensitive', 'secret'],
    })(),
};
exports.EASEnvironmentVariableScopeFlag = {
    scope: core_1.Flags.option({
        description: 'Scope for the variable',
        options: ['project', 'account'],
        default: 'project',
    })(),
};
exports.EASNonInteractiveFlag = {
    'non-interactive': core_1.Flags.boolean({
        description: 'Run the command in non-interactive mode.',
        // eslint-disable-next-line async-protect/async-suffix
        default: async () => {
            return isNonInteractiveByDefault();
        },
        noCacheDefault: true,
    }),
};
exports.EasJsonOnlyFlag = {
    json: core_1.Flags.boolean({
        description: 'Enable JSON output, non-JSON messages will be printed to stderr.',
    }),
};
exports.EasUpdateEnvironmentFlag = {
    environment: core_1.Flags.string({
        description: 'Environment to use for the server-side defined EAS environment variables during command execution, e.g. "production", "preview", "development".',
        required: false,
        default: undefined,
    }),
};
exports.EasUpdateEnvironmentRequiredFlag = {
    environment: core_1.Flags.string({
        description: 'Environment to use for the server-side defined EAS environment variables during command execution, e.g. "production", "preview", "development". Required for projects using Expo SDK 55 or greater.',
        required: false,
        default: undefined,
    }),
};
