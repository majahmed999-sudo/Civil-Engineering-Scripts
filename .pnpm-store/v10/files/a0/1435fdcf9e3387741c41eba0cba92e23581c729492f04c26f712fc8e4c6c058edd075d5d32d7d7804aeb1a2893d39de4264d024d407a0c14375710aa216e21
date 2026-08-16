"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const formatInsights_1 = require("../../channel/insights/formatInsights");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const ChannelInsightsQuery_1 = require("../../graphql/queries/ChannelInsightsQuery");
const timeRange_1 = require("../../insights/timeRange");
const log_1 = tslib_1.__importDefault(require("../../log"));
const json_1 = require("../../utils/json");
class ChannelInsights extends EasCommand_1.default {
    static description = 'display adoption, crash, and unique-user insights for a channel + runtime version';
    static flags = {
        channel: core_1.Flags.string({
            description: 'Name of the channel.',
            required: true,
        }),
        'runtime-version': core_1.Flags.string({
            description: 'Runtime version to query insights for.',
            required: true,
        }),
        days: core_1.Flags.integer({
            description: 'Show insights from the last N days (default 7, mutually exclusive with --start/--end).',
            min: 1,
            exclusive: ['start', 'end'],
        }),
        start: core_1.Flags.string({
            description: 'Start of insights time range (ISO date).',
            exclusive: ['days'],
        }),
        end: core_1.Flags.string({
            description: 'End of insights time range (ISO date).',
            exclusive: ['days'],
        }),
        ...flags_1.EasNonInteractiveAndJsonFlags,
    };
    static contextDefinition = {
        ...this.ContextOptions.ProjectId,
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { flags } = await this.parse(ChannelInsights);
        const { json, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        const { projectId, loggedIn: { graphqlClient }, } = await this.getContextAsync(ChannelInsights, { nonInteractive });
        if (json) {
            (0, json_1.enableJsonOutput)();
        }
        const { daysBack, startTime, endTime } = (0, timeRange_1.resolveInsightsTimeRange)(flags);
        const insights = await ChannelInsightsQuery_1.ChannelInsightsQuery.viewChannelRuntimeInsightsAsync(graphqlClient, {
            appId: projectId,
            channelName: flags.channel,
            runtimeVersion: flags['runtime-version'],
            startTime,
            endTime,
        });
        const summary = (0, formatInsights_1.toChannelInsightsSummary)(flags.channel, flags['runtime-version'], insights, {
            startTime,
            endTime,
            daysBack,
        });
        if (json) {
            (0, json_1.printJsonOnlyOutput)((0, formatInsights_1.buildChannelInsightsJson)(summary));
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, formatInsights_1.buildChannelInsightsTable)(summary));
        }
    }
}
exports.default = ChannelInsights;
