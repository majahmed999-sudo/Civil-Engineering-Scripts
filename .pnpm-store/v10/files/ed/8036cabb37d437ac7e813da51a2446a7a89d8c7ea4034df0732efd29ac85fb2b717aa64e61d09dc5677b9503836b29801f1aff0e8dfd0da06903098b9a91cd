"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getManagedApplicationTargetEntitlementsAsync = getManagedApplicationTargetEntitlementsAsync;
exports.getNativeTargetEntitlementsAsync = getNativeTargetEntitlementsAsync;
const tslib_1 = require("tslib");
const config_plugins_1 = require("@expo/config-plugins");
const prebuild_config_1 = require("@expo/prebuild-config");
const log_1 = tslib_1.__importDefault(require("../../log"));
const sentry_1 = tslib_1.__importDefault(require("../../sentry"));
const expoCli_1 = require("../../utils/expoCli");
const plist_1 = require("../../utils/plist");
const projectUtils_1 = require("../projectUtils");
const workflow_1 = require("../workflow");
async function getManagedApplicationTargetEntitlementsAsync(projectDir, env, vcsClient) {
    let expoConfigError;
    if ((0, projectUtils_1.isExpoInstalled)(projectDir)) {
        try {
            const { stdout } = await (0, expoCli_1.spawnExpoCommand)(projectDir, ['config', '--json', '--type', 'introspect'], {
                env: {
                    ...env,
                    EXPO_NO_DOTENV: '1',
                },
            });
            const expWithMods = JSON.parse(stdout);
            return expWithMods.ios?.entitlements ?? {};
        }
        catch (error) {
            try {
                sentry_1.default.withScope(scope => {
                    if (process.env.EAS_BUILD_PROJECT_ID) {
                        scope.setTag('app_id', process.env.EAS_BUILD_PROJECT_ID);
                    }
                    if (process.env.EAS_BUILD_ID) {
                        scope.setTag('build_id', process.env.EAS_BUILD_ID);
                    }
                    scope.setTag('config_resolution', 'ios_entitlements_introspection');
                    scope.setExtra('expo_config_command_error', JSON.stringify({
                        message: error.message,
                        output: error.output,
                        signal: error.signal,
                        status: error.status,
                        stderr: error.stderr,
                        stdout: error.stdout,
                    }));
                    sentry_1.default.captureMessage('iOS entitlements config fallback', 'error');
                });
            }
            catch {
                // do nothing
            }
            expoConfigError = error;
            log_1.default.warn(`Failed to read the app config from the project using the local Expo CLI: ${formatError(error)}`);
            log_1.default.warn('Falling back to the version of "@expo/config" shipped with the EAS CLI.');
        }
    }
    try {
        return await resolveManagedApplicationTargetEntitlementsWithBundledConfigAsync(projectDir, env, vcsClient);
    }
    catch (fallbackError) {
        if (expoConfigError) {
            throw new Error(`Failed to resolve iOS entitlements from Expo config. The local Expo CLI failed with: ${formatError(expoConfigError)}. The bundled config fallback also failed with: ${formatError(fallbackError)}`, { cause: fallbackError });
        }
        throw new Error(`Failed to resolve iOS entitlements from Expo config using the bundled config fallback: ${formatError(fallbackError)}`, { cause: fallbackError });
    }
}
async function resolveManagedApplicationTargetEntitlementsWithBundledConfigAsync(projectDir, env, vcsClient) {
    const originalProcessEnv = process.env;
    try {
        process.env = {
            ...process.env,
            ...env,
        };
        const { exp } = await (0, prebuild_config_1.getPrebuildConfigAsync)(projectDir, { platforms: ['ios'] });
        const expWithMods = await (0, config_plugins_1.compileModsAsync)(exp, {
            projectRoot: projectDir,
            platforms: ['ios'],
            introspect: true,
            ignoreExistingNativeFiles: await (0, workflow_1.hasIgnoredIosProjectAsync)(projectDir, vcsClient),
        });
        return expWithMods.ios?.entitlements ?? {};
    }
    finally {
        process.env = originalProcessEnv;
    }
}
function formatError(error) {
    return error.stderr?.trim() || error.stdout?.trim() || error.message;
}
async function getNativeTargetEntitlementsAsync(projectDir, target) {
    const entitlementsPath = config_plugins_1.IOSConfig.Entitlements.getEntitlementsPath(projectDir, target);
    if (entitlementsPath) {
        const plist = await (0, plist_1.readPlistAsync)(entitlementsPath);
        return plist ? plist : null;
    }
    else {
        return null;
    }
}
