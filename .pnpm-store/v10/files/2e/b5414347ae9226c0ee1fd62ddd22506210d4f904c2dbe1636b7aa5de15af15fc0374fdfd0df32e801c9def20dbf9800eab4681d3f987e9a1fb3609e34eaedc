"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const pagination_1 = require("../../commandUtils/pagination");
const log_1 = tslib_1.__importDefault(require("../../log"));
const fetchNavigationRoutes_1 = require("../../observe/fetchNavigationRoutes");
const flags_2 = require("../../observe/flags");
const formatNavigationRoutes_1 = require("../../observe/formatNavigationRoutes");
const metricNames_1 = require("../../observe/metricNames");
const platforms_1 = require("../../observe/platforms");
const resolveProjectContext_1 = require("../../observe/resolveProjectContext");
const startAndEndTime_1 = require("../../observe/startAndEndTime");
const json_1 = require("../../utils/json");
const DEFAULT_ROUTES_LIMIT = 50;
const STAT_OPTIONS = ['median', 'med', 'p90', 'count', 'event_count', 'eventCount'];
const DEFAULT_STATS_TABLE = ['median', 'count'];
const DEFAULT_STATS_JSON = ['median', 'p90', 'count'];
class ObserveRoutes extends EasCommand_1.default {
    static description = 'display app navigation route metrics (Cold TTR, Warm TTR, TTI) grouped by route name';
    static flags = {
        ...flags_2.ObservePlatformFlag,
        metric: core_1.Flags.option({
            description: 'Navigation metric to display (can be specified multiple times). Defaults to all three.',
            multiple: true,
            options: Object.keys(metricNames_1.NAVIGATION_METRIC_ALIASES),
        })(),
        stat: core_1.Flags.option({
            description: 'Statistic to display per metric (can be specified multiple times)',
            multiple: true,
            options: STAT_OPTIONS,
        })(),
        ...flags_2.ObserveAfterFlag,
        limit: (0, pagination_1.getLimitFlagWithCustomValues)({
            defaultTo: DEFAULT_ROUTES_LIMIT,
            limit: 200,
        }),
        ...flags_2.ObserveTimeRangeFlags,
        ...flags_2.ObserveAppVersionFlag,
        ...flags_2.ObserveUpdateIdFlag,
        'build-number': core_1.Flags.string({
            description: 'Filter by app build number',
        }),
        'route-name': core_1.Flags.string({
            description: 'Filter by route name (can be specified multiple times to include several routes)',
            multiple: true,
        }),
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
        const { flags } = await this.parse(ObserveRoutes);
        const { projectId, graphqlClient } = await (0, resolveProjectContext_1.resolveObserveCommandContextAsync)({
            command: this,
            commandClass: ObserveRoutes,
            loggedInOnlyContextDefinition: ObserveRoutes.loggedInOnlyContextDefinition,
            projectIdOverride: flags['project-id'],
            nonInteractive: flags['non-interactive'],
        });
        if (flags.json) {
            (0, json_1.enableJsonOutput)();
        }
        const metricNames = flags.metric?.length
            ? Array.from(new Set(flags.metric.map(metricNames_1.resolveNavigationMetricName)))
            : formatNavigationRoutes_1.NAVIGATION_METRIC_NAMES;
        const argumentsStat = flags.stat?.length
            ? Array.from(new Set(flags.stat.map(formatNavigationRoutes_1.resolveNavigationStatKey)))
            : undefined;
        const routeNames = flags['route-name']?.length
            ? Array.from(new Set(flags['route-name']))
            : undefined;
        const { daysBack, startTime, endTime } = (0, startAndEndTime_1.resolveTimeRange)(flags);
        const platforms = (0, platforms_1.appPlatformsFromFlag)(flags.platform);
        const { routes, pageInfoByPlatform } = await (0, fetchNavigationRoutes_1.fetchObserveNavigationRoutesAsync)(graphqlClient, projectId, {
            startTime,
            endTime,
            platforms,
            limit: flags.limit ?? DEFAULT_ROUTES_LIMIT,
            ...(flags.after && { after: flags.after }),
            appVersion: flags['app-version'],
            updateId: flags['update-id'],
            buildNumber: flags['build-number'],
            routeNames,
        });
        if (flags.json) {
            const stats = argumentsStat ?? DEFAULT_STATS_JSON;
            (0, json_1.printJsonOnlyOutput)((0, formatNavigationRoutes_1.buildObserveNavigationRoutesJson)(routes, metricNames, stats, pageInfoByPlatform));
        }
        else {
            const stats = argumentsStat ?? DEFAULT_STATS_TABLE;
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, formatNavigationRoutes_1.buildObserveNavigationRoutesTable)(routes, metricNames, stats, {
                daysBack,
                startTime,
                endTime,
                pageInfoByPlatform,
            }));
        }
    }
}
exports.default = ObserveRoutes;
