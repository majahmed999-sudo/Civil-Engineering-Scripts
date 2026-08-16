"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.appPlatformToObservePlatform = exports.allowedPlatformFlagValues = void 0;
exports.appObservePlatformFromFlag = appObservePlatformFromFlag;
exports.appPlatformsFromFlag = appPlatformsFromFlag;
const generated_1 = require("../graphql/generated");
/**
 * Allowed values for the --platform flag in observe commands.
 * Derived from the AppObservePlatform enum so new platforms added on
 * the server are automatically picked up.
 */
exports.allowedPlatformFlagValues = Object.values(generated_1.AppObservePlatform).map(s => s.toLowerCase());
const defaultAppObservePlatform = generated_1.AppObservePlatform.Ios;
const defaultAppPlatform = generated_1.AppPlatform.Ios;
/**
 * Resolve a single AppObservePlatform from a --platform flag value.
 * Returns undefined when no flag was provided.
 */
function appObservePlatformFromFlag(flag) {
    if (!flag) {
        return undefined;
    }
    switch (flag) {
        case 'android':
            return generated_1.AppObservePlatform.Android;
        case 'ios':
            return generated_1.AppObservePlatform.Ios;
    }
    return defaultAppObservePlatform;
}
/**
 * Resolve a list of AppPlatform values from a --platform flag value.
 * Returns the single matching platform when a flag is provided, or all
 * known platforms when no flag is provided (so the caller queries every
 * platform).
 */
function appPlatformsFromFlag(flag) {
    if (!flag) {
        return [generated_1.AppPlatform.Android, generated_1.AppPlatform.Ios];
    }
    switch (flag) {
        case 'android':
            return [generated_1.AppPlatform.Android];
        case 'ios':
            return [generated_1.AppPlatform.Ios];
    }
    return [defaultAppPlatform];
}
exports.appPlatformToObservePlatform = {
    [generated_1.AppPlatform.Android]: generated_1.AppObservePlatform.Android,
    [generated_1.AppPlatform.Ios]: generated_1.AppObservePlatform.Ios,
};
