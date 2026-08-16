"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchObserveNavigationRoutesAsync = fetchObserveNavigationRoutesAsync;
const tslib_1 = require("tslib");
const generated_1 = require("../graphql/generated");
const ObserveQuery_1 = require("../graphql/queries/ObserveQuery");
const log_1 = tslib_1.__importDefault(require("../log"));
const platforms_1 = require("./platforms");
async function fetchObserveNavigationRoutesAsync(graphqlClient, appId, options) {
    const orderBy = options.orderBy ?? {
        field: generated_1.AppObserveNavigationRoutesOrderByField.NavigationCount,
        direction: generated_1.AppObserveEventsOrderByDirection.Desc,
    };
    const queries = options.platforms.map(async (appPlatform) => {
        const observePlatform = platforms_1.appPlatformToObservePlatform[appPlatform];
        try {
            const result = await ObserveQuery_1.ObserveQuery.navigationRoutesAsync(graphqlClient, {
                appId,
                filter: {
                    platform: observePlatform,
                    startTime: options.startTime,
                    endTime: options.endTime,
                    ...(options.appVersion && { appVersion: options.appVersion }),
                    ...(options.updateId && { appUpdateId: options.updateId }),
                    ...(options.buildNumber && { appBuildNumber: options.buildNumber }),
                    ...(options.routeNames?.length && { routeNames: options.routeNames }),
                },
                first: options.limit,
                ...(options.after && { after: options.after }),
                orderBy,
            });
            return { appPlatform, ...result };
        }
        catch (error) {
            log_1.default.warn(`Failed to fetch navigation routes on ${observePlatform}: ${error.message}`);
            return null;
        }
    });
    const results = await Promise.all(queries);
    const routes = [];
    const pageInfoByPlatform = new Map();
    for (const result of results) {
        if (!result) {
            continue;
        }
        pageInfoByPlatform.set(result.appPlatform, result.pageInfo);
        for (const route of result.routes) {
            routes.push({ platform: result.appPlatform, route });
        }
    }
    return { routes, pageInfoByPlatform };
}
