"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const core_1 = require("@oclif/core");
const EasCommand_1 = tslib_1.__importDefault(require("../../commandUtils/EasCommand"));
const flags_1 = require("../../commandUtils/flags");
const UpdateInsightsQuery_1 = require("../../graphql/queries/UpdateInsightsQuery");
const timeRange_1 = require("../../insights/timeRange");
const log_1 = tslib_1.__importDefault(require("../../log"));
const formatInsights_1 = require("../../update/insights/formatInsights");
const json_1 = require("../../utils/json");
class UpdateInsights extends EasCommand_1.default {
    static description = 'display launch, crash, unique-user, and size insights for an update group';
    static args = {
        groupId: core_1.Args.string({
            required: true,
            description: 'The ID of an update group.',
        }),
    };
    static flags = {
        platform: core_1.Flags.option({
            description: 'Filter to a single platform.',
            options: ['ios', 'android'],
        })(),
        days: core_1.Flags.integer({
            description: `Show insights from the last N days (default ${timeRange_1.INSIGHTS_DEFAULT_DAYS_BACK}, mutually exclusive with --start/--end).`,
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
        ...this.ContextOptions.LoggedIn,
    };
    async runAsync() {
        const { args: { groupId }, flags, } = await this.parse(UpdateInsights);
        const { json, nonInteractive } = (0, flags_1.resolveNonInteractiveAndJsonFlags)(flags);
        const { loggedIn: { graphqlClient }, } = await this.getContextAsync(UpdateInsights, { nonInteractive });
        if (json) {
            (0, json_1.enableJsonOutput)();
        }
        const { daysBack, startTime, endTime } = (0, timeRange_1.resolveInsightsTimeRange)(flags);
        const allUpdates = await UpdateInsightsQuery_1.UpdateInsightsQuery.viewUpdateGroupInsightsAsync(graphqlClient, {
            groupId,
            startTime,
            endTime,
        });
        const updates = flags.platform
            ? allUpdates.filter(u => u.platform === flags.platform)
            : allUpdates;
        if (updates.length === 0) {
            throw new Error(`Update group "${groupId}" has no ${flags.platform} update (available platforms: ${allUpdates
                .map(u => u.platform)
                .sort()
                .join(', ')}).`);
        }
        const summary = (0, formatInsights_1.toUpdateInsightsSummary)(groupId, updates, { startTime, endTime, daysBack });
        if (json) {
            (0, json_1.printJsonOnlyOutput)((0, formatInsights_1.buildUpdateInsightsJson)(summary));
        }
        else {
            log_1.default.addNewLineIfNone();
            log_1.default.log((0, formatInsights_1.buildUpdateInsightsTable)(summary));
        }
    }
}
exports.default = UpdateInsights;
