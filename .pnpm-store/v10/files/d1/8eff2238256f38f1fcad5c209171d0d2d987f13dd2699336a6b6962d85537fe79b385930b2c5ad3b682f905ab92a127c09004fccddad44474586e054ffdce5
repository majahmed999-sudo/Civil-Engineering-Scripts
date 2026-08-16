"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const errors_1 = require("../../commandUtils/errors");
const flags_1 = require("../../commandUtils/flags");
const pagination_1 = require("../../commandUtils/pagination");
const log_1 = tslib_1.__importDefault(require("../../log"));
const fetchEvents_1 = require("../../observe/fetchEvents");
const flags_2 = require("../../observe/flags");
const metricNames_1 = require("../../observe/metricNames");
const formatEvents_1 = require("../../observe/formatEvents");
const platforms_1 = require("../../observe/platforms");
const resolveProjectContext_1 = require("../../observe/resolveProjectContext");
const startAndEndTime_1 = require("../../observe/startAndEndTime");
const prompts_1 = require("../../prompts");
const json_1 = require("../../utils/json");
const DEFAULT_EVENTS_LIMIT = 10;
class ObserveMetrics extends EasCommand_1.default {
    static description = 'display individual performance metric samples ordered by value';
    static args = {
        metric: core_1.Args.string({
            description: 'Metric to query (e.g. tti, cold_launch, nav_tti)',
            required: false,
            options: Object.keys(metricNames_1.METRIC_ALIASES),
        }),
    };
    static flags = {
        sort: core_1.Flags.option({
            description: 'Sort order for events',
            options: Object.values(fetchEvents_1.EventsOrderPreset).map(s => s.toLowerCase()),
            required: false,
            default: fetchEvents_1.EventsOrderPreset.Oldest.valueOf().toLowerCase(),
        })(),
        ...flags_2.ObservePlatformFlag,
        ...flags_2.ObserveAfterFlag,
        limit: (0, pagination_1.getLimitFlagWithCustomValues)({
            defaultTo: DEFAULT_EVENTS_LIMIT,
            limit: 100,
        }),
        ...flags_2.ObserveTimeRangeFlags,
        ...flags_2.ObserveAppVersionFlag,
        ...flags_2.ObserveUpdateIdFlag,
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
        const { flags, args } = await this.parse(ObserveMetrics);
        const { projectId, graphqlClient } = await (0, resolveProjectContext_1.resolveObserveCommandContextAsync)({
            command: this,
            commandClass: ObserveMetrics,
            loggedInOnlyContextDefinition: ObserveMetrics.loggedInOnlyContextDefinition,
            projectIdOverride: flags['project-id'],
            nonInteractive: flags['non-interactive'],
        });
        if (flags.json) {
            (0, json_1.enableJsonOutput)();
        }
        let metricName;
        if (args.metric) {
            metricName = (0, metricNames_1.resolveMetricName)(args.metric);
        }
        else if (flags['non-interactive']) {
            throw new errors_1.EasCommandError('A metric argument is required in non-interactive mode. Available metrics: ' +
                Object.keys(metricNames_1.METRIC_ALIASES).join(', '));
        }
        else {
            const choices = Object.entries(metricNames_1.METRIC_SHORT_NAMES).map(([fullName, displayName]) => ({
                title: `${displayName} (${fullName})`,
                value: fullName,
            }));
            metricName = await (0, prompts_1.selectAsync)('Select a metric', choices);
        }
        const orderBy = (0, fetchEvents_1.resolveOrderBy)(flags.sort);
        const { daysBack, startTime, endTime } = (0, startAndEndTime_1.resolveTimeRange)(flags);
        const platform = (0, platforms_1.appObservePlatformFromFlag)(flags.platform);
        const platforms = (0, platforms_1.appPlatformsFromFlag)(flags.platform);
        const [{ events, pageInfo }, totalEventCount] = await Promise.all([
            (0, fetchEvents_1.fetchObserveEventsAsync)(graphqlClient, projectId, {
                metricName,
                orderBy,
                limit: flags.limit ?? DEFAULT_EVENTS_LIMIT,
                ...(flags.after && { after: flags.after }),
                startTime,
                endTime,
                platform,
                appVersion: flags['app-version'],
                updateId: flags['update-id'],
            }),
            (0, fetchEvents_1.fetchTotalEventCountAsync)(graphqlClient, projectId, metricName, platforms, startTime, endTime),
        ]);
        if (flags.json) {
            (0, json_1.printJsonOnlyOutput)((0, formatEvents_1.buildObserveEventsJson)(events, pageInfo));
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, formatEvents_1.buildObserveEventsTable)(events, pageInfo, {
                metricName,
                daysBack,
                startTime,
                endTime,
                totalEventCount,
            }));
        }
    }
}
exports.default = ObserveMetrics;
