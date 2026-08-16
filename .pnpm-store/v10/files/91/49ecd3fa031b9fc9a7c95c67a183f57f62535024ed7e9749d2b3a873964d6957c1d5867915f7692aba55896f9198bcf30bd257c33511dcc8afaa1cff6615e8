"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppStoreAuthAsync = getAppStoreAuthAsync;
const tslib_1 = require("tslib");
const apple_utils_1 = require("@expo/apple-utils");
const assert_1 = tslib_1.__importDefault(require("assert"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const authenticate_1 = require("../credentials/ios/appstore/authenticate");
const authenticateTypes_1 = require("../credentials/ios/appstore/authenticateTypes");
const resolveCredentials_1 = require("../credentials/ios/appstore/resolveCredentials");
const AppStoreConnectApiKeyQuery_1 = require("../graphql/queries/AppStoreConnectApiKeyQuery");
const log_1 = tslib_1.__importDefault(require("../log"));
const bundleIdentifier_1 = require("../project/ios/bundleIdentifier");
const projectUtils_1 = require("../project/projectUtils");
/**
 * Resolve the bundle identifier from the selected submit profile.
 * This bundle identifier is used as target for the metadata submission.
 */
async function resolveAppStoreBundleIdentifierAsync(projectDir, profile, exp, vcsClient) {
    if ('bundleIdentifier' in profile) {
        return profile.bundleIdentifier ?? (await (0, bundleIdentifier_1.getBundleIdentifierAsync)(projectDir, exp, vcsClient));
    }
    return await (0, bundleIdentifier_1.getBundleIdentifierAsync)(projectDir, exp, vcsClient);
}
/**
 * Try to resolve an ASC API key from the submit profile or EAS credentials service.
 * Returns null if no key is available from these sources.
 */
async function tryResolveAscApiKeyAsync({ profile, graphqlClient, projectId, exp, bundleId, }) {
    // 1. Check submit profile for ASC API key fields
    if ('ascApiKeyPath' in profile && 'ascApiKeyIssuerId' in profile && 'ascApiKeyId' in profile) {
        const { ascApiKeyPath, ascApiKeyIssuerId, ascApiKeyId } = profile;
        if (ascApiKeyPath && ascApiKeyIssuerId && ascApiKeyId) {
            const keyP8 = await fs_1.default.promises.readFile(ascApiKeyPath, 'utf-8');
            // Also try to get teamId from the profile if available
            const teamId = 'appleTeamId' in profile ? profile.appleTeamId : undefined;
            return {
                ascApiKey: { keyP8, keyId: ascApiKeyId, issuerId: ascApiKeyIssuerId },
                teamId,
            };
        }
    }
    // 2. Look up stored credentials via EAS credentials service
    try {
        const account = await (0, projectUtils_1.getOwnerAccountForProjectIdAsync)(graphqlClient, projectId);
        const appLookupParams = {
            account,
            projectName: exp.slug,
            bundleIdentifier: bundleId,
        };
        // Import dynamically to avoid circular dependency issues
        const { getAscApiKeyForAppSubmissionsAsync } = await Promise.resolve().then(() => tslib_1.__importStar(require('../credentials/ios/api/GraphqlClient')));
        const ascKeyFragment = await getAscApiKeyForAppSubmissionsAsync(graphqlClient, appLookupParams);
        if (ascKeyFragment) {
            log_1.default.log('Using App Store Connect API Key from EAS credentials service.');
            const fullKey = await AppStoreConnectApiKeyQuery_1.AppStoreConnectApiKeyQuery.getByIdAsync(graphqlClient, ascKeyFragment.id);
            return {
                ascApiKey: {
                    keyP8: fullKey.keyP8,
                    keyId: fullKey.keyIdentifier,
                    issuerId: fullKey.issuerIdentifier,
                },
                teamId: ascKeyFragment.appleTeam?.appleTeamIdentifier,
                teamName: ascKeyFragment.appleTeam?.appleTeamName ?? undefined,
            };
        }
    }
    catch (error) {
        // If we can't look up credentials, that's fine — we'll fall back
        log_1.default.warn(`Could not look up stored ASC API key: ${error.message}`);
    }
    return null;
}
/**
 * To start syncing ASC entities, we need access to the apple utils App instance.
 * This resolves both the authentication and that App instance.
 *
 * Resolution order for authentication:
 * 1. ASC API key from environment variables (EXPO_ASC_API_KEY_PATH, etc.)
 * 2. ASC API key from submit profile (ascApiKeyPath, etc. in eas.json)
 * 3. ASC API key from EAS credentials service
 * 4. Interactive cookie auth (only when not in non-interactive mode)
 */
async function getAppStoreAuthAsync({ projectDir, profile, exp, credentialsCtx, nonInteractive, graphqlClient, projectId, }) {
    const bundleId = await resolveAppStoreBundleIdentifierAsync(projectDir, profile, exp, credentialsCtx.vcsClient);
    // Try to resolve an ASC API key from profile or credentials service
    const resolvedKey = await tryResolveAscApiKeyAsync({
        profile,
        graphqlClient,
        projectId,
        exp,
        bundleId,
    });
    if (resolvedKey || (0, resolveCredentials_1.hasAscEnvVars)()) {
        const authOptions = {
            mode: authenticateTypes_1.AuthenticationMode.API_KEY,
            ...(resolvedKey
                ? {
                    ascApiKey: resolvedKey.ascApiKey,
                    teamId: resolvedKey.teamId,
                    teamName: resolvedKey.teamName,
                    // Default to COMPANY_OR_ORGANIZATION to avoid prompting for team type
                    teamType: authenticateTypes_1.AppleTeamType.COMPANY_OR_ORGANIZATION,
                }
                : {}),
        };
        const authCtx = await credentialsCtx.appStore.ensureAuthenticatedAsync(authOptions);
        (0, assert_1.default)(authCtx.authState, 'Failed to authenticate with App Store Connect');
        const app = await apple_utils_1.App.findAsync((0, authenticate_1.getRequestContext)(authCtx), { bundleId });
        (0, assert_1.default)(app, `Failed to load app "${bundleId}" from App Store Connect`);
        return { app, auth: authCtx.authState };
    }
    if (nonInteractive) {
        throw new Error('No App Store Connect API Key found. In non-interactive mode, provide one via:\n' +
            '  - Environment variables: EXPO_ASC_API_KEY_PATH, EXPO_ASC_KEY_ID, EXPO_ASC_ISSUER_ID\n' +
            '  - eas.json submit profile: ascApiKeyPath, ascApiKeyId, ascApiKeyIssuerId\n' +
            '  - EAS credentials service: run `eas credentials` to set up an API key');
    }
    // Fall back to interactive cookie auth
    const authCtx = await credentialsCtx.appStore.ensureAuthenticatedAsync();
    (0, assert_1.default)(authCtx.authState, 'Failed to authenticate with App Store Connect');
    const app = await apple_utils_1.App.findAsync((0, authenticate_1.getRequestContext)(authCtx), { bundleId });
    (0, assert_1.default)(app, `Failed to load app "${bundleId}" from App Store Connect`);
    return { app, auth: authCtx.authState };
}
