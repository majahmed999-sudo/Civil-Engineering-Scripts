"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlError = exports.EAS_CLI_UPGRADE_REQUIRED_ERROR_CODE = void 0;
exports.withErrorHandlingAsync = withErrorHandlingAsync;
exports.withUpgradeRequiredErrorHandlingAsync = withUpgradeRequiredErrorHandlingAsync;
const tslib_1 = require("tslib");
const core_1 = require("@urql/core");
Object.defineProperty(exports, "GraphqlError", { enumerable: true, get: function () { return core_1.CombinedError; } });
const errors_1 = require("../commandUtils/errors");
const log_1 = tslib_1.__importDefault(require("../log"));
exports.EAS_CLI_UPGRADE_REQUIRED_ERROR_CODE = 'EAS_CLI_UPGRADE_REQUIRED';
async function withErrorHandlingAsync(promise) {
    const { data, error } = await promise;
    if (error) {
        if (error.graphQLErrors.some(e => e?.extensions?.isTransient &&
            ![
                'EAS_BUILD_FREE_TIER_LIMIT_EXCEEDED',
                'EAS_BUILD_FREE_TIER_IOS_LIMIT_EXCEEDED',
                'EMBEDDED_UPDATE_ASSET_NOT_AVAILABLE',
            ].includes(e?.extensions?.errorCode))) {
            log_1.default.error(`We've encountered a transient error. Try again shortly.`);
        }
        throw error;
    }
    // Check for malformed response. This only checks the root query existence,
    // It doesn't affect returning responses with empty resultset.
    if (!data) {
        throw new Error('Returned query result data is null!');
    }
    return data;
}
/**
 * Wraps `withErrorHandlingAsync` for queries that hit endpoints which may evolve in
 * ways that require a newer eas-cli. The server signals this by returning a GraphQL
 * error with `extensions.errorCode === EAS_CLI_UPGRADE_REQUIRED`. As a fallback we
 * also detect schema validation errors of the form `Cannot query field "X" on type "Y"`,
 * which surface when a field has been removed without a coded error.
 *
 * In either case we re-throw an `EasCommandError` instructing the user to upgrade.
 */
async function withUpgradeRequiredErrorHandlingAsync(promise, { featureName }) {
    try {
        return await withErrorHandlingAsync(promise);
    }
    catch (error) {
        if (isUpgradeRequiredError(error)) {
            throw new errors_1.EasCommandError(`${featureName} is not supported by this version of eas-cli. ` +
                `Upgrade to the latest version: \`npm install -g eas-cli@latest\`.`);
        }
        throw error;
    }
}
function isUpgradeRequiredError(error) {
    if (!(error instanceof core_1.CombinedError)) {
        return false;
    }
    return error.graphQLErrors.some(e => {
        if (e?.extensions?.errorCode === exports.EAS_CLI_UPGRADE_REQUIRED_ERROR_CODE) {
            return true;
        }
        return /Cannot query field ".+" on type ".+"/.test(e?.message ?? '');
    });
}
