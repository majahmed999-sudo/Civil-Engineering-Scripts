"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildObserveEventsTable = buildObserveEventsTable;
exports.buildObserveEventsJson = buildObserveEventsJson;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const renderTextTable_1 = tslib_1.__importDefault(require("../utils/renderTextTable"));
const formatUtils_1 = require("./formatUtils");
const metricNames_1 = require("./metricNames");
function resolveCustomParams(event) {
    return event.customParams ?? null;
}
function buildObserveEventsTable(events, pageInfo, options) {
    if (events.length === 0) {
        return chalk_1.default.yellow('No events found.');
    }
    const hasUpdates = events.some(e => e.appUpdateId);
    const headers = [
        'Value',
        'App Version',
        ...(hasUpdates ? ['Update'] : []),
        'Platform',
        'Device',
        'Country',
        'Timestamp',
    ];
    const rows = events.map(event => [
        `${event.metricValue.toFixed(2)}s`,
        `${event.appVersion} (${event.appBuildNumber})`,
        ...(hasUpdates ? [event.appUpdateId ?? '-'] : []),
        `${event.deviceOs} ${event.deviceOsVersion}`,
        event.deviceModel,
        event.countryCode ?? '-',
        (0, formatUtils_1.formatTimestamp)(event.timestamp),
    ]);
    const lines = [];
    if (options) {
        const metricDisplay = (0, metricNames_1.getMetricDisplayName)(options.metricName);
        const timeDesc = (0, formatUtils_1.buildTimeRangeDescription)(options);
        const totalDesc = options.totalEventCount != null
            ? ` — ${options.totalEventCount.toLocaleString()} total events`
            : '';
        lines.push(chalk_1.default.bold(`${metricDisplay} events ${timeDesc}${totalDesc}`.trim()), '');
    }
    lines.push((0, renderTextTable_1.default)(headers, rows));
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
        lines.push('', `Next page: --after ${pageInfo.endCursor}`);
    }
    return lines.join('\n');
}
function buildObserveEventsJson(events, pageInfo) {
    return {
        events: events.map(event => ({
            id: event.id,
            metricName: event.metricName,
            metricValue: event.metricValue,
            appVersion: event.appVersion,
            appBuildNumber: event.appBuildNumber,
            appUpdateId: event.appUpdateId ?? null,
            deviceModel: event.deviceModel,
            deviceOs: event.deviceOs,
            deviceOsVersion: event.deviceOsVersion,
            countryCode: event.countryCode ?? null,
            sessionId: event.sessionId ?? null,
            easClientId: event.easClientId,
            timestamp: event.timestamp,
            customParams: resolveCustomParams(event),
            routeName: event.routeName ?? null,
        })),
        pageInfo: {
            hasNextPage: pageInfo.hasNextPage,
            endCursor: pageInfo.endCursor ?? null,
        },
    };
}
