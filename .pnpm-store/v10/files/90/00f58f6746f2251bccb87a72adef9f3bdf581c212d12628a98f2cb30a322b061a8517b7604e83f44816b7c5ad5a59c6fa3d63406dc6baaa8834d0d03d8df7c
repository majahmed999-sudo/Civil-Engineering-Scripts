"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STAT_DISPLAY_NAMES = exports.STAT_ALIASES = void 0;
exports.resolveStatKey = resolveStatKey;
exports.makeMetricsKey = makeMetricsKey;
exports.buildObserveMetricsJson = buildObserveMetricsJson;
exports.buildObserveMetricsTable = buildObserveMetricsTable;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const errors_1 = require("../commandUtils/errors");
const platform_1 = require("../platform");
const renderTextTable_1 = tslib_1.__importDefault(require("../utils/renderTextTable"));
const formatUtils_1 = require("./formatUtils");
const metricNames_1 = require("./metricNames");
exports.STAT_ALIASES = {
    min: 'min',
    max: 'max',
    med: 'median',
    median: 'median',
    avg: 'average',
    average: 'average',
    p80: 'p80',
    p90: 'p90',
    p99: 'p99',
    count: 'eventCount',
    event_count: 'eventCount',
    eventCount: 'eventCount',
};
exports.STAT_DISPLAY_NAMES = {
    min: 'Min',
    max: 'Max',
    median: 'Med',
    average: 'Avg',
    p80: 'P80',
    p90: 'P90',
    p99: 'P99',
    eventCount: 'Count',
};
function resolveStatKey(input) {
    const resolved = exports.STAT_ALIASES[input];
    if (resolved) {
        return resolved;
    }
    throw new errors_1.EasCommandError(`Unknown statistic: "${input}". Valid options: ${Object.keys(exports.STAT_ALIASES).join(', ')}`);
}
function formatStatValue(stat, value) {
    if (value == null) {
        return '-';
    }
    if (stat === 'eventCount') {
        return String(value);
    }
    return `${value.toFixed(2)}s`;
}
function formatMergedCell(stat, statValue, eventCount) {
    const formatted = formatStatValue(stat, statValue);
    const count = eventCount != null ? String(eventCount) : '-';
    return `${formatted} (${count})`;
}
function makeMetricsKey(appVersion, platform) {
    return `${appVersion}:${platform}`;
}
function parseMetricsKey(key) {
    const lastColon = key.lastIndexOf(':');
    return {
        appVersion: key.slice(0, lastColon),
        platform: key.slice(lastColon + 1),
    };
}
function buildObserveMetricsJson(metricsMap, metricNames, stats, totalEventCounts, buildNumbersMap, updateIdsMap) {
    const versions = [];
    for (const [key, versionMetrics] of metricsMap) {
        const { appVersion, platform } = parseMetricsKey(key);
        const metrics = {};
        for (const metricName of metricNames) {
            const values = versionMetrics.get(metricName);
            const statValues = {};
            for (const stat of stats) {
                statValues[stat] = values?.[stat] ?? null;
            }
            metrics[metricName] = statValues;
        }
        versions.push({
            appVersion,
            platform,
            buildNumbers: buildNumbersMap?.get(key) ?? [],
            updateIds: updateIdsMap?.get(key) ?? [],
            metrics,
        });
    }
    // Group total event counts by metric → platform
    const counts = {};
    if (totalEventCounts) {
        for (const [key, count] of totalEventCounts) {
            const lastColon = key.lastIndexOf(':');
            const metricName = key.slice(0, lastColon);
            const platform = key.slice(lastColon + 1);
            if (!counts[metricName]) {
                counts[metricName] = {};
            }
            counts[metricName][platform] = count;
        }
    }
    return { versions, totalEventCounts: counts };
}
function buildStatsDescription(displayStats) {
    return displayStats.map(s => exports.STAT_DISPLAY_NAMES[s]).join(', ');
}
function buildObserveMetricsTable(metricsMap, metricNames, stats, options) {
    const { versions: results } = buildObserveMetricsJson(metricsMap, metricNames, stats);
    if (results.length === 0) {
        return chalk_1.default.yellow('No metrics data found.');
    }
    const displayStats = stats.filter(s => s !== 'eventCount');
    const hasEventCount = stats.includes('eventCount');
    // Build summary header
    const statsDesc = displayStats.length > 0 ? buildStatsDescription(displayStats) : 'Event count';
    const timeDesc = (0, formatUtils_1.buildTimeRangeDescription)({ daysBack: options?.daysBack });
    const countSuffix = hasEventCount && displayStats.length > 0 ? ' (event count)' : '';
    const summaryLine = `${statsDesc} values${countSuffix}${timeDesc ? ` ${timeDesc}` : ''}`;
    // Group results by platform
    const byPlatform = new Map();
    for (const result of results) {
        if (!byPlatform.has(result.platform)) {
            byPlatform.set(result.platform, []);
        }
        byPlatform.get(result.platform).push(result);
    }
    // Build metric column headers
    const metricHeaders = [];
    for (const m of metricNames) {
        const name = (0, metricNames_1.getMetricDisplayName)(m);
        if (displayStats.length > 0 && hasEventCount) {
            // Merged mode: one column per metric
            metricHeaders.push(name);
        }
        else {
            // Separate columns per stat
            for (const stat of displayStats.length > 0
                ? displayStats
                : ['eventCount']) {
                metricHeaders.push(`${name} ${exports.STAT_DISPLAY_NAMES[stat]}`);
            }
        }
    }
    const headers = ['App Version', ...metricHeaders];
    const sections = [chalk_1.default.bold(summaryLine)];
    for (const [platform, platformResults] of byPlatform) {
        sections.push('');
        sections.push(chalk_1.default.bold(platform_1.appPlatformDisplayNames[platform]));
        const rows = [];
        for (const result of platformResults) {
            const key = makeMetricsKey(result.appVersion, result.platform);
            const buildNumbers = options?.buildNumbersMap?.get(key);
            const versionLabel = buildNumbers?.length
                ? `${result.appVersion} (${buildNumbers.join(', ')})`
                : result.appVersion;
            const metricCells = [];
            for (const m of metricNames) {
                const values = result.metrics[m];
                if (displayStats.length > 0 && hasEventCount) {
                    for (const stat of displayStats) {
                        metricCells.push(formatMergedCell(stat, values?.[stat] ?? null, values?.eventCount ?? null));
                    }
                }
                else {
                    for (const stat of displayStats.length > 0
                        ? displayStats
                        : ['eventCount']) {
                        metricCells.push(formatStatValue(stat, values?.[stat] ?? null));
                    }
                }
            }
            rows.push([versionLabel, ...metricCells]);
        }
        let footerRow;
        if (options?.totalEventCounts) {
            const countCells = [];
            for (const m of metricNames) {
                const count = options.totalEventCounts.get(`${m}:${platform}`);
                countCells.push(count != null ? count.toLocaleString() : '-');
            }
            if (countCells.some(c => c !== '-')) {
                footerRow = ['Total events', ...countCells];
            }
        }
        sections.push((0, renderTextTable_1.default)(headers, rows, footerRow));
    }
    return sections.join('\n');
}
