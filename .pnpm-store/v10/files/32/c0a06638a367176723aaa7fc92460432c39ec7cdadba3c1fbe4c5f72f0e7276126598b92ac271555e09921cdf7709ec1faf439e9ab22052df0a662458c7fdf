"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDateFlag = validateDateFlag;
exports.fetchObserveMetricsAsync = fetchObserveMetricsAsync;
const tslib_1 = require("tslib");
const errors_1 = require("../commandUtils/errors");
const ObserveQuery_1 = require("../graphql/queries/ObserveQuery");
const log_1 = tslib_1.__importDefault(require("../log"));
const formatMetrics_1 = require("./formatMetrics");
const platforms_1 = require("./platforms");
function validateDateFlag(value, flagName) {
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
        throw new errors_1.EasCommandError(`Invalid ${flagName} date: "${value}". Provide a valid ISO 8601 date (e.g. 2025-01-01).`);
    }
}
async function fetchObserveMetricsAsync(graphqlClient, appId, metricNames, platforms, startTime, endTime) {
    const queries = platforms.map(async (appPlatform) => {
        const observePlatform = platforms_1.appPlatformToObservePlatform[appPlatform];
        try {
            const appVersions = await ObserveQuery_1.ObserveQuery.appVersionsAsync(graphqlClient, {
                appId,
                platform: observePlatform,
                startTime,
                endTime,
                metricNames,
            });
            return { appPlatform, appVersions };
        }
        catch (error) {
            log_1.default.warn(`Failed to fetch observe data on ${observePlatform}: ${error.message}`);
            return null;
        }
    });
    const results = await Promise.all(queries);
    const metricsMap = new Map();
    const buildNumbersMap = new Map();
    const updateIdsMap = new Map();
    const totalEventCounts = new Map();
    for (const result of results) {
        if (!result) {
            continue;
        }
        const { appPlatform, appVersions } = result;
        for (const version of appVersions) {
            const key = (0, formatMetrics_1.makeMetricsKey)(version.appVersion, appPlatform);
            if (!metricsMap.has(key)) {
                metricsMap.set(key, new Map());
            }
            if (!buildNumbersMap.has(key)) {
                buildNumbersMap.set(key, version.buildNumbers.map(bn => bn.appBuildNumber));
            }
            if (!updateIdsMap.has(key)) {
                updateIdsMap.set(key, version.updates.map(u => u.appUpdateId));
            }
            for (const metric of version.metrics) {
                const values = {
                    min: metric.statistics.min,
                    max: metric.statistics.max,
                    median: metric.statistics.median,
                    average: metric.statistics.average,
                    p80: metric.statistics.p80,
                    p90: metric.statistics.p90,
                    p99: metric.statistics.p99,
                    eventCount: metric.eventCount,
                };
                metricsMap.get(key).set(metric.metricName, values);
                const eventCountKey = `${metric.metricName}:${appPlatform}`;
                totalEventCounts.set(eventCountKey, (totalEventCounts.get(eventCountKey) ?? 0) + metric.eventCount);
            }
        }
    }
    return { metricsMap, buildNumbersMap, updateIdsMap, totalEventCounts };
}
