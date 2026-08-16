"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchObserveSessionEventsAsync = fetchObserveSessionEventsAsync;
const generated_1 = require("../graphql/generated");
const fetchCustomEvents_1 = require("./fetchCustomEvents");
const fetchEvents_1 = require("./fetchEvents");
function metricEventToEntry(event) {
    return {
        source: 'metric',
        timestamp: event.timestamp,
        sessionId: event.sessionId ?? '',
        appVersion: event.appVersion,
        appBuildNumber: event.appBuildNumber,
        appUpdateId: event.appUpdateId ?? null,
        deviceModel: event.deviceModel,
        deviceOs: event.deviceOs,
        deviceOsVersion: event.deviceOsVersion,
        countryCode: event.countryCode ?? null,
        easClientId: event.easClientId,
        metricName: event.metricName,
        metricValue: event.metricValue,
        customParams: event.customParams ?? null,
        routeName: event.routeName ?? null,
    };
}
function customEventToEntry(event) {
    return {
        source: 'log',
        timestamp: event.timestamp,
        sessionId: event.sessionId ?? '',
        appVersion: event.appVersion,
        appBuildNumber: event.appBuildNumber,
        appUpdateId: event.appUpdateId ?? null,
        deviceModel: event.deviceModel,
        deviceOs: event.deviceOs,
        deviceOsVersion: event.deviceOsVersion,
        countryCode: event.countryCode ?? null,
        easClientId: event.easClientId,
        eventName: event.eventName,
        severityText: event.severityText ?? null,
        severityNumber: event.severityNumber ?? null,
        properties: event.properties.map(p => ({ key: p.key, value: p.value, type: p.type })),
        environment: event.environment ?? null,
    };
}
async function fetchObserveSessionEventsAsync(graphqlClient, appId, options) {
    const [metricResult, logResult] = await Promise.all([
        (0, fetchEvents_1.fetchObserveEventsAsync)(graphqlClient, appId, {
            orderBy: {
                field: generated_1.AppObserveEventsOrderByField.Timestamp,
                direction: generated_1.AppObserveEventsOrderByDirection.Asc,
            },
            limit: options.limit,
            sessionId: options.sessionId,
        }),
        (0, fetchCustomEvents_1.fetchObserveCustomEventsAsync)(graphqlClient, appId, {
            limit: options.limit,
            sessionId: options.sessionId,
        }),
    ]);
    const entries = [
        ...metricResult.events.map(metricEventToEntry),
        ...logResult.events.map(customEventToEntry),
    ].sort((a, b) => (a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0));
    let metadata = null;
    if (entries.length > 0) {
        const newest = entries[entries.length - 1];
        metadata = {
            appVersion: newest.appVersion,
            appBuildNumber: newest.appBuildNumber,
            appUpdateId: newest.appUpdateId,
            deviceOs: newest.deviceOs,
            deviceOsVersion: newest.deviceOsVersion,
            deviceModel: newest.deviceModel,
            countryCode: newest.countryCode,
            firstSeenAt: entries[0].timestamp,
            lastSeenAt: newest.timestamp,
        };
    }
    return {
        entries,
        metadata,
        hasMoreMetricEvents: metricResult.pageInfo.hasNextPage,
        hasMoreLogEvents: logResult.pageInfo.hasNextPage,
    };
}
