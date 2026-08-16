import { CombinedError as GraphqlError, OperationResult } from '@urql/core';
export declare const EAS_CLI_UPGRADE_REQUIRED_ERROR_CODE = "EAS_CLI_UPGRADE_REQUIRED";
export declare function withErrorHandlingAsync<T>(promise: Promise<OperationResult<T>>): Promise<T>;
/**
 * Wraps `withErrorHandlingAsync` for queries that hit endpoints which may evolve in
 * ways that require a newer eas-cli. The server signals this by returning a GraphQL
 * error with `extensions.errorCode === EAS_CLI_UPGRADE_REQUIRED`. As a fallback we
 * also detect schema validation errors of the form `Cannot query field "X" on type "Y"`,
 * which surface when a field has been removed without a coded error.
 *
 * In either case we re-throw an `EasCommandError` instructing the user to upgrade.
 */
export declare function withUpgradeRequiredErrorHandlingAsync<T>(promise: Promise<OperationResult<T>>, { featureName }: {
    featureName: string;
}): Promise<T>;
export { GraphqlError };
