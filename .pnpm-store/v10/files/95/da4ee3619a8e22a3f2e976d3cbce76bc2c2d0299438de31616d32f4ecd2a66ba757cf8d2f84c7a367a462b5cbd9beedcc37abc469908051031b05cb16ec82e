"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchObserveVersionsAsync = fetchObserveVersionsAsync;
const tslib_1 = require("tslib");
const generated_1 = require("../graphql/generated");
const ObserveQuery_1 = require("../graphql/queries/ObserveQuery");
const log_1 = tslib_1.__importDefault(require("../log"));
const appPlatformToObservePlatform = {
    [generated_1.AppPlatform.Android]: generated_1.AppObservePlatform.Android,
    [generated_1.AppPlatform.Ios]: generated_1.AppObservePlatform.Ios,
};
async function fetchObserveVersionsAsync(graphqlClient, appId, platforms, startTime, endTime) {
    const queries = platforms.map(async (appPlatform) => {
        const observePlatform = appPlatformToObservePlatform[appPlatform];
        try {
            const appVersions = await ObserveQuery_1.ObserveQuery.appVersionsAsync(graphqlClient, {
                appId,
                platform: observePlatform,
                startTime,
                endTime,
            });
            return { platform: appPlatform, appVersions };
        }
        catch (error) {
            log_1.default.warn(`Failed to fetch app versions for ${observePlatform}: ${error.message}`);
            return null;
        }
    });
    const results = await Promise.all(queries);
    return results.filter((r) => r !== null);
}
