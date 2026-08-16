"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUpdateInsightsSummary = toUpdateInsightsSummary;
exports.buildUpdateInsightsJson = buildUpdateInsightsJson;
exports.buildUpdateInsightsTable = buildUpdateInsightsTable;
exports.formatPercent = formatPercent;
exports.formatBytes = formatBytes;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const formatTimespan_1 = require("../../insights/formatTimespan");
const formatFields_1 = tslib_1.__importDefault(require("../../utils/formatFields"));
const renderTextTable_1 = tslib_1.__importDefault(require("../../utils/renderTextTable"));
function toUpdateInsightsSummary(groupId, updates, timespan) {
    const platforms = updates
        .map(toPlatformSummary)
        .sort((a, b) => a.platform.localeCompare(b.platform));
    return {
        groupId,
        startTime: timespan.startTime,
        endTime: timespan.endTime,
        daysBack: timespan.daysBack,
        platforms,
    };
}
function toPlatformSummary(update) {
    const { insights } = update;
    const { totalInstalls, totalFailedInstalls } = insights.cumulativeMetrics.metricsAtLastTimestamp;
    const denom = totalInstalls + totalFailedInstalls;
    const crashRatePercent = denom === 0 ? 0 : (totalFailedInstalls / denom) * 100;
    const { labels, installsDataset, failedInstallsDataset } = insights.cumulativeMetrics.data;
    const daily = labels.map((date, i) => ({
        date,
        installs: installsDataset.difference[i] ?? 0,
        failedInstalls: failedInstallsDataset.difference[i] ?? 0,
    }));
    return {
        platform: update.platform,
        updateId: update.id,
        totalUniqueUsers: insights.totalUniqueUsers,
        totalInstalls,
        totalFailedInstalls,
        crashRatePercent,
        launchAssetCount: insights.cumulativeAverageMetrics.launchAssetCount,
        averageUpdatePayloadBytes: insights.cumulativeAverageMetrics.averageUpdatePayloadBytes,
        daily,
    };
}
function buildUpdateInsightsJson(summary) {
    return {
        groupId: summary.groupId,
        timespan: {
            start: summary.startTime,
            end: summary.endTime,
            ...(summary.daysBack !== undefined ? { daysBack: summary.daysBack } : {}),
        },
        platforms: summary.platforms.map(p => ({
            platform: p.platform,
            updateId: p.updateId,
            totals: {
                uniqueUsers: p.totalUniqueUsers,
                installs: p.totalInstalls,
                failedInstalls: p.totalFailedInstalls,
                crashRatePercent: p.crashRatePercent,
            },
            payload: {
                launchAssetCount: p.launchAssetCount,
                averageUpdatePayloadBytes: p.averageUpdatePayloadBytes,
            },
            daily: p.daily,
        })),
    };
}
function buildUpdateInsightsTable(summary) {
    const sections = [];
    sections.push(chalk_1.default.bold('Update group insights:'));
    sections.push((0, formatFields_1.default)([
        { label: 'Group ID', value: summary.groupId },
        { label: 'Time range', value: (0, formatTimespan_1.formatTimespan)(summary) },
        { label: 'Platforms', value: summary.platforms.map(p => p.platform).join(', ') || 'N/A' },
    ]));
    const dailyHeader = summary.daysBack ? ` (last ${summary.daysBack} days)` : '';
    for (const platform of summary.platforms) {
        sections.push('');
        sections.push(chalk_1.default.bold(`${chalk_1.default.cyan(platform.platform)}:`));
        sections.push((0, formatFields_1.default)([
            { label: 'Update ID', value: platform.updateId },
            { label: 'Launches', value: platform.totalInstalls.toLocaleString() },
            { label: 'Failed launches', value: platform.totalFailedInstalls.toLocaleString() },
            { label: 'Crash rate', value: formatPercent(platform.crashRatePercent) },
            { label: 'Unique users', value: platform.totalUniqueUsers.toLocaleString() },
            { label: 'Launch assets', value: platform.launchAssetCount.toLocaleString() },
            { label: 'Avg payload size', value: formatBytes(platform.averageUpdatePayloadBytes) },
        ]));
        if (platform.daily.length > 0) {
            sections.push('');
            sections.push(chalk_1.default.bold(`  Daily breakdown${dailyHeader}:`));
            sections.push('');
            sections.push(indent(renderDailyTable(platform.daily), 2));
        }
    }
    return sections.join('\n');
}
function formatPercent(value) {
    return `${value.toFixed(2)}%`;
}
function formatBytes(bytes) {
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function renderDailyTable(rows) {
    return (0, renderTextTable_1.default)(['Date', 'Launches', 'Crashes'], rows.map(r => [
        (0, formatTimespan_1.toDateOnly)(r.date),
        r.installs.toLocaleString(),
        r.failedInstalls.toLocaleString(),
    ]));
}
function indent(text, spaces) {
    const pad = ' '.repeat(spaces);
    return text
        .split('\n')
        .map(line => (line.length > 0 ? pad + line : line))
        .join('\n');
}
