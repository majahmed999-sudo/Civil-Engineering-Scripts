"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toChannelInsightsSummary = toChannelInsightsSummary;
exports.buildChannelInsightsJson = buildChannelInsightsJson;
exports.buildChannelInsightsTable = buildChannelInsightsTable;
const tslib_1 = require("tslib");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const formatTimespan_1 = require("../../insights/formatTimespan");
const formatFields_1 = tslib_1.__importDefault(require("../../utils/formatFields"));
const renderTextTable_1 = tslib_1.__importDefault(require("../../utils/renderTextTable"));
function toChannelInsightsSummary(channelName, runtimeVersion, insights, timespan) {
    const mostPopular = insights.mostPopularUpdates.map((u, i) => ({
        rank: i + 1,
        groupId: u.group,
        message: u.message ?? null,
        platform: u.platform,
        totalUniqueUsers: u.insights.totalUniqueUsers,
    }));
    const otaTotalUniqueUsers = mostPopular.reduce((sum, u) => sum + u.totalUniqueUsers, 0);
    return {
        channelName,
        runtimeVersion,
        startTime: timespan.startTime,
        endTime: timespan.endTime,
        daysBack: timespan.daysBack,
        embeddedUpdateTotalUniqueUsers: insights.embeddedUpdateTotalUniqueUsers,
        otaTotalUniqueUsers,
        mostPopularUpdates: mostPopular,
        cumulativeMetricsAtLastTimestamp: insights.cumulativeMetricsOverTime.metricsAtLastTimestamp.map(m => ({ id: m.id, label: m.label, data: m.data })),
        uniqueUsersOverTime: {
            labels: insights.uniqueUsersOverTime.data.labels,
            datasets: insights.uniqueUsersOverTime.data.datasets.map(d => ({
                id: d.id,
                label: d.label,
                data: d.data,
            })),
        },
        cumulativeMetricsOverTime: {
            labels: insights.cumulativeMetricsOverTime.data.labels,
            datasets: insights.cumulativeMetricsOverTime.data.datasets.map(d => ({
                id: d.id,
                label: d.label,
                data: d.data,
            })),
        },
    };
}
function buildChannelInsightsJson(summary) {
    return {
        channel: summary.channelName,
        runtimeVersion: summary.runtimeVersion,
        timespan: {
            start: summary.startTime,
            end: summary.endTime,
            ...(summary.daysBack !== undefined ? { daysBack: summary.daysBack } : {}),
        },
        embeddedUpdateTotalUniqueUsers: summary.embeddedUpdateTotalUniqueUsers,
        otaTotalUniqueUsers: summary.otaTotalUniqueUsers,
        mostPopularUpdates: summary.mostPopularUpdates,
        cumulativeMetricsAtLastTimestamp: summary.cumulativeMetricsAtLastTimestamp,
        uniqueUsersOverTime: summary.uniqueUsersOverTime,
        cumulativeMetricsOverTime: summary.cumulativeMetricsOverTime,
    };
}
function buildChannelInsightsTable(summary) {
    const sections = [];
    sections.push(chalk_1.default.bold('Channel insights:'));
    sections.push((0, formatFields_1.default)([
        { label: 'Channel', value: summary.channelName },
        { label: 'Runtime version', value: summary.runtimeVersion },
        { label: 'Time range', value: (0, formatTimespan_1.formatTimespan)(summary) },
        {
            label: 'Embedded update users',
            value: summary.embeddedUpdateTotalUniqueUsers.toLocaleString(),
        },
        { label: 'OTA update users', value: summary.otaTotalUniqueUsers.toLocaleString() },
    ]));
    if (summary.cumulativeMetricsAtLastTimestamp.length > 0) {
        sections.push('');
        sections.push(chalk_1.default.bold('Cumulative metrics at last timestamp:'));
        sections.push((0, formatFields_1.default)(summary.cumulativeMetricsAtLastTimestamp.map(m => ({
            label: m.label,
            value: m.data.toLocaleString(),
        }))));
    }
    if (summary.mostPopularUpdates.length > 0) {
        sections.push('');
        sections.push(chalk_1.default.bold(`Most popular updates${formatTrailingTimespan(summary)}:`));
        sections.push(renderMostPopularTable(summary.mostPopularUpdates));
    }
    else {
        sections.push('');
        sections.push(chalk_1.default.yellow('No update launches recorded for this channel and runtime.'));
    }
    return sections.join('\n');
}
function formatTrailingTimespan(summary) {
    return summary.daysBack ? ` (last ${summary.daysBack} days)` : '';
}
function renderMostPopularTable(rows) {
    return (0, renderTextTable_1.default)(['#', 'Group ID', 'Platform', 'Unique users', 'Message'], rows.map(r => [
        String(r.rank),
        r.groupId,
        r.platform,
        r.totalUniqueUsers.toLocaleString(),
        r.message ?? '',
    ]));
}
