"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const log_1 = tslib_1.__importDefault(require("../../log"));
const fetchMetrics_1 = require("../../observe/fetchMetrics");
const flags_2 = require("../../observe/flags");
const formatMetrics_1 = require("../../observe/formatMetrics");
const metricNames_1 = require("../../observe/metricNames");
const platforms_1 = require("../../observe/platforms");
const resolveProjectContext_1 = require("../../observe/resolveProjectContext");
const startAndEndTime_1 = require("../../observe/startAndEndTime");
const json_1 = require("../../utils/json");
const DEFAULT_METRICS = [
    'expo.app_startup.cold_launch_time',
    'expo.app_startup.warm_launch_time',
    'expo.app_startup.tti',
    'expo.app_startup.ttr',
    'expo.app_startup.bundle_load_time',
];
const DEFAULT_STATS_TABLE = ['median', 'eventCount'];
const DEFAULT_STATS_JSON = [
    'min',
    'median',
    'max',
    'average',
    'p80',
    'p90',
    'p99',
    'eventCount',
];
class ObserveMetricsSummary extends EasCommand_1.default {
    static description = 'display aggregated performance metric statistics grouped by app version';
    static flags = {
        ...flags_2.ObservePlatformFlag,
        metric: core_1.Flags.option({
            description: 'Metric name to display (can be specified multiple times).',
            multiple: true,
            options: Object.keys(metricNames_1.METRIC_ALIASES),
        })(),
        stat: core_1.Flags.option({
            description: 'Statistic to display per metric (can be specified multiple times)',
            multiple: true,
            options: DEFAULT_STATS_JSON,
        })(),
        ...flags_2.ObserveTimeRangeFlags,
        ...flags_2.ObserveProjectIdFlag,
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.LoggedIn,
    };
    static loggedInOnlyContextDefinition = {
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { flags } = await this.parse(ObserveMetricsSummary);
        const { projectId, graphqlClient } = await (0, resolveProjectContext_1.resolveObserveCommandContextAsync)({
            command: this,
            commandClass: ObserveMetricsSummary,
            loggedInOnlyContextDefinition: ObserveMetricsSummary.loggedInOnlyContextDefinition,
            projectIdOverride: flags['project-id'],
            nonInteractive: flags['non-interactive'],
        });
        if (flags.json) {
            (0, json_1.enableJsonOutput)();
        }
        const metricNames = flags.metric?.length
            ? flags.metric.map(metricNames_1.resolveMetricName)
            : DEFAULT_METRICS;
        const { daysBack, startTime, endTime } = (0, startAndEndTime_1.resolveTimeRange)(flags);
        const platforms = (0, platforms_1.appPlatformsFromFlag)(flags.platform);
        const { metricsMap, buildNumbersMap, updateIdsMap, totalEventCounts } = await (0, fetchMetrics_1.fetchObserveMetricsAsync)(graphqlClient, projectId, metricNames, platforms, startTime, endTime);
        const argumentsStat = flags.stat?.length
            ? Array.from(new Set(flags.stat.map(formatMetrics_1.resolveStatKey)))
            : undefined;
        if (flags.json) {
            const stats = argumentsStat ?? DEFAULT_STATS_JSON;
            (0, json_1.printJsonOnlyOutput)((0, formatMetrics_1.buildObserveMetricsJson)(metricsMap, metricNames, stats, totalEventCounts, buildNumbersMap, updateIdsMap));
        }
        else {
            const stats = argumentsStat ?? DEFAULT_STATS_TABLE;
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, formatMetrics_1.buildObserveMetricsTable)(metricsMap, metricNames, stats, {
                daysBack,
                buildNumbersMap,
                totalEventCounts,
            }));
        }
    }
}
exports.default = ObserveMetricsSummary;
