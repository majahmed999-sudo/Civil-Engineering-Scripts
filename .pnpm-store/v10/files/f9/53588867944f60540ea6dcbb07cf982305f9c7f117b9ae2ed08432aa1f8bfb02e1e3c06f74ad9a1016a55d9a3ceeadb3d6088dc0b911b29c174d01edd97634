"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEVELOPMENT_IOS_SIMULATOR_BUILD_PROFILE_NAME = exports.DEVELOPMENT_BUILD_PROFILE_NAME = void 0;
exports.buildProfileNamesFromProjectAsync = buildProfileNamesFromProjectAsync;
exports.ensureDevelopmentBuildProfilesExistAsync = ensureDevelopmentBuildProfilesExistAsync;
exports.addProductionBuildProfileToEasJsonIfNeededAsync = addProductionBuildProfileToEasJsonIfNeededAsync;
exports.configureEasUpdateIfNeededAsync = configureEasUpdateIfNeededAsync;
exports.configureEasBuildIfNeededAsync = configureEasBuildIfNeededAsync;
const tslib_1 = require("tslib");
const eas_json_1 = require("@expo/eas-json");
const configure_1 = require("../../build/configure");
const log_1 = tslib_1.__importDefault(require("../../log"));
const platform_1 = require("../../platform");
const configure_2 = require("../../update/configure");
exports.DEVELOPMENT_BUILD_PROFILE_NAME = 'development';
exports.DEVELOPMENT_IOS_SIMULATOR_BUILD_PROFILE_NAME = 'development-ios-simulator';
async function buildProfileNamesFromProjectAsync(projectDir) {
    const easJsonAccessor = eas_json_1.EasJsonAccessor.fromProjectPath(projectDir);
    const buildProfileNames = new Set(easJsonAccessor && (await eas_json_1.EasJsonUtils.getBuildProfileNamesAsync(easJsonAccessor)));
    return buildProfileNames;
}
async function ensureDevelopmentBuildProfilesExistAsync(projectDir) {
    const easJsonAccessor = eas_json_1.EasJsonAccessor.fromProjectPath(projectDir);
    await easJsonAccessor.readRawJsonAsync();
    const addedProfiles = [];
    easJsonAccessor.patch(easJsonRawObject => {
        easJsonRawObject.build = easJsonRawObject.build ?? {};
        if (!easJsonRawObject.build[exports.DEVELOPMENT_BUILD_PROFILE_NAME]) {
            easJsonRawObject.build[exports.DEVELOPMENT_BUILD_PROFILE_NAME] = {
                developmentClient: true,
                distribution: 'internal',
            };
            addedProfiles.push(exports.DEVELOPMENT_BUILD_PROFILE_NAME);
        }
        if (!easJsonRawObject.build[exports.DEVELOPMENT_IOS_SIMULATOR_BUILD_PROFILE_NAME]) {
            easJsonRawObject.build[exports.DEVELOPMENT_IOS_SIMULATOR_BUILD_PROFILE_NAME] = {
                developmentClient: true,
                ios: {
                    simulator: true,
                },
            };
            addedProfiles.push(exports.DEVELOPMENT_IOS_SIMULATOR_BUILD_PROFILE_NAME);
        }
        return easJsonRawObject;
    });
    await easJsonAccessor.writeAsync();
    if (addedProfiles.length > 0) {
        log_1.default.log(`Added the following build profiles to eas.json: ${addedProfiles.join(', ')}`);
    }
}
async function addProductionBuildProfileToEasJsonIfNeededAsync(projectDir) {
    const easJsonAccessor = eas_json_1.EasJsonAccessor.fromProjectPath(projectDir);
    await easJsonAccessor.readRawJsonAsync();
    let profileAdded = false;
    easJsonAccessor.patch(easJsonRawObject => {
        if (!easJsonRawObject.build?.production) {
            profileAdded = true;
            easJsonRawObject.build = {
                ...(easJsonRawObject.build ?? {}),
                production: {},
            };
            // Also add the profile to submit
            easJsonRawObject.submit = {
                ...(easJsonRawObject.submit ?? {}),
                production: {},
            };
        }
        return easJsonRawObject;
    });
    if (profileAdded) {
        log_1.default.log('Added missing production build profile to eas.json');
    }
    await easJsonAccessor.writeAsync();
    return profileAdded;
}
async function hasBuildConfigureBeenRunAsync({ projectDir, expoConfig, }) {
    // Is there a project ID in the Expo config?
    if (!expoConfig.extra?.eas?.projectId) {
        return false;
    }
    // Is there an eas.json?
    const easJsonAccessor = eas_json_1.EasJsonAccessor.fromProjectPath(projectDir);
    try {
        await easJsonAccessor.readAsync();
    }
    catch {
        return false;
    }
    return true;
}
async function hasUpdateConfigureBeenRunAsync({ projectDir, expoConfig, }) {
    // Does the Expo config have an updates URL?
    if (!expoConfig.updates?.url) {
        return false;
    }
    // Does at least one build profile have a channel?
    const easJsonAccessor = eas_json_1.EasJsonAccessor.fromProjectPath(projectDir);
    try {
        const easJson = await easJsonAccessor.readAsync();
        return Object.values(easJson.build ?? {}).some(buildProfile => !!buildProfile.channel);
    }
    catch {
        return false;
    }
}
async function configureEasUpdateIfNeededAsync({ projectDir, expoConfig, projectId, vcsClient, }) {
    if (await hasUpdateConfigureBeenRunAsync({ projectDir, expoConfig })) {
        return;
    }
    const easJsonAccessor = eas_json_1.EasJsonAccessor.fromProjectPath(projectDir);
    const easJsonCliConfig = (await eas_json_1.EasJsonUtils.getCliConfigAsync(easJsonAccessor)) ?? {};
    await (0, configure_2.ensureEASUpdateIsConfiguredAsync)({
        exp: expoConfig,
        projectId,
        projectDir,
        vcsClient,
        platform: platform_1.RequestedPlatform.All,
        env: undefined,
        forceNativeConfigSync: true,
        manifestHostOverride: easJsonCliConfig?.updateManifestHostOverride ?? null,
    });
    await (0, configure_2.ensureEASUpdateIsConfiguredInEasJsonAsync)(projectDir);
    log_1.default.withTick('Configured EAS Update');
}
async function configureEasBuildIfNeededAsync({ projectDir, expoConfig, vcsClient, }) {
    if (await hasBuildConfigureBeenRunAsync({ projectDir, expoConfig })) {
        return;
    }
    await (0, configure_1.ensureProjectConfiguredAsync)({ projectDir, nonInteractive: false, vcsClient });
}
