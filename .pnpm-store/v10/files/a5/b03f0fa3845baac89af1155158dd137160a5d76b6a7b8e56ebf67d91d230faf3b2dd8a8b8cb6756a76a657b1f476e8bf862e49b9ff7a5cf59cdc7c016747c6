"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAVIGATION_METRIC_NAMES = exports.NAVIGATION_STAT_DISPLAY_NAMES = exports.NAVIGATION_STAT_ALIASES = void 0;
exports.resolveNavigationStatKey = resolveNavigationStatKey;
exports.isNavigationMetric = isNavigationMetric;
exports.buildObserveNavigationRoutesJson = buildObserveNavigationRoutesJson;
exports.buildObserveNavigationRoutesTable = buildObserveNavigationRoutesTable;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const errors_1 = require("../commandUtils/errors");
const platform_1 = require("../platform");
const renderTextTable_1 = tslib_1.__importDefault(require("../utils/renderTextTable"));
const formatUtils_1 = require("./formatUtils");
const metricNames_1 = require("./metricNames");
exports.NAVIGATION_STAT_ALIASES = {
    med: 'median',
    median: 'median',
    p90: 'p90',
    count: 'count',
    event_count: 'count',
    eventCount: 'count',
};
exports.NAVIGATION_STAT_DISPLAY_NAMES = {
    median: 'Med',
    p90: 'P90',
    count: 'Count',
};
function resolveNavigationStatKey(input) {
    const resolved = exports.NAVIGATION_STAT_ALIASES[input];
    if (resolved) {
        return resolved;
    }
    throw new errors_1.EasCommandError(`Unknown statistic: "${input}". Valid options: ${Object.keys(exports.NAVIGATION_STAT_ALIASES).join(', ')}`);
}
const FULL_METRIC_NAME_TO_FIELD = {
    'expo.navigation.cold_ttr': 'coldTtr',
    'expo.navigation.warm_ttr': 'warmTtr',
    'expo.navigation.tti': 'tti',
};
exports.NAVIGATION_METRIC_NAMES = Object.keys(FULL_METRIC_NAME_TO_FIELD);
function isNavigationMetric(metricName) {
    return metricName in FULL_METRIC_NAME_TO_FIELD;
}
function formatStatValue(stat, value) {
    if (value == null) {
        return '-';
    }
    if (stat === 'count') {
        return String(value);
    }
    return `${value.toFixed(2)}s`;
}
function formatMergedCell(stat, statValue, count) {
    const formatted = formatStatValue(stat, statValue);
    const countStr = count != null ? String(count) : '-';
    return `${formatted} (${countStr})`;
}
function metricStat(node, metricName) {
    const field = FULL_METRIC_NAME_TO_FIELD[metricName];
    if (!field) {
        throw new errors_1.EasCommandError(`Unknown navigation metric: "${metricName}"`);
    }
    const stat = node.route[field];
    return {
        count: stat.count,
        median: stat.median ?? null,
        p90: stat.p90 ?? null,
    };
}
function buildObserveNavigationRoutesJson(routes, metricNames, stats, pageInfoByPlatform) {
    const jsonRoutes = routes.map(node => {
        const metrics = {};
        for (const metricName of metricNames) {
            const values = metricStat(node, metricName);
            const statValues = {};
            for (const stat of stats) {
                statValues[stat] = values[stat] ?? null;
            }
            metrics[metricName] = statValues;
        }
        return {
            routeName: node.route.routeName,
            platform: node.platform,
            metrics,
        };
    });
    const pageInfoByPlatformOutput = {};
    for (const [platform, pageInfo] of pageInfoByPlatform) {
        pageInfoByPlatformOutput[platform] = {
            hasNextPage: pageInfo.hasNextPage,
            endCursor: pageInfo.endCursor ?? null,
        };
    }
    return { routes: jsonRoutes, pageInfoByPlatform: pageInfoByPlatformOutput };
}
function buildObserveNavigationRoutesTable(routes, metricNames, stats, options) {
    if (routes.length === 0) {
        return chalk_1.default.yellow('No navigation routes found.');
    }
    const displayStats = stats.filter(s => s !== 'count');
    const hasCount = stats.includes('count');
    const statsDesc = displayStats.length > 0
        ? displayStats.map(s => exports.NAVIGATION_STAT_DISPLAY_NAMES[s]).join(', ')
        : 'Navigation count';
    const timeDesc = (0, formatUtils_1.buildTimeRangeDescription)({
        daysBack: options?.daysBack,
        startTime: options?.startTime,
        endTime: options?.endTime,
    });
    const countSuffix = hasCount && displayStats.length > 0 ? ' (navigation count)' : '';
    const summaryLine = `${statsDesc} values${countSuffix}${timeDesc ? ` ${timeDesc}` : ''}`;
    const byPlatform = new Map();
    for (const node of routes) {
        if (!byPlatform.has(node.platform)) {
            byPlatform.set(node.platform, []);
        }
        byPlatform.get(node.platform).push(node);
    }
    const metricHeaders = [];
    for (const metricName of metricNames) {
        const displayName = (0, metricNames_1.getMetricDisplayName)(metricName);
        if (displayStats.length > 0 && hasCount) {
            for (const stat of displayStats) {
                metricHeaders.push(displayStats.length > 1
                    ? `${displayName} ${exports.NAVIGATION_STAT_DISPLAY_NAMES[stat]}`
                    : displayName);
            }
        }
        else {
            for (const stat of displayStats.length > 0
                ? displayStats
                : ['count']) {
                metricHeaders.push(displayStats.length === 0
                    ? `${displayName} Count`
                    : `${displayName} ${exports.NAVIGATION_STAT_DISPLAY_NAMES[stat]}`);
            }
        }
    }
    const headers = ['Route', ...metricHeaders];
    const sections = [chalk_1.default.bold(summaryLine)];
    for (const [platform, platformRoutes] of byPlatform) {
        sections.push('');
        sections.push(chalk_1.default.bold(platform_1.appPlatformDisplayNames[platform]));
        const rows = platformRoutes.map(node => {
            const cells = [];
            for (const metricName of metricNames) {
                const values = metricStat(node, metricName);
                if (displayStats.length > 0 && hasCount) {
                    for (const stat of displayStats) {
                        cells.push(formatMergedCell(stat, values[stat], values.count));
                    }
                }
                else {
                    for (const stat of displayStats.length > 0
                        ? displayStats
                        : ['count']) {
                        cells.push(formatStatValue(stat, values[stat]));
                    }
                }
            }
            return [node.route.routeName, ...cells];
        });
        sections.push((0, renderTextTable_1.default)(headers, rows));
        const pageInfo = options?.pageInfoByPlatform?.get(platform);
        if (pageInfo?.hasNextPage && pageInfo.endCursor) {
            sections.push(`Next page (${platform_1.appPlatformDisplayNames[platform]}): --after ${pageInfo.endCursor}`);
        }
    }
    return sections.join('\n');
}
