"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildObserveSessionEventsTable = buildObserveSessionEventsTable;
exports.buildObserveSessionEventsJson = buildObserveSessionEventsJson;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const formatUtils_1 = require("./formatUtils");
const metricNames_1 = require("./metricNames");
const renderTextTable_1 = tslib_1.__importDefault(require("../utils/renderTextTable"));
function formatEntryName(entry) {
    if (entry.source === 'metric' && entry.metricName) {
        const name = (0, metricNames_1.getMetricDisplayName)(entry.metricName);
        return entry.routeName ? `${name} · ${entry.routeName}` : name;
    }
    return entry.eventName ?? '-';
}
function formatMetricEntryValue(entry) {
    if (typeof entry.metricValue === 'number') {
        return `${entry.metricValue.toFixed(2)}s`;
    }
    return '-';
}
function formatEntrySeverity(entry) {
    if (entry.source !== 'log') {
        return '-';
    }
    if (entry.severityText) {
        return entry.severityText;
    }
    if (entry.severityNumber != null) {
        return String(entry.severityNumber);
    }
    return '-';
}
function primitivePropertyLines(entry) {
    if (entry.source !== 'log' || !entry.properties) {
        return [];
    }
    return entry.properties
        .filter(p => p.type === 'STRING' || p.type === 'NUMBER' || p.type === 'BOOLEAN')
        .map(p => `${p.key}=${p.value}`);
}
function formatOffsetSeconds(startIso, currentIso) {
    const offsetMs = new Date(currentIso).getTime() - new Date(startIso).getTime();
    return `${(offsetMs / 1000).toFixed(2)}s`;
}
function buildObserveSessionEventsTable(entries, options) {
    const lines = [];
    if (options?.metadata) {
        const { metadata } = options;
        lines.push(`App version: ${metadata.appVersion} (${metadata.appBuildNumber})`, `Device:      ${metadata.deviceModel} · ${metadata.deviceOs} ${metadata.deviceOsVersion}`, `First seen:  ${(0, formatUtils_1.formatLogTimestamp)(metadata.firstSeenAt)}`, `Last seen:   ${(0, formatUtils_1.formatLogTimestamp)(metadata.lastSeenAt)}`, '');
    }
    if (entries.length === 0) {
        lines.push(chalk_1.default.yellow('No events found for this session.'));
        return lines.join('\n');
    }
    const startIso = entries[0].timestamp;
    const headers = ['Offset', 'Type', 'Name', 'Value', 'Properties', 'Severity'];
    const rows = [];
    for (const entry of entries) {
        const offset = formatOffsetSeconds(startIso, entry.timestamp);
        const type = entry.source === 'metric' ? 'metric' : 'log';
        const name = formatEntryName(entry);
        const severity = formatEntrySeverity(entry);
        if (entry.source === 'metric') {
            rows.push([offset, type, name, formatMetricEntryValue(entry), '-', severity]);
            continue;
        }
        const propLines = primitivePropertyLines(entry);
        if (propLines.length === 0) {
            rows.push([offset, type, name, '-', '-', severity]);
            continue;
        }
        rows.push([offset, type, name, '-', propLines[0], severity]);
        for (let i = 1; i < propLines.length; i++) {
            rows.push(['', '', '', '', propLines[i], '']);
        }
    }
    lines.push((0, renderTextTable_1.default)(headers, rows));
    if (options?.hasMoreMetricEvents || options?.hasMoreLogEvents) {
        const sources = [];
        if (options.hasMoreMetricEvents) {
            sources.push('metric events');
        }
        if (options.hasMoreLogEvents) {
            sources.push('log events');
        }
        lines.push('', chalk_1.default.yellow(`More ${sources.join(' and ')} are available for this session; only the first 100 of each are shown.`));
    }
    return lines.join('\n');
}
function buildObserveSessionEventsJson(entries, sessionId, metadata, hasMoreMetricEvents, hasMoreLogEvents) {
    return {
        sessionId,
        metadata,
        entries,
        hasMoreMetricEvents,
        hasMoreLogEvents,
    };
}
