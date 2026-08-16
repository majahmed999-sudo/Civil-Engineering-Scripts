"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildObserveCustomEventsTable = buildObserveCustomEventsTable;
exports.buildObserveCustomEventsJson = buildObserveCustomEventsJson;
exports.buildObserveCustomEventsEmptyWithSuggestionsTable = buildObserveCustomEventsEmptyWithSuggestionsTable;
exports.buildObserveCustomEventsEmptyWithSuggestionsJson = buildObserveCustomEventsEmptyWithSuggestionsJson;
exports.buildObserveCustomEventNamesTable = buildObserveCustomEventNamesTable;
exports.buildObserveCustomEventNamesJson = buildObserveCustomEventNamesJson;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const renderTextTable_1 = tslib_1.__importDefault(require("../utils/renderTextTable"));
const formatUtils_1 = require("./formatUtils");
function formatSeverity(event) {
    if (event.severityText) {
        return event.severityText;
    }
    if (event.severityNumber != null) {
        return String(event.severityNumber);
    }
    return '-';
}
function buildObserveCustomEventsTable(events, pageInfo, options) {
    if (events.length === 0) {
        return chalk_1.default.yellow('No events found.');
    }
    const showEventName = !options?.eventName;
    const hasSeverity = events.some(e => e.severityText != null || e.severityNumber != null);
    const headers = [
        'Timestamp',
        ...(showEventName ? ['Event'] : []),
        ...(hasSeverity ? ['Severity'] : []),
        'App Version',
        'Platform',
        'Device',
        'Country',
    ];
    const rows = events.map(event => [
        (0, formatUtils_1.formatLogTimestamp)(event.timestamp),
        ...(showEventName ? [event.eventName] : []),
        ...(hasSeverity ? [formatSeverity(event)] : []),
        `${event.appVersion} (${event.appBuildNumber})`,
        `${event.deviceOs} ${event.deviceOsVersion}`,
        event.deviceModel,
        event.countryCode ?? '-',
    ]);
    const lines = [];
    if (options) {
        const timeDesc = (0, formatUtils_1.buildTimeRangeDescription)(options);
        const totalDesc = options.totalEventCount != null
            ? ` — ${options.totalEventCount.toLocaleString()} total events`
            : '';
        const subject = options.eventName ? `${options.eventName} events` : 'Events';
        lines.push(chalk_1.default.bold(`${subject} ${timeDesc}${totalDesc}`.trim()), '');
    }
    lines.push((0, renderTextTable_1.default)(headers, rows));
    if (pageInfo.hasNextPage && pageInfo.endCursor) {
        lines.push('', `Next page: --after ${pageInfo.endCursor}`);
    }
    return lines.join('\n');
}
function buildObserveCustomEventsJson(events, pageInfo) {
    return {
        events: events.map(event => ({
            id: event.id,
            eventName: event.eventName,
            timestamp: event.timestamp,
            sessionId: event.sessionId ?? null,
            severityNumber: event.severityNumber ?? null,
            severityText: event.severityText ?? null,
            properties: event.properties.map(p => ({
                key: p.key,
                value: p.value,
                type: p.type,
            })),
            appVersion: event.appVersion,
            appBuildNumber: event.appBuildNumber,
            appUpdateId: event.appUpdateId ?? null,
            appEasBuildId: event.appEasBuildId ?? null,
            deviceModel: event.deviceModel,
            deviceOs: event.deviceOs,
            deviceOsVersion: event.deviceOsVersion,
            countryCode: event.countryCode ?? null,
            environment: event.environment ?? null,
            easClientId: event.easClientId,
        })),
        pageInfo: {
            hasNextPage: pageInfo.hasNextPage,
            endCursor: pageInfo.endCursor ?? null,
        },
    };
}
function buildObserveCustomEventsEmptyWithSuggestionsTable(eventName, names, options) {
    const lines = [];
    const timeDesc = options ? (0, formatUtils_1.buildTimeRangeDescription)(options) : '';
    lines.push(chalk_1.default.yellow(`No events found matching "${eventName}" ${timeDesc}.`.trim()));
    if (names.length === 0) {
        lines.push('', chalk_1.default.yellow('No event names found in this time range.'));
        return lines.join('\n');
    }
    lines.push('', 'Available event names in this time range:', '');
    const headers = ['Event Name', 'Count'];
    const rows = names.map(n => [n.eventName, n.count.toLocaleString()]);
    lines.push((0, renderTextTable_1.default)(headers, rows));
    if (options?.isTruncated) {
        lines.push('', chalk_1.default.yellow('Result is truncated; not all event names are shown.'));
    }
    return lines.join('\n');
}
function buildObserveCustomEventsEmptyWithSuggestionsJson(eventName, names, isTruncated) {
    return {
        filteredEventName: eventName,
        events: [],
        availableEventNames: names.map(n => ({ eventName: n.eventName, count: n.count })),
        availableEventNamesIsTruncated: isTruncated,
    };
}
function buildObserveCustomEventNamesTable(names, options) {
    if (names.length === 0) {
        return chalk_1.default.yellow('No event names found.');
    }
    const headers = ['Event Name', 'Count'];
    const rows = names.map(n => [n.eventName, n.count.toLocaleString()]);
    const lines = [];
    if (options) {
        const timeDesc = (0, formatUtils_1.buildTimeRangeDescription)(options);
        const subject = 'Event names';
        lines.push(chalk_1.default.bold(`${subject} ${timeDesc}`.trim()), '');
    }
    lines.push((0, renderTextTable_1.default)(headers, rows));
    if (options?.isTruncated) {
        lines.push('', chalk_1.default.yellow('Result is truncated; not all event names are shown.'));
    }
    return lines.join('\n');
}
function buildObserveCustomEventNamesJson(names, isTruncated) {
    return {
        names: names.map(n => ({ eventName: n.eventName, count: n.count })),
        isTruncated,
    };
}
