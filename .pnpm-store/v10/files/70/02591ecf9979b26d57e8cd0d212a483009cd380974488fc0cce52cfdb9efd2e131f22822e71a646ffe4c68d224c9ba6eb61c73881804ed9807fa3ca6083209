"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsOrderPreset = void 0;
exports.resolveOrderBy = resolveOrderBy;
exports.fetchObserveEventsAsync = fetchObserveEventsAsync;
exports.fetchTotalEventCountAsync = fetchTotalEventCountAsync;
const generated_1 = require("../graphql/generated");
const ObserveQuery_1 = require("../graphql/queries/ObserveQuery");
var EventsOrderPreset;
(function (EventsOrderPreset) {
    EventsOrderPreset["Slowest"] = "SLOWEST";
    EventsOrderPreset["Fastest"] = "FASTEST";
    EventsOrderPreset["Newest"] = "NEWEST";
    EventsOrderPreset["Oldest"] = "OLDEST";
})(EventsOrderPreset || (exports.EventsOrderPreset = EventsOrderPreset = {}));
function resolveOrderBy(input) {
    const preset = input.toUpperCase();
    switch (preset) {
        case EventsOrderPreset.Slowest:
            return {
                field: generated_1.AppObserveEventsOrderByField.MetricValue,
                direction: generated_1.AppObserveEventsOrderByDirection.Desc,
            };
        case EventsOrderPreset.Fastest:
            return {
                field: generated_1.AppObserveEventsOrderByField.MetricValue,
                direction: generated_1.AppObserveEventsOrderByDirection.Asc,
            };
        case EventsOrderPreset.Newest:
            return {
                field: generated_1.AppObserveEventsOrderByField.Timestamp,
                direction: generated_1.AppObserveEventsOrderByDirection.Desc,
            };
        case EventsOrderPreset.Oldest:
            return {
                field: generated_1.AppObserveEventsOrderByField.Timestamp,
                direction: generated_1.AppObserveEventsOrderByDirection.Asc,
            };
    }
}
async function fetchObserveEventsAsync(graphqlClient, appId, options) {
    const filter = {
        ...(options.startTime && { startTime: options.startTime }),
        ...(options.endTime && { endTime: options.endTime }),
        ...(options.metricName && { metricName: options.metricName }),
        ...(options.platform && { platform: options.platform }),
        ...(options.appVersion && { appVersion: options.appVersion }),
        ...(options.updateId && { appUpdateId: options.updateId }),
        ...(options.sessionId && { sessionId: options.sessionId }),
    };
    return await ObserveQuery_1.ObserveQuery.eventsAsync(graphqlClient, {
        appId,
        filter,
        first: options.limit,
        ...(options.after && { after: options.after }),
        orderBy: options.orderBy,
    });
}
const appPlatformToObservePlatform = {
    [generated_1.AppPlatform.Android]: generated_1.AppObservePlatform.Android,
    [generated_1.AppPlatform.Ios]: generated_1.AppObservePlatform.Ios,
};
async function fetchTotalEventCountAsync(graphqlClient, appId, metricName, platforms, startTime, endTime) {
    const queries = platforms.map(async (appPlatform) => {
        try {
            const versions = await ObserveQuery_1.ObserveQuery.appVersionsAsync(graphqlClient, {
                appId,
                platform: appPlatformToObservePlatform[appPlatform],
                startTime,
                endTime,
                metricNames: [metricName],
            });
            return versions.reduce((sum, v) => {
                const metric = v.metrics.find(m => m.metricName === metricName);
                return sum + (metric?.eventCount ?? 0);
            }, 0);
        }
        catch {
            return 0;
        }
    });
    const counts = await Promise.all(queries);
    return counts.reduce((a, b) => a + b, 0);
}
